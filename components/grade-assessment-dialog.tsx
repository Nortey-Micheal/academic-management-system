"use client"

import { useState, useEffect } from "react"
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
import { Edit } from "lucide-react"
import type { Assessment, Student } from "@/lib/types"

interface GradeAssessmentDialogProps {
  assessment: Assessment
  onGradesSaved: () => void
}

export function GradeAssessmentDialog({ assessment, onGradesSaved }: GradeAssessmentDialogProps) {
  const [open, setOpen] = useState(false)
  const [students, setStudents] = useState<Student[]>([])
  const [grades, setGrades] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [studentsRes, gradesRes] = await Promise.all([
        fetch(`/api/students?classId=${assessment.classId}`),
        fetch(`/api/grades?assessmentId=${assessment._id}`),
      ])

      const [studentsData, gradesData] = await Promise.all([studentsRes.json(), gradesRes.json()])

      setStudents(studentsData.students)

      const existingGrades: Record<string, string> = {}
      gradesData.grades?.forEach((grade: any) => {
        existingGrades[grade.studentId] = grade.marksObtained.toString()
      })
      setGrades(existingGrades)
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleGradeChange = (studentId: string, value: string) => {
    setGrades((prev) => ({
      ...prev,
      [studentId]: value,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const gradeRecords = Object.entries(grades)
        .filter(([_, marks]) => marks !== "")
        .map(([studentId, marks]) => ({
          studentId,
          marksObtained: marks,
        }))

      const response = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          assessmentId: assessment._id,
          grades: gradeRecords,
        }),
      })

      if (response.ok) {
        setOpen(false)
        onGradesSaved()
      }
    } catch (error) {
      console.error("[v0] Error saving grades:", error)
      alert("Failed to save grades")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Edit className="w-4 h-4 mr-2" />
          Grade
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade Assessment</DialogTitle>
          <DialogDescription>
            {assessment.title} - {assessment.totalMarks} marks
          </DialogDescription>
        </DialogHeader>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading students...</div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              {students?.map((student) => (
                <div key={student._id} className="flex items-center gap-4 p-4 rounded-lg border">
                  <div className="flex-1">
                    <div className="font-medium">
                      {student.firstName} {student.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">{student.studentId}</div>
                  </div>
                  <div className="w-32 space-y-1">
                    <Label htmlFor={`grade-${student._id}`} className="sr-only">
                      Marks for {student.firstName}
                    </Label>
                    <Input
                      id={`grade-${student._id}`}
                      type="number"
                      min="0"
                      max={assessment.totalMarks}
                      placeholder="0"
                      value={grades[student._id!] || ""}
                      onChange={(e) => handleGradeChange(student._id!, e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">out of {assessment.totalMarks}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 justify-end pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save Grades"}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
