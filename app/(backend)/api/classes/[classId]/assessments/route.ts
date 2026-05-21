import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const userId = new URL(req.url).searchParams.get('userId')
    const { classId } = await params

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'HEADTEACHER')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // ACTIVE ACADEMIC YEAR
    const activeAcademicYear = await prisma.academicYear.findFirst({
      where: {
        isActive: true,
      },
    })

    if (!activeAcademicYear) {
      return NextResponse.json(
        { error: 'No active academic year found' },
        { status: 400 }
      )
    }

    // ACTIVE TERM
    const activeTerm = await prisma.term.findFirst({
      where: {
        isActive: true,
        academicYearId: activeAcademicYear.id,
      },
    })

    if (!activeTerm) {
      return NextResponse.json(
        { error: 'No active term found' },
        { status: 400 }
      )
    }

    // FILTERED ASSESSMENTS
    const assessments = await prisma.termAssessment.findMany({
      where: {
        classId,
        year: activeAcademicYear.year,
        term: activeTerm.termNumber,
      },

      include: {
        subject: true,

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

    const groupedAssessments = assessments.reduce((acc, assessment) => {
      const key = `${assessment.subjectId}-${assessment.term}-${assessment.year}`

      const total =
        ((assessment.test1 +
        assessment.groupWork +
        assessment.test2 +
        assessment.project) / 2) +
        (assessment.exam / 2)

      if (!acc[key]) {
        acc[key] = {
          id: key,
          subject: assessment.subject.subjectName,
          type: `Term ${assessment.term}`,
          date: assessment.createdAt,
          scores: [],
        }
      }

      acc[key].scores.push({
        student: assessment.student,
        total,
      })

      return acc
    }, {} as Record<string, any>)

    const formattedAssessments = Object.values(groupedAssessments).map(
      (assessment: any) => {
        const scores = assessment.scores.map((s: any) => s.total)

        const highestScore = scores.length
          ? Math.max(...scores)
          : 0

        const lowestScore = scores.length
          ? Math.min(...scores)
          : 0

        const averageScore = scores.length
          ? Number(
              (
                scores.reduce(
                  (acc: number, curr: number) => acc + curr,
                  0
                ) / scores.length
              ).toFixed(1)
            )
          : 0

        return {
          id: assessment.id,
          subject: assessment.subject,
          type: assessment.type,
          date: assessment.date,
          highestScore,
          lowestScore,
          averageScore,
        }
      }
    )

    const allScores = assessments.map((assessment) => {
      const total =
        ((assessment.test1 +
        assessment.groupWork +
        assessment.test2 +
        assessment.project) / 2) +
        (assessment.exam / 2)

      return {
        score: total,
        student: assessment.student,
      }
    })

    const overallAverage = allScores.length
      ? Number(
          (
            allScores.reduce(
              (acc, curr) => acc + curr.score,
              0
            ) / allScores.length
          ).toFixed(1)
        )
      : 0

    const sortedScores = [...allScores].sort(
      (a, b) => b.score - a.score
    )

    const highest = sortedScores[0]
    const lowest = sortedScores[sortedScores.length - 1]

    const distributionRanges = [
      { grade: 'A (90-100)', min: 90, max: 100 },
      { grade: 'B (80-89)', min: 80, max: 89 },
      { grade: 'C (70-79)', min: 70, max: 79 },
      { grade: 'D (60-69)', min: 60, max: 69 },
      { grade: 'F (0-59)', min: 0, max: 59 },
    ]

    const distribution = distributionRanges.map((range) => {
      const count = allScores.filter(
        (item) =>
          item.score >= range.min &&
          item.score <= range.max
      ).length

      return {
        grade: range.grade,
        count,
        percentage: allScores.length
          ? Math.round((count / allScores.length) * 100)
          : 0,
      }
    })

    return NextResponse.json({
      assessments: formattedAssessments.sort(
        (a, b) =>
          new Date(b.date).getTime() -
          new Date(a.date).getTime()
      ),

      activeAcademicYear: activeAcademicYear.year,
      activeTerm: activeTerm.termNumber,

      summary: {
        overallAverage,

        highestPerformer: highest
          ? {
              name: `${highest.student.user.firstName} ${highest.student.user.lastName}`,
              score: highest.score,
            }
          : null,

        lowestPerformer: lowest
          ? {
              name: `${lowest.student.user.firstName} ${lowest.student.user.lastName}`,
              score: lowest.score,
            }
          : null,
      },

      distribution,
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      { error: 'Failed to fetch assessments' },
      { status: 500 }
    )
  }
}