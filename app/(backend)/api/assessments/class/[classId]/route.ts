import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {
  try {
    const { classId } = await params
    const { searchParams } = new URL(req.url)
    const subjectId = searchParams.get("subjectId")

    // 1️⃣ Get active academic year
    const activeYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    })

    if (!activeYear) {
      return NextResponse.json(
        { error: "No active academic year found" },
        { status: 400 }
      )
    }

    // 2️⃣ Get active term
    const activeTerm = await prisma.term.findFirst({
      where: {
        academicYearId: activeYear.id,
        isActive: true,
      },
    })

    if (!activeTerm) {
      return NextResponse.json(
        { error: "No active term found" },
        { status: 400 }
      )
    }

    // 3️⃣ Fetch assessments
    const assessments = await prisma.termAssessment.findMany({
      where: {
        classId,
        term: activeTerm.termNumber,
        year: activeYear.year,
        ...(subjectId && { subjectId }),
      },
    })

    // 4️⃣ Transform into keyed object
    const formatted = assessments.reduce<Record<string, any>>(
      (acc, record) => {
        acc[record.studentId] = {
          studentId: record.studentId,
          subjectId: record.subjectId,
          classId: record.classId,
          test1: record.test1,
          test2: record.test2,
          groupWork: record.groupWork,
          project: record.project,
          exam: record.exam,
        }
        return acc
      },
      {}
    )

    return NextResponse.json(formatted)

  } catch (error) {
    console.error("Error fetching assessments:", error)
    return NextResponse.json(
      { error: "Failed to fetch assessments" },
      { status: 500 }
    )
  }
}