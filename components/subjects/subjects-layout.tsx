'use client'

import { SubjectCard } from './subject-card'
import { SubjectTable } from './subject-table'
import { Empty } from '@/components/ui/empty'
import { BookOpen } from 'lucide-react'

interface SubjectsLayoutProps {
  filters: {
    level: string
    class: string
    search: string
    sortBy: string
    viewMode: 'grid' | 'table'
  }
  onEditSubject: (subject: any) => void
  onAssignClass: (subject: any) => void
}

// Mock data - replace with actual API calls
const mockSubjects = [
  {
    id: '1',
    name: 'Mathematics',
    code: 'MATH101',
    level: 'primary',
    creditHours: 3,
    teacher: { id: '1', name: 'Mr. Mensah', avatar: 'MM' },
    classes: ['1A', '1B'],
    classCount: 2,
  },
  {
    id: '2',
    name: 'English Language',
    code: 'ENG101',
    level: 'primary',
    creditHours: 3,
    teacher: { id: '2', name: 'Mrs. Osei', avatar: 'MO' },
    classes: ['1A', '1B', '1C'],
    classCount: 3,
  },
  {
    id: '3',
    name: 'Integrated Science',
    code: 'SCI201',
    level: 'jhs',
    creditHours: 4,
    teacher: null,
    classes: [],
    classCount: 0,
  },
  {
    id: '4',
    name: 'Social Studies',
    code: 'SOC101',
    level: 'primary',
    creditHours: 2,
    teacher: { id: '3', name: 'Mr. Kofi', avatar: 'MK' },
    classes: ['1A'],
    classCount: 1,
  },
  {
    id: '5',
    name: 'Physical Education',
    code: 'PE101',
    level: 'primary',
    creditHours: 2,
    teacher: null,
    classes: [],
    classCount: 0,
  },
  {
    id: '6',
    name: 'Geography',
    code: 'GEO201',
    level: 'jhs',
    creditHours: 3,
    teacher: { id: '4', name: 'Ms. Ama', avatar: 'MA' },
    classes: ['2A', '2B'],
    classCount: 2,
  },
]

export function SubjectsLayout({
  filters,
  onEditSubject,
  onAssignClass,
}: SubjectsLayoutProps) {
  let filteredSubjects = mockSubjects

  // Apply filters
  if (filters.level !== 'all') {
    filteredSubjects = filteredSubjects.filter((s) => s.level === filters.level)
  }

  if (filters.search) {
    const searchLower = filters.search.toLowerCase()
    filteredSubjects = filteredSubjects.filter(
      (s) =>
        s.name.toLowerCase().includes(searchLower) ||
        s.code.toLowerCase().includes(searchLower)
    )
  }

  // Sort
  if (filters.sortBy === 'code') {
    filteredSubjects.sort((a, b) => a.code.localeCompare(b.code))
  } else if (filters.sortBy === 'level') {
    filteredSubjects.sort((a, b) => a.level.localeCompare(b.level))
  } else if (filters.sortBy === 'teacher') {
    filteredSubjects.sort((a, b) =>
      (a.teacher?.name || 'Z').localeCompare(b.teacher?.name || 'Z')
    )
  } else {
    filteredSubjects.sort((a, b) => a.name.localeCompare(b.name))
  }

  if (filteredSubjects.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Empty
          title="No subjects found"
          description={
            filters.search
              ? `No subjects match "${filters.search}"`
              : 'Create your first subject to get started'
          }
          icon={BookOpen}
        />
      </div>
    )
  }

  return (
    <>
      {filters.viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={() => onEditSubject(subject)}
              onAssignClass={() => onAssignClass(subject)}
            />
          ))}
        </div>
      ) : (
        <SubjectTable
          subjects={filteredSubjects}
          onEdit={onEditSubject}
          onAssignClass={onAssignClass}
        />
      )}
    </>
  )
}
