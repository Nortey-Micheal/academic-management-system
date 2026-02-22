import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prisma } from "@/lib/prisma"

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

    const query: any = {}
    if (classId) query.classId = classId

    // c
    

    return NextResponse.json({
      // assessments: assessments!
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
// ----------------------


type AssessmentRecord = {
  studentId: string;
  subjectId: string;
  classId: string;
  test1: number;
  test2: number;
  groupWork: number;
  project: number;
  exam: number;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { assessments } = body;

    if (!assessments || typeof assessments !== "object") {
      return NextResponse.json({ message: "Invalid assessments payload" }, { status: 400 });
    }

    // 1️⃣ Get the active academic year and term
    const activeTerm = await prisma.term.findFirst({
      where: { isActive: true },
      include: { academicYear: true },
    });

    if (!activeTerm) {
      return NextResponse.json({ message: "No active term found" }, { status: 400 });
    }

    const termNumber = activeTerm.termNumber;
    const year = activeTerm.academicYear.year;

    const records: AssessmentRecord[] = Object.values(assessments) as AssessmentRecord[];

    // 2️⃣ Validate sum of test1, test2, groupWork, project
    for (const record of records) {
      const sum = record.test1 + record.test2 + record.groupWork + record.project;
      if (sum > 100) {
        return NextResponse.json(
          {
            message: `The sum of test1, test2, groupWork, and project must be 100 for student ${record.studentId}`,
          },
          { status: 400 }
        );
      }
    }

    // 3️⃣ Upsert assessments
    await prisma.$transaction(
      records.map((record) => {
        const { test1, test2, groupWork, project, exam, studentId, subjectId, classId } = record;

        const total = test1 + test2 + groupWork + project + exam;

        return prisma.termAssessment.upsert({
          where: {
            studentId_subjectId_term_year: {
              studentId,
              subjectId,
              term: termNumber,
              year,
            },
          },
          update: { test1, test2, groupWork, project, exam },
          create: { studentId, subjectId, classId, term: termNumber, year, test1, test2, groupWork, project, exam },
        });
      })
    );

    return NextResponse.json({ message: "Assessments saved successfully" });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ message: error.message || "Something went wrong" }, { status: 500 });
  }
}