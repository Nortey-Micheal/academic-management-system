import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("teacherId");
    const dateStr = searchParams.get("date");

    if (!userId || !dateStr) {
      return NextResponse.json({ error: "Missing teacherId or date" }, { status: 400 });
    }

    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    const nextDay = new Date(date);
    nextDay.setDate(nextDay.getDate() + 1);

    // 1️⃣ Get teacher by userId
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
    });

    if (!teacher) {
      return NextResponse.json({ error: "Teacher not found" }, { status: 404 });
    }

    // 2️⃣ Get the class they are the class teacher of
    const classRecord = await prisma.class.findFirst({
      where: { classTeacherId: teacher.id },
      include: { students: { include: { user: true } } },
    });

    if (!classRecord) {
      return NextResponse.json({ error: "No class assigned to this teacher" }, { status: 404 });
    }

    // 3️⃣ Get attendance for this class & date
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        classId: classRecord.id,
        date: { gte: date, lt: nextDay },
      },
    });

    // Map to { studentId: status } for easy frontend use
    const attendance: Record<string, string> = {};
    attendanceRecords.forEach((rec) => {
      attendance[rec.studentId] = rec.status;
    });

    return NextResponse.json({
      class: classRecord,
      attendance,
    });
  } catch (error) {
    console.error("Teacher attendance fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}


export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { teacherId, classId, date, records } = body

    if (!teacherId || !classId || !date || !records) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)
    const nextDay = new Date(attendanceDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // Verify teacher is the class teacher
    const teacherClass = await prisma.class.findFirst({
      where: { id: classId, classTeacherId: teacherId }
    })
    if (!teacherClass) {
      return NextResponse.json({ error: "Not authorized to manage this class" }, { status: 403 })
    }

    // Delete existing attendance for the date
    await prisma.attendance.deleteMany({
      where: {
        classId,
        date: { gte: attendanceDate, lt: nextDay }
      }
    })

    // Create new records
    const attendanceData = records.map((r: any) => ({
      studentId: r.studentId,
      classId,
      date: attendanceDate,
      status: r.status,
      notes: r.notes || "",
      markedBy: teacherId
    }))

    if (attendanceData.length > 0) {
      await prisma.attendance.createMany({ data: attendanceData })
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error("Save attendance error:", error)
    return NextResponse.json({ error: "Failed to save attendance" }, { status: 500 })
  }
}