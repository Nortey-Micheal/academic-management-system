import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest, { params }: { params: Promise<{ classId: string }> }) {
  try {
    const { classId } = await params

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
      return NextResponse.json({ error: 'Class not found' }, { status: 404 })
    }

    const students = await prisma.student.findMany({
      where: { classId },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    const assessments = await prisma.termAssessment.findMany({
      where: { classId },
      include: {
        subject: {
          select: {
            subjectName: true,
          },
        },
      },
    })

    const genderData = [
      {
        name: 'Male',
        value: students.filter(student => student.gender === 'male').length,
      },
      {
        name: 'Female',
        value: students.filter(student => student.gender === 'female').length,
      },
    ]

    const groupedSubjects = assessments.reduce((acc, assessment) => {
      const total =
        assessment.test1 +
        assessment.groupWork +
        assessment.test2 +
        assessment.project +
        assessment.exam

      if (!acc[assessment.subject.subjectName]) acc[assessment.subject.subjectName] = []

      acc[assessment.subject.subjectName].push(total)

      return acc
    }, {} as Record<string, number[]>)

    const performanceData = Object.entries(groupedSubjects).map(([subject, scores]) => ({
      subject,
      average: Number(
        (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)
      ),
    }))

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

    return NextResponse.json({
      classInfo: currentClass,
      genderData,
      performanceData,
      analyticsSummary: {
        currentEnrollment: students.length,
        capacity: students.length,
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