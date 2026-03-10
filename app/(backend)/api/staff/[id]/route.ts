import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {

      // 1️⃣ Update user
      const user = await tx.user.update({
        where: { id },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          phone: body.phone,
          role: body.role,
          status: body.status
        }
      });

      let teacher = null;

      // 2️⃣ Create or update teacher profile
      if (body.role === "TEACHER" && body.teacherProfile) {

        teacher = await tx.teacher.upsert({
          where: { userId: id },
          update: {
            teacherId: body.teacherProfile.teacherId,
            specialization: body.teacherProfile.specialization,
            joinDate: body.teacherProfile.joinDate
          },
          create: {
            userId: id,
            teacherId: body.teacherProfile.teacherId,
            specialization: body.teacherProfile.specialization,
            joinDate: body.teacherProfile.joinDate
          }
        });

      }

      // 3️⃣ Handle class + subject assignments
      if (teacher && body.classAssignments) {

        // remove previous assignments
        await tx.teacherClassSubject.deleteMany({
          where: { teacherId: teacher.id }
        });

        for (const assignment of body.classAssignments) {

          const { classId, subjects, isClassTeacher } = assignment;

          // assign subjects
          for (const subjectId of subjects) {

            const classSubject = await tx.classSubject.findFirst({
              where: {
                classId,
                subjectId
              }
            });

            if (!classSubject) continue;

            await tx.teacherClassSubject.create({
              data: {
                teacherId: teacher.id,
                classSubjectId: classSubject.id
              }
            });
          }

          // assign class teacher
          if (isClassTeacher) {

            await tx.class.update({
              where: { id: classId },
              data: {
                classTeacherId: teacher.id
              }
            });

          }

        }

        // remove class teacher from classes not selected
        await tx.class.updateMany({
          where: {
            classTeacherId: teacher.id,
            id: {
              notIn: body.classAssignments
                .filter((c: any) => c.isClassTeacher)
                .map((c: any) => c.classId)
            }
          },
          data: {
            classTeacherId: null
          }
        });

      }

      return {...user,teacherProfile: {...teacher}};

    });

    return NextResponse.json({...result,password:undefined});

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error: "Failed to update staff" },
      { status: 500 }
    );

  }
}