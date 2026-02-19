import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken'
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/generated/prisma/enums";
import { generateSequentialId } from "@/lib/id-generator";
import { Prisma } from "@/lib/generated/prisma/client";

const JWT_SECRET = process.env.JWT_TOKEN as string;

export async function POST(req: Request) {
  try {
    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      role = 'TEACHER', 
      classId, 
      specialization,
      dateOfBirth,
      gender,
      guardianName,
      guardianPhone,
      guardianEmail,
      address,
      admissionDate,
      joinDate,
      selectedClasses,
      selectedSubjects
    } = await req.json();

    const existing = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstName,
          lastName,
          email,
          password: hashedPassword,
          role
        }
      });

      switch (role) {
        case UserRole.STUDENT: {
          if (!classId) {
            throw new Error("ClassId is required");
          }

          const studentId = await generateSequentialId(tx, "STUDENT");

          await tx.student.create({
            data: {
              userId: user.id,
              studentId,
              classId,
              dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : new Date(),
              gender: gender || "OTHER",
              guardianName: guardianName || "Unknown",
              guardianEmail: guardianEmail || "unknown@unknown.com",
              guardianPhone: guardianPhone || "0000000000",
              address: address || "Unknown",
              admissionDate: admissionDate ? new Date(admissionDate) : new Date(),
            }
          });

          break;
        }

        case UserRole.TEACHER: {
          if (!specialization) {
            throw new Error("Specialization required");
          }

          const teacherId = await generateSequentialId(tx, "TEACHER");

          const teacher = await tx.teacher.create({
            data: {
              userId: user.id,
              teacherId,
              specialization,
              joinDate: joinDate ? new Date(joinDate) : new Date(),
              // connect classes and subjects if provided
              classes: Array.isArray(selectedClasses) && selectedClasses.length > 0
                ? { connect: selectedClasses.map((id: string) => ({ id })) }
                : undefined,
              subjects: Array.isArray(selectedSubjects) && selectedSubjects.length > 0
                ? { connect: selectedSubjects.map((id: string) => ({ id })) }
                : undefined,
            }
          });

          // Create TeacherClassSubject links for each class-subject combination
          if (Array.isArray(selectedClasses) && Array.isArray(selectedSubjects) && selectedClasses.length && selectedSubjects.length) {
            const classSubjectRecords = await tx.classSubject.findMany({
              where: {
                classId: { in: selectedClasses },
                subjectId: { in: selectedSubjects }
              }
            });

            if (classSubjectRecords.length) {
              await tx.teacherClassSubject.createMany({
                data: classSubjectRecords.map(cs => ({ teacherId: teacher.id, classSubjectId: cs.id })),
                skipDuplicates: true
              });
            }
          }

          // Ensure teacher is connected to the selected classes (explicitly connect each class)
          if (Array.isArray(selectedClasses) && selectedClasses.length) {
            for (const cid of selectedClasses) {
              await tx.class.update({
                where: { id: cid },
                data: { teachers: { connect: { id: teacher.id } } }
              });
            }
          }

          break;
        }

        case UserRole.ADMIN:
          break;

        default:
          throw new Error("Invalid role");
      }

      return user;
    });
    // Fetch teacher with relations for verification if role is TEACHER
    let createdTeacher = null;
    if (role === UserRole.TEACHER) {
      try {
        createdTeacher = await prisma.teacher.findUnique({
          where: { userId: user.id },
          include: {
            classes: true,
            subjects: true,
            teacherClassSubjects: {
              include: { classSubject: { include: { class: true, subject: true } } }
            }
          }
        });
        console.log('Created teacher relations:', { selectedClasses, selectedSubjects, createdTeacher });
      } catch (e) {
        console.log('Failed to fetch created teacher relations', e);
      }
    }
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
      message: "Login successful",
      token,
      user: {
        ...user,
        password: undefined,
      },
      teacher: createdTeacher,
    });

    // SET cookie on the response you return
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      // path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err: any) {
    console.log(err)
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
