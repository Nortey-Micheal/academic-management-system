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
import { Plus } from "lucide-react"

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

export function AddClassDialog({ onClassAdded }: AddClassDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [teacherLoading, setTeacherLoading] = useState(false)

  const [formData, setFormData] = useState({
    level: "" as Level | "",
    grade: "",
    section: "" as Section | "",
    academicYear: "",
    capacity: "30",
    classTeacherId: "",
  })

  /* -------------------------- Helpers -------------------------- */

  const handleChange = (field: string, value: string) => {
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

  /* -------------------- Academic Year Format -------------------- */

  const handleAcademicYearChange = (value: string) => {
    const cleaned = value.replace(/[^0-9/]/g, "")

    // Auto-format: 2025 → 2025/2026
    if (cleaned.length === 4 && !cleaned.includes("/")) {
      const startYear = Number(cleaned)
      const nextYear = startYear + 1
      handleChange("academicYear", `${startYear}/${nextYear}`)
    } else {
      handleChange("academicYear", cleaned)
    }
  }

  /* -------------------- Fetch Available Teachers -------------------- */

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!formData.level || !formData.academicYear) {
        setTeachers([])
        return
      }

      setTeacherLoading(true)

      try {
        const res = await fetch(
          `/api/teachers/available?level=${formData.level}&academicYear=${formData.academicYear}`
        )

        if (!res.ok) throw new Error("Failed to fetch teachers")

        const data = await res.json()
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

  /* --------------------------- Submit --------------------------- */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const academicYearPattern = /^\d{4}\/\d{4}$/

    if (!academicYearPattern.test(formData.academicYear)) {
      alert("Academic Year must be in format YYYY/YYYY (e.g. 2025/2026)")
      return
    }

    setLoading(true)

    try {
      const response = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          level: formData.level,
          grade: Number(formData.grade),
          section: formData.section,
          academicYear: formData.academicYear,
          capacity: Number(formData.capacity),
          classTeacherId: formData.classTeacherId || null,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || "Failed to create class")
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

  /* ---------------------------- UI ---------------------------- */

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Class
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Class</DialogTitle>
          <DialogDescription>
            Create a new class for the academic year
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Level */}
          <div className="space-y-2">
            <Label>Level</Label>
            <select
              className="w-full border rounded-md p-2"
              value={formData.level}
              onChange={(e) => handleChange("level", e.target.value)}
              required
            >
              <option value="">Select Level</option>
              <option value="PRE_SCHOOL">Pre School</option>
              <option value="LOWER_PRIMARY">Lower Primary</option>
              <option value="UPPER_PRIMARY">Upper Primary</option>
              <option value="JUNIOR_HIGH_SCHOOL">Junior High School</option>
            </select>
          </div>

          {/* Academic Year */}
          <div className="space-y-2">
            <Label>Academic Year</Label>
            <Input
              placeholder="2025/2026"
              value={formData.academicYear}
              onChange={(e) =>
                handleAcademicYearChange(e.target.value)
              }
              required
            />
          </div>

          {/* Class Teacher */}
          <div className="space-y-2">
            <Label>Class Teacher (Optional)</Label>
            <select
              className="w-full border rounded-md p-2"
              value={formData.classTeacherId}
              onChange={(e) =>
                handleChange("classTeacherId", e.target.value)
              }
              disabled={teacherLoading || teachers.length === 0}
            >
              <option value="">
                {teacherLoading
                  ? "Loading teachers..."
                  : teachers.length === 0
                  ? "No available teachers"
                  : "Select Teacher"}
              </option>

              {teachers.map((teacher) => (
                <option key={teacher.id} value={teacher.id}>
                  {teacher.user.firstName} {teacher.user.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Grade + Section */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Grade</Label>
              <Input
                type="number"
                min={1}
                value={formData.grade}
                onChange={(e) =>
                  handleChange("grade", e.target.value)
                }
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Section</Label>
              <select
                className="w-full border rounded-md p-2"
                value={formData.section}
                onChange={(e) =>
                  handleChange("section", e.target.value)
                }
                required
              >
                <option value="">Select Section</option>
                {["A", "B", "C", "D", "E", "F"].map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Capacity */}
          <div className="space-y-2">
            <Label>Capacity</Label>
            <Input
              type="number"
              min={1}
              value={formData.capacity}
              onChange={(e) =>
                handleChange("capacity", e.target.value)
              }
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Class"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}