import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ userId: string }>;
  }
) {
  try {
    const { userId } = await params;

    /**
     * OPTIONAL:
     * verify user exists/role here
     */

    const classes = await prisma.class.findMany({
        include: {
            students: {
                select: {
                    id: true,
                    gender: true,
                    studentId: true,
                    guardianName: true,
                    guardianPhone: true,
                    user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        status: true,
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

    /**
     * Transform:
     * subjects: ClassSubject[]
     * =>
     * subjects: Subject[]
     */
    const transformedClasses = classes.map((cls) => ({
      ...cls,

      subjects: cls.subjects.map(
        (item) => item.subject
      ),
    }));

    return NextResponse.json(transformedClasses);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error: "Failed to fetch classes",
      },
      {
        status: 500,
      }
    );
  }
}