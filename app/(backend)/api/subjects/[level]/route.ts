import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { Level } from "@/lib/generated/prisma/enums";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ level: string }> }
) {
  try {
    const levelParam = (await params).level.toUpperCase();

    console.log(levelParam)

    if (!Object.values(Level).includes(levelParam as Level)) {
      return NextResponse.json(
        { message: "Invalid department level" },
        { status: 400 }
      );
    }

    const subjects = await prisma.subject.findMany({
      where: {
        level: levelParam as Level,
      },
      orderBy: {
        subjectName: "asc",
      },
    });

    return NextResponse.json(subjects);
  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
