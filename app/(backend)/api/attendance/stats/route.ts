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
    const studentId = searchParams.get("studentId")
    const classId = searchParams.get("classId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    const db = await getDb()
    const query: any = {}

    if (studentId) query.studentId = studentId
    if (classId) query.classId = classId
    if (startDate && endDate) {
      query.date = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      }
    }

    const attendance = await db.collection("attendance").find(query).toArray()

    const stats = {
      total: attendance.length,
      present: attendance.filter((a) => a.status === "present").length,
      absent: attendance.filter((a) => a.status === "absent").length,
      late: attendance.filter((a) => a.status === "late").length,
      excused: attendance.filter((a) => a.status === "excused").length,
    }

    const rate = stats.total > 0 ? ((stats.present + stats.late) / stats.total) * 100 : 0

    return NextResponse.json({
      stats,
      rate: rate.toFixed(1),
    })
  } catch (error) {
    console.error("[v0] Error fetching attendance stats:", error)
    return NextResponse.json({ error: "Failed to fetch attendance stats" }, { status: 500 })
  }
}
