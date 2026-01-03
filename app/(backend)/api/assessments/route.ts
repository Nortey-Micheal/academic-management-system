import { type NextRequest, NextResponse } from "next/server"
// import { getDb } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await requireAuth()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")

    // const db = await getDb()
    const query = classId ? { classId } : {}
    // const assessments = await db.collection("assessments").find(query).sort({ dueDate: -1 }).toArray()

    return NextResponse.json({
      // assessments: assessments.map((a) => ({
      //   ...a,
      //   _id: a._id.toString(),
      // })),
    })
  } catch (error) {
    console.error("[v0] Error fetching assessments:", error)
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await requireAuth(["admin", "teacher", "academic_officer"])

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    // const db = await getDb()

    const newAssessment = {
      title: data.title,
      description: data.description,
      classId: data.classId,
      subjectCode: data.subjectCode,
      assessmentType: data.assessmentType,
      totalMarks: Number.parseInt(data.totalMarks),
      weight: Number.parseFloat(data.weight),
      dueDate: new Date(data.dueDate),
      createdBy: user._id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // const result = await db.collection("assessments").insertOne(newAssessment)

    return NextResponse.json({
      assessment: {
        ...newAssessment,
        // _id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error creating assessment:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}
