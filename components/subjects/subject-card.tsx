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
import { Edit2, Trash2, Users, MoreVertical } from 'lucide-react'

interface SubjectCardProps {
  subject: {
    id: string
    name: string
    code: string
    level: string
    creditHours: number
    teacher: { id: string; name: string; avatar: string } | null
    classCount: number
  }
  onEdit: () => void
  onAssignClass: () => void
}

const levelColors: Record<string, { bg: string; text: string; label: string }> = {
  primary: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Primary' },
  jhs: { bg: 'bg-purple-100', text: 'text-purple-700', label: 'JHS' },
  shs: { bg: 'bg-cyan-100', text: 'text-cyan-700', label: 'SHS' },
}

export function SubjectCard({ subject, onEdit, onAssignClass }: SubjectCardProps) {
  const levelInfo = levelColors[subject.level] || levelColors.primary

  return (
    <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-lg line-clamp-2">{subject.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{subject.code}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit} className="gap-2">
                <Edit2 className="w-4 h-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem className="gap-2 text-red-600">
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="flex-1 pb-3">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Badge className={`${levelInfo.bg} ${levelInfo.text} border-0`}>
              {levelInfo.label}
            </Badge>
            <span className="text-xs font-medium text-muted-foreground">
              {subject.creditHours} Credit{subject.creditHours > 1 ? 's' : ''}
            </span>
          </div>

          <div className="border-t pt-3">
            {subject.teacher ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                    {subject.teacher.avatar}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground">Teacher</p>
                  <p className="text-sm font-medium text-foreground truncate">
                    {subject.teacher.name}
                  </p>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-xs text-muted-foreground">Teacher</p>
                <p className="text-sm text-amber-600 font-medium">Unassigned</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Users className="w-4 h-4" />
            <span>{subject.classCount} class{subject.classCount !== 1 ? 'es' : ''}</span>
          </div>
        </div>
      </CardContent>

      <CardFooter className="gap-2 pt-3 border-t">
        <Button
          variant="outline"
          size="sm"
          onClick={onAssignClass}
          className="flex-1 text-xs"
        >
          Assign Class
        </Button>
        <Button variant="ghost" size="sm" onClick={onEdit} className="flex-1 text-xs">
          Edit
        </Button>
      </CardFooter>
    </Card>
  )
}
