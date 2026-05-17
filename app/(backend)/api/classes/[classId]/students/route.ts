import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@/lib/generated/prisma/client'

type StudentWithUser = Prisma.StudentGetPayload<{
  include: {
    user: true
  }
}>

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ classId: string }>
  }
) {
  try {
    const { classId } = await params

    const userId =
      request.nextUrl.searchParams.get(
        'userId'
      )

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // VERIFY USER
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    })

    if (
      !user ||
      !['ADMIN', 'HEADTEACHER'].includes(
        user.role
      )
    ) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // FETCH STUDENTS
    const students = await prisma.student.findMany({
        where: {
          classId,
        },

        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              status: true,
            },
          },
        },

        orderBy: [
          {
            user: {
              firstName: 'asc',
            },
          },
        ],
    }) as StudentWithUser[]

    const formattedStudents =
      students.map((student) => ({
        id: student.id,

        name: `${student.user.lastName} ${student.user.firstName}`,

        admissionNo:
          student.studentId,

        gender: student.gender,

        status:
          student.user.status ===
          'active'
            ? 'Active'
            : 'Inactive',
      }))

    return NextResponse.json({
      students: formattedStudents,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error:
          'Failed to fetch students',
      },
      { status: 500 }
    )
  }
}