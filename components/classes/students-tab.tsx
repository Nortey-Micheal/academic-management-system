'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Search, MoreVertical, Eye, Trash2 } from 'lucide-react'

// Mock student data
const mockStudents = [
  { id: '1', name: 'Ama Boateng', admissionNo: 'ADM001', gender: 'Female', status: 'Active' },
  { id: '2', name: 'Kofi Mensah', admissionNo: 'ADM002', gender: 'Male', status: 'Active' },
  { id: '3', name: 'Abena Owusu', admissionNo: 'ADM003', gender: 'Female', status: 'Active' },
  { id: '4', name: 'Kwame Amoah', admissionNo: 'ADM004', gender: 'Male', status: 'Inactive' },
  { id: '5', name: 'Nadia Sappor', admissionNo: 'ADM005', gender: 'Female', status: 'Active' },
]

export function StudentsTab({ classId }: { classId: string }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [students, setStudents] = useState(mockStudents)

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.admissionNo.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleRemoveStudent = (studentId: string) => {
    setStudents(students.filter((s) => s.id !== studentId))
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Class Students</CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search students..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredStudents.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No students found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Admission No.</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.map((student) => (
                  <TableRow key={student.id}>
                    <TableCell className="font-medium">{student.name}</TableCell>
                    <TableCell className="text-sm">{student.admissionNo}</TableCell>
                    <TableCell className="text-sm">{student.gender}</TableCell>
                    <TableCell>
                      <Badge variant={student.status === 'Active' ? 'default' : 'secondary'}>
                        {student.status}
                      </Badge>
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
                            <Eye className="h-4 w-4" />
                            View Profile
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
