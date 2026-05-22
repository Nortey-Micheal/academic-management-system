import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {

  try {

    const body = await request.json()

    const {
      currentClassId,
      targetClassId,
      academicYearId,
      studentIds,
    } = body

    if (
      !currentClassId ||
      !targetClassId ||
      !academicYearId ||
      !studentIds ||
      !Array.isArray(studentIds)
    ) {
      return NextResponse.json(
        {
          error: "Missing required fields"
        },
        {
          status: 400
        }
      )
    }

    /**
     * GET CURRENT ACADEMIC YEAR
     */
    const currentAcademicYear = await prisma.academicYear.findUnique({
      where: {
        id: academicYearId,
      },
      include: {
        terms: true,
      },
    })

    if (!currentAcademicYear) {
      return NextResponse.json(
        {
          error: "Academic year not found",
        },
        {
          status: 404,
        }
      )
    }

    /**
     * CHECK ACTIVE TERM
     */
    const activeTerm = currentAcademicYear.terms.find(
      (term) => term.isActive
    )

    /**
     * DEFAULT ENROLLMENT YEAR
     */
    let enrollmentAcademicYearId = academicYearId

    /**
     * IF ACTIVE YEAR + TERM 3
     * USE NEXT ACADEMIC YEAR
     */
    if (
      currentAcademicYear.isActive &&
      activeTerm?.termNumber === 3
    ) {

      /**
       * EXAMPLE:
       * 2025/2026
       * -> 2026
       */
      const nextYearStart =
        currentAcademicYear.year.slice(-4)
        console.log(nextYearStart)

      /**
       * FIND NEXT YEAR
       */
      const nextAcademicYear =
        await prisma.academicYear.findFirst({
          where: {
            year: {
              startsWith: nextYearStart,
            },
          },
        })

        console.log(nextAcademicYear)

      if (nextAcademicYear) {
        enrollmentAcademicYearId =
          nextAcademicYear.id
      }

    }

    await prisma.$transaction(async (tx) => {

      for (const studentId of studentIds) {

        const currentEnrollment =
          await tx.studentEnrollment.findFirst({
            where: {
              studentId,
              classId: currentClassId,
              isCurrent: true,
            },
          })

        if (!currentEnrollment) {
          continue
        }

        /**
         * MARK OLD ENROLLMENT
         */
        await tx.studentEnrollment.update({
          where: {
            id: currentEnrollment.id,
          },
          data: {
            isCurrent: false,
            status: "PROMOTED",
          },
        })

        /**
         * CREATE NEW ENROLLMENT
         */
        await tx.studentEnrollment.create({
          data: {
            studentId,
            classId: targetClassId,
            academicYearId:
              enrollmentAcademicYearId,
            isCurrent: true,
            status: "ACTIVE",
          },
        })

      }

      /**
       * UPDATE OLD CLASS COUNT
       */
      await tx.class.update({
        where: {
          id: currentClassId,
        },
        data: {
          currentEnrollment: {
            decrement: studentIds.length,
          },
        },
      })

      /**
       * UPDATE NEW CLASS COUNT
       */
      await tx.class.update({
        where: {
          id: targetClassId,
        },
        data: {
          currentEnrollment: {
            increment: studentIds.length,
          },
        },
      })

    })

    return NextResponse.json({
      success: true,
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error: "Failed to promote students",
      },
      {
        status: 500,
      }
    )

  }

}