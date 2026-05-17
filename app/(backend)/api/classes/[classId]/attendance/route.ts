import { Prisma } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

type DailyGroup = Prisma.AttendanceGroupByOutputType & {
  date: Date
  _count: {
    id: number
  }
}

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

    const classId = params.classId

    // ---------------------------
    // DAILY ATTENDANCE (class level)
    // ---------------------------
    const dailyRecords = await prisma.attendance.groupBy({
      by: ['date'],
      where: {
        classId,
      },
      _count: {
        id: true,
      },
    }) as DailyGroup[]

    const daily = dailyRecords.map((record) => ({
      id: record.date.toISOString(),
      date: record.date,
      present: record._count.id,
      absent: 0,
      percentage: 100,
    }))

    // ---------------------------
    // STUDENT ATTENDANCE SUMMARY
    // ---------------------------
    const studentRecords = await prisma.attendance.findMany({
      where: { classId },
      include: {
        student: {
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
    })

    const studentMap = new Map<
      string,
      {
        id: string
        name: string
        present: number
        absent: number
        percentage: number
      }
    >()

    for (const record of studentRecords) {
      const studentId = record.studentId

      const name =
        `${record.student.user.firstName} ${record.student.user.lastName}`

      if (!studentMap.has(studentId)) {
        studentMap.set(studentId, {
          id: studentId,
          name,
          present: 0,
          absent: 0,
          percentage: 0,
        })
      }

      const existing = studentMap.get(studentId)!

      if (record.status === 'present') {
        existing.present += 1
      } else {
        existing.absent += 1
      }
    }

    const students = Array.from(studentMap.values()).map((s) => {
      const total = s.present + s.absent
      return {
        ...s,
        percentage: total === 0 ? 0 : Math.round((s.present / total) * 100),
      }
    })

    return NextResponse.json({
      daily,
      students,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch attendance' },
      { status: 500 }
    )
  }
}