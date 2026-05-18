'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

import { MoreVertical, Eye, FileText, Loader2 } from 'lucide-react'

import { toast } from 'sonner'
import { useSelector } from 'react-redux'
import { StoreState } from '@/lib/store'

interface Assessment {
  id: string
  subject: string
  type: string
  date: string
  highestScore: number
  lowestScore: number
  averageScore: number
}

interface Summary {
  overallAverage: number
  highestPerformer: {
    name: string
    score: number
  } | null
  lowestPerformer: {
    name: string
    score: number
  } | null
}

interface Distribution {
  grade: string
  count: number
  percentage: number
}

export function AssessmentsTab({ classId }: { classId: string }) {
  const [loading, setLoading] = useState(true)
  const [assessments, setAssessments] = useState<Assessment[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [distribution, setDistribution] = useState<Distribution[]>([])

  const userId = useSelector((state: StoreState) => state.user).id

  useEffect(() => {
    fetchAssessments()
  }, [classId])

  const fetchAssessments = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/classes/${classId}/assessments?userId=${userId}`)

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch assessments')
      }

      setAssessments(data.assessments || [])
      setSummary(data.summary || null)
      setDistribution(data.distribution || [])
    } catch (error: any) {
      toast.error(error.message || 'Failed to load assessments')
    } finally {
      setLoading(false)
    }
  }

  const sortedAssessments = useMemo(() => {
    return [...assessments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [assessments])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* RECORDS */}
      <Card className="rounded-2xl overflow-hidden">
        <CardHeader>
          <CardTitle className="text-base sm:text-lg">
            Subject Assessment Records
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="w-full overflow-x-auto">
            <Table className="min-w-212.5">
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Highest</TableHead>
                  <TableHead className="text-right">Lowest</TableHead>
                  <TableHead className="text-right">Average</TableHead>
                  <TableHead className="w-15" />
                </TableRow>
              </TableHeader>

              <TableBody>
                {sortedAssessments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No assessment records found
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedAssessments.map((assessment) => (
                    <TableRow key={assessment.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {assessment.subject}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline">
                          {assessment.type}
                        </Badge>
                      </TableCell>

                      <TableCell className="whitespace-nowrap">
                        {new Date(assessment.date).toLocaleDateString()}
                      </TableCell>

                      <TableCell className="text-right font-semibold text-green-600">
                        {assessment.highestScore}
                      </TableCell>

                      <TableCell className="text-right font-semibold text-amber-600">
                        {assessment.lowestScore}
                      </TableCell>

                      <TableCell className="text-right font-semibold">
                        {assessment.averageScore}%
                      </TableCell>

                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>

                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/assessments/${assessment.id}`} className="flex items-center gap-2">
                                <Eye className="h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>

                            <DropdownMenuItem asChild>
                              <Link href={`/assessments/${assessment.id}/grades`} className="flex items-center gap-2">
                                <FileText className="h-4 w-4" />
                                View Grades
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>

                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* SUMMARY */}
      <Card className="border-green-200 bg-green-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base text-green-900">
            Class Performance Summary
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <div className="rounded-xl border border-green-200 bg-white/60 p-4">
              <p className="text-sm text-green-700 mb-1">
                Overall Average
              </p>

              <p className="text-3xl font-bold text-green-900">
                {summary?.overallAverage || 0}%
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-white/60 p-4">
              <p className="text-sm text-green-700 mb-1">
                Highest Performer
              </p>

              <p className="text-base font-semibold text-green-900">
                {summary?.highestPerformer ? `${summary.highestPerformer.name} (${summary.highestPerformer.score})` : 'N/A'}
              </p>
            </div>

            <div className="rounded-xl border border-green-200 bg-white/60 p-4">
              <p className="text-sm text-green-700 mb-1">
                Lowest Performer
              </p>

              <p className="text-base font-semibold text-green-900">
                {summary?.lowestPerformer ? `${summary.lowestPerformer.name} (${summary.lowestPerformer.score})` : 'N/A'}
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* DISTRIBUTION */}
      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">
            Grade Distribution
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-5">
            {distribution.map((item) => (
              <div key={item.grade}>
                <div className="flex items-center justify-between mb-2 gap-3">
                  <span className="text-sm font-medium">
                    {item.grade}
                  </span>

                  <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap">
                    {item.count} students ({item.percentage}%)
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

    </div>
  )
}