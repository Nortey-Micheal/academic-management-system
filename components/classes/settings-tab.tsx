'use client'

import { useEffect, useMemo, useState } from 'react'
import { AlertCircle, Archive, ArrowUpCircle, Loader2, Save, Trash2, Users } from 'lucide-react'
import { toast } from 'sonner'
import { useSelector } from 'react-redux'

import { StoreState } from '@/lib/store'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import PromoteStudentsDialog from '../student-promotion-dialog'
import { ClassWithStudents } from '@/lib/types'

interface ClassData {
  id: string
  name: string
  academicYear: string
  academicYearId: string
  currentTerm: number
  capacity: number
  enrollment: number
  teacher: string
  level: string
  status: string
}

export function SettingsTab({ classData }: { classData: ClassData }) {
  const userId = useSelector((state: StoreState) => state.user.id)
  const [loading, setLoading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [open, setOpen] = useState<boolean>(false)
  const [classes, setClasses] = useState<ClassWithStudents[]>()
  const user = useSelector((state:StoreState) => state.user)

  const [formData, setFormData] = useState({
    name: classData.name,
    level: classData.level,
    capacity: classData.capacity.toString(),
  })

  useEffect(() => {
    const fetchClasses = async () => {
      const response = await fetch(`/api/classWithStudents/admin/${user.id}`)
      const data = await response.json()
      setClasses(data)
      console.log(data)
    }
    fetchClasses()
  },[])

  const capacityPercentage = useMemo(() => {
    if (!classData.capacity) return 0

    return Math.round((classData.enrollment / classData.capacity) * 100)
  }, [classData])

  const handleSave = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/classes/${classData.id}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          className: formData.name,
          level: formData.level,
          capacity: Number(formData.capacity),
        }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to update class')

      toast.success('Class updated successfully')

      setIsEditing(false)
    } catch (error: any) {
      toast.error(error.message || 'Failed to update class')
    } finally {
      setLoading(false)
    }
  }

  const handleArchive = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/classes/${classData.id}/archive`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to archive class')

      toast.success('Class archived successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to archive class')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/classes/${classData.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to delete class')

      toast.success('Class deleted successfully')
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete class')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">

      <Card className="rounded-2xl">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base">Class Information</CardTitle>
              <CardDescription>Manage class settings and information</CardDescription>
            </div>

            <Button variant={isEditing ? 'default' : 'outline'} size="sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Enrollment</p>
              </div>

              <p className="text-2xl font-bold mt-2">
                {classData.enrollment}/{classData.capacity}
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                {capacityPercentage}% capacity used
              </p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-medium">Academic Year</p>

              <p className="text-2xl font-bold mt-2">
                {classData.academicYear}
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Active academic year
              </p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-medium">Current Term</p>

              <p className="text-2xl font-bold mt-2">
                Term {classData.currentTerm}
              </p>

              <p className="text-xs text-muted-foreground mt-1">
                Active school term
              </p>
            </div>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            <div>
              <Label htmlFor="name">Class Name</Label>

              <Input
                id="name"
                className="mt-1"
                disabled={!isEditing}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="level">Level</Label>

              <Select
                disabled={!isEditing}
                value={formData.level}
                onValueChange={(value) => setFormData({ ...formData, level: value })}
              >
                <SelectTrigger id="level" className="mt-1">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Lower Primary">Lower Primary</SelectItem>
                  <SelectItem value="Upper Primary">Upper Primary</SelectItem>
                  <SelectItem value="JHS">JHS</SelectItem>
                  <SelectItem value="SHS">SHS</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="teacher">Class Teacher</Label>

              <Input id="teacher" className="mt-1" disabled value={classData.teacher} />
            </div>

            <div>
              <Label htmlFor="capacity">Capacity</Label>

              <Input
                id="capacity"
                type="number"
                className="mt-1"
                disabled={!isEditing}
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              />
            </div>

          </div>

          <div className="flex items-center justify-between gap-4 border-t pt-4">

            <Badge variant={classData.status === 'active' ? 'default' : 'secondary'}>
              {classData.status.charAt(0).toUpperCase() + classData.status.slice(1)}
            </Badge>

            {isEditing && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>

                <Button size="sm" disabled={loading} onClick={handleSave}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Save Changes
                </Button>
              </div>
            )}

          </div>

        </CardContent>
      </Card>

      <Card className="border-blue-200 bg-blue-50 rounded-2xl">

        <CardHeader>

          <CardTitle className="text-base text-blue-900 flex items-center gap-2">
            <ArrowUpCircle className="h-4 w-4" />
            Student Promotion
          </CardTitle>

          <CardDescription className="text-blue-700">
            Promote selected students to the next class for the new academic year.
          </CardDescription>

        </CardHeader>

        <CardContent>

          <PromoteStudentsDialog
            open={open}
            onOpenChange={setOpen}
            currentClassId={classData.id}
            academicYearId={classData.academicYearId}
            // onSuccess={fetchClasses}
            classes={classes!}
          />

        </CardContent>

      </Card>

      <Card className="border-amber-200 bg-amber-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base text-amber-900 flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archive Class
          </CardTitle>

          <CardDescription className="text-amber-700">
            Archived classes remain accessible but hidden from active lists.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AlertDialog>

            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                Archive Class
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>

              <AlertDialogHeader>
                <AlertDialogTitle>Archive this class?</AlertDialogTitle>

                <AlertDialogDescription>
                  Student records, attendance, and assessments will remain available.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction onClick={handleArchive}>
                  Archive
                </AlertDialogAction>
              </AlertDialogFooter>

            </AlertDialogContent>

          </AlertDialog>
        </CardContent>
      </Card>

      <Card className="border-red-200 bg-red-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base text-red-900 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Danger Zone
          </CardTitle>

          <CardDescription className="text-red-700">
            Permanently delete this class and associated records.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <AlertDialog>

            <AlertDialogTrigger asChild>
              <Button variant="destructive" className="gap-2">
                <Trash2 className="h-4 w-4" />
                Delete Class
              </Button>
            </AlertDialogTrigger>

            <AlertDialogContent>

              <AlertDialogHeader>
                <AlertDialogTitle>Delete class permanently?</AlertDialogTitle>

                <AlertDialogDescription>
                  This action cannot be undone and may remove all related data.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>

            </AlertDialogContent>

          </AlertDialog>
          
        </CardContent>
        
      </Card>
    </div>
  )
}