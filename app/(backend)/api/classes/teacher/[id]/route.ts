import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {

    const { id } = await params

    const teacher = await prisma.teacher.findUnique({
      where: {
        userId: id
      }
    })

    const teacherClass = await prisma.class.findFirst({
      where: {
        classTeacherId: teacher?.id
      },
      include: {
        students: {
          include: {
            user: true
          }
        }
      }
    })

    return NextResponse.json({
      class: teacherClass || null
    })

  } catch (error) {

    console.error("Fetch class teacher error:", error)

    return NextResponse.json(
      { error: "Failed to fetch class" },
      { status: 500 }
    )

  }
}