import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma/enums";
import { generateSequentialId } from "@/lib/id-generator";

const JWT_SECRET = process.env.JWT_TOKEN as string;

export async function POST(req: Request) {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role = "TEACHER",

      // STUDENT
      classId,
      dateOfBirth,
      gender,
      guardianName,
      guardianPhone,
      guardianEmail,
      address,
      admissionDate,

      // TEACHER
      specialization,
      joinDate,
      selectedClasses,
      selectedSubjects,
    } = await req.json();

    /* ===========================
       CHECK IF USER EXISTS
    ============================ */
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    /* ===========================
       TRANSACTION START
    ============================ */
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role,
        },
      });

      if (role === UserRole.ADMIN || role === UserRole.HEADTEACHER) {
        return newUser;
      }

      /* ===========================
         STUDENT CREATION
      ============================ */
      if (role === UserRole.STUDENT) {
        if (!classId) {
          throw new Error("ClassId is required for student");
        }

        const studentId = await generateSequentialId(tx, "STUDENT");

        await tx.student.create({
          data: {
            userId: newUser.id,
            studentId,
            classId,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
            gender: gender || "OTHER",
            guardianName: guardianName || "Unknown",
            guardianEmail: guardianEmail || "unknown@unknown.com",
            guardianPhone: guardianPhone || "0000000000",
            address: address || "Unknown",
            admissionDate: admissionDate
              ? new Date(admissionDate)
              : new Date(),
          },
        });
      }

      /* ===========================
         TEACHER CREATION
      ============================ */
      if (role === UserRole.TEACHER) {
        if (!specialization) {
          throw new Error("Specialization is required");
        }

        const teacherId = await generateSequentialId(tx, "TEACHER");

        const teacher = await tx.teacher.create({
          data: {
            userId: newUser.id,
            teacherId,
            specialization,
            joinDate: joinDate ? new Date(joinDate) : new Date(),

            // Subjects teacher is generally qualified to teach
            subjects:
              Array.isArray(selectedSubjects) &&
              selectedSubjects.length > 0
                ? {
                    connect: selectedSubjects.map((id: string) => ({
                      id,
                    })),
                  }
                : undefined,
          },
        });

        /* 1️⃣ Assign as FORM / CLASS TEACHER */
        if (classId) {
          await tx.class.update({
            where: { id: classId },
            data: {
              classTeacherId: teacher.id,
            },
          });
        }

        /* 2️⃣ Assign subject teaching per class */
        if (
          Array.isArray(selectedClasses) &&
          Array.isArray(selectedSubjects) &&
          selectedClasses.length &&
          selectedSubjects.length
        ) {
          const teacherClassSubjectData: { teacherId: string; classSubjectId: string }[] = [];

          for (const classId of selectedClasses) {
            for (const subjectId of selectedSubjects) {
              // Try to find existing ClassSubject
              let classSubject = await tx.classSubject.findFirst({
                where: { classId, subjectId },
              });

              // If not exists, create it
              if (!classSubject) {
                classSubject = await tx.classSubject.create({
                  data: { classId, subjectId },
                });
              }

              // Prepare data for linking
              teacherClassSubjectData.push({
                teacherId: teacher.id,
                classSubjectId: classSubject.id,
              });
            }
          }

          // Bulk insert TeacherClassSubject links
          await tx.teacherClassSubject.createMany({
            data: teacherClassSubjectData,
            skipDuplicates: true,
          });
        }
      }

      return newUser;
    });

    /* ===========================
       FETCH CREATED TEACHER
    ============================ */
    let createdTeacher = null;

    if (role === UserRole.TEACHER) {
      createdTeacher = await prisma.teacher.findUnique({
        where: { userId: user.id },
        include: {
          subjects: true,
          classTeacherOf: true,
          teacherClassSubjects: {
            include: {
              classSubject: {
                include: {
                  class: true,
                  subject: true,
                },
              },
            },
          },
        },
      });
    }

    /* ===========================
       JWT TOKEN
    ============================ */
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Account created successfully",
      token,
      user: {
        ...user,
        password: undefined,
      },
      teacher: createdTeacher,
    });

    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    console.error(err);
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}