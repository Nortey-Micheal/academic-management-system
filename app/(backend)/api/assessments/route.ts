import { NextRequest, NextResponse } from "next/server"
import { connectToDB } from "@/lib/db/mongodb"
import Assessment from "../../models/assessmentSchema"
import { ObjectId } from "mongodb"
import { z } from "zod"

// ---------------------
// Validation schemas
// ---------------------
const createAssessmentSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  classId: z.string().min(1, "classId is required"),
  subjectCode: z.string().min(1, "Subject code is required"),
  assessmentType: z.string().min(1, "Assessment type is required"),
  totalMarks: z
    .number({ invalid_type_error: "totalMarks must be a number" })
    .int()
    .positive("totalMarks must be positive"),
  weight: z
    .number({ invalid_type_error: "weight must be a number" })
    .positive("weight must be positive"),
  dueDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
})

const getAssessmentsSchema = z.object({
  classId: z.string().optional(),
})

// ---------------------
// GET: Fetch assessments (optionally filtered by class)
// ---------------------
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const classId = searchParams.get("classId") || undefined

    getAssessmentsSchema.parse({ classId })

    await connectToDB()

    const query: any = {}
    if (classId) query.classId = classId

    const assessments = await Assessment.find(query).sort({ dueDate: -1 })

    return NextResponse.json({
      assessments: assessments.map((a) => ({
        ...a.toObject(),
        _id: a._id.toString(),
        classId: a.classId.toString(),
        createdBy: a.createdBy?.toString() || null,
      })),
    })
  } catch (error: any) {
    console.error("Error fetching assessments:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
  }
}

// ---------------------
// POST: Create a new assessment
// ---------------------
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const parsedData = createAssessmentSchema.parse({
      ...body,
      totalMarks: Number(body.totalMarks),
      weight: Number(body.weight),
    })

    await connectToDB()

    const newAssessment = {
      ...parsedData,
      classId: new ObjectId(parsedData.classId),
      dueDate: new Date(parsedData.dueDate),
      createdBy: null, // remove auth
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await Assessment.create(newAssessment)

    return NextResponse.json({
      assessment: {
        ...result.toObject(),
        _id: result._id.toString(),
        classId: result.classId.toString(),
        createdBy: result.createdBy?.toString() || null,
      },
    }, { status: 201 })
  } catch (error: any) {
    console.error("Error creating assessment:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}
