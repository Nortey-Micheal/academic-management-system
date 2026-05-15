import { Button } from '@/components/ui/button'
import { Plus, Upload, Filter } from 'lucide-react'

interface SubjectsHeaderProps {
  onAddSubject: () => void
}

export function SubjectsHeader({ onAddSubject }: SubjectsHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Subjects Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage all subjects across levels and classes</p>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" className="gap-2">
          <Upload className="w-4 h-4" />
          <span className="hidden sm:inline">Import CSV</span>
        </Button>
        <Button variant="outline" size="sm" className="gap-2 sm:hidden">
          <Filter className="w-4 h-4" />
        </Button>
        <Button onClick={onAddSubject} size="sm" className="gap-2">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Add Subject</span>
        </Button>
      </div>
    </div>
  )
}
