import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ classId: string }> }
) {

  try {

    const { classId } = await params

    const currentClass = await prisma.class.findUnique({
      where: {
        id: classId,
      },

      include: {

        enrollments: {
          where: {
            isCurrent: true,
            status: "ACTIVE",
          },

          include: {
            student: {
              include: {
                user: {
                  select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    status: true,
                  },
                },
              },
            },
          },
        },

      },
    })

    if (!currentClass) {
      return NextResponse.json(
        {
          error: "Class not found",
        },
        {
          status: 404,
        }
      )
    }

    const promotionClasses = await prisma.class.findMany({

      where: {
        NOT: {
          id: currentClass.id,
        },

        grade: {
          gt: currentClass.grade,
        },
      },

      orderBy: [
        {
          level: "asc",
        },
        {
          grade: "asc",
        },
        {
          section: "asc",
        },
      ],

    })

    return NextResponse.json({
      currentClass,
      promotionClasses,
    })

  } catch (error) {

    console.error(error)

    return NextResponse.json(
      {
        error: "Failed to fetch promotion data",
      },
      {
        status: 500,
      }
    )

  }

}