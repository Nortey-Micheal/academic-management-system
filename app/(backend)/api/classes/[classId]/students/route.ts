import { Prisma } from '@/lib/generated/prisma/client'
import { prisma } from '@/lib/prisma'
import { NextRequest, NextResponse } from 'next/server'

export type StudentEnrollmentWithStudent =
  Prisma.StudentEnrollmentGetPayload<{
    include: {
      student: {
        include: {
          user: {
            select: {
              firstName: true
              lastName: true
              status: true
            }
          }
        }
      }
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

    const userId = request.nextUrl.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // VERIFY USER
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || !['ADMIN', 'HEADTEACHER'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // GET ACTIVE ACADEMIC YEAR
    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    })

    if (!academicYear) {
      return NextResponse.json(
        { error: 'No active academic year' },
        { status: 400 }
      )
    }

    // FETCH STUDENTS VIA ENROLLMENTS (CORRECT WAY)
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        classId,
        academicYearId: academicYear.id,
        status: 'ACTIVE',
      },
      include: {
        student: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
                status: true,
              },
            },
          },
        },
      },
      orderBy: {
        student: {
          user: {
            firstName: 'asc',
          },
        },
      },
    }) as StudentEnrollmentWithStudent[]

    const formattedStudents = enrollments.map((enrollment) => ({
      id: enrollment.student.id,

      name: `${enrollment.student.user.lastName} ${enrollment.student.user.firstName}`,

      admissionNo: enrollment.student.studentId,

      gender: enrollment.student.gender,

      status:
        enrollment.student.user.status === 'active'
          ? 'Active'
          : 'Inactive',
    }))

    return NextResponse.json({
      students: formattedStudents,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Failed to fetch students' },
      { status: 500 }
    )
  }
}