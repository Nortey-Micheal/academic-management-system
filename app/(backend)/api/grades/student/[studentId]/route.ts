import { NextResponse } from "next/server"
// import { getDb } from "@/lib/mongodb"
// import { requireAuth } from "@/lib/auth"
import { calculateGrade, getGradeRemarks, calculateOverallGrade } from "@/lib/grading"
import type { SubjectGrade } from "@/lib/types"

export async function GET(request: Request, { params }: { params: Promise<{ studentId: string }> }) {
  // const user = await requireAuth()

  // if (!user) {
  //   return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  // }

  try {
    const { studentId } = await params
    // const db = await getDb()

    // Get student info
    // const student = await db.collection("students").findOne({ _id: studentId } as any)

    // if (!student) {
    //   return NextResponse.json({ error: "Student not found" }, { status: 404 })
    // }

    // Get class info to get subjects
    // const classInfo = await db.collection("classes").findOne({ _id: student.classId } as any)

    // if (!classInfo || !classInfo.subjects || classInfo.subjects.length === 0) {
    //   return NextResponse.json({ error: "No subjects assigned to class" }, { status: 400 })
    // }

    // Get all assessments for this class
    // const assessments = await db.collection("assessments").find({ classId: student.classId }).toArray()

    // Get all grades for this student
    // const studentGrades = await db
      // .collection("grades")
      // .find({
      //   studentId,
      //   assessmentId: { $in: assessments.map((a) => a._id.toString()) },
      // })
      // .toArray()

    // Calculate subject-wise grades
    const subjectGrades: SubjectGrade[] = []

    // for (const subjectCode of classInfo.subjects) {
      // const subjectAssessments = assessments.filter((a) => a.subjectCode === subjectCode)

      let totalMarks = 0
      let obtainedMarks = 0

      // for (const assessment of subjectAssessments) {
        // const grade = studentGrades.find((g) => g.assessmentId === assessment._id.toString())
        // if (grade) {
        //   totalMarks += assessment.totalMarks
        //   obtainedMarks += grade.marksObtained
        // }
      // }

      // if (totalMarks > 0) {
      //   const percentage = (obtainedMarks / totalMarks) * 100
      //   const gradeValue = calculateGrade(percentage)
      //   const remarks = getGradeRemarks(gradeValue)

      //   subjectGrades.push({
          // subjectCode,
          // subjectName: subjectCode, // In a real app, fetch subject name
        //   totalMarks,
        //   obtainedMarks,
        //   percentage: Number.parseFloat(percentage.toFixed(2)),
        //   grade: gradeValue,
        //   remarks,
        // })
      // }
    // }

    // Calculate overall grade
    // const overall = calculateOverallGrade(subjectGrades)

    return NextResponse.json({
      student: {
        // _id: student._id.toString(),
        // studentId: student.studentId,
        // name: `${student.firstName} ${student.lastName}`,
      },
      subjectGrades,
      // overall,
    })
  } catch (error) {
    console.error("[v0] Error fetching student grades:", error)
    return NextResponse.json({ error: "Failed to fetch student grades" }, { status: 500 })
  }
}
