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
import { toast } from 'sonner'

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
  })
  const isMobile = useIsMobile()

  useEffect(() => {
    if (subject) {
      setFormData({
        name: subject.name,
        code: subject.code,
        description: '',
        level: subject.level,
      })
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        level: level || 'primary',
      })
    }
  }, [subject, level, open])

  const LEVEL_ABBREVIATIONS: Record<string, string> = {
    PRE_SCHOOL: 'PS',
    LOWER_PRIMARY: 'LP',
    UPPER_PRIMARY: 'UP',
    JUNIOR_HIGH_SCHOOL: 'JHS',
  }

  const generateSubjectCode = (
    name: string,
    level: string
  ) => {
    // English Language → EL
    // Social Studies → SS

    const subjectAbbr = (() => {
      const words = name.trim().split(/\s+/).filter(Boolean)

      // single word → first 3 letters
      if (words.length === 1) {
        return words[0].slice(0, 3).toUpperCase()
      }

      // multi-word → initials (max 4 chars)
      return words
        .map((word) => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 4)
    })()

    const levelAbbr =
      LEVEL_ABBREVIATIONS[level] || 'GEN'

    // Random number
    const number =
      Math.floor(Math.random() * 900) + 100

    return `${subjectAbbr}-${levelAbbr}-${number}`
  }

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData((prev) => ({
      ...prev,
      name,
      code: generateSubjectCode(name,level!),
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const res = await fetch(`/api/subjects`,{
      body: JSON.stringify(formData),method: 'POST'
    })

    const data = await res.json()

    if (data.success) {
      onOpenChange(false)
      toast.success(data.message)
    } else {
      toast.error(data.error)
    }
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
            disabled
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

        <div>
          <Label htmlFor="level">Level *</Label>
          <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value,code: generateSubjectCode(formData.name,value!) })}>
            <SelectTrigger className="mt-2">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PRE_SCHOOL">Pre School</SelectItem>
              <SelectItem value="LOWER_PRIMARY">Lower Primary</SelectItem>
              <SelectItem value="UPPER_PRIMARY">Upper Primary</SelectItem>
              <SelectItem value="JUNIOR_HIGH_SCHOOL">Junior High School</SelectItem>
            </SelectContent>
          </Select>
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
