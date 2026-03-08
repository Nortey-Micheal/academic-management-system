import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {

    const staff = await prisma.user.findMany({
      where: {
        role: {
          not: "STUDENT"
        }
      },
      include: {
        teacherProfile: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(staff);

  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

