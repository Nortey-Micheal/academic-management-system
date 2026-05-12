"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { toast } from "sonner"
import { StudentWithRelations } from "@/lib/types"
import { Class } from "@/lib/generated/prisma/client"

interface EditStudentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  student: StudentWithRelations
  classes: Class[]
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

  /**
   * Populate form when dialog opens
   */
  useEffect(() => {
    if (student) {
      setFormData({
        firstName: student.user.firstName || "",
        lastName: student.user.lastName || "",
        dateOfBirth: student.dateOfBirth
          ? new Date(student.dateOfBirth)
              .toISOString()
              .split("T")[0]
          : "",
        gender: student.gender || "",
        classId: student.classId || "",
        guardianName: student.guardianName || "",
        guardianPhone: student.guardianPhone || "",
        guardianEmail: student.guardianEmail || "",
        address: student.address || "",
        admissionDate: student.admissionDate
          ? new Date(student.admissionDate)
              .toISOString()
              .split("T")[0]
          : "",
      })
    }
  }, [student])

  /**
   * Handle input changes
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  /**
   * Submit update
   */
  const handleSubmit = async () => {
    try {
      setLoading(true)

      const res = await fetch(
        `/api/students/${student.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        }
      )

      const data = await res.json()

      if (!res.ok) {
        toast.error(
          data.error || "Failed to update student"
        )
        return
      }

      toast.success("Student updated successfully")

      onOpenChange(false)

      if (onSuccess) {
        onSuccess()
      }

    } catch (error) {
      console.error(error)

      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            Edit Student
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* First Name */}
          <div className="space-y-2">
            <Label>First Name</Label>

            <Input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
            />
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <Label>Last Name</Label>

            <Input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
            />
          </div>

          {/* Date of Birth */}
          <div className="space-y-2">
            <Label>Date of Birth</Label>

            <Input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>

          {/* Gender */}
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
                <SelectItem value="male">
                  Male
                </SelectItem>

                <SelectItem value="female">
                  Female
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Class */}
          <div className="space-y-2">
            <Label>Class</Label>

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
                {classes?.map((cls) => (
                  <SelectItem
                    key={cls.id}
                    value={cls.id}
                  >
                    {`Basic ${cls.grade}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Guardian Name */}
          <div className="space-y-2">
            <Label>Guardian Name</Label>

            <Input
              name="guardianName"
              value={formData.guardianName}
              onChange={handleChange}
            />
          </div>

          {/* Guardian Phone */}
          <div className="space-y-2">
            <Label>Guardian Phone</Label>

            <Input
              name="guardianPhone"
              value={formData.guardianPhone}
              onChange={handleChange}
            />
          </div>

          {/* Guardian Email */}
          <div className="space-y-2">
            <Label>Guardian Email</Label>

            <Input
              type="email"
              name="guardianEmail"
              value={formData.guardianEmail}
              onChange={handleChange}
            />
          </div>

          {/* Address */}
          <div className="space-y-2 md:col-span-2">
            <Label>Address</Label>

            <Input
              name="address"
              value={formData.address}
              onChange={handleChange}
            />
          </div>

          {/* Admission Date */}
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
            {loading
              ? "Updating..."
              : "Update Student"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}