'use client'

import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { StaffForm } from './staff-form'

interface ClassOption {
  id: string
  grade: number
  level: string
}

interface StaffMember {
  id?: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  role?: string
  status?: string
  teacherProfile?: {
    teacherId: string
    specialization: string
    joinDate: string
  }
  classAssignments?: {
    classId: string
    subjects: string[]
    isClassTeacher: boolean
    level: string;
    availableSubjects?: {
      id: string,
      subjectName: string
    }[]
  }[]
}

interface AddStaffDialogProps {
  open: boolean
  isLoading: boolean
  availableClasses: ClassOption[]
  fetchSubjects: (classId: string) => Promise<{ id: string; subjectName: string }[]>
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
}

interface EditStaffDialogProps {
  open: boolean
  isLoading: boolean
  staffData?: StaffMember
  availableClasses: ClassOption[]
  fetchSubjects: (classId: string) => Promise<{ id: string; subjectName: string }[]>
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => Promise<void>
}

interface DeleteStaffDialogProps {
  open: boolean
  isLoading: boolean
  staffName?: string
  onOpenChange: (open: boolean) => void
  onConfirm: () => Promise<void>
}

export function AddStaffDialog({
  open,
  isLoading,
  availableClasses,
  fetchSubjects,
  onOpenChange,
  onSubmit,
}: AddStaffDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-2xl h-[90vh] overflow-scroll scrollbar-hide ">
        <DialogHeader>
          <DialogTitle>Add New Staff Member</DialogTitle>
          <DialogDescription>
            Create a new staff member in the system. Teachers can be assigned classes and subjects.
          </DialogDescription>
        </DialogHeader>
        <StaffForm
          isLoading={isLoading}
          availableClasses={availableClasses}
          fetchSubjects={fetchSubjects}
          onSubmit={async (data) => {
            try {
              await onSubmit(data)
              onOpenChange(false)
            } catch (err) {
              console.error(err)
            }
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

export function EditStaffDialog({
  open,
  isLoading,
  staffData,
  availableClasses,
  fetchSubjects,
  onOpenChange,
  onSubmit,
}: EditStaffDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="lg:max-w-2xl h-[90vh] overflow-scroll scrollbar-hide ">
        <DialogHeader>
          <DialogTitle>Edit Staff Member</DialogTitle>
          <DialogDescription>
            Update staff information, status, and manage teacher assignments.
          </DialogDescription>
        </DialogHeader>
        <StaffForm
          initialData={staffData}
          isLoading={isLoading}
          isEditMode
          availableClasses={availableClasses}
          fetchSubjects={fetchSubjects}
          onSubmit={async (data) => {
            try {
              await onSubmit(data)
              onOpenChange(false)
            } catch (err) {
              console.error(err)
            }
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}

export function DeleteStaffDialog({
  open,
  isLoading,
  staffName,
  onOpenChange,
  onConfirm,
}: DeleteStaffDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Staff Member</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {staffName}? This action cannot be undone.
            All related assignments and records will be removed.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="flex gap-2 justify-end">
          <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}