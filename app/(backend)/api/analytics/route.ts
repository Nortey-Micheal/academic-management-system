// app/api/analytics/route.ts

import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  try {

    const activeAcademicYear = await prisma.academicYear.findFirst({
      where: {
        isActive: true,
      },
      include: {
        terms: true,
      },
    })

    const activeTerm = activeAcademicYear?.terms.find(
      (term) => term.isActive
    )

    /* -------------------------------- */
    /* BASIC COUNTS                     */
    /* -------------------------------- */

    const [
      totalStudents,
      totalTeachers,
      totalClasses,
      totalSubjects,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.class.count(),
      prisma.subject.count(),
    ])

    /* -------------------------------- */
    /* ACTIVE STUDENTS                  */
    /* -------------------------------- */

    const activeStudents = await prisma.studentEnrollment.count({
      where: {
        isCurrent: true,
        status: "ACTIVE",
      },
    })

    /* -------------------------------- */
    /* STUDENT GENDER DISTRIBUTION      */
    /* -------------------------------- */

    const genderDistribution = await prisma.student.groupBy({
      by: ["gender"],
      _count: true,
    })

    /* -------------------------------- */
    /* CLASS ENROLLMENT                 */
    /* -------------------------------- */

    const classEnrollment = await prisma.class.findMany({
      select: {
        id: true,
        grade: true,
        section: true,
        currentEnrollment: true,
      },
      orderBy: [
        {
          grade: "asc",
        },
      ],
    })

    /* -------------------------------- */
    /* ATTENDANCE SUMMARY               */
    /* -------------------------------- */

    const attendanceSummary = await prisma.attendance.groupBy({
      by: ["status"],
      _count: true,
      where: {
        academicYearId: activeAcademicYear?.id,
        termId: activeTerm?.id,
      },
    })

    /* -------------------------------- */
    /* RECENT ATTENDANCE TREND          */
    /* -------------------------------- */

    const recentAttendance = await prisma.attendance.findMany({
      where: {
        academicYearId: activeAcademicYear?.id,
        termId: activeTerm?.id,
      },
      select: {
        date: true,
        status: true,
      },
      orderBy: {
        date: "asc",
      },
    })

    const attendanceTrendMap = new Map()

    recentAttendance.forEach((record) => {

      const key = record.date.toISOString().split("T")[0]

      if (!attendanceTrendMap.has(key)) {
        attendanceTrendMap.set(key, {
          date: key,
          total: 0,
          present: 0,
        })
      }

      const existing = attendanceTrendMap.get(key)

      existing.total += 1

      if (record.status === "present") {
        existing.present += 1
      }

    })

    const attendanceTrend = Array.from(
      attendanceTrendMap.values()
    ).map((item) => ({
      date: item.date,
      attendanceRate:
        item.total === 0
          ? 0
          : Number(
              (
                (item.present / item.total) *
                100
              ).toFixed(1)
            ),
    }))

    /* -------------------------------- */
    /* SUBJECT PERFORMANCE              */
    /* -------------------------------- */

    const assessments = await prisma.termAssessment.findMany({
      where: {
        year: activeAcademicYear?.year,
        term: activeTerm?.termNumber,
      },
      include: {
        subject: true,
      },
    })

    const subjectMap = new Map()

    assessments.forEach((assessment) => {

      const total =
        assessment.test1 +
        assessment.groupWork +
        assessment.test2 +
        assessment.project +
        assessment.exam

      if (!subjectMap.has(assessment.subject.subjectName)) {
        subjectMap.set(
          assessment.subject.subjectName,
          {
            total: 0,
            count: 0,
          }
        )
      }

      const existing = subjectMap.get(
        assessment.subject.subjectName
      )

      existing.total += total
      existing.count += 1

    })

    const subjectPerformance = Array.from(
      subjectMap.entries()
    ).map(([subject, value]) => ({
      subject,
      average:
        value.count === 0
          ? 0
          : Number(
              (
                value.total / value.count
              ).toFixed(1)
            ),
    }))

    /* -------------------------------- */
    /* TOP STUDENTS                     */
    /* -------------------------------- */

    const studentAssessments =
      await prisma.termAssessment.findMany({
        where: {
          year: activeAcademicYear?.year,
          term: activeTerm?.termNumber,
        },
        include: {
          student: {
            include: {
              user: true,
            },
          },
        },
      })

    const studentMap = new Map()

    studentAssessments.forEach((assessment) => {

      const total =
        assessment.test1 +
        assessment.groupWork +
        assessment.test2 +
        assessment.project +
        assessment.exam

      if (!studentMap.has(assessment.studentId)) {
        studentMap.set(assessment.studentId, {
          student: assessment.student,
          total: 0,
          count: 0,
        })
      }

      const existing = studentMap.get(
        assessment.studentId
      )

      existing.total += total
      existing.count += 1

    })

    const topStudents = Array.from(
      studentMap.values()
    )
      .map((item) => ({
        id: item.student.id,
        name: `${item.student.user.firstName} ${item.student.user.lastName}`,
        studentId: item.student.studentId,
        average:
          item.count === 0
            ? 0
            : Number(
                (
                  item.total / item.count
                ).toFixed(1)
              ),
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 10)

    /* -------------------------------- */
    /* TEACHER WORKLOAD                 */
    /* -------------------------------- */

    const teacherAnalytics =
      await prisma.teacher.findMany({
        include: {
          user: true,
          teacherClassSubjects: true,
          subjects: true,
        },
      })

    const teacherPerformance =
      teacherAnalytics.map((teacher) => ({
        id: teacher.id,
        name: `${teacher.user.firstName} ${teacher.user.lastName}`,
        subjects: teacher.subjects.length,
        classes:
          teacher.teacherClassSubjects.length,
      }))

    /* -------------------------------- */
    /* RESPONSE                         */
    /* -------------------------------- */

    return NextResponse.json({
      success: true,

      overview: {
        totalStudents,
        activeStudents,
        totalTeachers,
        totalClasses,
        totalSubjects,
      },

      academicYear: activeAcademicYear,

      activeTerm,

      genderDistribution,

      classEnrollment,

      attendanceSummary,

      attendanceTrend,

      subjectPerformance,

      topStudents,

      teacherPerformance,
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error: "Failed to fetch analytics",
      },
      {
        status: 500,
      }
    )

  }
}