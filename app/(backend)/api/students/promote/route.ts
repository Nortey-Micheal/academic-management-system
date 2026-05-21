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

    await prisma.$transaction(async (tx) => {

      for (const studentId of studentIds) {

        const currentEnrollment = await tx.studentEnrollment.findFirst({
          where: {
            studentId,
            classId: currentClassId,
            isCurrent: true,
          },
        })

        if (!currentEnrollment) {
          continue
        }

        // mark old enrollment inactive
        await tx.studentEnrollment.update({
          where: {
            id: currentEnrollment.id,
          },
          data: {
            isCurrent: false,
            status: "PROMOTED",
          },
        })

        // create new enrollment
        await tx.studentEnrollment.create({
          data: {
            studentId,
            classId: targetClassId,
            academicYearId,
            isCurrent: true,
            status: "ACTIVE",
          },
        })

      }

      // decrement old class count
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

      // increment new class count
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
        error: "Failed to promote students"
      },
      {
        status: 500
      }
    )

  }

}
