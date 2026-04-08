"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Search, Pencil, Trash2 } from "lucide-react"
import { AddStudentDialog } from "@/components/add-student-dialog"
import { StudentWithRelations } from "@/lib/types"
import { Class } from "@/lib/generated/prisma/client"
import { useSelector } from "react-redux"
import { StoreState } from "@/lib/store"
import { toast } from "sonner"

export function StudentsTable() {
  const [students, setStudents] = useState<StudentWithRelations[]>([])
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClassId, setSelectedClassId] = useState<string>("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const user = useSelector((state:StoreState) => state.user)

  useEffect(() => {
    if (!user?.role || user.role === "STUDENT") return

    if (user.role === "TEACHER") {
      fetchDataForTeachers()
    } else {
      fetchDataForNoneTeachers()
    }
  }, [user])

  const fetchDataForNoneTeachers = async () => {
    setLoading(true)
    try {
      const [studentsRes, classesRes] = await Promise.all([
        fetch("/api/students"),
        fetch("/api/classes"),
      ])

      const [studentsData, classesData] = await Promise.all([
        studentsRes.json(),
        classesRes.json(),
      ])

      setStudents(studentsData.students)
      setClasses(classesData.classes)

      // Auto select first class
      if (classesData?.classes?.length > 0) {
        setSelectedClassId(classesData.classes[0].id)
      }
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDataForTeachers = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/classWithStudents/${user.teacherProfile?.id}`)
      const data = await response.json()

      const classList = data.map((cls: any) => {
        const { students, ...classInfo } = cls
        return classInfo
      })

      const studentList = data.flatMap((cls: any) =>
        cls.students.map((student: any) => ({
          ...student,
          classId: cls.id,
        }))
      )

      setClasses(classList)
      setStudents(studentList)

      console.log({classList,studentList})

      if (classList.length > 0) {
        setSelectedClassId(classList[0].id)
      }

    } catch (error: any) {
      toast.error(error)
    } finally {
      setLoading(false)
    }
  }

  const selectedClass = useMemo(
    () => classes?.find((c) => c.id === selectedClassId),
    [classes, selectedClassId],
  )

  const filteredStudents = useMemo(() => {
    return students
      ?.filter((student) => student.classId === selectedClassId)
      ?.filter(
        (student) =>
          student.user?.firstName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          student.user?.lastName
            ?.toLowerCase()
            .includes(search.toLowerCase()) ||
          student.studentId?.toLowerCase().includes(search.toLowerCase()),
      )
  }, [students, selectedClassId, search])

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        if (user.role === "TEACHER") {
          fetchDataForTeachers()
        } else {
          fetchDataForNoneTeachers()
        }
      }
    } catch (error) {
      console.error("Error deleting student:", error)
    }
  }

  const formatClassName = (cls: Class) => {
    return `${cls.level.replace(/_/g, " ")} - Grade ${cls.grade}${cls.section} (${cls.academicYear})`
  }

  return (
    <Card>
      <CardHeader className="space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle>
            {selectedClass
              ? `Students - ${formatClassName(selectedClass)}`
              : "Students"}
          </CardTitle>
          {user.role !== 'TEACHER' && <AddStudentDialog onStudentAdded={fetchDataForNoneTeachers} />}
        </div>

        {/* Class Selector */}
        <Select
          value={selectedClassId}
          onValueChange={(value) => setSelectedClassId(value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a class" />
          </SelectTrigger>
          <SelectContent>
            {classes?.map((cls) => (
              <SelectItem key={cls.id} value={cls.id}>
                {formatClassName(cls)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or student ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Class Info */}
        {selectedClass && (
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div>
              Capacity:{" "}
              <span className="font-medium text-foreground">
                {selectedClass.capacity}
              </span>
            </div>
            <div>
              Enrolled:{" "}
              <span className="font-medium text-foreground">
                {selectedClass.currentEnrollment}
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading students...
          </div>
        ) : !selectedClass ? (
          <div className="text-center py-8 text-muted-foreground">
            Please select a class.
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No students found in this class.
          </div>
        ) : (
          <div className="rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Guardian</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-mono text-sm">
                      {student.studentId}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">
                        {student.user?.firstName}{" "}
                        {student.user?.lastName}
                      </div>
                      <div className="text-sm text-muted-foreground capitalize">
                        {student.gender}
                      </div>
                    </TableCell>
                    <TableCell>{student.guardianName}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {student.guardianPhone}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {student.guardianEmail}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          student.user?.status === "active"
                            ? "default"
                            : "secondary"
                        }
                        className="capitalize"
                      >
                        {student.user?.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(student.id!)}
                        >
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