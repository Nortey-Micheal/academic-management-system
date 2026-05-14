import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { holidaySchema } from '@/lib/validation/settings'

export async function GET() {
  try {
    const holidays = await prisma.holiday.findMany({
      orderBy: {
        startDate: 'desc',
      },
      include: {
        academicYear: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: holidays,
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch holidays',
      },
      {
        status: 500,
      }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const validated = holidaySchema.parse(body)

    /**
     * Get current active academic year
     */
    const currentAcademicYear =
      await prisma.academicYear.findFirst({
        where: {
          isActive: true,
        },
      })

    if (!currentAcademicYear) {
      return NextResponse.json(
        {
          success: false,
          error: 'No active academic year found',
        },
        {
          status: 404,
        }
      )
    }

    /**
     * Create holiday
     */
    const holiday = await prisma.holiday.create({
      data: {
        name: validated.name,
        startDate: validated.startDate,
        endDate: validated.endDate,
        academicYearId: currentAcademicYear.id,
      },
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Holiday created successfully',
        data: holiday,
      },
      {
        status: 201,
      }
    )
  } catch (error: any) {
    console.log(error)

    return NextResponse.json(
      {
        success: false,
        error:
          error?.errors?.[0]?.message ||
          error?.message ||
          'Failed to create holiday',
      },
      {
        status: 400,
      }
    )
  }
}