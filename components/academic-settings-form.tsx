'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { academicSettingsSchema, AcademicSettings } from '@/lib/validation/settings'
import { SectionCard } from './section-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Form } from '@/components/ui/form'
import { useToast } from '@/hooks/use-toast'

export function AcademicSettingsForm() {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  
  const form = useForm<AcademicSettings>({
    resolver: zodResolver(academicSettingsSchema),
    defaultValues: {
      academicYear: '2025/2026',
      term: 'First Term',
      termStartDate: new Date(2025, 0, 13),
      termEndDate: new Date(2025, 3, 11),
      academicStatus: 'Active',
    },
  })

  async function onSubmit(data: AcademicSettings) {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/academic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save academic settings')

      toast({
        title: 'Success',
        description: 'Academic settings saved successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <SectionCard
      title="Academic Settings"
      description="Configure academic year, terms, and school status"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Academic Year */}
            <FormField
              control={form.control}
              name="academicYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Academic Year</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2025/2026" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Term Selection */}
            <FormField
              control={form.control}
              name="term"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Term</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="First Term">First Term</SelectItem>
                      <SelectItem value="Second Term">Second Term</SelectItem>
                      <SelectItem value="Third Term">Third Term</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Term Start Date */}
            <FormField
              control={form.control}
              name="termStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term Start Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Term End Date */}
            <FormField
              control={form.control}
              name="termEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Term End Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      {...field}
                      value={field.value instanceof Date ? field.value.toISOString().split('T')[0] : field.value}
                      onChange={(e) => field.onChange(new Date(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Academic Status */}
            <FormField
              control={form.control}
              name="academicStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Status</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Vacation">Vacation</SelectItem>
                      <SelectItem value="Closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Saving...' : 'Save Academic Settings'}
          </Button>
        </form>
      </Form>
    </SectionCard>
  )
}
