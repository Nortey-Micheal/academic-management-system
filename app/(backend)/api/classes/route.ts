import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { Level, Prisma, Section } from "@/lib/generated/prisma/client"

const createClassSchema = z.object({
  level: z.nativeEnum(Level),
  grade: z.string().min(1),
  section: z.nativeEnum(Section),
  capacity: z.coerce.number().int().positive().default(30),
  classTeacherId: z.string().optional(),
})

export async function GET() {
  try {
    const academicYear = await prisma.academicYear.findFirst({ where: { isActive: true } })

    if (!academicYear) return NextResponse.json({ error: "No active academic year" }, { status: 400 })

    const classes = await prisma.class.findMany({
      select: {
        id: true,
        level: true,
        grade: true,
        section: true,
        capacity: true,
        currentEnrollment: true,
        classTeacherId: true,
        createdAt: true,
        updatedAt: true,
        classTeacher: {
          include: {
            user: { select: { id: true, firstName: true, lastName: true } }
          }
        },
        subjects: {
          include: {
            subject: true
          }
        },
        enrollments: {
          where: {
            status: "ACTIVE",
            academicYearId: academicYear.id
          },
          include: {
            student: {
              include: {
                user: { select: { id: true, firstName: true, lastName: true } }
              }
            }
          }
        }
      },
      orderBy: [
        { level: "asc" },
        { grade: "asc" },
        { section: "asc" }
      ],
    })

    return NextResponse.json({ classes })

  } catch (error) {
    console.log(error)
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const data = createClassSchema.parse(body)

    const result = await prisma.$transaction(async (tx) => {
      const exists = await tx.class.findFirst({
        where: {
          level: data.level,
          grade: data.grade,
          section: data.section
        }
      })

      if (exists) throw new Error("Class already exists")

      if (data.classTeacherId) {
        const teacherTaken = await tx.class.findFirst({
          where: {
            classTeacherId: data.classTeacherId
          }
        })

        if (teacherTaken) throw new Error("Teacher already assigned to a class")
      }

      const newClass = await tx.class.create({
        data: {
          level: data.level,
          grade: data.grade,
          section: data.section,
          capacity: data.capacity,
          classTeacherId: data.classTeacherId || null,
        }
      })

      const subjects = await tx.subject.findMany({
        where: { level: data.level },
        select: { id: true }
      })

      if (subjects.length > 0) {
        await tx.classSubject.createMany({
          data: subjects.map((s) => ({
            classId: newClass.id,
            subjectId: s.id
          })),
          skipDuplicates: true
        })
      }

      return newClass
    })

    return NextResponse.json(result, { status: 201 })

  } catch (error: any) {
    console.log(error)

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Duplicate class" }, { status: 400 })
    }

    return NextResponse.json(
      { error: error.message || "Failed to create class" },
      { status: 500 }
    )
  }
}