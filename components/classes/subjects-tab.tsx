'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { MoreVertical, Trash2, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { StoreState } from '@/lib/store'

interface Subject {
  id: string
  name: string
  teacher: string
  status: string
}

export function SubjectsTab({ classId }: { classId: string }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(true)
  const userId = useSelector((state:StoreState) => state.user).id

  useEffect(() => {
    fetchSubjects()
  }, [classId])

  const fetchSubjects = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/classes/${classId}/subjects?userId=${userId}`)
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subjects')
      }

      setSubjects(data.subjects || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch subjects')
    } finally {
      setLoading(false)
    }
  }

  const sortedSubjects = useMemo(() => {
    return [...subjects].sort((a, b) =>
      a.name.localeCompare(b.name)
    )
  }, [subjects])

  const assigned = sortedSubjects.filter((s) => s.status === 'Assigned')
  const unassigned = sortedSubjects.filter((s) => s.status === 'Unassigned')

  return (
    <div className="space-y-6">

      {/* ASSIGNED */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Assigned Subjects</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : assigned.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              No assigned subjects
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Subject</TableHead>
                    <TableHead>Teacher</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {assigned.map((subject) => (
                    <TableRow key={subject.id}>
                      <TableCell className="font-medium">{subject.name}</TableCell>
                      <TableCell className="text-sm">{subject.teacher}</TableCell>
                      <TableCell>
                        <Badge>{subject.status}</Badge>
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              Change Teacher
                            </DropdownMenuItem>

                            <DropdownMenuItem className="text-destructive gap-2">
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

      {/* UNASSIGNED */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Unassigned Subjects</CardTitle>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : unassigned.length === 0 ? (
            <div className="text-sm text-muted-foreground py-6 text-center">
              All subjects have been assigned
            </div>
          ) : (
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
                  {unassigned.map((subject) => (
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
          )}
        </CardContent>
      </Card>

    </div>
  )
}