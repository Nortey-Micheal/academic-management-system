import { Prisma } from "@/lib/generated/prisma/client"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

/* -------------------- TYPES -------------------- */

type AcademicYearRecord = Prisma.AcademicYearGetPayload<{
  select: {
    id: true
    year: true
    isActive: true
  }
}>

type TermRecord = Prisma.TermGetPayload<{
  select: {
    id: true
    termNumber: true
    termEndDate: true
    academicYearId: true
  }
}>

type StudentRecord = Prisma.StudentGetPayload<{
  include: {
    user: true
    enrollments: {
      where: {
        academicYearId: string
        status: "ACTIVE"
      }
      include: {
        class: true
      }
    }
  }
}>

type ClassSubjectRecord = Prisma.ClassSubjectGetPayload<{
  include: {
    subject: true
  }
}>

type AssessmentRecord = Prisma.TermAssessmentGetPayload<{
  select: {
    subjectId: true
    test1: true
    test2: true
    groupWork: true
    project: true
    exam: true
  }
}>

type AttendanceRecord = Prisma.AttendanceGetPayload<{
  select: {
    status: true
  }
}>

/* -------------------- HELPERS -------------------- */

function calculateGrade(score: number) {
  if (score >= 80) return "A"
  if (score >= 70) return "B"
  if (score >= 60) return "C"
  if (score >= 50) return "D"
  return "F"
}

function calculateRemarks(score: number) {
  if (score >= 80) return "Excellent"
  if (score >= 70) return "Very Good"
  if (score >= 60) return "Good"
  if (score >= 50) return "Pass"
  return "Needs Improvement"
}

function calculateAge(dateOfBirth: Date) {
  const today = new Date()
  let age = today.getFullYear() - dateOfBirth.getFullYear()
  const m = today.getMonth() - dateOfBirth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) age--
  return age
}

/* -------------------- GET -------------------- */

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ studentId: string }> }
) {
  try {
    const { studentId } = await params

    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get("year")
    const termNumber = searchParams.get("term")

    if (!year || !termNumber) {
      return NextResponse.json(
        { message: "term and year are required" },
        { status: 400 }
      )
    }

    /* -------------------- 1. Academic Year -------------------- */

    const academicYear: AcademicYearRecord | null =
      await prisma.academicYear.findFirst({
        select: {
          id: true,
          year: true,
          isActive: true
        },
        where: {
          year,
          isActive: true
        }
      })

    if (!academicYear) {
      return NextResponse.json(
        { message: "Invalid academic year" },
        { status: 404 }
      )
    }

    /* -------------------- 2. Term -------------------- */

    const term: TermRecord | null =
      await prisma.term.findFirst({
        select: {
          id: true,
          termNumber: true,
          termEndDate: true,
          academicYearId: true
        },
        where: {
          termNumber: Number(termNumber),
          academicYearId: academicYear.id
        }
      })

    if (!term) {
      return NextResponse.json(
        { message: "Invalid term" },
        { status: 404 }
      )
    }

    /* -------------------- 3. Student -------------------- */

    const student =
      await prisma.student.findUnique({
        where: { id: studentId },
        include: {
          user: true,
          enrollments: {
            where: {
              academicYearId: academicYear.id,
              status: "ACTIVE"
            },
            include: {
              class: true
            }
          }
        }
      }) as StudentRecord

    if (!student) {
      return NextResponse.json(
        { message: "Student not found" },
        { status: 404 }
      )
    }

    const classId = student.enrollments[0]?.classId

    if (!classId) {
      return NextResponse.json(
        { message: "No active enrollment found" },
        { status: 404 }
      )
    }

    /* -------------------- 4. Class Subjects -------------------- */

    const classSubjects: ClassSubjectRecord[] =
      await prisma.classSubject.findMany({
        where: { classId },
        include: {
          subject: true
        }
      })

    /* -------------------- 5. Assessments -------------------- */

    const assessments: AssessmentRecord[] =
      await prisma.termAssessment.findMany({
        select: {
          subjectId: true,
          test1: true,
          test2: true,
          groupWork: true,
          project: true,
          exam: true
        },
        where: {
          studentId,
          classId,
          termId: term.id,
          academicYearId: academicYear.id
        }
      })

    const assessmentMap = new Map(
      assessments.map(a => [a.subjectId, a])
    )

    /* -------------------- 6. Attendance -------------------- */

    const attendanceRecords: AttendanceRecord[] =
      await prisma.attendance.findMany({
        select: {
          status: true
        },
        where: {
          studentId,
          classId,
          termId: term.id,
          academicYearId: academicYear.id
        }
      })

    const totalDays = attendanceRecords.length

    const presentDays = attendanceRecords.filter(
      a => a.status === "present"
    ).length

    const absentDays = attendanceRecords.filter(
      a => a.status === "absent"
    ).length

    const attendancePercentage =
      totalDays > 0
        ? Math.round((presentDays / totalDays) * 100)
        : 0

    /* -------------------- 7. SUBJECT RESULTS -------------------- */

    const subjects = classSubjects.map(link => {
      const subject = link.subject
      const a = assessmentMap.get(subject.id)

      const test1 = a?.test1 ?? 0
      const test2 = a?.test2 ?? 0
      const groupWork = a?.groupWork ?? 0
      const project = a?.project ?? 0
      const exam = a?.exam ?? 0

      const classScore = (test1 + test2 + groupWork + project) / 2
      const examScore = exam / 2
      const totalScore = classScore + examScore

      return {
        name: subject.subjectName,
        classScore,
        examsScore: examScore,
        totalScore,
        grade: calculateGrade(totalScore),
        remarks: calculateRemarks(totalScore)
      }
    })

    /* -------------------- 8. FINAL REPORT -------------------- */

    return NextResponse.json({
      id: student.id,
      name: `${student.user.lastName} ${student.user.firstName}`,
      age: calculateAge(student.dateOfBirth),

      attendance: {
        totalDays,
        presentDays,
        absentDays,
        percentage: attendancePercentage
      },

      term: term.termNumber,
      academicYear: academicYear.year,

      termEnding: term.termEndDate,
      nextTermBegins: "",
      promotedTo: "",
      conduct: "",
      attitude: "",
      classTeacherRemark: "",

      subjects,

      grade: student.enrollments[0]?.class.grade ?? null
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      { message: "Failed to generate report" },
      { status: 500 }
    )
  }
}