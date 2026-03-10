'use client'

import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { StoreState } from '@/lib/store'
import { toast } from 'sonner'
import { Plus, Search } from 'lucide-react'
import { StaffTable } from '@/components/staff-table'
import { AddStaffDialog, EditStaffDialog, DeleteStaffDialog } from '@/components/staff-dialogs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClassTeacherAssignment } from '@/components/class-teacher-assignment'
import { SubjectAssignment } from '@/components/subject-assignment'
import { canEditStaff } from '@/lib/auth-context'

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
    id: string
    teacherId: string
    specialization: string
    joinDate: string
    teacherClassSubjects?: { classId: string; subjects: string[]; isClassTeacher: boolean }[]
  }
}

interface ClassOption {
  id: string
  grade: number
  level: string
}

export default function StaffDetails() {
  const currentUser = useSelector((state: StoreState) => state.user)
  const [staff, setStaff] = useState<StaffMember[]>([])
  const [filteredStaff, setFilteredStaff] = useState<StaffMember[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assignmentDialogOpen, setAssignmentDialogOpen] = useState(false)

  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null)
  const [availableClasses, setAvailableClasses] = useState<ClassOption[]>([])

  const canEdit = currentUser && canEditStaff(currentUser.role)

  // Fetch staff
  const fetchStaff = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('/api/staff', { headers: { 'x-user-role': currentUser?.role || 'STUDENT' } })
      if (res.ok) {
        const data = await res.json()
        setStaff(data)
      } else {
        toast.error('Failed to fetch staff')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to fetch staff')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch available classes
  const fetchClasses = async () => {
    try {
      const res = await fetch('/api/classes')
      if (res.ok) {
        const data = await res.json()
        setAvailableClasses(data.classes)
      }
    } catch (err) {
      console.error('Failed to fetch classes', err)
    }
  }

  useEffect(() => {
    console.log({availableClasses})
  },[availableClasses])

  useEffect(() => {
    fetchStaff()
    fetchClasses()
  }, [])

  // Filter staff
  useEffect(() => {
    setFilteredStaff(
      staff.filter(member =>
        member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.teacherProfile?.teacherId?.includes(searchTerm)
      )
    )
  }, [searchTerm, staff])

  // Teacher subjects fetcher
  const fetchSubjects = async (level: string) => {
    try {
      const res = await fetch(`/api/subjects/${level}`)
      if (res.ok) {
        return await res.json()
      }
      return []
    } catch (err) {
      console.error('Failed to fetch subjects', err)
      return []
    }
  }

  const handleAddStaff = async (formData: any) => {
    try {
      setIsSubmitting(true)
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-role': currentUser?.role || 'STUDENT' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const newStaff = await res.json()
        setStaff([...staff, newStaff])
        toast.success('Staff member added successfully')
        setAddDialogOpen(false)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to add staff')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to add staff')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditStaff = async (formData: any) => {
    if (!selectedStaff) return
    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'x-user-role': currentUser?.role || 'STUDENT' },
        body: JSON.stringify(formData)
      })
      if (res.ok) {
        const updatedStaff = await res.json()
        setStaff(staff.map(s => s.id === selectedStaff.id ? updatedStaff : s))
        toast.success('Staff updated successfully')
        setEditDialogOpen(false)
        setSelectedStaff(null)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to update staff')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to update staff')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteStaff = async () => {
    if (!selectedStaff) return
    try {
      setIsSubmitting(true)
      const res = await fetch(`/api/staff/${selectedStaff.id}`, {
        method: 'DELETE',
        headers: { 'x-user-role': currentUser?.role || 'STUDENT' }
      })
      if (res.ok) {
        setStaff(staff.filter(s => s.id !== selectedStaff.id))
        toast.success('Staff deleted successfully')
        setDeleteDialogOpen(false)
        setSelectedStaff(null)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Failed to delete staff')
      }
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete staff')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!currentUser) return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="max-w-md"><CardContent className="pt-6 text-center">
        <p className="text-gray-600">Please log in to access this page</p>
      </CardContent></Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-aut">
        <div className="flex flex-wrap lg:flex-nowrap justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Staff Management</h1>
            <p className="text-gray-600 mt-1">Manage school staff, roles, and assignments</p>
          </div>
          {canEdit && <Button onClick={() => setAddDialogOpen(true)} className="gap-2 mt-5 lg:mt-0">
            <Plus className="h-4 w-4" /> Add Staff Member
          </Button>}
        </div>

        <Card className="mb-8 gap-2 py-2 lg:py-6">
          <CardHeader className='pb-1 lg:pb-6 px-2 lg:px-6'><CardTitle>Search & Filter</CardTitle></CardHeader>
          <CardContent className='p-2 lg:p-6'>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input placeholder="Search by name, email, or teacher ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8"/>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className='py-2 gap-2 lg:py-6 lg:gap-6'>
          <CardHeader className='px-2 pb-2 lg:px-6 lg:pb-6'><CardTitle>Staff Members ({filteredStaff.length})</CardTitle></CardHeader>
          <CardContent className='px-2 '>
            <StaffTable
              staff={filteredStaff}
              canEdit={canEdit}
              onEdit={(staffMember) => { setSelectedStaff(staffMember); setEditDialogOpen(true) }}
              onDelete={(staffId) => {
                const member = staff.find(s => s.id === staffId)
                if (member) { setSelectedStaff(member); setDeleteDialogOpen(true) }
              }}
              onManageAssignments={(staffMember) => {
                setSelectedStaff(staffMember)
                setAssignmentDialogOpen(true)
              }}
            />
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AddStaffDialog
        open={addDialogOpen}
        isLoading={isSubmitting}
        onOpenChange={setAddDialogOpen}
        onSubmit={handleAddStaff}
        availableClasses={availableClasses}
        fetchSubjects={fetchSubjects}
      />

      <EditStaffDialog
        open={editDialogOpen}
        isLoading={isSubmitting}
        staffData={selectedStaff || undefined}
        onOpenChange={setEditDialogOpen}
        onSubmit={handleEditStaff}
        availableClasses={availableClasses}
        fetchSubjects={fetchSubjects}
      />

      <DeleteStaffDialog
        open={deleteDialogOpen}
        isLoading={isSubmitting}
        staffName={selectedStaff ? `${selectedStaff.firstName} ${selectedStaff.lastName}` : ''}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteStaff}
      />

      <Dialog open={assignmentDialogOpen} onOpenChange={setAssignmentDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Assignments: {selectedStaff?.firstName} {selectedStaff?.lastName}</DialogTitle>
            <DialogDescription>Assign this teacher to classes and subjects</DialogDescription>
          </DialogHeader>

          {selectedStaff && <Tabs defaultValue="class-teacher" className="w-full">
            <TabsList>
              <TabsTrigger value="class-teacher">Class Teacher</TabsTrigger>
              <TabsTrigger value="subjects">Subject Assignments</TabsTrigger>
            </TabsList>

            <TabsContent value="class-teacher" className="space-y-4">
              <ClassTeacherAssignment teacherId={selectedStaff.teacherProfile?.id!} teacherName={`${selectedStaff.firstName} ${selectedStaff.lastName}`} userRole={currentUser.role}/>
            </TabsContent>

            <TabsContent value="subjects" className="space-y-4">
              <SubjectAssignment teacherId={selectedStaff.id} teacherName={`${selectedStaff.firstName} ${selectedStaff.lastName}`} userRole={currentUser.role} />
            </TabsContent>
          </Tabs>}
        </DialogContent>
      </Dialog>
    </div>
  )
}