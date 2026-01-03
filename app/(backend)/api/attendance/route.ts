import { type NextRequest, NextResponse } from "next/server"
import { getDb } from "@/lib/mongodb"
import { requireAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  const user = await requireAuth()

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId")
    const date = searchParams.get("date")

    if (!classId || !date) {
      return NextResponse.json({ error: "classId and date are required" }, { status: 400 })
    }

    const db = await getDb()
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(attendanceDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const attendance = await db
      .collection("attendance")
      .find({
        classId,
        date: {
          $gte: attendanceDate,
          $lt: nextDay,
        },
      })
      .toArray()

    return NextResponse.json({
      attendance: attendance.map((a) => ({
        ...a,
        _id: a._id.toString(),
      })),
    })
  } catch (error) {
    console.error("[v0] Error fetching attendance:", error)
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const user = await requireAuth(["admin", "teacher", "academic_officer"])

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const { classId, date, records } = await request.json()

    if (!classId || !date || !records) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = await getDb()
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(attendanceDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // Delete existing attendance for this class and date
    await db.collection("attendance").deleteMany({
      classId,
      date: {
        $gte: attendanceDate,
        $lt: nextDay,
      },
    })

    // Insert new attendance records
    const attendanceRecords = records.map((record: any) => ({
      studentId: record.studentId,
      classId,
      date: attendanceDate,
      status: record.status,
      notes: record.notes || "",
      markedBy: user._id,
      createdAt: new Date(),
    }))

    if (attendanceRecords.length > 0) {
      await db.collection("attendance").insertMany(attendanceRecords)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error saving attendance:", error)
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 })
  }
}
