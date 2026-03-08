import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {

    const body = await req.json();

    const result = await prisma.$transaction(async (tx) => {

      // update base user
      const user = await tx.user.update({
        where: { id: params.id },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          role: body.role,
          status: body.status
        }
      });

      // find teacher profile
      let teacher = await tx.teacher.findUnique({
        where: { userId: params.id }
      });

      // create teacher profile if role switched to teacher
      if (body.role === "TEACHER" && !teacher) {

        teacher = await tx.teacher.create({
          data: {
            userId: params.id,
            teacherId: body.teacherProfile.teacherId,
            specialization: body.teacherProfile.specialization,
            joinDate: body.teacherProfile.joinDate
          }
        });

      }

      // update teacher profile
      if (teacher && body.teacherProfile) {

        await tx.teacher.update({
          where: { userId: params.id },
          data: {
            teacherId: body.teacherProfile.teacherId,
            specialization: body.teacherProfile.specialization,
            joinDate: body.teacherProfile.joinDate
          }
        });

      }

      // assign subjects
      if (teacher && body.subjects) {

        await tx.teacherClassSubject.deleteMany({
          where: {
            teacherId: teacher.id
          }
        });

        for (const subjectId of body.subjects) {

          await tx.teacherClassSubject.create({
            data: {
              teacherId: teacher.id,
              classSubjectId: subjectId
            }
          });

        }

      }

      // class teacher assignments
      if (teacher && body.classTeacherOf) {

        await tx.class.updateMany({
          where: {
            classTeacherId: teacher.id
          },
          data: {
            classTeacherId: null
          }
        });

        for (const classId of body.classTeacherOf) {

          await tx.class.update({
            where: { id: classId },
            data: {
              classTeacherId: teacher.id
            }
          });

        }

      }

      return user;

    });

    return NextResponse.json(result);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Failed to update staff" },
      { status: 500 }
    );

  }
}