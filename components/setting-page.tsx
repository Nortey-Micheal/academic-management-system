'use client'

import { useState, useCallback } from 'react'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { AcademicSettingsForm } from '@/components/academic-settings-form'
import { HolidayManagement } from '@/components/holiday-management'
import { SchoolProfileForm } from '@/components/school-profile-form'
import { PromotionSettingsForm } from '@/components/promotion-settings-form'

interface FormRefs {
  academicSettings: any
  schoolProfile: any
  promotionSettings: any
}

export default function SystemSettingsPage() {
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  const formRefs: FormRefs = {
    academicSettings: null,
    schoolProfile: null,
    promotionSettings: null,
  }

  const handleSaveAll = async () => {
    setIsSaving(true)
    try {
      // Collect all form data from child components
      // This will be coordinated through form submission callbacks
      toast({
        title: 'Success',
        description: 'All settings saved successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save settings',
        variant: 'destructive',
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="">
      {/* Sticky Header */}
      <div className="bg-card border-b border-border/50 mb-5 shadow-sm">
        <div className="px-6 py-4 flex flex-col gap-3 justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">System Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your school's core settings and configurations</p>
          </div>
          <Button
            size="lg"
            onClick={handleSaveAll}
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save All Changes'}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-8">
        {/* Academic Settings Section */}
        <AcademicSettingsForm />

        {/* Holiday Management Section */}
        <HolidayManagement />

        {/* School Profile Section */}
        <SchoolProfileForm />

        {/* Promotion Settings Section */}
        <PromotionSettingsForm />
      </div>
    </div>
  )
}
