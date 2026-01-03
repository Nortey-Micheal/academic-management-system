"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon, Check, X, Clock, FileX } from "lucide-react"
import { format } from "date-fns"
import type { Student, Class } from "@/lib/types"
import { DUMMY_CLASSES, DUMMY_STUDENTS,DUMMY_ATTENDANCE_RECORDS } from "@/lib/dummy-data"

export function AttendanceMarker() {
  const [classes, setClasses] = useState<Class[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [attendance, setAttendance] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchClasses()
  }, [])

  useEffect(() => {
    if (selectedClass) {
      fetchStudents()
      fetchAttendance()
    }
  }, [selectedClass, selectedDate])

  const fetchClasses = async () => {
    try {
      // const response = await fetch("/api/classes")
      // const data = await response.json()
      // setClasses(data.classes)
      setClasses(DUMMY_CLASSES)
    } catch (error) {
      console.error("[v0] Error fetching classes:", error)
      // Use centralized dummy data for local development
      setClasses(DUMMY_CLASSES)
    }
  }

  const fetchStudents = async () => {
    setLoading(true)
    try {
      // const response = await fetch(`/api/students?classId=${selectedClass}`)
      // const data = await response.json()
      // setStudents(data.students)

      // // Initialize attendance with 'present' for all students
      // const initialAttendance: Record<string, string> = {}
      // data.students.forEach((student: Student) => {
      //   initialAttendance[student._id!] = "present"
      // })
      // setAttendance(initialAttendance)

      const fallback = DUMMY_STUDENTS.filter((s) => s.classId === selectedClass || selectedClass === "")
      setStudents(fallback)

      const initialAttendance: Record<string, string> = {}
      fallback.forEach((s) => {
        initialAttendance[s._id!] = "present"
      })
      setAttendance(initialAttendance)
    } catch (error) {
      console.error("[v0] Error fetching students:", error)
      // Use centralized dummy data for local development
      const fallback = DUMMY_STUDENTS.filter((s) => s.classId === selectedClass || selectedClass === "")
      setStudents(fallback)

      const initialAttendance: Record<string, string> = {}
      fallback.forEach((s) => {
        initialAttendance[s._id!] = "present"
      })
      setAttendance(initialAttendance)
    } finally {
      setLoading(false)
    }
  }

  const fetchAttendance = async () => {
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd")
      // const response = await fetch(`/api/attendance?classId=${selectedClass}&date=${dateStr}`)
      // const data = await response.json()
      const data = DUMMY_ATTENDANCE_RECORDS

      if (data.length > 0) {
        const existingAttendance: Record<string, string> = {}
        data.forEach((record: any) => {
          existingAttendance[record.studentId] = record.status
        })
        setAttendance(existingAttendance)
      }
    } catch (error) {
      console.error("[v0] Error fetching attendance:", error)
    }
  }

  const handleStatusChange = (studentId: string, status: string) => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: status,
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const records = Object.entries(attendance).map(([studentId, status]) => ({
        studentId,
        status,
      }))

      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          classId: selectedClass,
          date: format(selectedDate, "yyyy-MM-dd"),
          records,
        }),
      })

      if (response.ok) {
        alert("Attendance saved successfully!")
      }
    } catch (error) {
      console.error("[v0] Error saving attendance:", error)
      alert("Failed to save attendance")
    } finally {
      setSaving(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <Check className="w-4 h-4" />
      case "absent":
        return <X className="w-4 h-4" />
      case "late":
        return <Clock className="w-4 h-4" />
      case "excused":
        return <FileX className="w-4 h-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700 hover:bg-green-200"
      case "absent":
        return "bg-red-100 text-red-700 hover:bg-red-200"
      case "late":
        return "bg-amber-100 text-amber-700 hover:bg-amber-200"
      case "excused":
        return "bg-blue-100 text-blue-700 hover:bg-blue-200"
      default:
        return ""
    }
  }

  const stats = {
    present: Object.values(attendance).filter((s) => s === "present").length,
    absent: Object.values(attendance).filter((s) => s === "absent").length,
    late: Object.values(attendance).filter((s) => s === "late").length,
    excused: Object.values(attendance).filter((s) => s === "excused").length,
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mark Attendance</CardTitle>
          <CardDescription>Select class and date to mark student attendance</CardDescription>
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
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal bg-transparent">
                    <CalendarIcon className="mr-2 w-4 h-4" />
                    {format(selectedDate, "PPP")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={selectedDate} onSelect={(date) => date && setSelectedDate(date)} />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedClass && students.length > 0 && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-green-100">
                    <Check className="w-5 h-5 text-green-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.present}</div>
                    <div className="text-sm text-muted-foreground">Present</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-red-100">
                    <X className="w-5 h-5 text-red-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.absent}</div>
                    <div className="text-sm text-muted-foreground">Absent</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-amber-100">
                    <Clock className="w-5 h-5 text-amber-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.late}</div>
                    <div className="text-sm text-muted-foreground">Late</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <FileX className="w-5 h-5 text-blue-700" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{stats.excused}</div>
                    <div className="text-sm text-muted-foreground">Excused</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Students ({students.length})</CardTitle>
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Attendance"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Loading students...</div>
              ) : (
                <div className="space-y-3">
                  {students.map((student) => (
                    <div key={student._id} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">
                            {student.firstName} {student.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">{student.studentId}</div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {["present", "absent", "late", "excused"].map((status) => (
                          <Button
                            key={status}
                            variant={attendance[student._id!] === status ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleStatusChange(student._id!, status)}
                            className={attendance[student._id!] === status ? getStatusColor(status) : ""}
                          >
                            {getStatusIcon(status)}
                            <span className="ml-1 capitalize">{status}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
