import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export type TeacherClassSubjectPayload =
  Prisma.TeacherClassSubjectGetPayload<{
    include: {
      classSubject: {
        include: {
          class: {
            include: {
              enrollments: {
                include: {
                  student: true
                }
              },
              subjects:true
            }
          }
          subject: true
        }
      },
    }
  }>

export type FormTeacherClass = Prisma.ClassGetPayload<{
  include: {
    enrollments: {
      where: {
        academicYearId: string
        status: "ACTIVE"
      }
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true
                firstName: true
                lastName: true
                status: true
              }
            }
          }
        }
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
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const teacherId = (await params).teacherId

    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true }
    })

    if (!academicYear) {
      return NextResponse.json(
        { error: "No active academic year" },
        { status: 400 }
      )
    }

    const teacherClassSubjects = await prisma.teacherClassSubject.findMany({
      where: { teacherId },
      include: {
        classSubject: {
          include: {
            class: {
              include: {
                enrollments: {
                  where: {
                    academicYearId: academicYear.id,
                    status: "ACTIVE"
                  },
                  include: {
                    student: {
                      include: {
                        user: {
                          select: {
                            id: true,
                            firstName: true,
                            lastName: true,
                            status: true
                          }
                        }
                      }
                    }
                  }
                }
              }
            },
            subject: true
          }
        }
      }
    }) as TeacherClassSubjectPayload[]

    const formTeacherClasses = await prisma.class.findMany({
      where: { classTeacherId: teacherId },
      include: {
        enrollments: {
          where: {
            academicYearId: academicYear.id,
            status: "ACTIVE"
          },
          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    status: true
                  }
                }
              }
            }
          }
        },
        subjects: {
          include: {
            subject: true
          }
        }
      }
    }) as FormTeacherClass[]

    const classMap = new Map<string, any>()

    for (const tcs of teacherClassSubjects) {
      const cls = tcs.classSubject.class

      if (!classMap.has(cls.id)) {
        classMap.set(cls.id, {
          ...cls,
          subjects: [],
          students: cls.enrollments.map(e => e.student)
        })
      }

      classMap.get(cls.id).subjects.push(tcs.classSubject.subject)
    }

    for (const cls of formTeacherClasses) {
      const subjects = cls.subjects.map(s => s.subject)

      if (!classMap.has(cls.id)) {
        classMap.set(cls.id, {
          ...cls,
          subjects,
          students: cls.enrollments.map(e => e.student)
        })
      } else {
        const existing = classMap.get(cls.id)

        subjects.forEach(subject => {
          if (!existing.subjects.some((s: any) => s.id === subject.id)) {
            existing.subjects.push(subject)
          }
        })

        existing.students = cls.enrollments.map(e => e.student)
      }
    }

    const classes = Array.from(classMap.values()).sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade
      return a.section.localeCompare(b.section)
    })

    return NextResponse.json(classes)
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}