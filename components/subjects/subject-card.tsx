'use client'

import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit2, Trash2, Users, MoreVertical, BookOpen } from 'lucide-react'

interface SubjectCardProps {
  subject: {
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
  onEdit: () => void
  onAssignClass: () => void
  onDelete?: () => void
}

/* ---------------- Level UI ---------------- */
const levelConfig: Record<string, { label: string; className: string }> = {
  PRE_SCHOOL: {
    label: 'Pre School',
    className: 'bg-pink-100 text-pink-700',
  },
  LOWER_PRIMARY: {
    label: 'Lower Primary',
    className: 'bg-blue-100 text-blue-700',
  },
  UPPER_PRIMARY: {
    label: 'Upper Primary',
    className: 'bg-indigo-100 text-indigo-700',
  },
  JUNIOR_HIGH_SCHOOL: {
    label: 'JHS',
    className: 'bg-purple-100 text-purple-700',
  },
}

/* ---------------- Component ---------------- */

export function SubjectCard({
  subject,
  onEdit,
  onAssignClass,
  onDelete,
}: SubjectCardProps) {
  const level = levelConfig[subject.level]

  const classCount = subject.classLinks?.length ?? 0

  return (
    <Card className="group hover:shadow-lg transition-all duration-200 border-muted/50">
      
      {/* HEADER */}
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          
          <div className="space-y-1">
            <h3 className="font-semibold text-base line-clamp-1">
              {subject.subjectName}
            </h3>

            <p className="text-xs text-muted-foreground">
              {subject.subjectCode}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit} className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </DropdownMenuItem>

              <DropdownMenuItem
                onClick={onDelete}
                className="gap-2 text-red-600"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* CONTENT */}
      <CardContent className="space-y-3">

        {/* LEVEL + CREDIT */}
        <div className="flex items-center justify-between">
          <Badge className={`${level.className} border-0`}>
            {level.label}
          </Badge>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <BookOpen className="w-3 h-3" />
            <span>{subject.creditHours}h</span>
          </div>
        </div>

        {/* TEACHER */}
        <div className="border rounded-md p-2 bg-muted/30">
          <p className="text-[11px] text-muted-foreground">Teacher</p>

          {subject.teacher ? (
            <p className="text-sm font-medium truncate">
              {subject.teacher.user.lastName}{' '}
              {subject.teacher.user.firstName}
            </p>
          ) : (
            <p className="text-sm text-amber-600">Unassigned</p>
          )}
        </div>

        {/* CLASSES */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            <span>
              {classCount} class{classCount !== 1 ? 'es' : ''}
            </span>
          </div>

          {classCount > 0 && (
            <span className="text-green-600 font-medium">
              Assigned
            </span>
          )}
        </div>
      </CardContent>

      {/* FOOTER */}
      <CardFooter className="gap-2 pt-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onAssignClass}
          className="flex-1"
        >
          Assign Class
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={onEdit}
          className="flex-1"
        >
          Edit
        </Button>
      </CardFooter>
    </Card>
  )
}