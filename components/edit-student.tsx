"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { StudentWithRelations } from "@/lib/types"
import { Level, Section } from "@/lib/generated/prisma/client"
import { ClassStudentRow } from "./students-table"

type ClassWithEnrollments = {
  id: string
  level: Level
  grade: string
  section: Section
  capacity: number
  currentEnrollment: number
}

interface EditStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: ClassStudentRow
  classes: ClassWithEnrollments[]
  onSuccess?: () => void
}

export default function EditStudentDialog({
  open,
  onOpenChange,
  student,
  classes,
  onSuccess,
}: EditStudentDialogProps) {

  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    gender: "",
    classId: "",
    guardianName: "",
    guardianPhone: "",
    guardianEmail: "",
    address: "",
    admissionDate: "",
  })

  const currentEnrollment = student?.enrollments?.find(
    (enrollment) => enrollment.isCurrent
  )

  useEffect(() => {
    if (!student) return

    setFormData({
      firstName: student.user.firstName || "",
      lastName: student.user.lastName || "",
      dateOfBirth: student.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split("T")[0]
        : "",
      gender: student.gender || "",
      classId: currentEnrollment?.classId || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
      guardianEmail: student.guardianEmail || "",
      address: student.address || "",
      admissionDate: student.admissionDate
        ? new Date(student.admissionDate).toISOString().split("T")[0]
        : "",
    })
  }, [student])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/students/${student.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to update student")
        return
      }

      toast.success("Student updated successfully")

      onOpenChange(false)

      if (onSuccess) onSuccess()

    } catch (error) {
      console.error(error)
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const formatClassName = (cls: ClassWithEnrollments) => {
    return `${cls.level.replace(/_/g, " ")} - Grade ${cls.grade}${cls.section}`
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          <div className="space-y-2">
            <Label>First Name</Label>

            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Last Name</Label>

            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Date of Birth</Label>

            <Input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>

            <Select
              value={formData.gender}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  gender: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Class Assignment</Label>

            <Select
              value={formData.classId}
              onValueChange={(value) =>
                setFormData((prev) => ({
                  ...prev,
                  classId: value,
                }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>

              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {formatClassName(cls)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <p className="text-xs text-muted-foreground">
              Changing class updates the active enrollment automatically.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Guardian Name</Label>

            <Input
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Guardian Phone</Label>

            <Input
              name="guardianPhone"
              value={formData.guardianPhone}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Guardian Email</Label>

            <Input
              type="email"
              name="guardianEmail"
              value={formData.guardianEmail}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label>Address</Label>

            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          <div className="space-y-2">
            <Label>Admission Date</Label>

            <Input
              type="date"
              name="admissionDate"
              value={formData.admissionDate}
              onChange={handleChange}
            />
          </div>

        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Student"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}