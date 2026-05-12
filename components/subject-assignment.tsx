"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { X } from "lucide-react"

interface ClassSubject {
  id: string
  class: {
    id: string
    level: string
    grade: number
    section: string
    academicYear: string
  }
  subject: {
    id: string
    subjectName: string
    subjectCode: string
  }
}

interface SubjectAssignmentProps {
  teacherId: string
  teacherName: string
  userRole: string
  currentAssignments?: any[]
}

export function SubjectAssignment({
  teacherId,
  teacherName,
  userRole,
  currentAssignments = [],
}: SubjectAssignmentProps) {
  const [classes, setClasses] = useState<ClassSubject[]>([])
  const [assignments, setAssignments] = useState(currentAssignments)

  // ✅ MULTIPLE SELECTION
  const [selectedClassSubjects, setSelectedClassSubjects] = useState<
    string[]
  >([])

  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)


  const fetchInitialData = async () => {
    await Promise.all([
      fetchClassSubjects(),
      fetchAssignments(),
    ])
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const fetchAssignments = async () => {
    try {
      const response = await fetch(
        `/api/staff/${teacherId}/subjects`,
        {
          headers: {
            "x-user-role": userRole,
          },
        }
      )

      if (!response.ok) {
        throw new Error(
          "Failed to fetch assignments"
        )
      }

      const data = await response.json()

      setAssignments(data.assignments || [])
    } catch (error) {
      console.error(
        "Error fetching assignments:",
        error
      )

      toast.error(
        "Failed to fetch teacher assignments"
      )
    }
  }

  const fetchClassSubjects = async () => {
    try {
      setIsFetching(true)

      const classesRes = await fetch("/api/classes", {
        headers: {
          "x-user-role": userRole,
        },
      })

      if (classesRes.ok) {
        const classes = await classesRes.json()
        const classesData = classes.classes

        const classSubjectList: ClassSubject[] = []

        classesData.forEach((cls: any) => {
          cls.subjects?.forEach((cs: any) => {
            classSubjectList.push({
              id: cs.id,
              class: {
                id: cls.id,
                level: cls.level,
                grade: cls.grade,
                section: cls.section,
                academicYear: cls.academicYear,
              },
              subject: cs.subject,
            })
          })
        })

        setClasses(classSubjectList)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error("Failed to fetch class and subject data")
    } finally {
      setIsFetching(false)
    }
  }

  /**
   * ✅ Toggle selection
   */
  const toggleSelection = (id: string) => {
    setSelectedClassSubjects((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id)
      }

      return [...prev, id]
    })
  }

  /**
   * ✅ Assign multiple
   */
  const handleAssign = async () => {
    if (selectedClassSubjects.length === 0) {
      toast.error("Please select at least one class-subject")
      return
    }

    try {
      setIsLoading(true)

      const response = await fetch(
        `/api/staff/${teacherId}/subjects`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": userRole,
          },
          body: JSON.stringify({
            classSubjectIds: selectedClassSubjects,
          }),
        }
      )

      const data = await response.json()

      if (!response.ok) {
        toast.error(
          data.error || "Failed to assign subjects"
        )

        return
      }

      setAssignments((prev) => [
        ...prev,
        ...(data.assignments || []),
      ])

      setSelectedClassSubjects([])

      toast.success(
        `${selectedClassSubjects.length} subject(s) assigned successfully`
      )

    } catch (error) {
      console.error("Error assigning subjects:", error)

      toast.error("Failed to assign subjects")
    } finally {
      setIsLoading(false)
    }
  }
  /**
   * ✅ Remove assignment
   */
  const handleRemove = async (
    assignmentId: string
  ) => {
    try {
      setIsLoading(true)

      const response = await fetch(
        `/api/staff/${teacherId}/subjects`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "x-user-role": userRole,
          },
          body: JSON.stringify({
            assignmentId,
          }),
        }
      )

      if (response.ok) {
        setAssignments((prev) =>
          prev.filter(
            (a) => a.id !== assignmentId
          )
        )

        toast.success(
          "Subject assignment removed"
        )
      } else {
        const error = await response.json()

        toast.error(
          error.error ||
            "Failed to remove assignment"
        )
      }

    } catch (error) {
      console.error(
        "Error removing assignment:",
        error
      )

      toast.error(
        "Failed to remove assignment"
      )
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * ✅ Loading state
   */
  if (isFetching) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">

      {/* ASSIGNMENT CARD */}
      <Card>
        <CardHeader>
          <CardTitle>
            Assign to Class-Subject
          </CardTitle>

          <CardDescription>
            Select one or multiple class-subjects
            to assign {teacherName}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">

          {/* SELECTABLE LIST */}
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Class & Subjects
            </label>

            <div className="border rounded-md max-h-72 overflow-y-auto divide-y">

              {classes.map((cs) => {
                const selected =
                  selectedClassSubjects.includes(
                    cs.id
                  )

                return (
                  <button
                    type="button"
                    key={cs.id}
                    onClick={() =>
                      toggleSelection(cs.id)
                    }
                    className={`w-full text-left px-3 py-2 transition-colors hover:bg-muted ${
                      selected
                        ? "bg-primary/10 border-l-4 border-primary"
                        : ""
                    }`}
                  >
                    <p className="font-medium text-sm">
                      {
                        cs.subject.subjectName
                      }
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {cs.class.level} Grade{" "}
                      {cs.class.grade} Section{" "}
                      {cs.class.section}
                    </p>
                  </button>
                )
              })}

            </div>
          </div>

          {/* SELECTED */}
          {selectedClassSubjects.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedClassSubjects.map((id) => {
                const selected =
                  classes.find(
                    (c) => c.id === id
                  )

                if (!selected) return null

                return (
                  <Badge
                    key={id}
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    {
                      selected.subject
                        .subjectName
                    }

                    <X
                      className="h-3 w-3 cursor-pointer"
                      onClick={() =>
                        toggleSelection(id)
                      }
                    />
                  </Badge>
                )
              })}
            </div>
          )}

          {/* BUTTON */}
          <Button
            onClick={handleAssign}
            disabled={
              selectedClassSubjects.length === 0 ||
              isLoading
            }
          >
            {isLoading
              ? "Assigning..."
              : `Assign ${selectedClassSubjects.length || ""} Subject(s)`}
          </Button>
        </CardContent>
      </Card>

      {/* CURRENT ASSIGNMENTS */}
      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              Current Assignments
            </CardTitle>

            <CardDescription>
              {assignments.length} active
              assignment(s)
            </CardDescription>
          </CardHeader>

          <CardContent>
            <div className="space-y-2">

              {assignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-2 bg-green-50 rounded-md border border-green-200"
                >
                  <div className="text-sm">
                    <p className="font-medium">
                      {
                        assignment.classSubject
                          ?.subject
                          ?.subjectName
                      }
                    </p>

                    <p className="text-gray-600 text-xs">
                      {
                        assignment.classSubject
                          ?.class?.level
                      }{" "}
                      Grade{" "}
                      {
                        assignment.classSubject
                          ?.class?.grade
                      }{" "}
                      Section{" "}
                      {
                        assignment.classSubject
                          ?.class?.section
                      }
                    </p>
                  </div>

                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() =>
                      handleRemove(
                        assignment.id
                      )
                    }
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}

            </div>
          </CardContent>
        </Card>
      )}

      {/* EMPTY STATE */}
      {assignments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No subject assignments yet
        </div>
      )}
    </div>
  )
}