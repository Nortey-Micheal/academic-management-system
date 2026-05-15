import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

// ---------------------
// Validation schemas
// ---------------------
const getAttendanceSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
})

const attendanceRecordSchema = z.object({
  studentId: z.string().min(1),
  status: z.enum(["present", "absent", "late", "excused"]),
  notes: z.string().optional(),
})

const postAttendanceSchema = z.object({
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
  records: z.array(attendanceRecordSchema).min(1),
})

/* ---------------------------------------------------
GET
--------------------------------------------------- */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const date = searchParams.get("date") || ""
    const teacherId = request.headers.get("x-teacher-id") || ""

    getAttendanceSchema.parse({ date })

    if (!teacherId) {
      return NextResponse.json({ error: "Teacher ID required" }, { status: 400 })
    }

    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(attendanceDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // ✅ GET ACTIVE ACADEMIC CONTEXT
    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    })

    if (!currentAcademicYear) {
      return NextResponse.json(
        { error: "No active academic year" },
        { status: 400 }
      )
    }

    const currentTerm = await prisma.term.findFirst({
      where: {
        isActive: true,
        academicYearId: currentAcademicYear.id,
      },
    })

    if (!currentTerm) {
      return NextResponse.json(
        { error: "No active term" },
        { status: 400 }
      )
    }

    // teacher class
    const teacherClass = await prisma.class.findFirst({
      where: { classTeacherId: teacherId },
      select: {
        id: true,
        level: true,
        grade: true,
        section: true,
      },
    })

    if (!teacherClass) {
      return NextResponse.json(
        { error: "Teacher is not assigned to any class" },
        { status: 404 }
      )
    }

    // ✅ UPDATED QUERY (includes new schema fields)
    const attendance = await prisma.attendance.findMany({
      where: {
        classId: teacherClass.id,
        academicYearId: currentAcademicYear.id,
        termId: currentTerm.id,
        date: {
          gte: attendanceDate,
          lt: nextDay,
        },
      },
      include: {
        student: {
          select: {
            id: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "asc",
      },
    })

    return NextResponse.json({
      class: teacherClass,
      academicYear: currentAcademicYear,
      term: currentTerm,
      attendance,
    })
  } catch (error: any) {
    console.error("Error fetching attendance:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    )
  }
}

/* ---------------------------------------------------
POST
--------------------------------------------------- */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-teacher-id") || ""

    if (!userId) {
      return NextResponse.json(
        { error: "Teacher ID required" },
        { status: 400 }
      )
    }

    const body = await request.json()
    const parsedData = postAttendanceSchema.parse(body)

    const { date, records } = parsedData

    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(attendanceDate)
    nextDay.setDate(nextDay.getDate() + 1)

    // teacher
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
    })

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      )
    }

    const teacherClass = await prisma.class.findFirst({
      where: { classTeacherId: teacher.id },
      select: { id: true },
    })

    if (!teacherClass) {
      return NextResponse.json(
        { error: "Teacher is not assigned to any class" },
        { status: 403 }
      )
    }

    // ✅ ACTIVE ACADEMIC CONTEXT
    const currentAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
    })

    const currentTerm = await prisma.term.findFirst({
      where: {
        isActive: true,
        academicYearId: currentAcademicYear?.id,
      },
    })

    if (!currentAcademicYear || !currentTerm) {
      return NextResponse.json(
        { error: "Academic year or term not set" },
        { status: 400 }
      )
    }

    const classId = teacherClass.id

    // delete old records
    await prisma.attendance.deleteMany({
      where: {
        classId,
        academicYearId: currentAcademicYear.id,
        termId: currentTerm.id,
        date: {
          gte: attendanceDate,
          lt: nextDay,
        },
      },
    })

    // insert new records
    const attendanceRecords = records.map((r) => ({
      studentId: r.studentId,
      classId,
      date: attendanceDate,
      status: r.status,
      notes: r.notes || "",
      markedBy: userId,

      // ✅ REQUIRED FIELDS FIX
      academicYearId: currentAcademicYear.id,
      termId: currentTerm.id,
    }))

    await prisma.attendance.createMany({
      data: attendanceRecords,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error saving attendance:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    )
  }
}