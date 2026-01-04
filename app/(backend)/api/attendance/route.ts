import { NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/db/mongodb"
import Attendance from "../../models/attendanceSchema"
import { ObjectId } from "mongodb"
import { z } from "zod"

// ---------------------
// Validation schemas
// ---------------------
const getAttendanceSchema = z.object({
  classId: z.string().min(1, "classId is required"),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
})

const attendanceRecordSchema = z.object({
  studentId: z.string().min(1, "studentId is required"),
  status: z.enum(["present", "absent", "late", "excused"]),
  notes: z.string().optional(),
})

const postAttendanceSchema = z.object({
  classId: z.string().min(1),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  records: z.array(attendanceRecordSchema).min(1, "At least one record is required"),
})

// ---------------------
// GET: Fetch attendance for a class and date
// ---------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId") || ""
    const date = searchParams.get("date") || ""

    // Validate query
    getAttendanceSchema.parse({ classId, date })

    await connectToDB()

    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(attendanceDate)
    nextDay.setDate(nextDay.getDate() + 1)

    const attendance = await Attendance.find({
      classId,
      date: { $gte: attendanceDate, $lt: nextDay },
    })

    return NextResponse.json({
      attendance: attendance.map((a) => ({
        ...a.toObject(),
        _id: a._id.toString(),
        studentId: a.studentId.toString(),
        markedBy: a.markedBy?.toString() || null,
      })),
    })
  } catch (error: any) {
    console.error("Error fetching attendance:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

// ---------------------
// POST: Create/update attendance for a class
// ---------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate body
    const parsedData = postAttendanceSchema.parse(body)
    const { classId, date, records } = parsedData

    await connectToDB()

    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(attendanceDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // Delete existing attendance for the class & date
    await Attendance.deleteMany({
      classId,
      date: { $gte: attendanceDate, $lt: nextDay },
    })

    // Insert new attendance records
    const attendanceRecords = records.map((r) => ({
      studentId: r.studentId,
      classId,
      date: attendanceDate,
      status: r.status,
      notes: r.notes || "",
      markedBy: null, // remove auth, no user ID
      createdAt: new Date(),
    }))

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords)
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error saving attendance:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 })
  }
}
