'use client'

import { useEffect, useState, useMemo, useCallback } from 'react'
import { SubjectCard } from './subject-card'
import { SubjectTable } from './subject-table'
import { Empty } from '@/components/ui/empty'
import { BookOpen, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'

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

interface Subject {
  id: string
  subjectName: string
  subjectCode: string
  level: 'PRE_SCHOOL' | 'LOWER_PRIMARY' | 'UPPER_PRIMARY' | 'JUNIOR_HIGH_SCHOOL'
  creditHours: number
  teacher?: {
    id: string
    user: {
      firstName: string
      lastName: string
    }
  } | null
  classLinks?: any[]
}

export function SubjectsLayout({
  filters,
  onEditSubject,
  onAssignClass,
}: SubjectsLayoutProps) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  // -------------------------
  // Fetch subjects (stable)
  // -------------------------
  const fetchSubjects = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const res = await fetch('/api/subjects', {
        cache: 'no-store',
      })

      if (!res.ok) {
        throw new Error('Failed to fetch subjects')
      }

      const data = await res.json()
      setSubjects(data.data || [])
    } catch (err: any) {
      setError(err?.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  // -------------------------
  // Manual refresh (UX boost)
  // -------------------------
  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchSubjects()
    setRefreshing(false)
  }

  // -------------------------
  // Filter + sort (pure + safe)
  // -------------------------
  const filteredSubjects = useMemo(() => {
    let result = [...subjects]

    // LEVEL filter
    if (filters.level !== 'all') {
      result = result.filter((s) => s.level === filters.level)
    }

    // CLASS filter (IMPORTANT FIX)
    if (filters.class !== 'all') {
      result = result.filter((s) =>
        s.classLinks?.some((c: any) => c.classId === filters.class)
      )
    }

    // SEARCH
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()

      result = result.filter(
        (s) =>
          s.subjectName.toLowerCase().includes(searchLower) ||
          s.subjectCode.toLowerCase().includes(searchLower)
      )
    }

    // SORT
    switch (filters.sortBy) {
      case 'code':
        result.sort((a, b) => a.subjectCode.localeCompare(b.subjectCode))
        break

      case 'level':
        result.sort((a, b) => a.level.localeCompare(b.level))
        break

      case 'teacher':
        result.sort((a, b) =>
          (a.teacher?.user?.firstName || 'Z').localeCompare(
            b.teacher?.user?.firstName || 'Z'
          )
        )
        break

      default:
        result.sort((a, b) => a.subjectName.localeCompare(b.subjectName))
    }

    return result
  }, [subjects, filters])

  // -------------------------
  // Loading state
  // -------------------------
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px] text-muted-foreground">
        Loading subjects...
      </div>
    )
  }

  // -------------------------
  // Error state (with recovery)
  // -------------------------
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-3 text-red-500">
        <p>{error}</p>

        <Button onClick={fetchSubjects} variant="outline">
          Retry
        </Button>
      </div>
    )
  }

  // -------------------------
  // Empty state
  // -------------------------
  if (filteredSubjects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Empty
          title="No subjects found"
          // icon={BookOpen}
        />

        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCcw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>
    )
  }

  // -------------------------
  // UI
  // -------------------------
  return (
    <div className="space-y-4">

      {/* subtle refresh control */}
      <div className="flex justify-end">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCcw
            className={`w-4 h-4 mr-2 ${
              refreshing ? 'animate-spin' : ''
            }`}
          />
          Refresh
        </Button>
      </div>

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
    </div>
  )
}