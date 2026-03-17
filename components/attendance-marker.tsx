"use client"

import { useState, useEffect } from "react"
import { format } from "date-fns"
import { useSelector } from "react-redux"

import { StoreState } from "@/lib/store"
import { ClassWithStudents, StudentWithRelations } from "@/lib/types"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

import { CalendarIcon, Check, X, Clock, FileX } from "lucide-react"

export function AttendanceMarker() {

  const user = useSelector((state: StoreState) => state.user)

  const isAdmin = user.role === "ADMIN"

  const [classes, setClasses] = useState<ClassWithStudents[]>([])
  const [students, setStudents] = useState<StudentWithRelations[]>([])
  const [selectedClass, setSelectedClass] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const [attendance, setAttendance] = useState<Record<string, string>>({})

  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  /* -------------------------------- */
  /* INITIAL LOAD                     */
  /* -------------------------------- */

  useEffect(() => {

    if (isAdmin) fetchClasses()
    else fetchTeacherClass()

  }, [])

  /* -------------------------------- */
  /* CLASS + DATE EFFECT              */
  /* -------------------------------- */

  useEffect(() => {

    if (!selectedClass) return

    const selected = classes.find(c => c.id === selectedClass)
    if (!selected) return

    const classStudents = selected.students || []

    // SET STUDENTS FIRST (ALWAYS)
    setStudents(classStudents)

    // DEFAULT ATTENDANCE
    const defaultAttendance: Record<string,string> = {}

    classStudents.forEach(student => {
      defaultAttendance[student.id] = "present"
    })

    setAttendance(defaultAttendance)

    // FETCH EXISTING ATTENDANCE
    fetchAttendance(selectedClass)

  }, [selectedClass, selectedDate, classes])

  /* -------------------------------- */
  /* FETCH CLASSES                    */
  /* -------------------------------- */

  const fetchClasses = async () => {

    try {
      const res = await fetch("/api/classes")
      const data = await res.json()
      setClasses(data.classes || [])
    } catch (err) {
      console.error("Failed to load classes", err)
    }

  }

  /* -------------------------------- */
  /* FETCH TEACHER CLASS              */
  /* -------------------------------- */

  const fetchTeacherClass = async () => {

    try {
      const res = await fetch(`/api/classes/teacher/${user.id}`)
      const data = await res.json()

      if (!data.class) return

      setClasses([data.class])
      setSelectedClass(data.class.id)

    } catch (err) {
      console.error("Failed to fetch teacher class", err)
    }

  }

  /* -------------------------------- */
  /* CLASS CHANGE                     */
  /* -------------------------------- */

  const handleClassChange = (classId: string) => {
    setSelectedClass(classId)
  }

  /* -------------------------------- */
  /* FETCH ATTENDANCE                 */
  /* -------------------------------- */

  const fetchAttendance = async (classId: string) => {

    setLoading(true)

    try {

      const dateStr = format(selectedDate, "yyyy-MM-dd")

      const url = isAdmin
        ? `/api/attendance/admin?classId=${classId}&date=${dateStr}`
        : `/api/attendance/teacher?teacherId=${user.id}&date=${dateStr}`

      const res = await fetch(url)
      const data = await res.json()

      if (!data.attendance) return

      const existing: Record<string,string> = {}

      data.attendance.forEach((record: any) => {
        existing[record.studentId] = record.status
      })

      // MERGE (CRITICAL)
      setAttendance(prev => ({
        ...prev,
        ...existing
      }))

    } catch (err) {

      console.error("Attendance fetch error", err)

    } finally {

      setLoading(false)

    }

  }

  /* -------------------------------- */
  /* CHANGE STATUS                    */
  /* -------------------------------- */

  const handleStatusChange = (studentId: string, status: string) => {

    if (isAdmin) return

    setAttendance(prev => ({
      ...prev,
      [studentId]: status
    }))

  }

  /* -------------------------------- */
  /* SAVE ATTENDANCE                  */
  /* -------------------------------- */

  const handleSave = async () => {

    setSaving(true)

    try {

      const records = students.map(student => ({
        studentId: student.id,
        status: attendance[student.id] || "present"
      }))

      await fetch("/api/attendance", {

        method: "POST",
        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({
          classId: selectedClass,
          date: format(selectedDate, "yyyy-MM-dd"),
          records
        })

      })

    } catch (err) {

      console.error("Save error", err)

    } finally {

      setSaving(false)

    }

  }

  /* -------------------------------- */
  /* SPLIT BY GENDER                  */
  /* -------------------------------- */

  const sortedStudents = [...students].sort((a, b) =>
    a.user.lastName.localeCompare(b.user.lastName)
  )

  const maleStudents = sortedStudents.filter(s => s.gender === 
    'male'
  )
  const femaleStudents = sortedStudents.filter(s => s.gender === 'female')

  /* -------------------------------- */
  /* STATS                            */
  /* -------------------------------- */

  const stats = {

    present: students.filter(s => attendance[s.id] === "present").length,
    absent: students.filter(s => attendance[s.id] === "absent").length,
    late: students.filter(s => attendance[s.id] === "late").length,
    excused: students.filter(s => attendance[s.id] === "excused").length

  }

  const getIcon = (status: string) => {

    if (status === "present") return <Check className="w-4 h-4" />
    if (status === "absent") return <X className="w-4 h-4" />
    if (status === "late") return <Clock className="w-4 h-4" />
    if (status === "excused") return <FileX className="w-4 h-4" />

  }

  /* -------------------------------- */
  /* RENDER LIST                      */
  /* -------------------------------- */

  const renderStudentList = (list: StudentWithRelations[]) => (

    <div className="space-y-3">

      {list.map(student => (

        <div
          key={student.id}
          className="flex items-center justify-between border p-4 rounded-lg"
        >

          <div>
            <div className="font-medium">
              {student.user.lastName} {student.user.firstName}
            </div>
            <div className="text-sm text-muted-foreground">
              {student.studentId}
            </div>
          </div>

          <div className="flex gap-2">

            {["present","absent","late","excused"].map(status => (

              <Button
                key={status}
                size="sm"
                disabled={isAdmin}
                variant={attendance[student.id] === status ? "default" : "outline"}
                onClick={() => handleStatusChange(student.id, status)}
              >
                {getIcon(status)}
                <span className="ml-1 capitalize">{status}</span>
              </Button>

            ))}

          </div>

        </div>

      ))}

    </div>

  )

  /* -------------------------------- */
  /* UI                               */
  /* -------------------------------- */

  return (

    <div className="space-y-6">

      <Card>

        <CardHeader>
          <CardTitle>Attendance</CardTitle>
          <CardDescription>
            {isAdmin
              ? "View attendance records"
              : "Mark and manage class attendance"}
          </CardDescription>
        </CardHeader>

        <CardContent className="grid gap-4 md:grid-cols-2">

          {isAdmin && (
            <div className="space-y-2">
              <Label>Class</Label>
              <Select value={selectedClass} onValueChange={handleClassChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(c => (
                    <SelectItem key={c.id} value={c.id}>
                      Basic {c.grade} - {c.section}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {
            !isAdmin && (
              <p>Basic {classes[0]?.grade}</p>
            )
          }

          <div className="space-y-2">
            <Label>Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full justify-start">
                  <CalendarIcon className="mr-2 w-4 h-4" />
                  {format(selectedDate, "PPP")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                />
              </PopoverContent>
            </Popover>
          </div>

        </CardContent>

      </Card>

      {selectedClass && (

        <>

          {/* STATS */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card><CardContent className="pt-6">Present: {stats.present}</CardContent></Card>
            <Card><CardContent className="pt-6">Absent: {stats.absent}</CardContent></Card>
            <Card><CardContent className="pt-6">Late: {stats.late}</CardContent></Card>
            <Card><CardContent className="pt-6">Excused: {stats.excused}</CardContent></Card>
          </div>

          {/* STUDENTS */}
          <Card>

            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Students ({students.length})</CardTitle>

              {!isAdmin && (
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Saving..." : "Save Attendance"}
                </Button>
              )}

            </CardHeader>

            <CardContent>

              {loading ? (

                <div className="text-center py-6 text-muted-foreground">
                  Loading attendance...
                </div>

              ) : (

                <div className="space-y-6">

                  {/* MALES */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Male Students ({maleStudents.length})
                    </h3>

                    {maleStudents.length > 0
                      ? renderStudentList(maleStudents)
                      : <p className="text-sm text-muted-foreground">No male students</p>
                    }
                  </div>

                  {/* FEMALES */}
                  <div>
                    <h3 className="text-lg font-semibold mb-2">
                      Female Students ({femaleStudents.length})
                    </h3>

                    {femaleStudents.length > 0
                      ? renderStudentList(femaleStudents)
                      : <p className="text-sm text-muted-foreground">No female students</p>
                    }
                  </div>

                </div>

              )}

            </CardContent>

          </Card>

        </>

      )}

    </div>

  )

}