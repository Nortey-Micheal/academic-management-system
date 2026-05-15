'use client'

import { useState } from 'react'
import { SubjectsHeader } from '@/components/subjects/subjects-header'
import { SubjectsStats } from '@/components/subjects/subjects-stats'
import { SubjectsToolbar } from '@/components/subjects/subjects-toolbar'
import { SubjectsLayout } from '@/components/subjects/subjects-layout'
import { AddSubjectModal } from '@/components/subjects/add-subject-modal'
import { AssignClassModal } from '@/components/subjects/assign-class-modal'

interface SubjectFilters {
  level: string
  class: string
  search: string
  sortBy: string
  viewMode: 'grid' | 'table'
}

export default function SubjectsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAssignClassModalOpen, setIsAssignClassModalOpen] = useState(false)
  const [selectedSubject, setSelectedSubject] = useState<any>(null)
  const [filters, setFilters] = useState<SubjectFilters>({
    level: 'all',
    class: 'all',
    search: '',
    sortBy: 'name',
    viewMode: 'grid',
  })

  const handleAddSubject = () => {
    setSelectedSubject(null)
    setIsAddModalOpen(true)
  }

  const handleEditSubject = (subject: any) => {
    setSelectedSubject(subject)
    setIsAddModalOpen(true)
  }

  const handleAssignClass = (subject: any) => {
    setSelectedSubject(subject)
    setIsAssignClassModalOpen(true)
  }

  const handleFilterChange = (newFilters: Partial<SubjectFilters>) => {
    setFilters({ ...filters, ...newFilters })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col gap-6 p-6 max-w-7xl mx-auto">
        <SubjectsHeader onAddSubject={handleAddSubject} />
        <SubjectsStats />
        <SubjectsToolbar
          filters={filters}
          onFilterChange={handleFilterChange}
          onAddSubject={handleAddSubject}
        />
        <SubjectsLayout
          filters={filters}
          onEditSubject={handleEditSubject}
          onAssignClass={handleAssignClass}
        />
      </div>

      <AddSubjectModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        subject={selectedSubject}
        level={filters.level}
      />

      <AssignClassModal
        open={isAssignClassModalOpen}
        onOpenChange={setIsAssignClassModalOpen}
        subject={selectedSubject}
      />
    </div>
  )
}
