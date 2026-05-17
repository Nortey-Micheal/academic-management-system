import { Prisma } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

/* -------------------- HELPERS -------------------- */

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

/* -------------------- TYPES -------------------- */

type ClassSubjectWithSubject = Prisma.ClassSubjectGetPayload<{
  include: { subject: true };
}>;

/* -------------------- GET -------------------- */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params;
    const searchParams = request.nextUrl.searchParams;

    const year = searchParams.get("year");
    const termNumber = searchParams.get("term");

    if (!year || !termNumber) {
      return NextResponse.json(
        { message: "term and year are required" },
        { status: 400 }
      );
    }

    const academicYearRecord = await prisma.academicYear.findFirst({
      where: { year },
    });

    const termRecord = await prisma.term.findFirst({
      where: {
        termNumber: Number(termNumber),
        academicYearId: academicYearRecord?.id,
      },
    });

    if (!academicYearRecord || !termRecord) {
      return NextResponse.json(
        { message: "Invalid academic year or term" },
        { status: 404 }
      );
    }

    /* 1️⃣ Student */
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        class: true,
        user: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      );
    }

    /* 2️⃣ Class subjects */
    const classSubjects = await prisma.classSubject.findMany({
      where: {
        classId: student.classId,
      },
      include: {
        subject: true,
      },
      orderBy: {
        subject: {
          subjectName: "asc",
        },
      },
    }) as ClassSubjectWithSubject[];

    /* 3️⃣ Assessments */
    const assessments = await prisma.termAssessment.findMany({
      where: {
        studentId,
        classId: student.classId,
        term: Number(termNumber),
        year,
      },
    });

    console.log({assessments})

    const assessmentMap = new Map(
      assessments.map((a) => [a.subjectId, a])
    );

    /* 4️⃣ Attendance (daily records) */
    const attendanceRecords = await prisma.attendance.findMany({
      where: {
        studentId,
        classId: student.classId,
        termId: termRecord.id,
        academicYearId: academicYearRecord.id,
      },
      select: {
        status: true,
      },
    });

    const totalDays = attendanceRecords.length;

    const presentDays = attendanceRecords.filter(
      (a) => a.status === "present"
    ).length;

    const absentDays = attendanceRecords.filter(
      (a) => a.status === "absent"
    ).length;

    const attendancePercentage =
      totalDays > 0
        ? Math.round((presentDays / totalDays) * 100)
        : 0;

    /* 5️⃣ Subjects + results */
    const subjects = classSubjects.map((link) => {
      const subject = link.subject;
      const assessment = assessmentMap.get(subject.id);

      const test1 = assessment?.test1 ?? 0;
      const test2 = assessment?.test2 ?? 0;
      const groupWork = assessment?.groupWork ?? 0;
      const project = assessment?.project ?? 0;
      const exam = assessment?.exam ?? 0;

      const classScore =
        (test1 + test2 + groupWork + project) / 2;

      const examsScore = exam / 2;

      const totalScore = classScore + examsScore;

      return {
        name: subject.subjectName,
        classScore,
        examsScore,
        totalScore,
        grade: calculateGrade(totalScore),
        remarks: calculateRemarks(totalScore),
      };
    });

    /* 6️⃣ FINAL REPORT */
    const report = {
      id: student.id,
      name: `${student.user.lastName} ${student.user.firstName}`,
      age: calculateAge(student.dateOfBirth),

      attendance: {
        totalDays,
        presentDays,
        absentDays,
        percentage: attendancePercentage,
      },

      term: termRecord.termNumber,
      academicYear: academicYearRecord.year,

      termEnding: termRecord.termEndDate,
      nextTermBegins: "",
      promotedTo: "",
      conduct: "",
      attitude: "",
      classTeacherRemark: "",

      subjects,

      grade: student.class.grade,
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