import { type NextRequest, NextResponse } from "next/server"
// import { getDb } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth"

export async function GET() {
  const user = await requireAuth()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // const db = await getDb()
    // const classes = await db.collection("classes").find({}).sort({ className: 1 }).toArray()

    return NextResponse.json({
      // classes: classes.map((c) => ({
      //   ...c,
      //   _id: c._id.toString(),
      // })),
    })
  } catch (error) {
    console.error("[v0] Error fetching classes:", error)
    return NextResponse.json({ error: "Failed to fetch classes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await requireAuth(["admin", "academic_officer"])

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const data = await request.json()
    // const db = await getDb()

    const newClass = {
      className: data.className,
      level: data.level,
      section: data.section,
      academicYear: data.academicYear,
      capacity: Number.parseInt(data.capacity),
      currentEnrollment: 0,
      classTeacherId: data.classTeacherId || null,
      subjects: data.subjects || [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // const result = await db.collection("classes").insertOne(newClass)

    return NextResponse.json({
      class: {
        ...newClass,
        // _id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error("[v0] Error creating class:", error)
    return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
  }
}
