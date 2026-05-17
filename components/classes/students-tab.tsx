'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

import {
  Search,
  MoreVertical,
  Eye,
  Trash2,
  Loader2,
  ArrowUpDown,
  Users,
} from 'lucide-react'

import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { StoreState } from '@/lib/store'
import { cn } from '@/lib/utils'

interface Student {
  id: string
  name: string
  admissionNo: string
  gender: string
  status: string
}

interface Props {
  classId: string
}

type SortField = 'name' | 'admissionNo'
type SortOrder = 'asc' | 'desc'

export function StudentsTab({ classId }: Props) {
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  const [sortField, setSortField] = useState<SortField>('name')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const userId = useSelector((state: StoreState) => state.user).id

  useEffect(() => {
    fetchStudents()
  }, [classId])

  const fetchStudents = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/classes/${classId}/students?userId=${userId}`)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch students')
      }

      const sortedStudents = (data.students || []).sort((a: Student, b: Student) =>
        a.name.localeCompare(b.name)
      )

      setStudents(sortedStudents)
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch students')
    } finally {
      setLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))
      return
    }

    setSortField(field)
    setSortOrder('asc')
  }

  const filteredStudents = useMemo(() => {
    const filtered = students.filter((student) => {
      const search = searchTerm.toLowerCase()

      return (
        student.name.toLowerCase().includes(search) ||
        student.admissionNo.toLowerCase().includes(search)
      )
    })

    return filtered.sort((a, b) => {
      const valueA = a[sortField].toLowerCase()
      const valueB = b[sortField].toLowerCase()

      if (sortOrder === 'asc') {
        return valueA.localeCompare(valueB)
      }

      return valueB.localeCompare(valueA)
    })
  }, [students, searchTerm, sortField, sortOrder])

  const handleRemoveStudent = async (studentId: string) => {
    try {
      const response = await fetch(`/api/classes/${classId}/students/${studentId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove student')
      }

      setStudents((prev) => prev.filter((student) => student.id !== studentId))

      toast.success('Student removed successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to remove student')
    }
  }

  return (
    <Card className="rounded-2xl border bg-background shadow-sm overflow-hidden">
      <CardHeader className="border-b bg-muted/30">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Users className="h-4 w-4 text-primary" />
              </div>

              <div>
                <CardTitle className="text-lg">
                  Class Students
                </CardTitle>

                <p className="text-sm text-muted-foreground">
                  {students.length} student{students.length !== 1 ? 's' : ''} enrolled
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
            <div className="relative w-full sm:w-[300px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 rounded-xl bg-background"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-0">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-primary" />

              <p className="text-sm text-muted-foreground">
                Loading students...
              </p>
            </div>
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-muted-foreground" />
            </div>

            <p className="text-base font-semibold">
              No students found
            </p>

            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Try adjusting your search or add students to this class.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="min-w-[220px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('name')}
                      className="px-0 hover:bg-transparent font-semibold"
                    >
                      Student
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>

                  <TableHead className="min-w-[160px]">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('admissionNo')}
                      className="px-0 hover:bg-transparent font-semibold"
                    >
                      Admission No.
                      <ArrowUpDown className="ml-2 h-3.5 w-3.5" />
                    </Button>
                  </TableHead>

                  <TableHead className="min-w-[120px]">
                    Gender
                  </TableHead>

                  <TableHead className="min-w-[120px]">
                    Status
                  </TableHead>

                  <TableHead className="w-[70px] text-right">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {filteredStudents.map((student, index) => (
                  <TableRow
                    key={student.id}
                    className={cn(
                      'transition-colors hover:bg-muted/40',
                      index % 2 === 0 && 'bg-background'
                    )}
                  >
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary shrink-0">
                          {student.name.charAt(0)}
                        </div>

                        <div className="min-w-0">
                          <p className="font-semibold truncate">
                            {student.name}
                          </p>

                          <p className="text-xs text-muted-foreground">
                            Student
                          </p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell className="text-sm font-medium whitespace-nowrap">
                      {student.admissionNo}
                    </TableCell>

                    <TableCell className="text-sm whitespace-nowrap">
                      {student.gender}
                    </TableCell>

                    <TableCell>
                      <Badge
                        variant={student.status === 'Active' ? 'default' : 'secondary'}
                        className="rounded-lg"
                      >
                        {student.status}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link
                              href={`/students/${student.id}`}
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Profile
                            </Link>
                          </DropdownMenuItem>

                          <DropdownMenuItem
                            className="gap-2 text-destructive"
                            onClick={() => handleRemoveStudent(student.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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