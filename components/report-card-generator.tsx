"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Printer } from "lucide-react"
import type { Class, Student, SubjectGrade } from "@/lib/types"
import { format } from "date-fns"
import { DUMMY_CLASSES, DUMMY_STUDENTS, DUMMY_REPORT_DATA } from "@/lib/dummy-data"

interface ReportData {
  student: {
    _id: string
    studentId: string
    name: string
  }
  subjectGrades: SubjectGrade[]
  overall: {
    totalMarks: number
    obtainedMarks: number
    percentage: number
    grade: string
    remarks: string
  }
}

export function ReportCardGenerator() {
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedStudent, setSelectedStudent] = useState("")
  const [reportData, setReportData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
    }
  }, [selectedClass])

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      const data = await response.json()
      // setClasses(data.classes)
      setClasses(DUMMY_CLASSES)
    } catch (error) {
      console.error("[v0] Error fetching classes:", error)
      // Use centralized dummy data for dev
      setClasses(DUMMY_CLASSES)
    }
  }

  const fetchStudents = async () => {
    try {
      // const response = await fetch(`/api/students?classId=${selectedClass}`)
      // const data = await response.json()
      // setStudents(data.students)
      const filtered = DUMMY_STUDENTS.filter((s) => s.classId === selectedClass)
      setStudents(filtered.length > 0 ? filtered : DUMMY_STUDENTS.slice(0, 2))
    } catch (error) {
      console.error("[v0] Error fetching students:", error)
      // Use centralized dummy data filtered by class
      const filtered = DUMMY_STUDENTS.filter((s) => s.classId === selectedClass)
      setStudents(filtered.length > 0 ? filtered : DUMMY_STUDENTS.slice(0, 2))
    }
  }

  const generateReport = async () => {
    if (!selectedStudent) return

    setLoading(true)
    try {
      // const response = await fetch(`/api/grades/student/${selectedStudent}`)
      // const data = await response.json()
      // setReportData(data)
      setReportData({
        student: { _id: selectedStudent, studentId: "S001", name: "Alice Johnson" },
        subjectGrades: DUMMY_REPORT_DATA.subjectGrades,
        overall: DUMMY_REPORT_DATA.overall,
      })
    } catch (error) {
      console.error("[v0] Error generating report:", error)
      // Fallback report data for dev/testing
      setReportData({
        student: { _id: selectedStudent, studentId: "S001", name: "Alice Johnson" },
        subjectGrades: DUMMY_REPORT_DATA.subjectGrades,
        overall: DUMMY_REPORT_DATA.overall,
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const getClassName = () => {
    const classObj = classes?.find((c) => c._id === selectedClass)
    return classObj?.className || "N/A"
  }

  return (
    <div className="space-y-6">
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle>Generate Report Card</CardTitle>
          <CardDescription>Select a student to generate their academic report card</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classes?.map((c) => (
                    <SelectItem key={c._id} value={c._id!}>
                      {c.className}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Student</Label>
              <Select
                value={selectedStudent}
                onValueChange={setSelectedStudent}
                disabled={!selectedClass || students.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a student" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s._id} value={s._id!}>
                      {s.firstName} {s.lastName} ({s.studentId})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={generateReport} disabled={!selectedStudent || loading}>
              {loading ? "Generating..." : "Generate Report"}
            </Button>
            {reportData && (
              <Button onClick={handlePrint} variant="outline">
                <Printer className="w-4 h-4 mr-2" />
                Print Report
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {reportData && (
        <div ref={printRef} className="print:p-8">
          <Card className="max-w-4xl mx-auto">
            <CardContent className="p-8 space-y-6">
              {/* Header */}
              <div className="text-center border-b pb-6">
                <h1 className="text-3xl font-bold mb-2">Academic Report Card</h1>
                <p className="text-muted-foreground">Academic Year {new Date().getFullYear()}</p>
              </div>

              {/* Student Information */}
              <div className="grid grid-cols-2 gap-4 py-4">
                <div>
                  <p className="text-sm text-muted-foreground">Student Name</p>
                  <p className="font-semibold">{reportData.student.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Student ID</p>
                  <p className="font-semibold">{reportData.student.studentId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Class</p>
                  <p className="font-semibold">{getClassName()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Report Date</p>
                  <p className="font-semibold">{format(new Date(), "PPP")}</p>
                </div>
              </div>

              {/* Subject Grades */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Subject Performance</h2>
                <div className="rounded-lg border">
                  <table className="w-full">
                    <thead className="bg-muted">
                      <tr>
                        <th className="text-left p-3 font-semibold">Subject</th>
                        <th className="text-center p-3 font-semibold">Total Marks</th>
                        <th className="text-center p-3 font-semibold">Obtained</th>
                        <th className="text-center p-3 font-semibold">Percentage</th>
                        <th className="text-center p-3 font-semibold">Grade</th>
                        <th className="text-left p-3 font-semibold">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.subjectGrades.map((subject, index) => (
                        <tr key={index} className="border-t">
                          <td className="p-3 font-medium">{subject.subjectName}</td>
                          <td className="p-3 text-center">{subject.totalMarks}</td>
                          <td className="p-3 text-center">{subject.obtainedMarks}</td>
                          <td className="p-3 text-center">{subject.percentage}%</td>
                          <td className="p-3 text-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-md bg-primary/10 text-primary font-semibold">
                              {subject.grade}
                            </span>
                          </td>
                          <td className="p-3">{subject.remarks}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Overall Performance */}
              <div className="space-y-4 border-t pt-6">
                <h2 className="text-xl font-semibold">Overall Performance</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Total Marks</p>
                    <p className="text-2xl font-bold">{reportData.overall?.totalMarks}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Obtained Marks</p>
                    <p className="text-2xl font-bold">{reportData.overall?.obtainedMarks}</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted">
                    <p className="text-sm text-muted-foreground">Percentage</p>
                    <p className="text-2xl font-bold">{reportData.overall?.percentage}%</p>
                  </div>
                  <div className="p-4 rounded-lg bg-primary/10">
                    <p className="text-sm text-muted-foreground">Overall Grade</p>
                    <p className="text-2xl font-bold text-primary">{reportData.overall?.grade}</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <p className="text-sm text-muted-foreground mb-1">Academic Standing</p>
                  <p className="text-lg font-semibold">{reportData.overall?.remarks}</p>
                </div>
              </div>

              {/* Grading Scale */}
              <div className="border-t pt-6 space-y-3">
                <h3 className="font-semibold">Grading Scale</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-sm">
                  <div>
                    <span className="font-medium">A+/A/A-:</span> Excellent (80-100%)
                  </div>
                  <div>
                    <span className="font-medium">B+/B/B-:</span> Very Good (65-79%)
                  </div>
                  <div>
                    <span className="font-medium">C+/C/C-:</span> Satisfactory (50-64%)
                  </div>
                  <div>
                    <span className="font-medium">D:</span> Pass (45-49%)
                  </div>
                  <div>
                    <span className="font-medium">F:</span> Fail (Below 45%)
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="grid grid-cols-3 gap-8 pt-8 border-t print:mt-16">
                <div className="text-center">
                  <div className="border-t border-foreground/20 pt-2">
                    <p className="text-sm font-medium">Class Teacher</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-foreground/20 pt-2">
                    <p className="text-sm font-medium">Principal</p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t border-foreground/20 pt-2">
                    <p className="text-sm font-medium">Parent/Guardian</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:p-8,
          .print\\:p-8 * {
            visibility: visible;
          }
          .print\\:p-8 {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}
