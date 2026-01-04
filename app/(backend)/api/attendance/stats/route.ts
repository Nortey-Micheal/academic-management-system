import { NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/db/mongodb"
import Attendance from "@/app/(backend)/models/attendanceSchema"
import { ObjectId } from "mongodb"
import { z } from "zod"

// --------------------
// Validation schema
// --------------------
const querySchema = z.object({
  studentId: z.string().optional(),
  classId: z.string().optional(),
  startDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid startDate",
    }),
  endDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), {
      message: "Invalid endDate",
    }),
})

// --------------------
// GET: Attendance stats
// --------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const rawQuery = {
      studentId: searchParams.get("studentId") || undefined,
      classId: searchParams.get("classId") || undefined,
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    }

    const parsedQuery = querySchema.parse(rawQuery)

    await connectToDB()

    const query: any = {}

    if (parsedQuery.studentId) {
      if (!ObjectId.isValid(parsedQuery.studentId)) {
        return NextResponse.json(
          { error: "Invalid studentId" },
          { status: 400 }
        )
      }
      query.studentId = new ObjectId(parsedQuery.studentId)
    }

    if (parsedQuery.classId) {
      if (!ObjectId.isValid(parsedQuery.classId)) {
        return NextResponse.json(
          { error: "Invalid classId" },
          { status: 400 }
        )
      }
      query.classId = new ObjectId(parsedQuery.classId)
    }

    if (parsedQuery.startDate && parsedQuery.endDate) {
      const start = new Date(parsedQuery.startDate)
      start.setHours(0, 0, 0, 0)

      const end = new Date(parsedQuery.endDate)
      end.setHours(23, 59, 59, 999)

      query.date = { $gte: start, $lte: end }
    }

    const attendance = await Attendance.find(query)

    const stats = {
      total: attendance.length,
      present: 0,
      absent: 0,
      late: 0,
      excused: 0,
    }

    for (const record of attendance) {
      if (record.status in stats) {
        // @ts-ignore
        stats[record.status]++
      }
    }

    const attendanceRate =
      stats.total > 0
        ? ((stats.present + stats.late) / stats.total) * 100
        : 0

    return NextResponse.json({
      stats,
      rate: Number(attendanceRate.toFixed(1)),
    })
  } catch (error: any) {
    console.error("Error fetching attendance stats:", error)

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to fetch attendance stats" },
      { status: 500 }
    )
  }
}
