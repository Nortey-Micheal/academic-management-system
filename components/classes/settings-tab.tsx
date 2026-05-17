'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { AlertCircle, Trash2, Archive } from 'lucide-react'

interface ClassData {
  name: string
  academicYear: string
  capacity: number
  enrollment: number
  teacher: string
  level: string
  status: string
}

export function SettingsTab({ classData }: { classData: ClassData }) {
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: classData.name,
    teacher: classData.teacher,
    level: classData.level,
    capacity: classData.capacity.toString(),
  })

  const handleSaveChanges = () => {
    // Handle save logic here
    setIsEditing(false)
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Class Information</CardTitle>
              <CardDescription>Edit basic class details</CardDescription>
            </div>
            <Button
              variant={isEditing ? 'default' : 'outline'}
              onClick={() => setIsEditing(!isEditing)}
              size="sm"
            >
              {isEditing ? 'Cancel' : 'Edit'}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="class-name">Class Name</Label>
              <Input
                id="class-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="level">Level</Label>
              <Select value={formData.level} disabled={!isEditing}>
                <SelectTrigger id="level" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lower Primary">Lower Primary</SelectItem>
                  <SelectItem value="Upper Primary">Upper Primary</SelectItem>
                  <SelectItem value="JHS">JHS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="teacher">Class Teacher</Label>
              <Input
                id="teacher"
                value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="capacity">Class Capacity</Label>
              <Input
                id="capacity"
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                disabled={!isEditing}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <p className="text-xs text-muted-foreground">
              Academic Year: <span className="font-semibold">{classData.academicYear}</span>
            </p>
          </div>
          {isEditing && (
            <div className="flex gap-2 pt-4 border-t">
              <Button onClick={handleSaveChanges} size="sm">
                Save Changes
              </Button>
              <Button onClick={() => setIsEditing(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Class Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Current Status</p>
              <p className="text-sm text-muted-foreground">Manage class lifecycle</p>
            </div>
            <Badge variant="default">{classData.status.charAt(0).toUpperCase() + classData.status.slice(1)}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Promotion Settings */}
      <Card className="border-blue-200 bg-blue-50">
        <CardHeader>
          <CardTitle className="text-base text-blue-900">Promote Class</CardTitle>
          <CardDescription className="text-blue-700">
            Move students to the next level and archive this class
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
                Promote Class
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Promote Class?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action will promote all students to the next level and create a record for this term. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogAction>Promote</AlertDialogAction>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Archive Settings */}
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="text-base text-amber-900 flex items-center gap-2">
            <Archive className="h-4 w-4" />
            Archive Class
          </CardTitle>
          <CardDescription className="text-amber-700">
            Archive this class without deleting data. Archived classes won&apos;t appear in active lists.
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
                <AlertDialogTitle>Archive Class?</AlertDialogTitle>
                <AlertDialogDescription>
                  Archiving will hide this class from active lists but preserve all data. You can restore it later.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogAction>Archive</AlertDialogAction>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="text-base text-red-900 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Danger Zone
          </CardTitle>
          <CardDescription className="text-red-700">
            Irreversible and destructive actions
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
                <AlertDialogTitle>Delete Class?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will permanently delete this class and all associated data including student records, assessments, and attendance. This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Delete
              </AlertDialogAction>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>
    </div>
  )
}
