"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Pencil, Trash2 } from "lucide-react"
import { AddStudentDialog } from "@/components/add-student-dialog"
import { DUMMY_CLASSES, DUMMY_STUDENTS } from "@/lib/dummy-data"
import { StudentWithRelations } from "@/lib/types"
import { Class } from "@/lib/generated/prisma/client"

export function StudentsTable() {
  const [students, setStudents] = useState<StudentWithRelations[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [studentsRes, classesRes] = await Promise.all([fetch("/api/students"), fetch("/api/classes")])

      const [studentsData, classesData] = await Promise.all([studentsRes.json(), classesRes.json()])

      setStudents(studentsData.students)
      setClasses(classesData.classes)
      // setClasses(DUMMY_CLASSES)
      // setStudents(DUMMY_STUDENTS)
    } catch (error) {
      console.error("[v0] Error fetching data:", error)
      // Use centralized dummy data for local development
      // setClasses(DUMMY_CLASSES)
      // setStudents(DUMMY_STUDENTS)
    } finally {
      setLoading(false)
    }
  }

  const getClassName = (classId: string) => {
    const classObj = classes.find((c) => c.id === classId)
    return `Basic ${classObj?.grade}` || "N/A"
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error("[v0] Error deleting student:", error)
    }
  }

  const filteredStudents = students?.filter(
    (student) =>
      student.user?.firstName.toLowerCase().includes(search.toLowerCase()) ||
      student.user?.lastName.toLowerCase().includes(search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Students ({students?.length})</CardTitle>
          <AddStudentDialog onStudentAdded={fetchData} />
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading students?...</div>
        ) : filteredStudents?.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {search ? "No students found matching your search." : "No students added yet."}
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents?.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-sm">{student.studentId}</TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {student.user?.firstName} {student.user?.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">{student.gender}</div>
                    </TableCell>
                    <TableCell>{getClassName(student.classId)}</TableCell>
                    <TableCell>{student.guardianName}</TableCell>
                    <TableCell>
                      <div className="text-sm">{student.guardianPhone}</div>
                      <div className="text-xs text-muted-foreground">{student.guardianEmail}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={student.user?.status === "active" ? "default" : "secondary"} className="capitalize">
                        {student.user?.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(student.id!)}>
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
