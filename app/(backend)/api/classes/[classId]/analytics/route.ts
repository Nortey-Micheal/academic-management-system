import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@/lib/generated/prisma/client'

type EnrollmentWithStudent = Prisma.StudentEnrollmentGetPayload<{
  include: {
    student: {
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
}>

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params

    const academicYear = await prisma.academicYear.findFirst({
      where: { isActive: true }
    })

    if (!academicYear) {
      return NextResponse.json(
        { error: 'No active academic year' },
        { status: 400 }
      )
    }

    const currentClass = await prisma.class.findUnique({
      where: { id: classId },
      select: {
        id: true,
        level: true,
        grade: true,
        section: true,
        academicYear: true,
        currentEnrollment: true,
      }
    })

    if (!currentClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    // ✅ ENROLLMENTS (SOURCE OF TRUTH)
    const enrollments = await prisma.studentEnrollment.findMany({
      where: {
        classId,
        academicYearId: academicYear.id,
        status: 'ACTIVE'
      },
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
    }) as EnrollmentWithStudent[]

    const students = enrollments.map(e => e.student)

    // -------------------------
    // GENDER DATA
    // -------------------------
    const genderData = [
      {
        name: 'Male',
        value: students.filter(s => s.gender === 'male').length,
      },
      {
        name: 'Female',
        value: students.filter(s => s.gender === 'female').length,
      },
    ]

    // -------------------------
    // PERFORMANCE DATA
    // -------------------------
    const assessments = await prisma.termAssessment.findMany({
      where: {
        classId,
        academicYearId: academicYear.id,
      },
      include: {
        subject: {
          select: {
            subjectName: true,
          },
        },
      },
    })

    const groupedSubjects = assessments.reduce((acc, assessment) => {
      const total =
        assessment.test1 +
        assessment.groupWork +
        assessment.test2 +
        assessment.project +
        assessment.exam

      if (!acc[assessment.subject.subjectName]) {
        acc[assessment.subject.subjectName] = []
      }

      acc[assessment.subject.subjectName].push(total)

      return acc
    }, {} as Record<string, number[]>)

    const performanceData = Object.entries(groupedSubjects).map(
      ([subject, scores]) => ({
        subject,
        average: Number(
          (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
        ),
      })
    )

    const overallAverage =
      performanceData.length > 0
        ? (
            performanceData.reduce((sum, item) => sum + item.average, 0) /
            performanceData.length
          ).toFixed(1)
        : '0'

    const bestSubject =
      performanceData.length > 0
        ? performanceData.reduce((prev, current) =>
            prev.average > current.average ? prev : current
          )
        : null

    // -------------------------
    // RESPONSE
    // -------------------------
    return NextResponse.json({
      classInfo: currentClass,
      genderData,
      performanceData,
      analyticsSummary: {
        currentEnrollment: students.length,
        capacity: currentClass.currentEnrollment, // FIXED (or use class capacity if available)
        averagePerformance: overallAverage,
        bestSubject: bestSubject?.subject || 'N/A',
        bestSubjectAverage: bestSubject?.average || 0,
      },
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    )
  }
}