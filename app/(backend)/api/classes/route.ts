import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

// ---------------------
// Zod schema for validation
// ---------------------
const createClassSchema = z.object({
  className: z.string().min(1, "Class name is required"),
  level: z.string().min(1, "Level is required"),
  section: z.string().optional(),
  academicYear: z.string().min(4, "Academic year is required"),
  capacity: z
    .number({ invalid_type_error: "Capacity must be a number" })
    .int()
    .positive("Capacity must be positive"),
  classTeacherId: z.string().optional(),
  subjects: z.array(z.string()).optional(),
})

/**
 * GET: Fetch all classes
 */
export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        level: true,
        grade: true,
        section: true,
        academicYear: true,
        capacity: true,
        currentEnrollment: true,
        classTeacherId: true,
        createdAt: true,
        updatedAt: true,
        subjects:true,
        students: {
          include: {
            user: {
             select: {
              id: true,
              firstName: true,
              lastName: true
             }
            }
          }
        },
      },
      orderBy: [
        { level: "asc" },
        { grade: "asc" },
        { section: "asc" },
      ],
    });

    return NextResponse.json({ classes })

  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}

/**
 * POST: Create a new class
 */
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const {
      level,
      grade,
      section,
      academicYear,
      capacity,
      classTeacherId,
    } = body

    // ✅ 1. Prevent duplicate class (Prisma unique constraint)
    const existingClass = await prisma.class.findFirst({
      where: {
        level,
        grade,
        section,
        academicYear,
      },
    })

    if (existingClass) {
      return NextResponse.json(
        { message: "Class already exists for this academic year." },
        { status: 400 }
      )
    }

    // ✅ 2. Prevent teacher from being class teacher twice in same year
    if (classTeacherId) {
      const teacherAlreadyAssigned = await prisma.class.findFirst({
        where: {
          classTeacherId,
          academicYear,
        },
      })

      if (teacherAlreadyAssigned) {
        return NextResponse.json(
          {
            message:
              "This teacher is already assigned as a class teacher for this academic year.",
          },
          { status: 400 }
        )
      }
    }

    // ✅ 3. Create class
    const newClass = await prisma.class.create({
      data: {
        level,
        grade: Number(grade),
        section,
        academicYear,
        capacity: Number(capacity),
        classTeacherId: classTeacherId || null,
      },
    })

    return NextResponse.json(newClass, { status: 201 })
  } catch (error: any) {
    console.error(error)

    return NextResponse.json(
      { message: "Something went wrong." },
      { status: 500 }
    )
  }
}