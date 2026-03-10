import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await req.json()
    const { classId } = body

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID is required" },
        { status: 400 }
      )
    }

    // Check teacher exists
    const teacher = await prisma.teacher.findUnique({
      where: { id }
    })

    if (!teacher) {
      return NextResponse.json(
        { error: "Teacher not found" },
        { status: 404 }
      )
    }

    // Check class exists
    const existingClass = await prisma.class.findUnique({
      where: { id: classId }
    })

    if (!existingClass) {
      return NextResponse.json(
        { error: "Class not found" },
        { status: 404 }
      )
    }

    // Ensure class doesn't already have a teacher
    if (existingClass.classTeacherId) {
      return NextResponse.json(
        { error: "This class already has a class teacher" },
        { status: 400 }
      )
    }

    // Ensure teacher isn't already a class teacher elsewhere
    const alreadyAssigned = await prisma.class.findFirst({
      where: { classTeacherId: id }
    })

    if (alreadyAssigned) {
      return NextResponse.json(
        { error: "Teacher is already assigned to another class" },
        { status: 400 }
      )
    }

    // Assign teacher
    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: {
        classTeacherId: teacher.id
      }
    })

    return NextResponse.json(updatedClass)

  } catch (error) {
    console.error("Class teacher assignment error:", error)

    return NextResponse.json(
      { error: "Failed to assign class teacher" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  req: NextRequest
) {
  try {
    const body = await req.json()
    const { classId } = body

    if (!classId) {
      return NextResponse.json(
        { error: "Class ID required" },
        { status: 400 }
      )
    }

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: { classTeacherId: null }
    })

    return NextResponse.json(updatedClass)

  } catch (error) {
    console.error("Remove class teacher error:", error)

    return NextResponse.json(
      { error: "Failed to remove class teacher" },
      { status: 500 }
    )
  }
}