import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { academicSettingsSchema } from '@/lib/validation/settings'
import { Prisma } from '@/lib/generated/prisma/client'

type AcademicYearWithTerms = Prisma.AcademicYearGetPayload<{
  include: { terms: true }
}>

export async function GET() {
  try {
    const academicYears = await prisma.academicYear.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        terms: {
          orderBy: {
            termNumber: 'asc',
          },
        },
      },
    }) as AcademicYearWithTerms[]

    const currentAcademicYear = academicYears.find(
      (year) => year.isActive
    )

    const currentTerm =
      currentAcademicYear?.terms.find(
        (term) => term.isActive
      ) || null

    console.log(academicYears)

    return NextResponse.json({
      success: true,

      academicYears: academicYears.map((year) => ({
        id: year.id,
        year: year.year,
        isActive: year.isActive,
        terms: [...year.terms]
      })),

      terms:
        currentAcademicYear?.terms.map((term) => ({
          id: term.id,
          name:
            term.termNumber === 1
              ? 'First Term'
              : term.termNumber === 2
              ? 'Second Term'
              : 'Third Term',

          termNumber: term.termNumber,
          isActive: term.isActive,
          startDate: term.termStartDate,
          endDate: term.termEndDate,
        })) || [],

      currentAcademicYear: currentAcademicYear
        ? {
            id: currentAcademicYear.id,
            name: currentAcademicYear.year,
          }
        : null,

      currentTerm: currentTerm
        ? {
            id: currentTerm.id,
            name:
              currentTerm.termNumber === 1
                ? 'First Term'
                : currentTerm.termNumber === 2
                ? 'Second Term'
                : 'Third Term',

            startDate: currentTerm.termStartDate,
            endDate: currentTerm.termEndDate,
          }
        : null,

      academicStatus: 'Active',
    })
  } catch (error) {
    console.log(error)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch academic settings',
      },
      {
        status: 500,
      }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const validated = academicSettingsSchema.parse(body)

    const academicYear = await prisma.academicYear.findFirst({
      where: {
        year: validated.academicYear,
      },
    })

    if (!academicYear) {
      return NextResponse.json(
        {
          success: false,
          error: 'Academic year not found',
        },
        {
          status: 404,
        }
      )
    }

    const termNumberMap: Record<string, number> = {
      'First Term': 1,
      'Second Term': 2,
      'Third Term': 3,
    }

    const selectedTermNumber =
      termNumberMap[validated.term]

    const term = await prisma.term.findFirst({
      where: {
        academicYearId: academicYear.id,
        termNumber: selectedTermNumber,
      },
    })

    if (!term) {
      return NextResponse.json(
        {
          success: false,
          error: 'Term not found',
        },
        {
          status: 404,
        }
      )
    }

    await prisma.$transaction([
      prisma.academicYear.updateMany({
        data: {
          isActive: false,
        },
      }),

      prisma.term.updateMany({
        data: {
          isActive: false,
        },
      }),

      prisma.academicYear.update({
        where: {
          id: academicYear.id,
        },
        data: {
          isActive: true,
        },
      }),

      prisma.term.update({
        where: {
          id: term.id,
        },
        data: {
          isActive: true,
          termStartDate: validated.termStartDate,
          termEndDate: validated.termEndDate,
        },
      }),
    ])

    const updatedAcademicYear =
      await prisma.academicYear.findUnique({
        where: {
          id: academicYear.id,
        },
        include: {
          terms: true,
        },
      })

    return NextResponse.json({
      success: true,
      message: 'Academic settings updated successfully',
      data: updatedAcademicYear,
    })
  } catch (error: any) {
    console.log(error)

    return NextResponse.json(
      {
        success: false,
        error:
          error?.errors?.[0]?.message ||
          error?.message ||
          'Failed to save academic settings',
      },
      {
        status: 400,
      }
    )
  }
}