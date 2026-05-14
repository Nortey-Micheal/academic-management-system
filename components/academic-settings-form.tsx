'use client'

import { useEffect, useState } from 'react'
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
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'

import { Form } from '@/components/ui/form'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'
import { Pencil, Plus, CheckCircle2 } from 'lucide-react'

interface AcademicYear {
  id: string
  year: string
  isActive: boolean
}

interface Term {
  id: string
  termNumber: number
  academicYearId: string
  isActive: boolean
  termStartDate: string
  termEndDate: string
}

const TERM_OPTIONS = [
  {
    label: 'First Term',
    value: 1,
  },
  {
    label: 'Second Term',
    value: 2,
  },
  {
    label: 'Third Term',
    value: 3,
  },
]

const getTermLabel = (termNumber: number) => {
  return (
    TERM_OPTIONS.find((t) => t.value === termNumber)?.label ||
    `Term ${termNumber}`
  )
}

const getTermValueFromLabel = (label: string) => {
  return (
    TERM_OPTIONS.find((t) => t.label === label)?.value || 1
  )
}

export function AcademicSettingsForm() {
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [terms, setTerms] = useState<Term[]>([])

  const [editingYear, setEditingYear] = useState<string | null>(null)
  const [editingTerm, setEditingTerm] = useState<string | null>(null)

  const [newAcademicYear, setNewAcademicYear] = useState('')
  const [newTerm, setNewTerm] = useState('')

  const { toast } = useToast()

  const form = useForm<AcademicSettings>({
    resolver: zodResolver(academicSettingsSchema),
    mode: 'onBlur',
    defaultValues: {
      academicYear: '',
      term: '',
      termStartDate: new Date(),
      termEndDate: new Date(),
      academicStatus: 'Active',
    },
  })

  useEffect(() => {
    fetchAcademicSettings()
  }, [])

  async function fetchAcademicSettings() {
    try {
      setFetching(true)

      const response = await fetch('/api/settings/academic')

      if (!response.ok) {
        throw new Error('Failed to fetch academic settings')
      }

      const data = await response.json()

      setAcademicYears(data.academicYears || [])
      setTerms(data.terms || [])

      form.reset({
        academicYear: data.currentAcademicYear?.year || '',
        term: getTermLabel(data.currentTerm?.termNumber || 1) as
          | 'First Term'
          | 'Second Term'
          | 'Third Term',
        termStartDate: data.currentTerm?.termStartDate
          ? new Date(data.currentTerm.termStartDate)
          : new Date(),
        termEndDate: data.currentTerm?.termEndDate
          ? new Date(data.currentTerm.termEndDate)
          : new Date(),
        academicStatus: data.academicStatus || 'Active',
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

  async function onSubmit(data: AcademicSettings) {
    setLoading(true)

    try {
      const response = await fetch('/api/settings/academic', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error('Failed to save settings')
      }

      toast({
        title: 'Success',
        description: 'Academic settings updated successfully',
      })

      fetchAcademicSettings()
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

  async function setCurrentAcademicYear(id: string) {
    try {
      const response = await fetch(`/api/settings/academic-years/${id}/current`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Failed to update academic year')
      }

      fetchAcademicSettings()

      toast({
        title: 'Updated',
        description: 'Current academic year updated',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  async function setCurrentTerm(id: string) {
    try {
      const response = await fetch(`/api/settings/terms/${id}/current`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error('Failed to update current term')
      }

      fetchAcademicSettings()

      toast({
        title: 'Updated',
        description: 'Current term updated',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  async function addAcademicYear() {
    if (!newAcademicYear.trim()) return

    try {
      const response = await fetch('/api/settings/academic-years', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year: newAcademicYear,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add academic year')
      }

      setNewAcademicYear('')

      await fetchAcademicSettings()

      toast({
        title: 'Success',
        description: 'Academic year added',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  async function addTerm() {
    if (!newTerm.trim()) return

    try {
      const response = await fetch('/api/settings/terms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          termNumber: getTermValueFromLabel(newTerm),
          academicYearId: academicYears.find((y) => y.isActive)?.id,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to add term')
      }

      setNewTerm('')

      await fetchAcademicSettings()

      toast({
        title: 'Success',
        description: 'Term added successfully',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  async function updateAcademicYear(id: string, year: string) {
    try {
      const response = await fetch(`/api/settings/academic-years/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          year,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update academic year')
      }

      setEditingYear(null)

      await fetchAcademicSettings()

      toast({
        title: 'Updated',
        description: 'Academic year updated',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  async function updateTerm(id: string, label: string) {
    try {
      const response = await fetch(`/api/settings/terms/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          termNumber: getTermValueFromLabel(label),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update term')
      }

      setEditingTerm(null)

      await fetchAcademicSettings()

      toast({
        title: 'Updated',
        description: 'Term updated',
      })
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      })
    }
  }

  if (fetching) {
    return (
      <SectionCard
        title="Academic Settings"
        description="Manage academic years and terms"
      >
        <div className="py-10 text-center text-muted-foreground">
          Loading academic settings...
        </div>
      </SectionCard>
    )
  }

  return (
    <SectionCard
      title="Academic Settings"
      description="Manage academic years, terms, and school academic status"
    >
      <div className="space-y-8">
        {/* Academic Years */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Academic Years</h3>

            <div className="flex items-center gap-2">
              <Input
                placeholder="2026/2027"
                value={newAcademicYear}
                onChange={(e) => setNewAcademicYear(e.target.value)}
                className="w-[150px]"
              />

              <Button
                size="sm"
                type="button"
                onClick={addAcademicYear}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {academicYears.map((year) => (
              <div
                key={year.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {editingYear === year.id ? (
                    <Input
                      defaultValue={year.year}
                      className="w-[160px]"
                      onBlur={(e) =>
                        updateAcademicYear(year.id, e.target.value)
                      }
                    />
                  ) : (
                    <span className="font-medium">{year.year}</span>
                  )}

                  {year.isActive && (
                    <Badge>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Current
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => setEditingYear(year.id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  {!year.isActive && (
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => setCurrentAcademicYear(year.id)}
                    >
                      Set Current
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Terms */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Terms</h3>

            <div className="flex items-center gap-2">
              <Select
                value={newTerm}
                onValueChange={setNewTerm}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Select term" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="First Term">
                    First Term
                  </SelectItem>

                  <SelectItem value="Second Term">
                    Second Term
                  </SelectItem>

                  <SelectItem value="Third Term">
                    Third Term
                  </SelectItem>
                </SelectContent>
              </Select>

              <Button
                size="sm"
                type="button"
                onClick={addTerm}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {terms.map((term) => (
              <div
                key={term.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  {editingTerm === term.id ? (
                    <Input
                      defaultValue={getTermLabel(term.termNumber)}
                      className="w-[160px]"
                      onBlur={(e) =>
                        updateTerm(term.id, e.target.value)
                      }
                    />
                  ) : (
                    <span className="font-medium">{getTermLabel(term.termNumber)}</span>
                  )}

                  {term.isActive && (
                    <Badge>
                      <CheckCircle2 className="w-3 h-3 mr-1" />
                      Current
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    type="button"
                    onClick={() => setEditingTerm(term.id)}
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>

                  {!term.isActive && (
                    <Button
                      size="sm"
                      type="button"
                      onClick={() => setCurrentTerm(term.id)}
                    >
                      Set Current
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Academic Settings Form */}
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Current Academic Year */}
              <FormField
                control={form.control}
                name="academicYear"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Academic Year</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select academic year" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {academicYears.map((year) => (
                          <SelectItem
                            key={year.id}
                            value={year.year}
                          >
                            {year.year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Current Term */}
              <FormField
                control={form.control}
                name="term"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Term</FormLabel>

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select term" />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        {terms.map((term) => (
                          <SelectItem
                            key={term.id}
                            value={getTermLabel(term.termNumber)}
                          >
                            {getTermLabel(term.termNumber)}
                          </SelectItem>
                        ))}
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
                    <FormLabel>Term Start Date</FormLabel>

                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
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
                    <FormLabel>Term End Date</FormLabel>

                    <FormControl>
                      <Input
                        type="date"
                        value={
                          field.value instanceof Date
                            ? field.value.toISOString().split('T')[0]
                            : ''
                        }
                        onChange={(e) =>
                          field.onChange(new Date(e.target.value))
                        }
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

                    <Select
                      onValueChange={field.onChange}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>

                      <SelectContent>
                        <SelectItem value="Active">
                          Active
                        </SelectItem>

                        <SelectItem value="Vacation">
                          Vacation
                        </SelectItem>

                        <SelectItem value="Closed">
                          Closed
                        </SelectItem>
                      </SelectContent>
                    </Select>

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
              {loading ? 'Saving...' : 'Save Academic Settings'}
            </Button>
          </form>
        </Form>
      </div>
    </SectionCard>
  )
}