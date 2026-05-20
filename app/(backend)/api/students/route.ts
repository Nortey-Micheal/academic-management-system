import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

// ---------------------
// Validation schemas
// ---------------------
export const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),

  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date of birth",
    }),

  gender: z.enum(["male", "female"]),

  classId: z.string().min(1, "Class is required"),

  guardianName: z.string().min(1, "Guardian name is required"),
  guardianPhone: z.string().min(1, "Guardian phone is required"),

  guardianEmail: z.string().email().optional(),

  address: z.string().min(1, "Address is required"),

  admissionDate: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Date.parse(val)),
      { message: "Invalid admission date" }
    ),
});

const getStudentsSchema = z.object({
  classId: z.string().optional(),
})

// ---------------------
// GET: Fetch students (optionally by class)
// ---------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId") || undefined

    getStudentsSchema.parse({ classId })

    const query: any = {}
    if (classId) query.classId = classId

    const students = await prisma.student.findMany({
      where: {
        ...query
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            status: true
          }
        }
      }
    })

    return NextResponse.json({
      students
    })
  } catch (error: any) {
    console.error("Error fetching students:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 })
  }
}

// ---------------------
// POST: Create a new student
// ---------------------

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsedData = createStudentSchema.parse(body)

    const plainPassword = Math.random().toString(36).slice(-8)

    const admissionDate = parsedData.admissionDate
      ? new Date(parsedData.admissionDate)
      : new Date()

    const existingClass = await prisma.class.findUnique({
      where: {
        id: parsedData.classId,
      },
      select: {
        id: true,
        currentEnrollment: true,
        capacity: true,
      },
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: 'Class not found' },
        { status: 404 }
      )
    }

    if (existingClass.currentEnrollment >= existingClass.capacity) {
      return NextResponse.json(
        { error: 'Class capacity reached' },
        { status: 400 }
      )
    }

    const result = await prisma.$transaction(async (tx) => {

      const count = await tx.student.count()

      const studentId = `S${String(count + 1).padStart(4, '0')}`

      const email = `${studentId.toLowerCase()}@school.edu`

      const hashedPassword = await bcrypt.hash(plainPassword, 10)

      const activeAcademicYear = await tx.academicYear.findFirst({
        where: {
          isActive: true,
        },
      })

      if (!activeAcademicYear) {
        return NextResponse.json(
          { error: 'No active academic year found' },
          { status: 400 }
        )
      }

      const user = await tx.user.create({
        data: {
          email,
          firstName: parsedData.firstName,
          lastName: parsedData.lastName,
          password: hashedPassword,
          role: 'STUDENT',
          status: 'active',
        },
      })

      const student = await tx.student.create({
        data: {
          userId: user.id,
          studentId,
          dateOfBirth: new Date(parsedData.dateOfBirth),
          gender: parsedData.gender,
          guardianName: parsedData.guardianName,
          guardianPhone: parsedData.guardianPhone,
          guardianEmail: parsedData.guardianEmail || '',
          address: parsedData.address,
          admissionDate,
        },
        include: {
          user: true,
        },
      })

      await tx.studentEnrollment.create({
        data: {
          studentId: student.id,
          classId: parsedData.classId,
          academicYearId: activeAcademicYear.id,
          isCurrent: true,
          status: "ACTIVE"
        },
      })

      await tx.class.update({
        where: {
          id: parsedData.classId,
        },
        data: {
          currentEnrollment: {
            increment: 1,
          },
        },
      })

      return {
        student,
        generatedCredentials: {
          email,
          password: plainPassword,
        },
      }
    })

    return NextResponse.json(result, { status: 201 })

  } catch (error: any) {
    console.error('Error creating student:', error)

    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create student' },
      { status: 500 }
    )
  }
}
