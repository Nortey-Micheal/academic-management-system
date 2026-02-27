import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)

  const level = searchParams.get("level")
  const academicYear = searchParams.get("academicYear")

  if (!level || !academicYear) {
    return NextResponse.json([], { status: 200 })
  }

  // 1️⃣ Get teachers in that level
  const teachersInLevel = await prisma.teacher.findMany({
    include: {
        user: {
            select: {
                firstName: true,
                lastName: true
            }
        }
    }
  })

  // 2️⃣ Get teachers already assigned this year
  const assignedTeachers = await prisma.class.findMany({
    where: {
      academicYear,
      classTeacherId: { not: null },
    },
    select: {
      classTeacherId: true,
    },
  })

  const assignedIds = assignedTeachers.map(
    (c) => c.classTeacherId
  )

  // 3️⃣ Filter available teachers
  const availableTeachers = teachersInLevel.filter(
    (teacher) => !assignedIds.includes(teacher.id)
  )

  return NextResponse.json(availableTeachers)
}