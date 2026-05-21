"use client"

import { useEffect, useMemo, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

import {
  ClassWithStudents,
  StudentWithRelations,
} from "@/lib/types"
import { Class } from "@/lib/generated/prisma/client"
import { DialogTrigger } from "@radix-ui/react-dialog"

interface PromoteStudentsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void

  currentClassId: string
//   students: StudentWithRelations[]

  classes: ClassWithStudents[]

  academicYearId: string

//   onSuccess?: () => void
}

export default function PromoteStudentsDialog({
  open,
  onOpenChange,
  currentClassId,
  classes,
  academicYearId,
//   onSuccess,
}: PromoteStudentsDialogProps) {

  const [selectedStudents, setSelectedStudents] = useState<string[]>([])

  const [targetClassId, setTargetClassId] = useState("")

  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState<StudentWithRelations[]>([])

  const [promotionClasses, setPromotionClasses] = useState<Class[]>([])

  const [loadingData, setLoadingData] = useState(true)

  const currentClass = useMemo(() => {
    return classes?.find((c) => c.id === currentClassId)
  }, [classes, currentClassId])

    useEffect(() => {

        if (!open || !currentClassId) return

        const fetchPromotionData = async () => {

            try {

            setLoadingData(true)

            const response = await fetch(
                `/api/classes/${currentClassId}/promotion-data`
            )

            const data = await response.json()

            if (!response.ok) {
                toast.error(data.error)
                return
            }

            const transformedStudents: StudentWithRelations[] =
                data.currentClass.enrollments.map((enrollment: any) => ({
                ...enrollment.student,

                enrollments: [
                    {
                    id: enrollment.id,
                    classId: enrollment.classId,
                    isCurrent: enrollment.isCurrent,
                    status: enrollment.status,
                    },
                ],
                }))

            setStudents(transformedStudents)

            setPromotionClasses(data.promotionClasses)

            } catch (error) {

            console.error(error)

            toast.error("Failed to load promotion data")

            } finally {

            setLoadingData(false)

            }

        }

        fetchPromotionData()

    }, [open, currentClassId])

  const availableClasses = useMemo(() => {

    if (!currentClass) return []

    return classes.filter((cls) => {

      // same level, higher grade
      if (cls.level === currentClass.level) {
        return Number(cls.grade) > Number(currentClass.grade)
      }

      return false

    })

  }, [classes, currentClass])

  const handleToggleStudent = (studentId: string) => {

    setSelectedStudents((prev) => {

      if (prev.includes(studentId)) {
        return prev.filter((id) => id !== studentId)
      }

      return [...prev, studentId]

    })

  }

  const handleSelectAll = () => {

    if (selectedStudents.length === students.length) {
      setSelectedStudents([])
      return
    }

    setSelectedStudents(students.map((s) => s.id))

  }

  const handlePromote = async () => {

    if (!targetClassId) {
      toast.error("Please select a target class")
      return
    }

    if (selectedStudents.length === 0) {
      toast.error("Please select at least one student")
      return
    }

    try {

      setLoading(true)

      const response = await fetch("/api/students/promote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentClassId,
          targetClassId,
          academicYearId,
          studentIds: selectedStudents,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || "Failed to promote students")
        return
      }

      toast.success("Students promoted successfully")

      setSelectedStudents([])
      setTargetClassId("")

      onOpenChange(false)

    //   onSuccess?.()

    } catch (error) {

      console.error(error)

      toast.error("Something went wrong")

    } finally {

      setLoading(false)

    }

  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogTrigger >
            <Button>
                Promote Students
            </Button>
        </DialogTrigger>

      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">

        <DialogHeader>
          <DialogTitle>
            Promote Students
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">

          {/* TARGET CLASS */}
          <div className="space-y-2">
            <Label>Promote To</Label>

            <Select
              value={targetClassId}
              onValueChange={setTargetClassId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select target class" />
              </SelectTrigger>

              <SelectContent>
                {promotionClasses.map((cls) => (
                  <SelectItem
                    key={cls.id}
                    value={cls.id}
                  >
                    Grade {cls.grade} - {cls.section}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* SELECT ALL */}
          <div className="flex items-center gap-3 border rounded-lg p-3">
            <Checkbox
              checked={selectedStudents.length === students.length}
              onCheckedChange={handleSelectAll}
            />

            <Label>
              Select All Students
            </Label>
          </div>

          {/* STUDENTS */}
          <div className="space-y-3">

            {students.map((student) => {

              const checked = selectedStudents.includes(student.id)

              return (
                <div
                  key={student.id}
                  className="flex items-center justify-between border rounded-lg p-3"
                >

                  <div>
                    <p className="font-medium">
                      {student.user.lastName} {student.user.firstName}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {student.studentId}
                    </p>
                  </div>

                  <Checkbox
                    checked={checked}
                    onCheckedChange={() =>
                      handleToggleStudent(student.id)
                    }
                  />

                </div>
              )

            })}

          </div>

        </div>

        <DialogFooter>

          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button
            onClick={handlePromote}
            disabled={loading}
          >
            {loading
              ? "Promoting..."
              : "Promote Students"
            }
          </Button>

        </DialogFooter>

      </DialogContent>

    </Dialog>
  )
}