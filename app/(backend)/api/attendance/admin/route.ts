import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)

    const classId = searchParams.get("classId")
    const dateStr = searchParams.get("date")

    if (!classId || !dateStr) {
      return NextResponse.json(
        { error: "classId and date required" },
        { status: 400 }
      )
    }

    /* ---------------------------------------------
    NORMALIZE DATE (START OF DAY → END OF DAY)
    --------------------------------------------- */
    const date = new Date(dateStr)
    date.setHours(0, 0, 0, 0)

    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)

    /* ---------------------------------------------
    FETCH ATTENDANCE
    --------------------------------------------- */
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        classId,
        date: {
          gte: date,
          lt: nextDay
        }
      },
      include: {
        student: {
          include: {
            user: true
          }
        }
      }
    })

    /* ---------------------------------------------
    MAP FOR FRONTEND (CONSISTENT WITH TEACHER ROUTE)
    --------------------------------------------- */
    const attendance: Record<string, string> = {}

    attendanceRecords.forEach((rec) => {
      attendance[rec.studentId] = rec.status
    })

    return NextResponse.json({
      attendance,
      records: attendanceRecords // optional (for admin detail view)
    })

  } catch (error) {
    console.error("Admin attendance fetch error:", error)

    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    )
  }
}