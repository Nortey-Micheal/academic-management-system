import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
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

    // 2️⃣ Get active term inside that year
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

    // 3️⃣ Return structured response
    return NextResponse.json({
      academicYear: {
        year: activeYear.year,
      },
      term: {
        termNumber: activeTerm.termNumber,
      },
    })

  } catch (error) {
    console.error("Error fetching active term:", error)
    return NextResponse.json(
      { error: "Failed to fetch active term" },
      { status: 500 }
    )
  }
}