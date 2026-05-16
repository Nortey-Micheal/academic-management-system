import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ teacherId: string }> }
) {
  try {
    const teacherId = (await params).teacherId;

    // 1️⃣ Get all class-teaching links for this teacher
    const teacherClassSubjects = await prisma.teacherClassSubject.findMany({
      where: { teacherId },
      include: {
        classSubject: {
          include: {
            class: {
              include: {
                students: {
                  select: {
                    id: true,
                    gender: true,
                    user: {
                      select: {
                        firstName: true,
                        lastName: true,
                        status: true,
                      },
                    },
                    studentId: true,
                    guardianName: true,
                    guardianPhone: true,
                  },
                },
              },
            },
            subject: true,
          },
        },
      },
    });

    // 2️⃣ Include classes where teacher is form/class teacher
    const formTeacherClasses = await prisma.class.findMany({
      where: { classTeacherId: teacherId },
      include: {
        students: {
          select: {
            id: true,
            gender: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });

    // 3️⃣ Transform TeacherClassSubject to classes array
    const subjectClassesMap = new Map<string, any>();
    for (const tcs of teacherClassSubjects) {
      const cls = tcs.classSubject.class;
      if (!subjectClassesMap.has(cls.id)) {
        subjectClassesMap.set(cls.id, {
          ...cls,
          subjects: [],
        });
      }
      subjectClassesMap.get(cls.id).subjects.push(tcs.classSubject.subject);
    }

    // Merge form teacher classes (avoid duplicates)
    for (const cls of formTeacherClasses) {
      const transformedSubjects = cls.subjects.map(
        (item) => item.subject
      );

      if (!subjectClassesMap.has(cls.id)) {
        subjectClassesMap.set(cls.id, {
          ...cls,
          subjects: transformedSubjects,
        });
      } else {
        const existingSubjects =
          subjectClassesMap.get(cls.id).subjects;

        transformedSubjects.forEach((subject) => {
          if (
            !existingSubjects.some(
              (s: { id: string }) => s.id === subject.id
            )
          ) {
            existingSubjects.push(subject);
          }
        });
      }
    }

    // Convert map to array and sort by className
    const classes = Array.from(subjectClassesMap.values()).sort((a, b) => {
      if (a.grade !== b.grade) {
        return a.grade - b.grade
      }

      return a.section.localeCompare(b.section)
    });

    return NextResponse.json(classes);
  } catch (error) {``
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch classes, subjects, and students" },
      { status: 500 }
    );
  }
}