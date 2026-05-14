import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { holidaySchema } from '@/lib/validation/settings'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const body = await request.json()

    const validated = holidaySchema.parse(body)

    /**
     * Check if holiday exists
     */
    const existingHoliday = await prisma.holiday.findUnique({
      where: {
        id,
      },
    })

    if (!existingHoliday) {
      return NextResponse.json(
        {
          success: false,
          error: 'Holiday not found',
        },
        {
          status: 404,
        }
      )
    }

    /**
     * Update holiday
     */
    const updatedHoliday = await prisma.holiday.update({
      where: {
        id,
      },
      data: {
        name: validated.name,
        startDate: validated.startDate,
        endDate: validated.endDate,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Holiday updated successfully',
      data: updatedHoliday,
    })
  } catch (error: any) {
    console.log(error)

    return NextResponse.json(
      {
        success: false,
        error:
          error?.errors?.[0]?.message ||
          error?.message ||
          'Failed to update holiday',
      },
      {
        status: 400,
      }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    /**
     * Check if holiday exists
     */
    const existingHoliday = await prisma.holiday.findUnique({
      where: {
        id,
      },
    })

    if (!existingHoliday) {
      return NextResponse.json(
        {
          success: false,
          error: 'Holiday not found',
        },
        {
          status: 404,
        }
      )
    }

    /**
     * Delete holiday
     */
    await prisma.holiday.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Holiday deleted successfully',
    })
  } catch (error: any) {
    console.log(error)

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          'Failed to delete holiday',
      },
      {
        status: 400,
      }
    )
  }
}