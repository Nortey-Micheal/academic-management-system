import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"

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
        subjects: {
          include: {
            subject: true
          }
        },
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

    if (!level || !grade || !section || !academicYear) {
      return NextResponse.json(
        { message: "Missing required fields." },
        { status: 400 }
      )
    }

    const parsedGrade = Number(grade)
    const parsedCapacity = Number(capacity) || 30

    const result = await prisma.$transaction(async (tx) => {

      // 🔥 1️⃣ Prevent duplicate class teacher in same year
      if (classTeacherId) {
        const teacherAlreadyAssigned = await tx.class.findFirst({
          where: {
            classTeacherId,
            academicYear,
          },
        })

        if (teacherAlreadyAssigned) {
          throw new Error(
            "This teacher is already assigned as a class teacher for this academic year."
          )
        }
      }

      // 🔥 2️⃣ Create Class
      const newClass = await tx.class.create({
        data: {
          level,
          grade: parsedGrade,
          section,
          academicYear,
          capacity: parsedCapacity,
          classTeacherId: classTeacherId || null,
        },
      })

      // 🔥 3️⃣ Fetch subjects for this level (include teacher)
      const subjectsForLevel = await tx.subject.findMany({
        where: { level },
        select: {
          id: true,
          teacherId: true,
        },
      })

      if (subjectsForLevel.length === 0) {
        throw new Error(
          "No subjects found for this level. Please create subjects first."
        )
      }

      // 🔥 4️⃣ Create ClassSubject records
      const createdClassSubjects = await Promise.all(
        subjectsForLevel.map((subject) =>
          tx.classSubject.create({
            data: {
              classId: newClass.id,
              subjectId: subject.id,
            },
          })
        )
      )

      // 🔥 5️⃣ Create TeacherClassSubject links (if subject has teacher)
      const teacherLinks = createdClassSubjects
        .map((classSubject, index) => {
          const teacherId = subjectsForLevel[index].teacherId
          if (!teacherId) return null

          return {
            teacherId,
            classSubjectId: classSubject.id,
          }
        })
        .filter(Boolean) as { teacherId: string; classSubjectId: string }[]

      if (teacherLinks.length > 0) {
        await tx.teacherClassSubject.createMany({
          data: teacherLinks,
        })
      }

      return newClass
    })

    return NextResponse.json(result, { status: 201 })

  } catch (error: any) {
    console.error(error)

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { message: "Class already exists for this academic year." },
          { status: 400 }
        )
      }
    }

    return NextResponse.json(
      { message: error.message || "Something went wrong." },
      { status: 500 }
    )
  }
}