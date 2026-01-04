import { type NextRequest, NextResponse } from "next/server"
// import { getDb } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth"
import { ObjectId } from "mongodb"

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
    // const students = await db.collection("students").find(query).sort({ lastName: 1, firstName: 1 }).toArray()

    return NextResponse.json({
      // students: students.map((s) => ({
      //   ...s,
      //   _id: s._id.toString(),
      // })),
    })
  } catch (error) {
    console.error(" Error fetching students:", error)
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
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

    // Generate student ID
    // const count = await db.collection("students").countDocuments()
    // const studentId = `STU${String(count + 1).padStart(6, "0")}`

    const newStudent = {
      // studentId,
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: new Date(data.dateOfBirth),
      gender: data.gender,
      classId: data.classId,
      guardianName: data.guardianName,
      guardianPhone: data.guardianPhone,
      guardianEmail: data.guardianEmail,
      address: data.address,
      admissionDate: new Date(data.admissionDate || new Date()),
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // const result = await db.collection("students").insertOne(newStudent)

    // Update class enrollment
    // await db.collection("classes").updateOne({ _id: new ObjectId(data.classId) }, { $inc: { currentEnrollment: 1 } })

    return NextResponse.json({
      student: {
        ...newStudent,
        // _id: result.insertedId.toString(),
      },
    })
  } catch (error) {
    console.error(" Error creating student:", error)
    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
