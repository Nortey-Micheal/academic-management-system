'use client'

import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  academicSettingsSchema,
  AcademicSettings,
} from '@/lib/validation/settings'

import { SectionCard } from './section-card'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Badge } from '@/components/ui/badge'

import { useToast } from '@/hooks/use-toast'

import {
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  Loader2,
  Plus,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { AcademicYearInput } from './academic-year-input'

interface Term {
  id: string
  termNumber: number
  isActive: boolean
  termStartDate: string
  termEndDate: string
}

interface AcademicYear {
  id: string
  year: string
  isActive: boolean
  terms: Term[]
}

const TERM_LABELS: Record<number, string> = {
  1: 'First Term',
  2: 'Second Term',
  3: 'Third Term',
}

const getTermLabel = (termNumber: number) =>
  TERM_LABELS[termNumber] || `Term ${termNumber}`

export function AcademicSettingsForm() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [academicYears, setAcademicYears] = useState<
    AcademicYear[]
  >([])

  const [newAcademicYear, setNewAcademicYear] =
    useState('')

  const { toast } = useToast()

  const form = useForm<AcademicSettings>({
    resolver: zodResolver(academicSettingsSchema),

    defaultValues: {
      academicYear: '',
      term: 'First Term',
      termStartDate: new Date(),
      termEndDate: new Date(),
      academicStatus: 'Active',
    },
  })

  const selectedAcademicYear = useMemo(() => {
    return academicYears.find(
      (year) =>
        year.year === form.watch('academicYear')
    )
  }, [academicYears, form])

  const selectedTerms =
    selectedAcademicYear?.terms || []

  useEffect(() => {
    fetchAcademicSettings()
  }, [])

  async function fetchAcademicSettings() {
    try {
      setFetching(true)

      const response = await fetch(
        '/api/settings/academic'
      )

      if (!response.ok) {
        throw new Error(
          'Failed to fetch academic settings'
        )
      }

      const data = await response.json()

      setAcademicYears(data.academicYears || [])

      form.reset({
        academicYear:
          data.currentAcademicYear?.name || '',

        term:
          data.currentTerm?.name || 'First Term',

        termStartDate: data.currentTerm?.startDate
          ? new Date(data.currentTerm.startDate)
          : new Date(),

        termEndDate: data.currentTerm?.endDate
          ? new Date(data.currentTerm.endDate)
          : new Date(),

        academicStatus:
          data.academicStatus || 'Active',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    } finally {
      setFetching(false)
    }
  }

  async function addAcademicYear() {
    if (!newAcademicYear.trim()) return

    const exists = academicYears.some(
      (year) =>
        year.year.toLowerCase() ===
        newAcademicYear.toLowerCase()
    )

    if (exists) {
      toast({
        title: 'Duplicate Academic Year',
        description:
          'Academic year already exists',
        variant: 'destructive',
      })

      return
    }

    try {
      const response = await fetch(
        '/api/settings/academic-years',
        {
          method: 'POST',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify({
            year: newAcademicYear,
          }),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to create academic year'
        )
      }

      setNewAcademicYear('')

      await fetchAcademicSettings()

      toast({
        title: 'Success',
        description:
          'Academic year created successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  async function onSubmit(
    data: AcademicSettings
  ) {
    try {
      setLoading(true)

      const response = await fetch(
        '/api/settings/academic',
        {
          method: 'PUT',

          headers: {
            'Content-Type': 'application/json',
          },

          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        throw new Error(
          'Failed to save academic settings'
        )
      }

      toast({
        title: 'Success',
        description:
          'Academic settings updated',
      })

      await fetchAcademicSettings()
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

  if (fetching) {
    return (
      <SectionCard
        title="Academic Calendar"
        description="Manage academic years and terms"
      >
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Academic Calendar"
      description="Manage academic years, active terms, and school session settings"
    >
      <div className="space-y-8">
        {/* Hero */}
        <div className="rounded-3xl border bg-muted/40 p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-primary/10 p-3">
                <GraduationCap className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Active Academic Year
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {
                    academicYears.find(
                      (y) => y.isActive
                    )?.year
                  }
                </h2>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-primary/10 p-3">
                <CalendarDays className="h-6 w-6" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Current Term
                </p>

                <h2 className="mt-1 text-2xl font-bold">
                  {getTermLabel(
                    academicYears
                      .find((y) => y.isActive)
                      ?.terms.find(
                        (t) => t.isActive
                      )?.termNumber || 1
                  )}
                </h2>
              </div>
            </div>
          </div>
        </div>

        {/* Create Academic Year */}
        <div className="rounded-3xl border p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Academic Years
              </h3>

              <p className="text-sm text-muted-foreground">
                Creating a year automatically
                creates all 3 terms.
              </p>
            </div>

            <div className="flex w-full gap-2 md:w-auto">
              <AcademicYearInput value={newAcademicYear} onChange={setNewAcademicYear}/>

              <Button
                type="button"
                onClick={addAcademicYear}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Year
              </Button>
            </div>
          </div>
        </div>

        {/* Academic Year Cards */}
        <div className="grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
          {academicYears.map((year) => (
            <div
              key={year.id}
              className={`rounded-3xl border p-5 transition-all ${
                year.isActive
                  ? 'border-primary bg-primary/5'
                  : 'hover:border-primary/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-bold">
                    {year.year}
                  </h3>

                  <p className="text-sm text-muted-foreground">
                    Academic Year
                  </p>
                </div>

                {year.isActive && (
                  <Badge className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Active
                  </Badge>
                )}
              </div>

              <div className="mt-5 space-y-3">
                {year.terms.map((term) => (
                  <div
                    key={term.id}
                    className={`rounded-2xl border p-3 ${
                      term.isActive
                        ? 'border-primary bg-primary/10'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">
                          {getTermLabel(
                            term.termNumber
                          )}
                        </p>

                        <p className="text-xs text-muted-foreground">
                          {formatDate(new Date(
                            term.termStartDate
                          ))}{' '}
                          -{' '}
                          {formatDate(new Date(
                            term.termEndDate
                          ))}
                        </p>
                      </div>

                      {term.isActive && (
                        <Badge variant="secondary">
                          Current
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Settings Form */}
        <div className="rounded-3xl border p-6">
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(
                onSubmit
              )}
              className="space-y-6"
            >
              <div className="grid gap-6 md:grid-cols-2">
                {/* Academic Year */}
                <FormField
                  control={form.control}
                  name="academicYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Academic Year
                      </FormLabel>

                      <Select
                        onValueChange={(
                          value
                        ) => {
                          field.onChange(value)

                          const selectedYear =
                            academicYears.find(
                              (year) =>
                                year.year ===
                                value
                            )

                          const activeTerm =
                            selectedYear?.terms.find(
                              (term) =>
                                term.isActive
                            )

                          if (activeTerm) {
                            form.setValue(
                              'term',
                              getTermLabel(
                                activeTerm.termNumber
                              ) as
                                | 'First Term'
                                | 'Second Term'
                                | 'Third Term'
                            )

                            form.setValue(
                              'termStartDate',
                              new Date(
                                activeTerm.termStartDate
                              )
                            )

                            form.setValue(
                              'termEndDate',
                              new Date(
                                activeTerm.termEndDate
                              )
                            )
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {academicYears.map(
                            (year) => (
                              <SelectItem
                                key={year.id}
                                value={year.year}
                              >
                                {year.year}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Term */}
                <FormField
                  control={form.control}
                  name="term"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Current Term
                      </FormLabel>

                      <Select
                        onValueChange={(
                          value
                        ) => {
                          field.onChange(value)

                          const term =
                            selectedTerms.find(
                              (t) =>
                                getTermLabel(
                                  t.termNumber
                                ) === value
                            )

                          if (term) {
                            form.setValue(
                              'termStartDate',
                              new Date(
                                term.termStartDate
                              )
                            )

                            form.setValue(
                              'termEndDate',
                              new Date(
                                term.termEndDate
                              )
                            )
                          }
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select term" />
                          </SelectTrigger>
                        </FormControl>

                        <SelectContent>
                          {selectedTerms.map(
                            (term) => (
                              <SelectItem
                                key={term.id}
                                value={getTermLabel(
                                  term.termNumber
                                )}
                              >
                                {getTermLabel(
                                  term.termNumber
                                )}
                              </SelectItem>
                            )
                          )}
                        </SelectContent>
                      </Select>

                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Start Date */}
                <FormField
                  control={form.control}
                  name="termStartDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Term Start Date
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? new Date(
                                  field.value
                                )
                                  .toISOString()
                                  .split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              new Date(
                                e.target.value
                              )
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
                  name="termEndDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Term End Date
                      </FormLabel>

                      <FormControl>
                        <Input
                          type="date"
                          value={
                            field.value
                              ? new Date(
                                  field.value
                                )
                                  .toISOString()
                                  .split('T')[0]
                              : ''
                          }
                          onChange={(e) =>
                            field.onChange(
                              new Date(
                                e.target.value
                              )
                            )
                          }
                        />
                      </FormControl>

                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
              >
                {loading
                  ? 'Saving Changes...'
                  : 'Save Academic Settings'}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </SectionCard>
  )
}