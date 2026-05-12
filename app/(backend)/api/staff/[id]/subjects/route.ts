import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  try {
    const { id } = await params

    /**
     * FIND TEACHER USING USER ID
     */
    const teacher = await prisma.teacher.findUnique({
      where: {
        userId: id,
      },
    })

    if (!teacher) {
      return NextResponse.json(
        {
          error: "Teacher not found",
        },
        {
          status: 404,
        }
      )
    }

    /**
     * FETCH ASSIGNED SUBJECTS
     */
    const assignments =
      await prisma.teacherClassSubject.findMany({
        where: {
          teacherId: teacher.id,
        },

        include: {
          classSubject: {
            include: {
              class: true,
              subject: true,
            },
          },
        },

        // orderBy: {
        //   createdAt: "desc",
        // },
      })

    return NextResponse.json({
      success: true,
      assignments,
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error:
          "Failed to fetch teacher assignments",
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(
  request: NextRequest,
  {
    params,
  }: {
    params: Promise<{ id: string }>
  }
) {
  try {
    const { id } = await params

    const body = await request.json()
    const { classSubjectIds } = body

    if (
      !Array.isArray(classSubjectIds) ||
      classSubjectIds.length === 0
    ) {
      return NextResponse.json(
        {
          error:
            "classSubjectIds must be a non-empty array",
        },
        { status: 400 }
      )
    }

    const teacher = await prisma.teacher.findUnique({
      where: {
        userId: id,
      },
    })

    if (!teacher) {
      return NextResponse.json(
        {
          error: "Teacher not found",
        },
        { status: 404 }
      )
    }

    await prisma.teacherClassSubject.createMany({
      data: classSubjectIds.map(
        (classSubjectId: string) => ({
          teacherId: teacher.id,
          classSubjectId,
        })
      ),
      skipDuplicates: true,
    })

    const assignments =
      await prisma.teacherClassSubject.findMany({
        where: {
          teacherId: teacher.id,
        },
        include: {
          classSubject: {
            include: {
              class: true,
              subject: true,
            },
          },
        },
      })

    return NextResponse.json({
      success: true,
      assignments,
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: "Failed to assign subjects",
      },
      { status: 500 }
    )
  }
}