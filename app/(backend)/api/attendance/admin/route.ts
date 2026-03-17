import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {

  try {

    const { searchParams } = new URL(req.url)

    const classId = searchParams.get("classId")
    const date = searchParams.get("date")

    if (!classId || !date) {

      return NextResponse.json(
        { error: "classId and date required" },
        { status: 400 }
      )

    }

    const attendance = await prisma.attendance.findMany({

      where: {
        classId,
        date: new Date(date)
      },

      include: {
        student: {
          include: {
            user: true
          }
        }
      }

    })

    return NextResponse.json({
      attendance
    })

  } catch (error) {

    console.error("Admin attendance fetch error:", error)

    return NextResponse.json(
      { error: "Failed to fetch attendance" },
      { status: 500 }
    )

  }

}