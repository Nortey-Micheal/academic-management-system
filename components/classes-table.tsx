"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  MoreVertical,
  GraduationCap,
  Users,
  UserCheck,
  BookOpen,
} from "lucide-react"

import { AddClassDialog } from "@/components/add-class-dialog"

interface ClassItem {
  id: string
  grade: number
  section: string
  level: string
  academicYear: string
  capacity: number
  currentEnrollment: number
  classTeacherId: string | null
  enrollments: any[]

  classTeacher?: {
    id: string
    user?: {
      firstName: string
      lastName: string
    }
  } | null

  students?: {
    id: string
    gender: string
  }[]

  subjects?: {
    id: string
  }[]
}

export function ClassesTable() {
  const router = useRouter()

  const [classes, setClasses] = useState<ClassItem[]>([])
  const [loading, setLoading] = useState(true)
  const [academicYear,setAcademicYear] = useState<string>('')

  // ------------------------------------------------
  // FETCH CLASSES
  // ------------------------------------------------
  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setLoading(true)

      const response = await fetch("/api/classes")

      if (!response.ok) {
        throw new Error("Failed to fetch classes")
      }

      const data = await response.json()

      setClasses(data.classes || [])
    } catch (error) {
      console.error("[v0] Error fetching classes:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const fetchAcademicYear = async () => {
      const response = await fetch('/api/system/active-term')
      const data = await response.json()

      setAcademicYear(data.academicYear.year)
    }

    fetchAcademicYear()
  },[])

  // ------------------------------------------------
  // SORTED CLASSES
  // ------------------------------------------------
  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => {
      if (a.grade !== b.grade) {
        return a.grade - b.grade
      }

      return a.section.localeCompare(b.section)
    })
  }, [classes])

  // ------------------------------------------------
  // STATS
  // ------------------------------------------------
  const totalStudents = classes.reduce(
    (acc, cls) => acc + cls.enrollments.length,
    0
  )

  const fullClasses = classes.filter(
    (cls) => cls.enrollments.length >= cls.capacity
  ).length

  // ------------------------------------------------
  // HELPERS
  // ------------------------------------------------
  const getOccupancyPercentage = (
    current: number,
    capacity: number
  ) => {
    if (!capacity || capacity <= 0) return 0

    return Math.round((current / capacity) * 100)
  }

  const getProgressColor = (percentage: number) => {
    if (percentage >= 90) {
      return "[&>*]:bg-red-500"
    }

    if (percentage >= 70) {
      return "[&>*]:bg-yellow-500"
    }

    return "[&>*]:bg-green-600"
  }

  // ------------------------------------------------
  // LOADING SKELETON
  // ------------------------------------------------
  if (loading) {
    return (
      <div className="space-y-6 pb-24">
        <Card>
          <CardHeader>
            <div className="h-6 w-40 rounded bg-muted animate-pulse" />
          </CardHeader>

          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 6 }).map((_, index) => (
                <Card key={index} className="border-2">
                  <CardContent className="pt-6 space-y-4">
                    <div className="space-y-2">
                      <div className="h-5 w-28 rounded bg-muted animate-pulse" />
                      <div className="h-4 w-40 rounded bg-muted animate-pulse" />
                    </div>

                    <div className="h-3 w-full rounded bg-muted animate-pulse" />

                    <div className="flex gap-2">
                      <div className="h-8 flex-1 rounded bg-muted animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-24">

      {/* ------------------------------------------------ */}
      {/* OVERVIEW STATS */}
      {/* ------------------------------------------------ */}
      <div className="grid gap-4 grid-cols-2 xl:grid-cols-4">

        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Classes
              </p>

              <h2 className="text-2xl font-bold">
                {classes.length}
              </h2>
            </div>

            <GraduationCap className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Total Students
              </p>

              <h2 className="text-2xl font-bold">
                {totalStudents}
              </h2>
            </div>

            <Users className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Full Classes
              </p>

              <h2 className="text-2xl font-bold">
                {fullClasses}
              </h2>
            </div>

            <UserCheck className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                Academic Year
              </p>

              <h2 className="text-xl font-bold">
                {academicYear}
              </h2>
            </div>

            <BookOpen className="h-8 w-8 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      {/* ------------------------------------------------ */}
      {/* MAIN CARD */}
      {/* ------------------------------------------------ */}
      <Card>

        {/* HEADER */}
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <CardTitle>
                Classes ({classes.length})
              </CardTitle>

              <p className="text-sm text-muted-foreground mt-1">
                Manage school classes, enrollment, and assignments.
              </p>
            </div>

            <AddClassDialog onClassAdded={fetchClasses} />
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent>

          {/* EMPTY STATE */}
          {sortedClasses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">

              <GraduationCap className="h-12 w-12 text-muted-foreground mb-4" />

              <h3 className="text-lg font-semibold">
                No classes created yet
              </h3>

              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                Start by creating your first class to manage
                students, attendance, subjects, and assessments.
              </p>

              <div className="mt-6">
                <AddClassDialog onClassAdded={fetchClasses} />
              </div>
            </div>
          ) : (

            /* CLASSES GRID */
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {sortedClasses.map((classItem) => {

                const occupancy = getOccupancyPercentage(
                  classItem.enrollments.length,
                  classItem.capacity
                )

                const boys =
                  classItem.students?.filter(
                    (student) => student.gender === "male"
                  ).length || 0

                const girls =
                  classItem.students?.filter(
                    (student) => student.gender === "female"
                  ).length || 0

                return (
                  <Card
                    key={classItem.id}
                    className="border-2 transition-all hover:shadow-lg hover:-translate-y-1 cursor-pointer h-full"
                    onClick={() =>
                      router.push(`/classes/${classItem.id}`)
                    }
                  >
                    <CardContent className="pt-6 h-full">

                      <div className="flex flex-col justify-between h-full space-y-5">

                        {/* TOP */}
                        <div className="space-y-4">

                          {/* HEADER */}
                          <div className="flex items-start justify-between gap-4">

                            <div>
                              <h3 className="text-xl font-semibold">
                                Basic {classItem.grade}{" "}
                                {classItem.section}
                              </h3>

                              <p className="text-sm text-muted-foreground">
                                Academic Year:{" "}
                                {academicYear}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">

                              <Badge variant="secondary">
                                {classItem.level
                                  ?.replaceAll("_", " ")
                                  ?.toLowerCase()}
                              </Badge>

                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <MoreVertical className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end">

                                  <DropdownMenuItem
                                    onClick={() =>
                                      router.push(
                                        `/dashboard/classes/${classItem.id}`
                                      )
                                    }
                                  >
                                    View Class
                                  </DropdownMenuItem>

                                  <DropdownMenuItem>
                                    View Students
                                  </DropdownMenuItem>

                                  <DropdownMenuItem>
                                    Assign Subjects
                                  </DropdownMenuItem>

                                  <DropdownMenuItem>
                                    Attendance
                                  </DropdownMenuItem>

                                  <DropdownMenuItem>
                                    Assessments
                                  </DropdownMenuItem>

                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>

                          {/* CLASS TEACHER */}
                          <div className="text-sm">
                            <span className="text-muted-foreground">
                              Class Teacher:
                            </span>{" "}
                            <span className="font-medium">
                              {classItem.classTeacher?.user
                                ? `${classItem.classTeacher.user.firstName} ${classItem.classTeacher.user.lastName}`
                                : "Not Assigned"}
                            </span>
                          </div>

                          {/* ENROLLMENT */}
                          <div className="space-y-2">

                            <div className="flex items-center justify-between text-sm">

                              <span className="text-muted-foreground">
                                Enrollment
                              </span>

                              <span className="font-medium">
                                {classItem.enrollments.length} /{" "}
                                {classItem.capacity}
                              </span>
                            </div>

                            <Progress
                              value={occupancy}
                              className={getProgressColor(occupancy)}
                            />

                            <div className="text-xs text-muted-foreground text-right">
                              {occupancy}% occupied
                            </div>
                          </div>

                          {/* STATS */}
                          <div className="grid grid-cols-3 gap-3 text-center">

                            <div className="rounded-lg border p-3">
                              <p className="text-xs text-muted-foreground">
                                Boys
                              </p>

                              <p className="font-semibold">
                                {boys}
                              </p>
                            </div>

                            <div className="rounded-lg border p-3">
                              <p className="text-xs text-muted-foreground">
                                Girls
                              </p>

                              <p className="font-semibold">
                                {girls}
                              </p>
                            </div>

                            <div className="rounded-lg border p-3">
                              <p className="text-xs text-muted-foreground">
                                Subjects
                              </p>

                              <p className="font-semibold">
                                {classItem.subjects?.length || 0}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* FOOTER */}
                        <div className="flex gap-2">

                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()

                              router.push(
                                `/classes/${classItem.id}`
                              )
                            }}
                          >
                            View Details
                          </Button>

                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}