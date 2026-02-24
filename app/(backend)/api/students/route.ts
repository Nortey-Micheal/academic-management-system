import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

// ---------------------
// Validation schemas
// ---------------------
const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date of birth" }),
  gender: z.enum(["male", "female"]),
  classId: z.string().min(1, "classId is required"),
  guardianName: z.string().min(1, "Guardian name is required"),
  guardianPhone: z.string().min(1, "Guardian phone is required"),
  guardianEmail: z.string().email().optional(),
  address: z.string().min(1, "Address is required"),
  admissionDate: z
    .string()
    .optional()
    .refine((val) => !val || !isNaN(Date.parse(val)), { message: "Invalid admission date" }),
})

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

    // Validate input
    const parsedData = createStudentSchema.parse(body)

    const admissionDate = parsedData.admissionDate
      ? new Date(parsedData.admissionDate)
      : new Date()

    const newStudent = {
      firstName: parsedData.firstName,
      lastName: parsedData.lastName,
      dateOfBirth: new Date(parsedData.dateOfBirth),
      gender: parsedData.gender,
      classId: new ObjectId(parsedData.classId),
      guardianName: parsedData.guardianName,
      guardianPhone: parsedData.guardianPhone,
      guardianEmail: parsedData.guardianEmail || "",
      address: parsedData.address,
      admissionDate,
      status: "active",
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await prisma.student.create({
      data: {
        ...newStudent
      }
    })

    // Update class enrollment
    // await prisma.class.update({
    //   where: {
    //     id: 'parsedData.classId'
    //   },
    //   data: {
      
    //   }
    // })

    return NextResponse.json({
      student: {
        ...result
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating student:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create student" }, { status: 500 })
  }
}
