import { Prisma } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

type ClassWithUser = Prisma.ClassSubjectGetPayload<{
  include: {
    teacherAssignments: {
      include: {
        teacher: {
          include: {
            user: {
              select: {
                firstName: true
                lastName: true
              }
            }
          }
        }
      }
    }
    subject: true
  }
}>

export async function GET(
  req: Request,
  { params }: { params: { classId: string } }
) {
  try {
    const userId = new URL(req.url).searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'HEADTEACHER')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const classSubjects = await prisma.classSubject.findMany({
      where: { classId: params.classId },
      include: {
        subject: true,
        teacherAssignments: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    }) as ClassWithUser[]

    // ✅ DEDUP MAP
    const subjectMap = new Map<
      string,
      {
        id: string
        name: string
        teacher: string
        status: string
      }
    >()

    classSubjects.forEach((cs) => {
      const subjectId = cs.subject.id

      const assignment = cs.teacherAssignments?.[0]

      const teacherName = assignment?.teacher?.user
        ? `${assignment.teacher.user.firstName} ${assignment.teacher.user.lastName}`
        : 'Unassigned'

      const existing = subjectMap.get(subjectId)

      if (!existing) {
        subjectMap.set(subjectId, {
          id: subjectId,
          name: cs.subject.subjectName,
          teacher: teacherName,
          status: assignment ? 'Assigned' : 'Unassigned',
        })
      } else {
        // 🔥 MERGE RULE: prefer assigned teacher over unassigned
        if (existing.teacher === 'Unassigned' && assignment) {
          subjectMap.set(subjectId, {
            ...existing,
            teacher: teacherName,
            status: 'Assigned',
          })
        }
      }
    })

    const subjects = Array.from(subjectMap.values())

    return NextResponse.json({ subjects })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
      { status: 500 }
    )
  }
}