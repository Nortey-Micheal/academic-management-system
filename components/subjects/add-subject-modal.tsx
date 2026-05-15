'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useIsMobile } from '@/hooks/use-mobile'

interface AddSubjectModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject?: any
  level?: string
}

export function AddSubjectModal({
  open,
  onOpenChange,
  subject,
  level,
}: AddSubjectModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    level: level || 'primary',
    creditHours: '3',
  })
  const isMobile = useIsMobile()

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        code: subject.code,
        description: '',
        level: subject.level,
        creditHours: subject.creditHours.toString(),
      })
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        level: level || 'primary',
        creditHours: '3',
      })
    }
  }, [subject, level, open])

  const generateSubjectCode = (name: string) => {
    const code = name
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase())
      .join('')
      .slice(0, 4)
      .padEnd(4, '0')
    const number = Math.floor(Math.random() * 900) + 100
    return `${code}${number}`
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      code: formData.code || generateSubjectCode(name),
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log('Form submitted:', formData)
    onOpenChange(false)
  }

  const content = (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Subject Name *</Label>
          <Input
            id="name"
            placeholder="e.g., Mathematics"
            value={formData.name}
            onChange={handleNameChange}
            className="mt-2"
            required
          />
        </div>

        <div>
          <Label htmlFor="code">Subject Code *</Label>
          <Input
            id="code"
            placeholder="e.g., MATH101"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="mt-2"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">Auto-generated based on name</p>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Brief description of the subject..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-2 resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="level">Level *</Label>
            <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="primary">Primary</SelectItem>
                <SelectItem value="jhs">Junior High School</SelectItem>
                <SelectItem value="shs">Senior High School</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="creditHours">Credit Hours *</Label>
            <Select
              value={formData.creditHours}
              onValueChange={(value) => setFormData({ ...formData, creditHours: value })}
            >
              <SelectTrigger className="mt-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1</SelectItem>
                <SelectItem value="2">2</SelectItem>
                <SelectItem value="3">3</SelectItem>
                <SelectItem value="4">4</SelectItem>
                <SelectItem value="5">5</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => onOpenChange(false)}
        >
          Cancel
        </Button>
        <Button type="submit">
          {subject ? 'Update Subject' : 'Add Subject'}
        </Button>
      </div>
    </form>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{subject ? 'Edit Subject' : 'Add New Subject'}</DrawerTitle>
            <DrawerDescription>Fill in the subject details below</DrawerDescription>
          </DrawerHeader>
          <div className="px-4 pb-6">{content}</div>
        </DrawerContent>
      </Drawer>
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{subject ? 'Edit Subject' : 'Add New Subject'}</DialogTitle>
          <DialogDescription>Fill in the subject details to create a new subject</DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
