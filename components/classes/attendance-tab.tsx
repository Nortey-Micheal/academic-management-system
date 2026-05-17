'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Calendar, MoreVertical, Edit2 } from 'lucide-react'

// Mock attendance data
const mockAttendanceRecords = [
  { date: '2024-01-15', present: 36, absent: 2, percentage: 94.7 },
  { date: '2024-01-14', present: 37, absent: 1, percentage: 97.4 },
  { date: '2024-01-13', present: 35, absent: 3, percentage: 92.1 },
  { date: '2024-01-12', present: 38, absent: 0, percentage: 100 },
  { date: '2024-01-11', present: 36, absent: 2, percentage: 94.7 },
]

const mockStudentAttendance = [
  { id: '1', name: 'Ama Boateng', present: 18, absent: 2, percentage: 90 },
  { id: '2', name: 'Kofi Mensah', present: 19, absent: 1, percentage: 95 },
  { id: '3', name: 'Abena Owusu', present: 20, absent: 0, percentage: 100 },
  { id: '4', name: 'Kwame Amoah', present: 17, absent: 3, percentage: 85 },
  { id: '5', name: 'Nadia Sappor', present: 19, absent: 1, percentage: 95 },
]

export function AttendanceTab({ classId }: { classId: string }) {
  const [view, setView] = useState<'daily' | 'student'>('daily')

  return (
    <div className="space-y-6">
      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={view === 'daily' ? 'default' : 'outline'}
          onClick={() => setView('daily')}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          Daily View
        </Button>
        <Button
          variant={view === 'student' ? 'default' : 'outline'}
          onClick={() => setView('student')}
        >
          Student View
        </Button>
      </div>

      {/* Daily Attendance View */}
      {view === 'daily' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Daily Attendance Record</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Present</TableHead>
                    <TableHead className="text-right">Absent</TableHead>
                    <TableHead>Attendance %</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAttendanceRecords.map((record) => (
                    <TableRow key={record.date}>
                      <TableCell className="font-medium">{record.date}</TableCell>
                      <TableCell className="text-right">{record.present}</TableCell>
                      <TableCell className="text-right">{record.absent}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={record.percentage} className="w-20" />
                          <span className="text-sm font-medium">{record.percentage}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Edit2 className="h-4 w-4" />
                              Edit Attendance
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Student Attendance View */}
      {view === 'student' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Student Attendance Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student Name</TableHead>
                    <TableHead className="text-right">Present</TableHead>
                    <TableHead className="text-right">Absent</TableHead>
                    <TableHead>Attendance Rate</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockStudentAttendance.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell className="text-right">{student.present}</TableCell>
                      <TableCell className="text-right">{student.absent}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={student.percentage} className="w-20" />
                          <Badge
                            variant={student.percentage >= 90 ? 'default' : 'secondary'}
                          >
                            {student.percentage}%
                          </Badge>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Class Attendance Summary */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">Class Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-blue-700">Average Attendance</p>
              <p className="text-2xl font-bold text-blue-900">94.8%</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Most Present</p>
              <p className="text-2xl font-bold text-blue-900">38</p>
            </div>
            <div>
              <p className="text-sm text-blue-700">Least Attendance</p>
              <p className="text-2xl font-bold text-blue-900">85%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
