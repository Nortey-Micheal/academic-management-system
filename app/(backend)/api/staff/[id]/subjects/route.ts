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

    // ------------------------------------------------
    // CREATE CLASS SUBJECT ASSIGNMENTS
    // ------------------------------------------------
    await prisma.teacherClassSubject.createMany({
      data: classSubjectIds.map(
        (classSubjectId: string) => ({
          teacherId: teacher.id,
          classSubjectId,
        })
      ),
      skipDuplicates: true,
    })

    // ------------------------------------------------
    // GET RELATED SUBJECT IDS
    // ------------------------------------------------
    const classSubjects = await prisma.classSubject.findMany({
      where: {
        id: {
          in: classSubjectIds,
        },
      },
      select: {
        subjectId: true,
      },
    })

    const subjectIds = [
      ...new Set(
        classSubjects.map((cs) => cs.subjectId)
      ),
    ]

    // ------------------------------------------------
    // UPDATE SUBJECT TEACHER
    // ------------------------------------------------
    await prisma.subject.updateMany({
      where: {
        id: {
          in: subjectIds,
        },
      },
      data: {
        teacherId: teacher.id,
      },
    })

    // ------------------------------------------------
    // RETURN UPDATED ASSIGNMENTS
    // ------------------------------------------------
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

export async function DELETE(
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

    const { assignmentId } = body

    if (!assignmentId) {
      return NextResponse.json(
        {
          error: "Assignment ID is required",
        },
        {
          status: 400,
        }
      )
    }

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
     * VERIFY ASSIGNMENT BELONGS TO TEACHER
     */
    const assignment =
      await prisma.teacherClassSubject.findFirst({
        where: {
          id: assignmentId,
          teacherId: teacher.id,
        },
      })

    if (!assignment) {
      return NextResponse.json(
        {
          error: "Assignment not found",
        },
        {
          status: 404,
        }
      )
    }

    /**
     * DELETE ASSIGNMENT
     */
    await prisma.teacherClassSubject.delete({
      where: {
        id: assignmentId,
      },
    })

    return NextResponse.json({
      success: true,
      message:
        "Subject assignment removed successfully",
    })

  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error:
          "Failed to remove subject assignment",
      },
      {
        status: 500,
      }
    )
  }
}