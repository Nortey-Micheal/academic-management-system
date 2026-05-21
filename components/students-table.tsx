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
import { useSelector } from "react-redux"
import { StoreState } from "@/lib/store"
import { toast } from "sonner"
import EditStudentDialog from "./edit-student"
import { Prisma } from "@/lib/generated/prisma/client"
import { StudentWithRelations } from "@/lib/types"

type ClassWithEnrollments = Prisma.ClassGetPayload<{
  include: {
    classTeacher: {
      include: {
        user: {
          select: {
            id: true
            firstName: true
            lastName: true
          }
        }
      }
    }
    subjects: {
      include: {
        subject: true
      }
    }
    enrollments: {
      include: {
        student: {
          include: {
            user: {
              select: {
                id: true
                firstName: true
                lastName: true
                status: true
              }
            }
          }
        }
      }
    }
  }
}>

export type ClassStudentRow = StudentWithRelations & {
  classId: string
}

export function StudentsTable() {
  const [classes, setClasses] = useState<ClassWithEnrollments[]>([])
  const [selectedClassId, setSelectedClassId] = useState("")
  const [search, setSearch] = useState("")
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [student, setStudent] = useState<ClassStudentRow | null>(null)

  const user = useSelector((state: StoreState) => state.user)

  useEffect(() => {
    if (!user?.role || user.role === "STUDENT") return

    if (user.role === "TEACHER") {
      fetchTeacherData()
    } else {
      fetchAdminData()
    }
  }, [user])

  const fetchAdminData = async () => {
    setLoading(true)

    try {
      const response = await fetch("/api/classes")
      const data = await response.json()

      setClasses(data.classes || [])

      if (data.classes?.length > 0) {
        setSelectedClassId(data.classes[0].id)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch classes")
    } finally {
      setLoading(false)
    }
  }

  const fetchTeacherData = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/classWithStudents/${user.teacherProfile?.id}`)
      const data = await response.json()

      setClasses(data || [])

      if (data?.length > 0) {
        setSelectedClassId(data[0].id)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch teacher classes")
    } finally {
      setLoading(false)
    }
  }

  const selectedClass = useMemo(() => {
    return classes.find((cls) => cls.id === selectedClassId)
  }, [classes, selectedClassId])

  const students = useMemo<ClassStudentRow[]>(() => {
    if (!selectedClass) return []

    return selectedClass.enrollments.map((enrollment) => ({
      id: enrollment.student.id,
      studentId: enrollment.student.studentId,
      gender: enrollment.student.gender,
      guardianName: enrollment.student.guardianName,
      guardianPhone: enrollment.student.guardianPhone,
      guardianEmail: enrollment.student.guardianEmail,
      address: enrollment.student.address,
      admissionDate: enrollment.student.admissionDate,
      dateOfBirth: enrollment.student.dateOfBirth,

      classId: enrollment.classId,

      user: enrollment.student.user,

      enrollments: [
        {
          id: enrollment.id,
          classId: enrollment.classId,
          isCurrent: enrollment.isCurrent,
          status: enrollment.status,
        },
      ],
    }))
  }, [selectedClass])

  const filteredStudents = useMemo(() => {
    return students.filter((student) =>
      `${student.user.firstName} ${student.user.lastName}`
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      student.studentId.toLowerCase().includes(search.toLowerCase())
    )
  }, [students, search])

  const handleEdit = (student: ClassStudentRow) => {
    setStudent(student)
    setOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        toast.error("Failed to delete student")
        return
      }

      toast.success("Student deleted successfully")

      if (user.role === "TEACHER") {
        fetchTeacherData()
      } else {
        fetchAdminData()
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete student")
    }
  }

  const formatClassName = (cls: ClassWithEnrollments) => {
    return `${cls.level.replace(/_/g, " ")} - Grade ${cls.grade}${cls.section}`
  }

  return (
    <div className="mb-0 pb-25">
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex items-center justify-between">
            <CardTitle>
              {selectedClass
                ? `Students - ${formatClassName(selectedClass)}`
                : "Students"}
            </CardTitle>

            {user.role !== "TEACHER" && (
              <AddStudentDialog onStudentAdded={fetchAdminData} />
            )}
          </div>

          <Select
            value={selectedClassId}
            onValueChange={setSelectedClassId}
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

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

            <Input
              placeholder="Search by name or student ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

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
                  {selectedClass.enrollments.length}
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
              No students found.
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
                    <TableHead className="text-right">
                      Actions
                    </TableHead>
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
                          {student.user.firstName}{" "}
                          {student.user.lastName}
                        </div>

                        <div className="text-sm text-muted-foreground capitalize">
                          {student.gender}
                        </div>
                      </TableCell>

                      <TableCell>
                        {student.guardianName}
                      </TableCell>

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
                            student.user.status === "active"
                              ? "default"
                              : "secondary"
                          }
                          className="capitalize"
                        >
                          {student.user.status}
                        </Badge>
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(student)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(student.id)}
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

          <EditStudentDialog
            open={open}
            onOpenChange={setOpen}
            student={student!}
            classes={classes}
          />
        </CardContent>
      </Card>
    </div>
  )
}