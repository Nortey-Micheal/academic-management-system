'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface ClassOption {
  id: string
  grade: number
  level: string
}

interface SubjectOption {
  id: string,
  subjectName: string
}

interface StaffMember {
  id?: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role?: string
  status?: string
  teacherProfile?: {
    teacherId: string
    specialization: string
  }
  classAssignments?: {
    classId: string
    subjects: string[]
    isClassTeacher: boolean
    level: string
    availableSubjects?: SubjectOption[]
  }[]
}

interface StaffFormProps {
  initialData?: StaffMember
  isLoading: boolean
  isEditMode?: boolean
  availableClasses: ClassOption[]
  fetchSubjects: (level: string) => Promise<SubjectOption[]>
  onSubmit: (data: any) => Promise<void>
  onCancel: () => void
}

export function StaffForm({
  initialData,
  isLoading,
  isEditMode = false,
  availableClasses,
  fetchSubjects,
  onSubmit,
  onCancel,
}: StaffFormProps) {
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    firstName: initialData?.firstName || '',
    lastName: initialData?.lastName || '',
    phone: initialData?.phone || '',
    role: initialData?.role || 'TEACHER',
    status: initialData?.status || 'active',
    specialization: initialData?.teacherProfile?.specialization || '',
    teacherId: initialData?.teacherProfile?.teacherId || '',
    classAssignments: initialData?.classAssignments || [],
  })

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleClassChange = async (index: number, classId: string, level?: string) => {
    const updatedAssignments = [...formData.classAssignments]
    const selectedClass = availableClasses.find(c => c.id === classId)
    const classLevel = level || selectedClass?.level || ''

    // fetch subjects for this class level
    const subjects = classLevel ? await fetchSubjects(classLevel) : []

    updatedAssignments[index] = {
      classId,
      subjects: [],
      isClassTeacher: false,
      level: classLevel,
      availableSubjects: subjects,
    }

    handleChange('classAssignments', updatedAssignments)
  }

  const handleSubjectToggle = (classIndex: number, subjectId: string) => {
    const updatedAssignments = [...formData.classAssignments]
    const subjects = updatedAssignments[classIndex].subjects || []
    updatedAssignments[classIndex].subjects = subjects.includes(subjectId)
      ? subjects.filter(id => id !== subjectId)
      : [...subjects, subjectId]
    handleChange('classAssignments', updatedAssignments)
  }

  const handleClassTeacherToggle = (classIndex: number, value: boolean) => {
    const updatedAssignments = [...formData.classAssignments]
    updatedAssignments[classIndex].isClassTeacher = value
    handleChange('classAssignments', updatedAssignments)
  }

  const addClassAssignment = () => {
    handleChange('classAssignments', [
      ...(formData.classAssignments || []),
      { classId: '', subjects: [], isClassTeacher: false, level: '', availableSubjects: [] },
    ])
  }

  const removeClassAssignment = (index: number) => {
    const updatedAssignments = [...formData.classAssignments]
    updatedAssignments.splice(index, 1)
    handleChange('classAssignments', updatedAssignments)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    console.log(formData)
    e.preventDefault()
    const payload: any = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      role: formData.role,
      status: formData.status.toLowerCase(),
    }

    if (formData.role === 'TEACHER') {
      payload.teacherProfile = {
        specialization: formData.specialization,
      }
      payload.classAssignments = formData.classAssignments?.map(c => ({
        classId: c.classId,
        subjects: c.subjects,
        isClassTeacher: c.isClassTeacher,
      }))
    }

    await onSubmit(payload)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Basic Info */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="John"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Doe"
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="john@example.com"
          required
          disabled={isEditMode}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+1 (555) 000-0000"
        />
      </div>

      {/* Role and Status */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="role">Role *</Label>
          <Select
            value={formData.role}
            onValueChange={(value) => handleChange('role', value)}
          >
            <SelectTrigger id="role">
              <SelectValue placeholder="Select role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="TEACHER">Teacher</SelectItem>
              <SelectItem value="HEADTEACHER">Head Teacher</SelectItem>
              <SelectItem value="ADMIN">Admin</SelectItem>
              <SelectItem value="ACADEMIC_OFFICER">Academic Officer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleChange('status', value)}
          >
            <SelectTrigger id="status">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Teacher Fields */}
      {formData.role === 'TEACHER' && (
        <div className="space-y-4 border p-4 rounded">
          <div className="space-y-2">
            <Label htmlFor="specialization">Specialization</Label>
            <Input
              id="specialization"
              value={formData.specialization}
              onChange={(e) => handleChange('specialization', e.target.value)}
              placeholder="e.g., Mathematics, English"
            />
          </div>

          <div>
            <h4 className="font-medium mb-2">Class Assignments</h4>
            {(formData.classAssignments || []).map((assignment, index) => (
              <div key={index} className="mb-4 p-2 border rounded space-y-2">
                {/* Class Selector */}
                <Select
                  value={assignment.classId}
                  onValueChange={(value) =>
                    handleClassChange(index, value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableClasses.map(cls => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {`Basic ${cls.grade} (${cls.level})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Subjects */}
                {assignment.classId && assignment.availableSubjects?.length && (
                  <div className="grid grid-cols-2 gap-2">
                    {assignment.availableSubjects.map(subject => (
                      <label key={subject.id} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={assignment.subjects?.includes(subject.id)}
                          onChange={() => handleSubjectToggle(index, subject.id)}
                        />
                        {subject.subjectName}
                      </label>
                    ))}
                  </div>
                )}

                {/* Class Teacher */}
                {assignment.classId && (
                  <label className="flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      checked={assignment.isClassTeacher || false}
                      onChange={(e) => handleClassTeacherToggle(index, e.target.checked)}
                    />
                    Class Teacher
                  </label>
                )}

                <Button
                  type="button"
                  variant="destructive"
                  size="sm"
                  onClick={() => removeClassAssignment(index)}
                >
                  Remove Assignment
                </Button>
              </div>
            ))}

            <Button type="button" onClick={addClassAssignment}>
              + Add Class Assignment
            </Button>
          </div>
        </div>
      )}

      <div className="flex gap-2 justify-end pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : isEditMode ? 'Update Staff' : 'Add Staff'}
        </Button>
      </div>
    </form>
  )
}