// app/api/classes/[classId]/route.ts

import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

export async function GET(
  req: Request,
  {
    params,
  }: {
    params: Promise<{ classId: string }>
  }
) {
  try {
    const { classId } = await params

    const classData = await prisma.class.findUnique({
      where: {
        id: classId,
      },

      include: {
        classTeacher: {
          include: {
            user: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    })

    const currentTerm = await prisma.term.findFirst({
      where: {
        isActive: true
      },
    })

    console.log({currentTerm})

    if (!classData) {
      return NextResponse.json(
        {
          error: 'Class not found',
        },
        {
          status: 404,
        }
      )
    }

    return NextResponse.json({
      class: {...classData,currentTerm:currentTerm?.termNumber},
    })
  } catch (error) {
    console.error(error)

    return NextResponse.json(
      {
        error: 'Failed to fetch class',
      },
      {
        status: 500,
      }
    )
  }
}