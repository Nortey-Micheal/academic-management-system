'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit2, Trash2, MoreVertical, Users } from 'lucide-react'

interface SubjectTableProps {
  subjects: any[]
  onEdit: (subject: any) => void
  onAssignClass: (subject: any) => void
}

/* ---------------- Level UI ---------------- */
const levelConfig: Record<string, { label: string; className: string }> = {
  PRE_SCHOOL: {
    label: 'Pre School',
    className: 'bg-red-100 text-red-700',
  },
  LOWER_PRIMARY: {
    label: 'Lower Primary',
    className: 'bg-blue-100 text-blue-700',
  },
  UPPER_PRIMARY: {
    label: 'Upper Primary',
    className: 'bg-green-100 text-green-700',
  },
  JUNIOR_HIGH_SCHOOL: {
    label: 'JHS',
    className: 'bg-yellow-100 text-yellow-700',
  },
}

/* ---------------- Component ---------------- */

export function SubjectTable({
  subjects,
  onEdit,
  onAssignClass,
}: SubjectTableProps) {
  if (!subjects || subjects.length === 0) {
    return (
      <div className="text-center py-10 text-muted-foreground border rounded-lg">
        No subjects found
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/40">
            <TableHead>Subject</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Classes</TableHead>
            <TableHead className="w-[80px]">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {subjects.map((subject) => {
            const level = levelConfig[subject.level] ?? {
              label: subject.level,
              className: 'bg-gray-100 text-gray-700',
            }

            const classCount = subject.classLinks?.length ?? 0

            return (
              <TableRow key={subject.id} className="hover:bg-muted/30">

                {/* SUBJECT */}
                <TableCell className="font-medium">
                  {subject.subjectName}
                </TableCell>

                {/* CODE */}
                <TableCell className="text-muted-foreground">
                  {subject.subjectCode}
                </TableCell>

                {/* LEVEL */}
                <TableCell>
                  <Badge className={`${level.className} border-0`}>
                    {level.label}
                  </Badge>
                </TableCell>

                {/* CREDITS */}
                <TableCell>{subject.creditHours}</TableCell>

                {/* TEACHER */}
                <TableCell>
                  {subject.teacher ? (
                    <span className="text-sm">
                      {subject.teacher.user.lastName}{' '}
                      {subject.teacher.user.firstName}
                    </span>
                  ) : (
                    <span className="text-amber-600 text-sm font-medium">
                      Unassigned
                    </span>
                  )}
                </TableCell>

                {/* CLASSES */}
                <TableCell className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    <span>
                      {classCount} class{classCount !== 1 ? 'es' : ''}
                    </span>
                  </div>
                </TableCell>

                {/* ACTIONS */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => onEdit(subject)}
                        className="gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={() => onAssignClass(subject)}
                        className="gap-2"
                      >
                        <Users className="w-4 h-4" />
                        Assign Class
                      </DropdownMenuItem>

                      <DropdownMenuItem className="gap-2 text-red-600">
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>

              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}