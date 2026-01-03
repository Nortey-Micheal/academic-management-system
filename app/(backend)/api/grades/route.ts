import { type NextRequest, NextResponse } from "next/server"
// import { getDb } from "@/lib/mongodb"
// import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  // const user = await requireAuth()

  // if (!user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }

  try {
    const { searchParams } = new URL(request.url)
    const assessmentId = searchParams.get("assessmentId")
    const studentId = searchParams.get("studentId")

    // const db = await getDb()
    const query: any = {}

    if (assessmentId) query.assessmentId = assessmentId
    if (studentId) query.studentId = studentId

    // const grades = await db.collection("grades").find(query).toArray()

    return NextResponse.json({
      // grades: grades.map((g) => ({
      //   ...g,
      //   _id: g._id.toString(),
      // })),
    })
  } catch (error) {
    console.error("[v0] Error fetching grades:", error)
    return NextResponse.json({ error: "Failed to fetch grades" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // const user = await requireAuth(["admin", "teacher", "academic_officer"])

  // if (!user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }

  try {
    const { assessmentId, grades } = await request.json()

    // const db = await getDb()

    // Delete existing grades for this assessment
    // await db.collection("grades").deleteMany({ assessmentId })

    // Insert new grades
    const gradeRecords = grades.map((grade: any) => ({
      assessmentId,
      studentId: grade.studentId,
      marksObtained: Number.parseFloat(grade.marksObtained),
      feedback: grade.feedback || "",
      // gradedBy: user._id,
      gradedAt: new Date(),
      createdAt: new Date(),
    }))

    if (gradeRecords.length > 0) {
      // await db.collection("grades").insertMany(gradeRecords)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving grades:", error)
    return NextResponse.json({ error: "Failed to save grades" }, { status: 500 })
  }
}
