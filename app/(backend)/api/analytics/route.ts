import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)

    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")
    const classId = searchParams.get("classId")

    const dateFilter =
      startDate && endDate
        ? {
            gte: new Date(startDate),
            lte: new Date(endDate),
          }
        : undefined

    /* -------------------------------- */
    /* ACTIVE ACADEMIC CONTEXT          */
    /* -------------------------------- */

    const activeAcademicYear = await prisma.academicYear.findFirst({
      where: { isActive: true },
      include: { terms: true },
    })

    const activeTerm = activeAcademicYear?.terms.find(
      (t) => t.isActive
    )

    /* -------------------------------- */
    /* BASIC COUNTS (SYSTEM WIDE)       */
    /* -------------------------------- */

    const [totalStudents, totalTeachers, totalClasses, totalSubjects] =
      await Promise.all([
        prisma.student.count(),
        prisma.teacher.count(),
        prisma.class.count(),
        prisma.subject.count(),
      ])

    const activeStudents = await prisma.studentEnrollment.count({
      where: { isCurrent: true, status: "ACTIVE" },
    })

    /* -------------------------------- */
    /* ATTENDANCE (GLOBAL + FILTERED)   */
    /* -------------------------------- */

    const attendanceWhere: any = {
      academicYearId: activeAcademicYear?.id,
      ...(activeTerm?.id && { termId: activeTerm.id }),
    }

    if (classId) attendanceWhere.classId = classId
    if (dateFilter) attendanceWhere.date = dateFilter

    const attendance = await prisma.attendance.findMany({
      where: attendanceWhere,
      select: {
        date: true,
        status: true,
        classId: true,
      },
    })

    const attendanceSummaryMap = new Map()

    const classAttendanceMap = new Map()

    attendance.forEach((a) => {
      const key = a.status

      attendanceSummaryMap.set(
        key,
        (attendanceSummaryMap.get(key) || 0) + 1
      )

      // per class
      if (!classAttendanceMap.has(a.classId)) {
        classAttendanceMap.set(a.classId, {
          classId: a.classId,
          total: 0,
          present: 0,
        })
      }

      const c = classAttendanceMap.get(a.classId)
      c.total += 1
      if (a.status === "present") c.present += 1
    })

    const attendanceSummary = Array.from(attendanceSummaryMap).map(
      ([status, count]) => ({
        status,
        _count: count,
      })
    )

    const attendanceByClass = Array.from(
      classAttendanceMap.values()
    ).map((c) => ({
      classId: c.classId,
      rate:
        c.total === 0 ? 0 : Number(((c.present / c.total) * 100).toFixed(1)),
    }))

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
    })

    /* -------------------------------- */
    /* SUBJECT PERFORMANCE (FILTERED)   */
    /* -------------------------------- */

    const assessments = await prisma.termAssessment.findMany({
      where: {
        year: activeAcademicYear?.year,
        ...(activeTerm?.termNumber && {
          term: activeTerm.termNumber,
        }),
      },
      include: { subject: true },
    })

    const subjectMap = new Map()

    assessments.forEach((a) => {
      const total =
        a.test1 + a.groupWork + a.test2 + a.project + a.exam

      if (!subjectMap.has(a.subject.subjectName)) {
        subjectMap.set(a.subject.subjectName, { total: 0, count: 0 })
      }

      const s = subjectMap.get(a.subject.subjectName)
      s.total += total
      s.count += 1
    })

    const subjectPerformance = Array.from(subjectMap).map(
      ([subject, v]) => ({
        subject,
        average: v.count ? Number((v.total / v.count).toFixed(1)) : 0,
      })
    )

    /* -------------------------------- */
    /* TOP STUDENTS                     */
    /* -------------------------------- */

    const studentAssessments = await prisma.termAssessment.findMany({
      where: {
        year: activeAcademicYear?.year,
        ...(activeTerm?.termNumber && {
          term: activeTerm.termNumber,
        }),
      },
      include: {
        student: {
          include: { user: true },
        },
      },
    })

    const studentMap = new Map()

    studentAssessments.forEach((a) => {
      const total =
        a.test1 + a.groupWork + a.test2 + a.project + a.exam

      if (!studentMap.has(a.studentId)) {
        studentMap.set(a.studentId, {
          student: a.student,
          total: 0,
          count: 0,
        })
      }

      const s = studentMap.get(a.studentId)
      s.total += total
      s.count += 1
    })

    const topStudents = Array.from(studentMap.values())
      .map((s) => ({
        id: s.student.id,
        name: `${s.student.user.firstName} ${s.student.user.lastName}`,
        studentId: s.student.studentId,
        average: s.count ? Number((s.total / s.count).toFixed(1)) : 0,
      }))
      .sort((a, b) => b.average - a.average)
      .slice(0, 10)

    /* -------------------------------- */
    /* RESPONSE                         */
    /* -------------------------------- */

    return NextResponse.json({
      success: true,

      overview: {
        totalStudents,
        activeStudents,
        totalTeachers: await prisma.teacher.count(),
        totalClasses,
        totalSubjects,
      },

      academicYear: activeAcademicYear,
      activeTerm,

      attendanceSummary,
      attendanceByClass,

      classEnrollment,
      subjectPerformance,
      topStudents,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    )
  }
}