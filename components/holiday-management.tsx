'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import { holidaySchema, Holiday } from '@/lib/validation/settings'

import { SectionCard } from './section-card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

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

import {
  Trash2,
  Edit2,
  CalendarDays,
  Plus,
  X,
} from 'lucide-react'

interface HolidayWithId extends Holiday {
  id: string
  isActive?: boolean
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

  useEffect(() => {
    loadHolidays()
  }, [])

  async function loadHolidays() {
    try {
      setLoadingHolidays(true)

      const response = await fetch('/api/settings/holidays')

      if (!response.ok) {
        throw new Error('Failed to load holidays')
      }

      const data = await response.json()

      setHolidays(data.data || [])
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setLoadingHolidays(false)
    }
  }

  async function onSubmit(data: Holiday) {
    setLoading(true)

    try {
      const method = editingId ? 'PUT' : 'POST'

      const url = editingId
        ? `/api/settings/holidays/${editingId}`
        : '/api/settings/holidays'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(
          editingId
            ? 'Failed to update holiday'
            : 'Failed to create holiday'
        )
      }

      toast({
        title: 'Success',
        description: editingId
          ? 'Holiday updated successfully'
          : 'Holiday added successfully',
      })

      form.reset({
        name: '',
        startDate: new Date(),
        endDate: new Date(),
      })

      setEditingId(null)

      loadHolidays()
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
      const response = await fetch(
        `/api/settings/holidays/${id}`,
        {
          method: 'DELETE',
        }
      )

      if (!response.ok) {
        throw new Error('Failed to delete holiday')
      }

      toast({
        title: 'Success',
        description: 'Holiday deleted successfully',
      })

      loadHolidays()
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

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    })
  }

  function cancelEdit() {
    form.reset({
      name: '',
      startDate: new Date(),
      endDate: new Date(),
    })

    setEditingId(null)
  }

  function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  function calculateDuration(start: Date | string, end: Date | string) {
    const startDate = new Date(start)
    const endDate = new Date(end)

    const diffTime = endDate.getTime() - startDate.getTime()

    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    return `${diffDays} day${diffDays > 1 ? 's' : ''}`
  }

  return (
    <SectionCard
      title="Holiday Management"
      description="Manage school holidays and vacation periods"
    >
      <div className="space-y-8">
        {/* FORM */}
        <div className="rounded-xl border bg-card p-5">
          <div className="mb-4 flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />

            <h3 className="text-sm font-semibold">
              {editingId ? 'Edit Holiday' : 'Add Holiday'}
            </h3>
          </div>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-5"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Holiday Name */}
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Holiday Name</FormLabel>

                      <FormControl>
                        <Input
                          placeholder="e.g. Christmas Break"
                          {...field}
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>

                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value instanceof Date
                              ? field.value
                                  .toISOString()
                                  .split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              new Date(e.target.value)
                            )
                          }
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* End Date */}
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>

                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value instanceof Date
                              ? field.value
                                  .toISOString()
                                  .split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              new Date(e.target.value)
                            )
                          }
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  type="submit"
                  disabled={loading}
                >
                  {loading ? (
                    'Saving...'
                  ) : editingId ? (
                    <>
                      <Edit2 className="mr-2 h-4 w-4" />
                      Update Holiday
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Holiday
                    </>
                  )}
                </Button>

                {editingId && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={cancelEdit}
                  >
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>

        {/* HOLIDAYS LIST */}
        <div className="rounded-xl border overflow-hidden">
          {loadingHolidays ? (
            <div className="py-16 text-center text-muted-foreground">
              Loading holidays...
            </div>
          ) : holidays.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarDays className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />

              <p className="text-sm text-muted-foreground">
                No holidays added yet
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-semibold">
                    Holiday
                  </TableHead>

                  <TableHead className="font-semibold">
                    Start Date
                  </TableHead>

                  <TableHead className="font-semibold">
                    End Date
                  </TableHead>

                  <TableHead className="font-semibold">
                    Duration
                  </TableHead>

                  <TableHead className="font-semibold">
                    Status
                  </TableHead>

                  <TableHead className="text-right font-semibold">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {holidays.map((holiday) => {
                  const today = new Date()

                  const isActive =
                    today >= new Date(holiday.startDate) &&
                    today <= new Date(holiday.endDate)

                  return (
                    <TableRow key={holiday.id}>
                      <TableCell className="font-medium">
                        {holiday.name}
                      </TableCell>

                      <TableCell>
                        {formatDate(holiday.startDate)}
                      </TableCell>

                      <TableCell>
                        {formatDate(holiday.endDate)}
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {calculateDuration(
                          holiday.startDate,
                          holiday.endDate
                        )}
                      </TableCell>

                      <TableCell>
                        {isActive ? (
                          <Badge>
                            Ongoing
                          </Badge>
                        ) : (
                          <Badge variant="secondary">
                            Scheduled
                          </Badge>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              startEdit(holiday)
                            }
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              deleteHoliday(holiday.id)
                            }
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </SectionCard>
  )
}