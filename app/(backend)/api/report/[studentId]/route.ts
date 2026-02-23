import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


function calculateGrade(score: number) {
  if (score >= 80) return "A";
  if (score >= 70) return "B";
  if (score >= 60) return "C";
  if (score >= 50) return "D";
  return "F";
}

function calculateRemarks(score: number) {
  if (score >= 80) return "Excellent";
  if (score >= 70) return "Very Good";
  if (score >= 60) return "Good";
  if (score >= 50) return "Pass";
  return "Needs Improvement";
}

function calculateAge(dateOfBirth: Date) {
  const today = new Date();
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();

  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }

  return age;
}

type ClassSubjectWithSubject = Prisma.ClassSubjectGetPayload<{
  include: {
    subject: true
  }
}>

/* -------------------- GET -------------------- */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const searchParams = request.nextUrl.searchParams;

    const term = searchParams.get("term");
    const year = searchParams.get("year");

    if (!term || !year) {
      return NextResponse.json(
        { message: "term and year are required" },
        { status: 400 }
      );
    }

    /* 1️⃣ Fetch Student + Class */
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true
      }
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    //:(ClassSubject & { subject: { id: string; subjectName: string } })[]

    /* 2️⃣ Fetch All Subjects Assigned To This Class */
    const classSubjects = await prisma.classSubject.findMany({
      where: {
        classId: student.classId
      },
      include: {
        subject: true
      },
      orderBy: {
        subject: {
          subjectName: "asc"
        }
      }
    }) as ClassSubjectWithSubject[]

    /* 3️⃣ Fetch All Assessments For Student (This Term) */
    const assessments = await prisma.termAssessment.findMany({
      where: {
        studentId,
        classId: student.classId,
        term: Number(term),
        year: String(year)
      }
    });

    /* 4️⃣ Convert Assessments To Map */
    const assessmentMap = new Map(
      assessments.map(a => [a.subjectId, a])
    );

    /* 5️⃣ Merge Subjects + Default Zero Scores */
    const subjects = classSubjects.map(link => {
      console.log(assessments)
      const subject = link.subject;
      const assessment = assessmentMap.get(subject.id);

      const test1 = assessment?.test1 ?? 0;
      const test2 = assessment?.test2 ?? 0;
      const groupWork = assessment?.groupWork ?? 0;
      const project = assessment?.project ?? 0;
      const exam = assessment?.exam ?? 0;

      const classScore = test1 + test2 + groupWork + project;
      const examsScore = exam;
      const totalScore = classScore + examsScore;

      return {
        name: subject.subjectName,
        classScore,
        examsScore,
        totalScore,
        grade: calculateGrade(totalScore),
        remarks: calculateRemarks(totalScore)
      };
    });

    /* 6️⃣ Final Report Object */
    const report = {
      id: student.id,
      name: student.studentId, // or join user.firstName + lastName if needed
      age: calculateAge(student.dateOfBirth),
      attendance: "", // integrate Attendance model later
      term: String(term),
      academicPeriod: student.class.academicYear,
      termEnding: "", // fetch from Term table if you create one
      nextTermBegins: "",
      promotedTo: "",
      conduct: "",
      attitude: "",
      classTeacherRemark: "",
      subjects
    };

    return NextResponse.json(report, { status: 200 });

  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Failed to generate report" },
      { status: 500 }
    );
  }
}