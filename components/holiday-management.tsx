'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { holidaySchema, Holiday } from '@/lib/validation/settings'
import { SectionCard } from './section-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Edit2 } from 'lucide-react'

interface HolidayWithId extends Holiday {
  id: string
}

export function HolidayManagement() {
  const [holidays, setHolidays] = useState<HolidayWithId[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingHolidays, setLoadingHolidays] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const { toast } = useToast()

  const form = useForm<Holiday>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      name: '',
      startDate: new Date(),
      endDate: new Date(),
    },
  })

  // Load holidays
  useEffect(() => {
    loadHolidays()
  }, [])

  async function loadHolidays() {
    try {
      setLoadingHolidays(true)
      const response = await fetch('/api/settings/holidays')
      if (response.ok) {
        const data = await response.json()
        setHolidays(data.data || [])
      }
    } catch (error) {
      console.error('Failed to load holidays:', error)
    } finally {
      setLoadingHolidays(false)
    }
  }

  async function onSubmit(data: Holiday) {
    setLoading(true)
    try {
      const method = editingId ? 'PUT' : 'POST'
      const url = editingId ? `/api/settings/holidays/${editingId}` : '/api/settings/holidays'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!response.ok) throw new Error('Failed to save holiday')

      toast({
        title: 'Success',
        description: editingId ? 'Holiday updated successfully' : 'Holiday added successfully',
      })

      form.reset()
      setEditingId(null)
      await loadHolidays()
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

  async function deleteHoliday(id: string) {
    try {
      const response = await fetch(`/api/settings/holidays/${id}`, { method: 'DELETE' })
      if (!response.ok) throw new Error('Failed to delete holiday')

      toast({ title: 'Success', description: 'Holiday deleted successfully' })
      await loadHolidays()
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  function startEdit(holiday: HolidayWithId) {
    form.reset({
      name: holiday.name,
      startDate: new Date(holiday.startDate),
      endDate: new Date(holiday.endDate),
    })
    setEditingId(holiday.id)
  }

  function cancelEdit() {
    form.reset()
    setEditingId(null)
  }

  return (
    <SectionCard
      title="Holiday Management"
      description="Add and manage school holidays"
    >
      <div className="space-y-6">
        {/* Add Holiday Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Holiday Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Christmas Break" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
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

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
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
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Holiday' : 'Add Holiday'}
              </Button>
              {editingId && (
                <Button type="button" variant="outline" onClick={cancelEdit}>
                  Cancel Edit
                </Button>
              )}
            </div>
          </form>
        </Form>

        {/* Holidays Table */}
        <div className="border border-border/50 rounded-lg overflow-hidden">
          {loadingHolidays ? (
            <div className="p-8 text-center text-muted-foreground">Loading holidays...</div>
          ) : holidays.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              No holidays added yet. Add one to get started.
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="font-semibold">Holiday Name</TableHead>
                  <TableHead className="font-semibold">Date Range</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {holidays.map((holiday) => (
                  <TableRow key={holiday.id}>
                    <TableCell className="font-medium">{holiday.name}</TableCell>
                    <TableCell className="text-sm">
                      {new Date(holiday.startDate).toLocaleDateString()} -{' '}
                      {new Date(holiday.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEdit(holiday)}
                        className="inline-flex gap-1"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteHoliday(holiday.id)}
                        className="inline-flex gap-1 text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </SectionCard>
  )
}
