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
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useIsMobile } from '@/hooks/use-mobile'

interface AssignClassModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  subject?: any
}

// Mock classes data - organized by level
const mockClasses = {
  primary: [
    { id: '1a', name: 'Primary 1A' },
    { id: '1b', name: 'Primary 1B' },
    { id: '2a', name: 'Primary 2A' },
    { id: '2b', name: 'Primary 2B' },
    { id: '3a', name: 'Primary 3A' },
    { id: '3b', name: 'Primary 3B' },
  ],
  jhs: [
    { id: 'j1a', name: 'JHS 1A' },
    { id: 'j1b', name: 'JHS 1B' },
    { id: 'j2a', name: 'JHS 2A' },
    { id: 'j2b', name: 'JHS 2B' },
    { id: 'j3a', name: 'JHS 3A' },
    { id: 'j3b', name: 'JHS 3B' },
  ],
  shs: [
    { id: 's1a', name: 'SHS 1A' },
    { id: 's1b', name: 'SHS 1B' },
    { id: 's2a', name: 'SHS 2A' },
    { id: 's2b', name: 'SHS 2B' },
    { id: 's3a', name: 'SHS 3A' },
    { id: 's3b', name: 'SHS 3B' },
  ],
}

export function AssignClassModal({ open, onOpenChange, subject }: AssignClassModalProps) {
  const [selectedClasses, setSelectedClasses] = useState<string[]>([])
  const isMobile = useIsMobile()

  useEffect(() => {
    if (subject && subject.classes) {
      setSelectedClasses(subject.classes)
    } else {
      setSelectedClasses([])
    }
  }, [subject, open])

  const getClassesForLevel = () => {
    if (!subject) return []
    const levelKey = subject.level as keyof typeof mockClasses
    return mockClasses[levelKey] || []
  }

  const handleClassToggle = (classId: string) => {
    setSelectedClasses((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    )
  }

  const handleSubmit = () => {
    // Handle class assignment here
    console.log('Classes assigned:', selectedClasses)
    onOpenChange(false)
  }

  const classes = getClassesForLevel()

  const content = (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold mb-4">
          Assign Classes to <span className="text-primary">{subject?.name}</span>
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Select the classes that will have this subject
        </p>

        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {classes.map((classItem) => (
            <div key={classItem.id} className="flex items-center space-x-2">
              <Checkbox
                id={classItem.id}
                checked={selectedClasses.includes(classItem.id)}
                onCheckedChange={() => handleClassToggle(classItem.id)}
              />
              <Label htmlFor={classItem.id} className="font-normal cursor-pointer">
                {classItem.name}
              </Label>
            </div>
          ))}
        </div>

        {classes.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            No classes available for this level
          </p>
        )}
      </div>

      <div className="flex gap-2 justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button onClick={handleSubmit}>
          Assign {selectedClasses.length > 0 && `(${selectedClasses.length})`}
        </Button>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>Assign Classes</DrawerTitle>
            <DrawerDescription>
              Select classes for {subject?.name}
            </DrawerDescription>
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
          <DialogTitle>Assign Classes</DialogTitle>
          <DialogDescription>
            Select which classes will have this subject
          </DialogDescription>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  )
}
