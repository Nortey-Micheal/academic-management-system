"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { FileText } from "lucide-react"
import { AddAssessmentDialog } from "@/components/add-assessment-dialog"
import { GradeAssessmentDialog } from "@/components/grade-assessment-dialog"
import type { Assessment, Class } from "@/lib/types"
import { format } from "date-fns"
import { DUMMY_CLASSES, DUMMY_ASSESSMENTS } from "@/lib/dummy-data"

export function AssessmentsList() {
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState("all") // Updated default value to "all"
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    fetchAssessments()
  }, [selectedClass])

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      const data = await response.json()
      // setClasses(data.classes)
      setClasses(DUMMY_CLASSES)
    } catch (error) {
      console.error("[v0] Error fetching classes:", error)
      // Use centralized dummy data for local development
      setClasses(DUMMY_CLASSES)
    }
  }

  const fetchAssessments = async () => {
    setLoading(true)
    try {
      const url = selectedClass === "all" ? "/api/assessments" : `/api/assessments?classId=${selectedClass}`
      const response = await fetch(url)
      const data = await response.json()
      // setAssessments(data.assessments)
      const filtered = selectedClass === "all" ? DUMMY_ASSESSMENTS : DUMMY_ASSESSMENTS.filter((a) => a.classId === selectedClass)
      setAssessments(filtered)
    } catch (error) {
      console.error("[v0] Error fetching assessments:", error)
      // Use centralized dummy data for local development
      const filtered = selectedClass === "all" ? DUMMY_ASSESSMENTS : DUMMY_ASSESSMENTS.filter((a) => a.classId === selectedClass)
      setAssessments(filtered)
    } finally {
      setLoading(false)
    }
  }

  const getClassName = (classId: string) => {
    const classObj = classes.find((c) => c._id === classId)
    return classObj?.className || "N/A"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Filter by Class</CardTitle>
            <AddAssessmentDialog onAssessmentAdded={fetchAssessments} />
          </div>
          <div className="space-y-2 pt-4">
            <Label>Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger>
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes?.map((c) => (
                  <SelectItem key={c._id} value={c._id!}>
                    {c.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assessments ({assessments?.length || 0})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading assessments...</div>
          ) : assessments?.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No assessments found.</div>
          ) : (
            <div className="space-y-3">
              {assessments?.map((assessment) => (
                <Card key={assessment._id} className="border-2">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold">{assessment.title}</h3>
                            <p className="text-sm text-muted-foreground">{assessment.description}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 pt-2">
                          <Badge variant="outline">{getClassName(assessment.classId)}</Badge>
                          <Badge variant="outline">{assessment.subjectCode}</Badge>
                          <Badge variant="secondary" className="capitalize">
                            {assessment.assessmentType}
                          </Badge>
                          <Badge variant="outline">{assessment.totalMarks} marks</Badge>
                          <Badge variant="outline">{assessment.weight}% weight</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Due: {format(new Date(assessment.dueDate), "PPP")}
                        </div>
                      </div>
                      <GradeAssessmentDialog assessment={assessment} onGradesSaved={fetchAssessments} />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
