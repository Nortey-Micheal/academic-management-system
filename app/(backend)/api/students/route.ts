import { NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/db/mongodb"
import Student from "../../models/studentSchema"
import ClassRoom from "../../models/classSchema"
import { ObjectId } from "mongodb"
import { z } from "zod"

// ---------------------
// Validation schemas
// ---------------------
const createStudentSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dateOfBirth: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), { message: "Invalid date of birth" }),
  gender: z.enum(["male", "female", "other"]),
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

    await connectToDB()

    const query: any = {}
    if (classId) query.classId = classId

    const students = await Student.find(query).sort({ lastName: 1, firstName: 1 })

    return NextResponse.json({
      students: students.map((s) => ({
        ...s.toObject(),
        _id: s._id.toString(),
        classId: s.classId.toString(),
      })),
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

    await connectToDB()

    // Optional: Generate studentId based on total count
    const count = await Student.countDocuments()
    const studentId = `STU${String(count + 1).padStart(6, "0")}`

    const admissionDate = parsedData.admissionDate
      ? new Date(parsedData.admissionDate)
      : new Date()

    const newStudent = {
      studentId,
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

    const result = await Student.create(newStudent)

    // Update class enrollment
    await ClassRoom.updateOne(
      { _id: new ObjectId(parsedData.classId) },
      { $inc: { currentEnrollment: 1 } }
    )

    return NextResponse.json({
      student: {
        ...result.toObject(),
        _id: result._id.toString(),
        classId: result.classId.toString(),
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
