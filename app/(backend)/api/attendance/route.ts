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
GET: Get attendance for class teacher's class
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

    /* ---------------------------------------------
    Find class where this teacher is class teacher
    --------------------------------------------- */

    const teacherClass = await prisma.class.findFirst({
      where: {
        classTeacherId: teacherId,
      },
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

    /* ---------------------------------------------
    Get attendance for that class
    --------------------------------------------- */

    const attendance = await prisma.attendance.findMany({
      where: {
        classId: teacherClass.id,
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
      attendance,
    })
  } catch (error: any) {
    console.error("Error fetching attendance:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 })
  }
}

/* ---------------------------------------------------
POST: Save attendance for teacher's class
--------------------------------------------------- */

export async function POST(request: NextRequest) {
  try {
    /* ---------------------------------------------
    GET USER ID FROM HEADER
    --------------------------------------------- */
    const userId = request.headers.get("x-teacher-id") || ""

    if (!userId) {
      return NextResponse.json(
        { error: "Teacher ID required" },
        { status: 400 }
      )
    }

    /* ---------------------------------------------
    PARSE BODY
    --------------------------------------------- */
    const body = await request.json()
    const parsedData = postAttendanceSchema.parse(body)

    const { date, records } = parsedData

    /* ---------------------------------------------
    NORMALIZE DATE (START OF DAY)
    --------------------------------------------- */
    const attendanceDate = new Date(date)
    attendanceDate.setHours(0, 0, 0, 0)

    const nextDay = new Date(attendanceDate)
    nextDay.setDate(nextDay.getDate() + 1)

    /* ---------------------------------------------
    GET TEACHER FROM USER ID
    --------------------------------------------- */
    const teacher = await prisma.teacher.findUnique({
      where: { userId }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      )
    }

    /* ---------------------------------------------
    GET CLASS WHERE TEACHER IS CLASS TEACHER
    --------------------------------------------- */
    const teacherClass = await prisma.class.findFirst({
      where: {
        classTeacherId: teacher.id
      },
      select: {
        id: true
      }
    })

    if (!teacherClass) {
      return NextResponse.json(
        { error: "Teacher is not assigned to any class" },
        { status: 403 }
      )
    }

    const classId = teacherClass.id

    /* ---------------------------------------------
    DELETE EXISTING ATTENDANCE FOR THAT DAY
    --------------------------------------------- */
    await prisma.attendance.deleteMany({
      where: {
        classId,
        date: {
          gte: attendanceDate,
          lt: nextDay
        }
      }
    })

    /* ---------------------------------------------
    PREPARE NEW RECORDS
    --------------------------------------------- */
    const attendanceRecords = records.map((r) => ({
      studentId: r.studentId,
      classId,
      date: attendanceDate,
      status: r.status,
      notes: r.notes || "",
      markedBy: userId // ✅ use Teacher.id, NOT userId
    }))

    /* ---------------------------------------------
    INSERT RECORDS
    --------------------------------------------- */
    if (attendanceRecords.length > 0) {
      await prisma.attendance.createMany({
        data: attendanceRecords
      })
    }

    /* ---------------------------------------------
    SUCCESS RESPONSE
    --------------------------------------------- */
    return NextResponse.json({ success: true })

  } catch (error: any) {

    console.error("Error saving attendance:", error)

    /* ---------------------------------------------
    VALIDATION ERROR (ZOD)
    --------------------------------------------- */
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to save attendance" },
      { status: 500 }
    )
  }
}