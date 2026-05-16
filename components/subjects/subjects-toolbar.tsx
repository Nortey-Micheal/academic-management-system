'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { LayoutGrid, List, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface Filters {
  level: string
  class: string
  search: string
  sortBy: string
  viewMode: 'grid' | 'table'
}

interface SubjectsToolbarProps {
  filters: Filters
  onFilterChange: (filters: Partial<Filters>) => void
  onAddSubject: () => void
  onReset?: () => void
}

export function SubjectsToolbar({
  filters,
  onFilterChange,
  onAddSubject,
  onReset,
}: SubjectsToolbarProps) {
  const hasActiveFilters =
    filters.search ||
    filters.level !== 'all' ||
    filters.class !== 'all'
  
  const [classes, setClasses] = useState<any[]>([])

  useEffect(() => {
    const fetchClasses = async () => {
      const res = await fetch('/api/classes?level=' + filters.level)
      const data = await res.json()
      setClasses(data.classes)
      console.log(data.classes)
    }

    if (filters.level !== 'all') fetchClasses()
  }, [filters.level])

  return (
    <div className="space-y-4">

      {/* TOP ROW */}
      <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">

        {/* SEARCH */}
        <div className="flex-1">
          <Input
            placeholder="Search subjects by name or code..."
            value={filters.search}
            onChange={(e) =>
              onFilterChange({ search: e.target.value })
            }
          />
        </div>

        {/* ACTIONS */}
        <div className="flex gap-2">
          {hasActiveFilters && onReset && (
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}

          <Button onClick={onAddSubject}>
            Add Subject
          </Button>
        </div>
      </div>

      {/* FILTER ROW */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

        {/* LEVEL */}
        <Select
          value={filters.level}
          onValueChange={(value) =>
            onFilterChange({ level: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="PRE_SCHOOL">Pre School</SelectItem>
            <SelectItem value="LOWER_PRIMARY">
              Lower Primary
            </SelectItem>
            <SelectItem value="UPPER_PRIMARY">
              Upper Primary
            </SelectItem>
            <SelectItem value="JUNIOR_HIGH_SCHOOL">
              Junior High
            </SelectItem>
          </SelectContent>
        </Select>

        {/* CLASS (placeholder but safe) */}
        <Select
          value={filters.class}
          onValueChange={(value) =>
            onFilterChange({ class: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>

            {classes?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                Basic {c.grade}-{c.section}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* SORT */}
        <Select
          value={filters.sortBy}
          onValueChange={(value) =>
            onFilterChange({ sortBy: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="code">Code</SelectItem>
            <SelectItem value="level">Level</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
          </SelectContent>
        </Select>

        {/* VIEW MODE */}
        <div className="flex items-center justify-center border rounded-md p-1 bg-muted/30">

          <Button
            variant={
              filters.viewMode === 'grid'
                ? 'secondary'
                : 'ghost'
            }
            size="sm"
            onClick={() =>
              onFilterChange({ viewMode: 'grid' })
            }
            className="flex-1"
          >
            <LayoutGrid className="w-4 h-4 mr-1" />
            Grid
          </Button>

          <Button
            variant={
              filters.viewMode === 'table'
                ? 'secondary'
                : 'ghost'
            }
            size="sm"
            onClick={() =>
              onFilterChange({ viewMode: 'table' })
            }
            className="flex-1"
          >
            <List className="w-4 h-4 mr-1" />
            Table
          </Button>
        </div>
      </div>
    </div>
  )
}