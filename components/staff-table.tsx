'use client'

import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { MoreHorizontal, Edit2, Trash2, Users } from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface StaffMember {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role: string
  status: string
  createdAt: string
  teacherProfile?: {
    teacherId: string
    specialization: string
    joinDate: string
  }
}

interface StaffTableProps {
  staff: StaffMember[]
  onEdit: (staff: StaffMember) => void
  onDelete: (staffId: string) => void
  onManageAssignments: (staff: StaffMember) => void
  canEdit: boolean
}

export function StaffTable({
  staff,
  onEdit,
  onDelete,
  onManageAssignments,
  canEdit,
}: StaffTableProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800'
      case 'HEADTEACHER':
        return 'bg-blue-100 text-blue-800'
      case 'TEACHER':
        return 'bg-green-100 text-green-800'
      case 'ACADEMIC_OFFICER':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'inactive':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted">
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Phone</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Teacher ID</TableHead>
            <TableHead>Specialization</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {staff.map((member) => (
            <TableRow key={member.id}>
              
              {/* Name */}
              <TableCell className="font-medium">
                {member.firstName} {member.lastName}
              </TableCell>

              {/* Email */}
              <TableCell className="text-sm text-muted-foreground">
                {member.email}
              </TableCell>

              {/* Phone */}
              <TableCell className="text-sm">
                {member.phone || '-'}
              </TableCell>

              {/* Role */}
              <TableCell>
                <Badge className={getRoleBadgeColor(member.role)}>
                  {member.role.replace('_', ' ')}
                </Badge>
              </TableCell>

              {/* Status */}
              <TableCell>
                <Badge className={getStatusBadgeColor(member.status)}>
                  {member.status}
                </Badge>
              </TableCell>

              {/* Teacher ID */}
              <TableCell className="text-sm">
                {member.teacherProfile?.teacherId || '-'}
              </TableCell>

              {/* Specialization */}
              <TableCell className="text-sm">
                {member.teacherProfile?.specialization || '-'}
              </TableCell>

              {/* Join Date */}
              <TableCell className="text-sm">
                {member.teacherProfile?.joinDate
                  ? formatDate(member.teacherProfile.joinDate)
                  : '-'}
              </TableCell>

              {/* Actions */}
              <TableCell className="text-right">
                {canEdit ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end">

                      <DropdownMenuItem onClick={() => onEdit(member)}>
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Staff
                      </DropdownMenuItem>

                      {member.role === 'TEACHER' && (
                        <DropdownMenuItem
                          onClick={() => onManageAssignments(member)}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Manage Classes & Subjects
                        </DropdownMenuItem>
                      )}

                      <DropdownMenuItem
                        onClick={() => onDelete(member.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>

                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    No actions
                  </span>
                )}
              </TableCell>

            </TableRow>
          ))}
        </TableBody>
      </Table>

      {staff.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          No staff members found
        </div>
      )}
    </div>
  )
}