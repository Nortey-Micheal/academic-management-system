import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod"


// export async function GET(
//   req: Request,
//   { params }: { params: Promise<{ level: string }> }
// ) {
//   try {
//     const levelParam = (await params).level.toUpperCase();

//     if (!Object.values(Level).includes(levelParam as Level)) {
//       return NextResponse.json(
//         { message: "Invalid department level" },
//         { status: 400 }
//       );
//     }

//     const subjects = await prisma.subject.findMany({
//       where: {
//         level: levelParam as Level,
//       },
//       orderBy: {
//         subjectName: "asc",
//       },
//     });

//     return NextResponse.json(subjects);
//   } catch (error) {
//     console.log(error)
//     return NextResponse.json(
//       { message: "Server error" },
//       { status: 500 }
//     );
//   }
// }


// --------------------
// Validation
// --------------------
const createSubjectSchema = z.object({
  name: z.string().min(2),
  description: z.string().min(2),
  creditHours: z.number().int().min(1).max(10).optional(),
  level: z.enum([
    "PRE_SCHOOL",
    "LOWER_PRIMARY",
    "UPPER_PRIMARY",
    "JUNIOR_HIGH_SCHOOL",
  ]),
  teacherId: z.string().optional().nullable(),
  code: z.string()
})

// --------------------
// Level abbreviations
// --------------------
const LEVEL_ABBREVIATIONS: Record<string, string> = {
  PRE_SCHOOL: "PS",
  LOWER_PRIMARY: "LP",
  UPPER_PRIMARY: "UP",
  JUNIOR_HIGH_SCHOOL: "JHS",
}

// ======================================================
// GET: Fetch all subjects (grouped-ready)
// ======================================================
export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        teacher: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        classLinks: {
          select: {
            class: true
          }
        }
      },
    })

    return NextResponse.json({
      success: true,
      data: subjects,
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch subjects",
      },
      { status: 500 }
    )
  }
}

// ======================================================
// POST: Create subject
// ======================================================
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = createSubjectSchema.parse(body)

    // --------------------------------------------------
    // 1. Prevent duplicate subject in SAME level
    // --------------------------------------------------
    const existing = await prisma.subject.findFirst({
      where: {
        subjectName: data.name,
        level: data.level,
      },
    })

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          error: "Subject already exists for this level",
        },
        { status: 409 }
      )
    }

    // --------------------------------------------------
    // 2. Ensure unique subjectCode
    // --------------------------------------------------
    let subjectCode = data.code

    let codeExists = await prisma.subject.findUnique({
      where: { subjectCode },
    })

    while (codeExists) {
      const random = Math.floor(Math.random() * 900) + 100
      subjectCode = `${subjectCode}-${random}`

      codeExists = await prisma.subject.findUnique({
        where: { subjectCode },
      })
    }

    // --------------------------------------------------
    // 3. Create subject
    // --------------------------------------------------
    const subject = await prisma.subject.create({
      data: {
        subjectCode,
        subjectName: data.name,
        description: data.description,
        level: data.level,
        teacherId: data.teacherId || null,
        creditHours: data.creditHours ?? 1,
      },
    })

    // --------------------------------------------------
    // 4. Fetch all classes for this level
    // --------------------------------------------------
    const classes = await prisma.class.findMany({
      where: {
        level: data.level,
      },
      select: {
        id: true,
      },
    })

    // --------------------------------------------------
    // 5. Auto-assign subject to all classes in level
    // --------------------------------------------------
    if (classes.length > 0) {
      await prisma.classSubject.createMany({
        data: classes.map((cls) => ({
          classId: cls.id,
          subjectId: subject.id,
        })),
        skipDuplicates: true,
      })
    }

    // --------------------------------------------------
    // 6. Return response
    // --------------------------------------------------
    return NextResponse.json(
      {
        success: true,
        message: "Subject created and assigned to all classes",
        data: subject,
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Subject creation error:", error)

    return NextResponse.json(
      {
        success: false,
        error:
          error?.errors?.[0]?.message ||
          error?.message ||
          "Failed to create subject",
      },
      { status: 400 }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: any) {
  try {
    const { id } = params

    // --------------------------------------------------
    // 1. Check subject exists
    // --------------------------------------------------
    const subject = await prisma.subject.findUnique({
      where: { id },
    })

    if (!subject) {
      return NextResponse.json(
        { success: false, error: "Subject not found" },
        { status: 404 }
      )
    }

    // --------------------------------------------------
    // 2. OPTIONAL: manual cleanup (extra safety)
    // --------------------------------------------------
    await prisma.classSubject.deleteMany({
      where: {
        subjectId: id,
      },
    })

    // --------------------------------------------------
    // 3. Delete subject
    // --------------------------------------------------
    await prisma.subject.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Subject deleted successfully",
    })
  } catch (error: any) {
    console.error("Delete subject error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to delete subject",
      },
      { status: 500 }
    )
  }
}