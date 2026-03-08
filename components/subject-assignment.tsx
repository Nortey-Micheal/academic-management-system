'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ClassSubject {
  id: string
  class: {
    id: string
    level: string
    grade: number
    section: string
    academicYear: string
  }
  subject: {
    id: string
    subjectName: string
    subjectCode: string
  }
}

interface SubjectAssignmentProps {
  teacherId: string
  teacherName: string
  userRole: string
  currentAssignments?: any[]
}

export function SubjectAssignment({
  teacherId,
  teacherName,
  userRole,
  currentAssignments = [],
}: SubjectAssignmentProps) {
  const [classes, setClasses] = useState<ClassSubject[]>([])
  const [assignments, setAssignments] = useState(currentAssignments)
  const [selectedClassSubject, setSelectedClassSubject] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    fetchClassSubjects()
  }, [])

  const fetchClassSubjects = async () => {
    try {
      setIsFetching(true)
      const [classesRes, subjectsRes] = await Promise.all([
        fetch('/api/classes', {
          headers: { 'x-user-role': userRole }
        }),
        fetch('/api/subjects', {
          headers: { 'x-user-role': userRole }
        })
      ])

      if (classesRes.ok) {
        const classesData = await classesRes.json()
        // Flatten class-subject combinations
        const classSubjectList: ClassSubject[] = []
        classesData.forEach((cls: any) => {
          cls.subjects?.forEach((cs: any) => {
            classSubjectList.push({
              id: cs.id,
              class: {
                id: cls.id,
                level: cls.level,
                grade: cls.grade,
                section: cls.section,
                academicYear: cls.academicYear
              },
              subject: cs.subject
            })
          })
        })
        setClasses(classSubjectList)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error('Failed to fetch class and subject data')
    } finally {
      setIsFetching(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedClassSubject) {
      toast.error('Please select a class-subject')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/staff/${teacherId}/subjects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole
        },
        body: JSON.stringify({ classSubjectId: selectedClassSubject })
      })

      if (response.ok) {
        const newAssignment = await response.json()
        setAssignments([...assignments, newAssignment])
        setSelectedClassSubject('')
        toast.success(`Subject assigned to ${teacherName}`)
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to assign subject')
      }
    } catch (error) {
      console.error('Error assigning subject:', error)
      toast.error('Failed to assign subject')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (assignmentId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/staff/${teacherId}/subjects`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole
        },
        body: JSON.stringify({ assignmentId })
      })

      if (response.ok) {
        setAssignments(assignments.filter(a => a.id !== assignmentId))
        toast.success('Subject assignment removed')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to remove assignment')
      }
    } catch (error) {
      console.error('Error removing assignment:', error)
      toast.error('Failed to remove assignment')
    } finally {
      setIsLoading(false)
    }
  }

  if (isFetching) {
    return (
      <Card>
        <CardContent className="flex justify-center py-8">
          <Spinner />
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Assign to Class-Subject</CardTitle>
          <CardDescription>
            Select a class and subject to assign {teacherName}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Class & Subject</label>
            <Select value={selectedClassSubject} onValueChange={setSelectedClassSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Select class and subject" />
              </SelectTrigger>
              <SelectContent className="max-h-48">
                {classes.map(cs => (
                  <SelectItem key={cs.id} value={cs.id}>
                    {cs.class.level} Grade {cs.class.grade} Section {cs.class.section} - {cs.subject.subjectName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleAssign}
            disabled={!selectedClassSubject || isLoading}
          >
            {isLoading ? 'Assigning...' : 'Assign Subject'}
          </Button>
        </CardContent>
      </Card>

      {assignments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Assignments</CardTitle>
            <CardDescription>{assignments.length} active assignment(s)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignments.map(assignment => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-2 bg-green-50 rounded-md border border-green-200"
                >
                  <div className="text-sm">
                    <p className="font-medium">
                      {assignment.classSubject?.subject?.subjectName || 'Unknown Subject'}
                    </p>
                    <p className="text-gray-600 text-xs">
                      {assignment.classSubject?.class?.level} Grade {assignment.classSubject?.class?.grade} Section {assignment.classSubject?.class?.section}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(assignment.id)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {assignments.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No subject assignments yet
        </div>
      )}
    </div>
  )
}
