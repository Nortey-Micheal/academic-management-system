import { NextRequest, NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

// ---------------------
// Zod schema for validation
// ---------------------
const createClassSchema = z.object({
  className: z.string().min(1, "Class name is required"),
  level: z.string().min(1, "Level is required"),
  section: z.string().optional(),
  academicYear: z.string().min(4, "Academic year is required"),
  capacity: z
    .number({ invalid_type_error: "Capacity must be a number" })
    .int()
    .positive("Capacity must be positive"),
  classTeacherId: z.string().optional(),
  subjects: z.array(z.string()).optional(),
})

/**
 * GET: Fetch all classes
 */
export async function GET() {
  try {
    const classes = await prisma.class.findMany({
      select: {
        id: true,
        level: true,
        grade: true,
        section: true,
        academicYear: true,
        capacity: true,
        currentEnrollment: true,
        classTeacherId: true,
        createdAt: true,
        updatedAt: true,
        subjects:true,
        students: {
          include: {
            user: {
             select: {
              id: true,
              firstName: true,
              lastName: true
             }
            }
          }
        },
      },
      orderBy: [
        { level: "asc" },
        { grade: "asc" },
        { section: "asc" },
      ],
    });

    return NextResponse.json({ classes })

  } catch (error) {
    console.error("Error fetching classes:", error)
    return NextResponse.json(
      { error: "Failed to fetch classes" },
      { status: 500 }
    )
  }
}

/**
 * POST: Create a new class
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate input
    const parsedData = createClassSchema.parse({
      ...body,
      capacity: Number(body.capacity), // ensure number
    })

    const newClassData = {
      ...parsedData,
      classTeacherId: parsedData.classTeacherId
        ? new ObjectId(parsedData.classTeacherId)
        : null,
      currentEnrollment: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await prisma.class.create({
      data: {
        ...newClassData
      }
    })

    return NextResponse.json(
      {
        class: {
          ...result
        },
      },
      { status: 201 }
    )
  } catch (error: any) {
    console.error("Error creating class:", error)

    if (error.name === "ZodError") {
      return NextResponse.json({ error: error.errors }, { status: 400 })
    }

    if (error.name === "ValidationError") {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: "Failed to create class" }, { status: 500 })
  }
}
