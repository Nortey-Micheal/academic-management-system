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
import { LayoutGrid, List } from 'lucide-react'

interface SubjectsToolbarProps {
  filters: {
    level: string
    class: string
    search: string
    sortBy: string
    viewMode: 'grid' | 'table'
  }
  onFilterChange: (filters: any) => void
  onAddSubject: () => void
}

export function SubjectsToolbar({ filters, onFilterChange, onAddSubject }: SubjectsToolbarProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex-1">
        <Input
          placeholder="Search subjects..."
          value={filters.search}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          className="w-full"
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <Select value={filters.level} onValueChange={(value) => onFilterChange({ level: value })}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="primary">Primary</SelectItem>
            <SelectItem value="jhs">Junior High School</SelectItem>
            <SelectItem value="shs">Senior High School</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.class} onValueChange={(value) => onFilterChange({ class: value })}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Classes" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Classes</SelectItem>
            {filters.level !== 'all' && (
              <>
                <SelectItem value="1">Class 1</SelectItem>
                <SelectItem value="2">Class 2</SelectItem>
                <SelectItem value="3">Class 3</SelectItem>
              </>
            )}
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={(value) => onFilterChange({ sortBy: value })}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Sort By" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Name (A-Z)</SelectItem>
            <SelectItem value="code">Code (A-Z)</SelectItem>
            <SelectItem value="level">Level</SelectItem>
            <SelectItem value="teacher">Teacher</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button
            variant={filters.viewMode === 'grid' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange({ viewMode: 'grid' })}
            className="h-8 w-8 p-0"
          >
            <LayoutGrid className="w-4 h-4" />
          </Button>
          <Button
            variant={filters.viewMode === 'table' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => onFilterChange({ viewMode: 'table' })}
            className="h-8 w-8 p-0"
          >
            <List className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
