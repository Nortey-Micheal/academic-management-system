import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { Prisma } from "@/lib/generated/prisma/client"

type ClassWithEnrollments = Prisma.ClassGetPayload<{
  include: {
    enrollments: {
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    }
    classTeacher: {
      include: {
        user: true
      }
    }
    subjects: {
      include: {
        subject: true
      }
    }
  }
}>

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true }
    })

    if (!academicYear) {
      return NextResponse.json({ error: "No active academic year" }, { status: 400 })
    }

    const teacher = await prisma.teacher.findUnique({
      where: { userId: id }
    })

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 })
    }

    const teacherClass = await prisma.class.findFirst({
      where: {
        classTeacherId: teacher.id
      },
      include: {
        classTeacher: {
          include: {
            user: true
          }
        },

        subjects: {
          include: {
            subject: true
          }
        },

        enrollments: {
          where: {
            academicYearId: academicYear.id,
            status: "ACTIVE"
          },
          include: {
            student: {
              include: {
                user: true
              }
            }
          }
        }
      }
    }) as ClassWithEnrollments

    /**
     * Map enrollments → old "students" format (BACKWARD COMPATIBLE)
     */
    const formattedClass = teacherClass
      ? {
          ...teacherClass,
          students: teacherClass.enrollments.map((e) => e.student)
        }
      : null

    return NextResponse.json({
      class: formattedClass
    })

  } catch (error) {
    console.error("Fetch class teacher error:", error)

    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    )
  }
}