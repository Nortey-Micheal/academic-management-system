'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Trash2 } from 'lucide-react'

// Mock subject data
const mockSubjects = [
  { id: '1', name: 'Mathematics', teacher: 'Mrs. Sarah Johnson', status: 'Assigned' },
  { id: '2', name: 'English Language', teacher: 'Mr. David Smith', status: 'Assigned' },
  { id: '3', name: 'Science', teacher: 'Miss Grace Osei', status: 'Assigned' },
  { id: '4', name: 'Social Studies', teacher: 'Unassigned', status: 'Unassigned' },
  { id: '5', name: 'Physical Education', teacher: 'Mr. Joseph Mensah', status: 'Assigned' },
]

export function SubjectsTab({ classId }: { classId: string }) {
  return (
    <div className="space-y-6">
      {/* Assigned Subjects */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assigned Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Assigned Teacher</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSubjects
                  .filter((s) => s.status === 'Assigned')
                  .map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell className="text-sm">{subject.teacher}</TableCell>
                      <TableCell>
                        <Badge variant="default">{subject.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Change Teacher</DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-destructive">
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
        </CardContent>
      </Card>

      {/* Unassigned Subjects */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-base text-amber-900">Unassigned Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockSubjects
                  .filter((s) => s.status === 'Unassigned')
                  .map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{subject.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline">
                          Assign Teacher
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
          {mockSubjects.filter((s) => s.status === 'Unassigned').length === 0 && (
            <div className="text-center py-6 text-amber-800">
              <p>All subjects have been assigned!</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
