'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Calendar, MoreVertical, Edit2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { StoreState } from '@/lib/store'

type ViewType = 'daily' | 'student'

interface AttendanceRecord {
  id: string
  date: string
  present: number
  absent: number
  percentage: number
}

interface StudentAttendance {
  id: string
  name: string
  present: number
  absent: number
  percentage: number
}

export function AttendanceTab({ classId }: { classId: string }) {
  const [view, setView] = useState<ViewType>('daily')

  const [loading, setLoading] = useState(true)
  const [daily, setDaily] = useState<AttendanceRecord[]>([])
  const [students, setStudents] = useState<StudentAttendance[]>([])

  const userId = useSelector((state: StoreState) => state.user).id

  useEffect(() => {
    fetchAttendance()
  }, [classId])

  const fetchAttendance = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `/api/classes/${classId}/attendance?userId=${userId}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch attendance')
      }

      setDaily(data.daily || [])
      setStudents(data.students || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load attendance')
    } finally {
      setLoading(false)
    }
  }

  const sortedDaily = useMemo(() => {
    return [...daily].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [daily])

  const sortedStudents = useMemo(() => {
    return [...students].sort((a, b) => a.name.localeCompare(b.name))
  }, [students])

  const avgAttendance = useMemo(() => {
    if (!students.length) return 0
    return Math.round(
      students.reduce((acc, s) => acc + s.percentage, 0) / students.length
    )
  }, [students])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Toggle */}
      <div className="flex gap-2 overflow-x-auto">
        <Button
          variant={view === 'daily' ? 'default' : 'outline'}
          onClick={() => setView('daily')}
          className="gap-2 shrink-0"
        >
          <Calendar className="h-4 w-4" />
          Daily
        </Button>

        <Button
          variant={view === 'student' ? 'default' : 'outline'}
          onClick={() => setView('student')}
          className="shrink-0"
        >
          Students
        </Button>
      </div>

      {/* DAILY */}
      {view === 'daily' && (
        <Card>
          <CardHeader>
            <CardTitle>Daily Attendance</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Absent</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedDaily.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No attendance records
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedDaily.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell className="whitespace-nowrap">
                        {new Date(record.date).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-right">{record.present}</TableCell>

                      <TableCell className="text-right">{record.absent}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={record.percentage} className="w-20" />
                          <span className="text-sm">{record.percentage}%</span>
                        </div>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Edit2 className="h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* STUDENTS */}
      {view === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle>Student Attendance</CardTitle>
          </CardHeader>

          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-right">Present</TableHead>
                  <TableHead className="text-right">Absent</TableHead>
                  <TableHead>Rate</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedStudents.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                      No student records
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {student.name}
                      </TableCell>

                      <TableCell className="text-right">{student.present}</TableCell>

                      <TableCell className="text-right">{student.absent}</TableCell>

                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.percentage} className="w-20" />
                          <Badge variant={student.percentage >= 90 ? 'default' : 'secondary'}>
                            {student.percentage}%
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* SUMMARY */}
      <Card>
        <CardHeader>
          <CardTitle>Class Summary</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Average Attendance</p>
              <p className="text-xl font-bold">{avgAttendance}%</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Total Students</p>
              <p className="text-xl font-bold">{students.length}</p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">Records</p>
              <p className="text-xl font-bold">{daily.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

    </div>
  )
}