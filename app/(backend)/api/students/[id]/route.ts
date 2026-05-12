import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { createStudentSchema } from "../route";

/**
 * GET SINGLE STUDENT
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
        class: true,
      },
    });

    if (!student) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(student);

  } catch (error) {
    console.error("Error fetching student:", error);

    return NextResponse.json(
      { error: "Failed to fetch student" },
      { status: 500 }
    );
  }
}

/**
 * UPDATE STUDENT (FULL UPDATE)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const parsedData = createStudentSchema.parse(body);

    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    const updatedStudent = await prisma.$transaction(async (tx) => {

      /**
       * Handle class enrollment changes
       */
      if (existingStudent.classId !== parsedData.classId) {

        // decrement old class
        await tx.class.update({
          where: { id: existingStudent.classId },
          data: {
            currentEnrollment: {
              decrement: 1,
            },
          },
        });

        // increment new class
        await tx.class.update({
          where: { id: parsedData.classId },
          data: {
            currentEnrollment: {
              increment: 1,
            },
          },
        });
      }

      /**
       * Update user
       */
      await tx.user.update({
        where: {
          id: existingStudent.userId,
        },
        data: {
          firstName: parsedData.firstName,
          lastName: parsedData.lastName,
        },
      });

      /**
       * Update student
       */
      return await tx.student.update({
        where: { id },
        data: {
          dateOfBirth: new Date(parsedData.dateOfBirth),
          gender: parsedData.gender,
          classId: parsedData.classId,
          guardianName: parsedData.guardianName,
          guardianPhone: parsedData.guardianPhone,
          guardianEmail: parsedData.guardianEmail || "",
          address: parsedData.address,
          admissionDate: parsedData.admissionDate
            ? new Date(parsedData.admissionDate)
            : undefined,
        },
        include: {
          user: true,
          class: true,
        },
      });
    });

    return NextResponse.json(updatedStudent);

  } catch (error: any) {
    console.error("Error updating student:", error);

    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update student" },
      { status: 500 }
    );
  }
}

/**
 * PATCH STUDENT (PARTIAL UPDATE)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const body = await request.json();

    const existingStudent = await prisma.student.findUnique({
      where: { id },
      include: {
        user: true,
      },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    /**
     * Update user fields separately
     */
    if (body.firstName || body.lastName) {
      await prisma.user.update({
        where: {
          id: existingStudent.userId,
        },
        data: {
          ...(body.firstName && {
            firstName: body.firstName,
          }),
          ...(body.lastName && {
            lastName: body.lastName,
          }),
        },
      });
    }

    /**
     * Update student
     */
    const updatedStudent = await prisma.student.update({
      where: { id },
      data: {
        ...(body.dateOfBirth && {
          dateOfBirth: new Date(body.dateOfBirth),
        }),

        ...(body.gender && {
          gender: body.gender,
        }),

        ...(body.classId && {
          classId: body.classId,
        }),

        ...(body.guardianName && {
          guardianName: body.guardianName,
        }),

        ...(body.guardianPhone && {
          guardianPhone: body.guardianPhone,
        }),

        ...(body.guardianEmail && {
          guardianEmail: body.guardianEmail,
        }),

        ...(body.address && {
          address: body.address,
        }),
      },
      include: {
        user: true,
        class: true,
      },
    });

    return NextResponse.json(updatedStudent);

  } catch (error) {
    console.error("Error patching student:", error);

    return NextResponse.json(
      { error: "Failed to patch student" },
      { status: 500 }
    );
  }
}

/**
 * DELETE STUDENT
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const existingStudent = await prisma.student.findUnique({
      where: { id },
    });

    if (!existingStudent) {
      return NextResponse.json(
        { error: "Student not found" },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {

      /**
       * Decrement class enrollment
       */
      await tx.class.update({
        where: {
          id: existingStudent.classId,
        },
        data: {
          currentEnrollment: {
            decrement: 1,
          },
        },
      });

      /**
       * Delete student
       */
      await tx.student.delete({
        where: { id },
      });

      /**
       * Delete linked user
       */
      await tx.user.delete({
        where: {
          id: existingStudent.userId,
        },
      });
    });

    return NextResponse.json({
      message: "Student deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting student:", error);

    return NextResponse.json(
      { error: "Failed to delete student" },
      { status: 500 }
    );
  }
}