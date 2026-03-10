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
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        teacherProfile: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(staff);

  } catch (error) {
    console.log(error)
    return NextResponse.json(
      { error: "Failed to fetch staff" },
      { status: 500 }
    );
  }
}

