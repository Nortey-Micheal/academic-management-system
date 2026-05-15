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
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit2, Trash2, MoreVertical } from 'lucide-react'

interface SubjectTableProps {
  subjects: any[]
  onEdit: (subject: any) => void
  onAssignClass: (subject: any) => void
}

const levelColors: Record<string, { bg: string; text: string; label: string }> = {
  primary: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Primary' },
  jhs: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'JHS' },
  shs: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'SHS' },
}

export function SubjectTable({ subjects, onEdit, onAssignClass }: SubjectTableProps) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead>Subject Name</TableHead>
            <TableHead>Code</TableHead>
            <TableHead>Level</TableHead>
            <TableHead>Credits</TableHead>
            <TableHead>Teacher</TableHead>
            <TableHead>Classes</TableHead>
            <TableHead className="w-[100px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subject) => {
            const levelInfo = levelColors[subject.level] || levelColors.primary
            return (
              <TableRow key={subject.id} className="hover:bg-muted/30">
                <TableCell className="font-medium">{subject.name}</TableCell>
                <TableCell className="text-muted-foreground">{subject.code}</TableCell>
                <TableCell>
                  <Badge className={`${levelInfo.bg} ${levelInfo.text} border-0`}>
                    {levelInfo.label}
                  </Badge>
                </TableCell>
                <TableCell>{subject.creditHours}</TableCell>
                <TableCell>
                  {subject.teacher ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                          {subject.teacher.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{subject.teacher.name}</span>
                    </div>
                  ) : (
                    <span className="text-amber-600 text-sm font-medium">Unassigned</span>
                  )}
                </TableCell>
                <TableCell>{subject.classCount}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(subject)} className="gap-2">
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => onAssignClass(subject)}
                        className="gap-2"
                      >
                        <Edit2 className="w-4 h-4" />
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
