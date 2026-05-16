"use client"

import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import {
  BookOpen,
  GraduationCap,
  Plus,
  Users,
} from "lucide-react"

interface AddClassDialogProps {
  onClassAdded: () => void
}

type Level =
  | "PRE_SCHOOL"
  | "LOWER_PRIMARY"
  | "UPPER_PRIMARY"
  | "JUNIOR_HIGH_SCHOOL"

type Section = "A" | "B" | "C" | "D" | "E" | "F"

interface Teacher {
  id: string
  user: {
    firstName: string
    lastName: string
  }
}

interface AcademicYear {
  id: string
  year: string
  isActive: boolean
}

export function AddClassDialog({
  onClassAdded,
}: AddClassDialogProps) {
  const [open, setOpen] = useState(false)

  const [loading, setLoading] = useState(false)

  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [teacherLoading, setTeacherLoading] =
    useState(false)

  const [academicYears, setAcademicYears] =
    useState<AcademicYear[]>([])

  const [academicYearsLoading, setAcademicYearsLoading] =
    useState(false)

  const [formData, setFormData] = useState({
    level: "" as Level | "",
    grade: "",
    section: "" as Section | "",
    academicYear: "",
    capacity: "30",
    classTeacherId: "",
  })

  /* -------------------------------------------------- */
  /* HELPERS */
  /* -------------------------------------------------- */

  const handleChange = (
    field: string,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const resetForm = () => {
    setFormData({
      level: "",
      grade: "",
      section: "",
      academicYear: "",
      capacity: "30",
      classTeacherId: "",
    })

    setTeachers([])
  }

  /* -------------------------------------------------- */
  /* FETCH ACADEMIC YEARS */
  /* -------------------------------------------------- */

  useEffect(() => {
    const fetchAcademicYears = async () => {
      try {
        setAcademicYearsLoading(true)

        const response = await fetch(
          "/api/settings/academic"
        )

        if (!response.ok) {
          throw new Error(
            "Failed to fetch academic years"
          )
        }

        const data = await response.json()

        setAcademicYears(data.academicYears || [])

        // auto-select current academic year
        const currentYear = data.academicYears?.find(
          (year: AcademicYear) => year.isActive
        )

        if (currentYear) {
          setFormData((prev) => ({
            ...prev,
            academicYear: currentYear.name,
          }))
        }
      } catch (error) {
        console.error(error)
      } finally {
        setAcademicYearsLoading(false)
      }
    }

    fetchAcademicYears()
  }, [])

  /* -------------------------------------------------- */
  /* FETCH AVAILABLE TEACHERS */
  /* -------------------------------------------------- */

  useEffect(() => {
    const fetchTeachers = async () => {
      if (
        !formData.level ||
        !formData.academicYear
      ) {
        setTeachers([])
        return
      }

      try {
        setTeacherLoading(true)

        const response = await fetch(
          `/api/teachers/available?level=${formData.level}&academicYear=${formData.academicYear}`
        )

        if (!response.ok) {
          throw new Error(
            "Failed to fetch teachers"
          )
        }

        const data = await response.json()

        setTeachers(data)
      } catch (error) {
        console.error(error)
        setTeachers([])
      } finally {
        setTeacherLoading(false)
      }
    }

    fetchTeachers()
  }, [formData.level, formData.academicYear])

  /* -------------------------------------------------- */
  /* SUBMIT */
  /* -------------------------------------------------- */

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault()

    setLoading(true)

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          level: formData.level,
          grade: Number(formData.grade),
          section: formData.section,
          academicYear: formData.academicYear,
          capacity: Number(formData.capacity),
          classTeacherId:
            formData.classTeacherId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to create class"
        )
      }

      setOpen(false)

      resetForm()

      onClassAdded()
    } catch (error: any) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  /* -------------------------------------------------- */
  /* UI */
  /* -------------------------------------------------- */

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}

    >
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="w-4 h-4" />
          Add Class
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[620px] p-0 overflow-auto h-[90%] ">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 border-b px-6 py-5">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <GraduationCap className="w-6 h-6 text-primary" />
              Create New Class
            </DialogTitle>

            <DialogDescription className="pt-1">
              Set up a class and assign a class teacher
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-6 p-6"
        >
          {/* Academic Details */}
          <div className="rounded-2xl border bg-muted/30 p-5 space-y-5">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />

              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Academic Information
              </h3>
            </div>

            {/* Level */}
            <div className="space-y-2">
              <Label>Level</Label>

              <Select
                value={formData.level}
                onValueChange={(value) =>
                  handleChange("level", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select level" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="PRE_SCHOOL">
                    Pre School
                  </SelectItem>

                  <SelectItem value="LOWER_PRIMARY">
                    Lower Primary
                  </SelectItem>

                  <SelectItem value="UPPER_PRIMARY">
                    Upper Primary
                  </SelectItem>

                  <SelectItem value="JUNIOR_HIGH_SCHOOL">
                    Junior High School
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Academic Year */}
            <div className="space-y-2">
              <Label>Academic Year</Label>

              <Select
                value={formData.academicYear}
                onValueChange={(value) =>
                  handleChange(
                    "academicYear",
                    value
                  )
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      academicYearsLoading
                        ? "Loading..."
                        : "Select academic year"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {academicYears.map((year) => (
                    <SelectItem
                      key={year.id}
                      value={year.year}
                    >
                      <div className="flex items-center gap-2">
                        <span>{year.year}</span>

                        {year.isActive && (
                          <span className="text-xs text-green-600 font-medium">
                            Current
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Class Setup */}
          <div className="rounded-2xl border bg-muted/30 p-5 space-y-5">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />

              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
                Class Setup
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Grade */}
              <div className="space-y-2">
                <Label>Grade</Label>

                <Input
                  type="number"
                  min={1}
                  placeholder="Enter grade"
                  value={formData.grade}
                  onChange={(e) =>
                    handleChange(
                      "grade",
                      e.target.value
                    )
                  }
                  required
                />
              </div>

              {/* Section */}
              <div className="space-y-2">
                <Label>Section</Label>

                <Select
                  value={formData.section}
                  onValueChange={(value) =>
                    handleChange(
                      "section",
                      value
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>

                  <SelectContent>
                    {[
                      "A",
                      "B",
                      "C",
                      "D",
                      "E",
                      "F",
                    ].map((section) => (
                      <SelectItem
                        key={section}
                        value={section}
                      >
                        Section {section}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Capacity */}
            <div className="space-y-2">
              <Label>Class Capacity</Label>

              <Input
                type="number"
                min={1}
                value={formData.capacity}
                onChange={(e) =>
                  handleChange(
                    "capacity",
                    e.target.value
                  )
                }
              />
            </div>
          </div>

          {/* Teacher */}
          <div className="rounded-2xl border bg-muted/30 p-5 space-y-4">
            <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground">
              Class Teacher
            </h3>

            <div className="space-y-2">
              <Label>
                Assign Teacher (Optional)
              </Label>

              <Select
                value={formData.classTeacherId}
                onValueChange={(value) =>
                  handleChange(
                    "classTeacherId",
                    value
                  )
                }
                disabled={
                  teacherLoading ||
                  teachers.length === 0
                }
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      teacherLoading
                        ? "Loading teachers..."
                        : teachers.length === 0
                        ? "No available teachers"
                        : "Select class teacher"
                    }
                  />
                </SelectTrigger>

                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem
                      key={teacher.id}
                      value={teacher.id}
                    >
                      {teacher.user.firstName}{" "}
                      {teacher.user.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
              className="min-w-[140px]"
            >
              {loading
                ? "Creating..."
                : "Create Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}