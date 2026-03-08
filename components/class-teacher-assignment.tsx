'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Spinner } from '@/components/ui/spinner'
import { toast } from 'sonner'
import { X } from 'lucide-react'

interface Class {
  id: string
  level: string
  grade: number
  section: string
  academicYear: string
  classTeacherId?: string
  classTeacher?: {
    user: {
      firstName: string
      lastName: string
    }
  }
}

interface ClassTeacherAssignmentProps {
  teacherId: string
  teacherName: string
  userRole: string
}

export function ClassTeacherAssignment({
  teacherId,
  teacherName,
  userRole,
}: ClassTeacherAssignmentProps) {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(true)

  useEffect(() => {
    fetchClasses()
  }, [])

  const fetchClasses = async () => {
    try {
      setIsFetching(true)
      const response = await fetch('/api/classes', {
        headers: {
          'x-user-role': userRole
        }
      })
      if (response.ok) {
        const data = await response.json()
        setClasses(data)
      }
    } catch (error) {
      console.error('Error fetching classes:', error)
      toast.error('Failed to fetch classes')
    } finally {
      setIsFetching(false)
    }
  }

  const handleAssign = async () => {
    if (!selectedClass) {
      toast.error('Please select a class')
      return
    }

    try {
      setIsLoading(true)
      const response = await fetch(`/api/staff/${teacherId}/class-teacher`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole
        },
        body: JSON.stringify({ classId: selectedClass })
      })

      if (response.ok) {
        toast.success(`${teacherName} assigned as class teacher`)
        setSelectedClass(null)
        await fetchClasses()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to assign class teacher')
      }
    } catch (error) {
      console.error('Error assigning class teacher:', error)
      toast.error('Failed to assign class teacher')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRemove = async (classId: string) => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/staff/${teacherId}/class-teacher`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'x-user-role': userRole
        },
        body: JSON.stringify({ classId })
      })

      if (response.ok) {
        toast.success('Class teacher assignment removed')
        await fetchClasses()
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

  // Find classes where this teacher is already a class teacher
  const teacherClasses = classes.filter(c => c.classTeacherId)
  const assignedClasses = teacherClasses.filter(c => 
    c.classTeacher?.user.firstName === teacherName.split(' ')[0]
  )
  const availableClasses = classes.filter(c => !c.classTeacherId)

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Assign as Class Teacher</CardTitle>
          <CardDescription>
            Select a class to assign {teacherName} as the form/class teacher
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            {availableClasses.map(cls => (
              <div key={cls.id} className="flex items-center gap-2">
                <Checkbox
                  id={cls.id}
                  checked={selectedClass === cls.id}
                  onCheckedChange={() => setSelectedClass(cls.id)}
                />
                <label htmlFor={cls.id} className="flex-1 cursor-pointer">
                  <span className="font-medium">
                    {cls.level} - Grade {cls.grade}, Section {cls.section}
                  </span>
                  <span className="text-sm text-gray-600 ml-2">
                    ({cls.academicYear})
                  </span>
                </label>
              </div>
            ))}
            {availableClasses.length === 0 && (
              <p className="text-sm text-gray-500">No available classes</p>
            )}
          </div>
          <Button
            onClick={handleAssign}
            disabled={!selectedClass || isLoading}
          >
            {isLoading ? 'Assigning...' : 'Assign as Class Teacher'}
          </Button>
        </CardContent>
      </Card>

      {assignedClasses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Assigned Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {assignedClasses.map(cls => (
                <div
                  key={cls.id}
                  className="flex items-center justify-between p-2 bg-blue-50 rounded-md border border-blue-200"
                >
                  <div>
                    <span className="font-medium">
                      {cls.level} - Grade {cls.grade}, Section {cls.section}
                    </span>
                    <span className="text-sm text-gray-600 ml-2">
                      ({cls.academicYear})
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(cls.id)}
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
    </div>
  )
}
