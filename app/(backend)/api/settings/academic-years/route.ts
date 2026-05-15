import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const year = body.year?.trim()

    if (!year) {
      return NextResponse.json(
        {
          success: false,
          error: 'Academic year is required',
        },
        {
          status: 400,
        }
      )
    }

    // Validate format: 2025/2026
    const academicYearRegex = /^\d{4}\/\d{4}$/

    if (!academicYearRegex.test(year)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Academic year must be in format 2025/2026',
        },
        {
          status: 400,
        }
      )
    }

    const [startYear, endYear] = year
      .split('/')
      .map(Number)

    // Ensure consecutive years
    if (endYear !== startYear + 1) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Academic year must contain consecutive years',
        },
        {
          status: 400,
        }
      )
    }

    // Prevent duplicates
    const existingAcademicYear =
      await prisma.academicYear.findUnique({
        where: {
          year,
        },
      })

    if (existingAcademicYear) {
      return NextResponse.json(
        {
          success: false,
          error: 'Academic year already exists',
        },
        {
          status: 409,
        }
      )
    }

    // Create academic year with all 3 terms
    const academicYear =
      await prisma.academicYear.create({
        data: {
          year,

          terms: {
            create: [
              {
                termNumber: 1,
              },
              {
                termNumber: 2,
              },
              {
                termNumber: 3,
              },
            ],
          },
        },

        include: {
          terms: {
            orderBy: {
              termNumber: 'asc',
            },
          },
        },
      })

    return NextResponse.json(
      {
        success: true,
        message:
          'Academic year created successfully',
        data: academicYear,
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
          error?.message ||
          'Failed to create academic year',
      },
      {
        status: 500,
      }
    )
  }
}