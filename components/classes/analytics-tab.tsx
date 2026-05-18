'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { StoreState } from '@/lib/store'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

interface EnrollmentData {
  month: string
  enrollment: number
}

interface GenderData {
  name: string
  value: number
}

interface PerformanceData {
  subject: string
  average: number
}

interface AttendanceData {
  week: string
  percentage: number
}

interface Summary {
  currentEnrollment: number
  capacity: number
  averagePerformance: number
  bestSubject: string
  bestSubjectAverage: number
}

const COLORS = ['#3b82f6', '#ef4444']

export function AnalyticsTab({ classId }: { classId: string }) {
  const [loading, setLoading] = useState(true)

  const [enrollmentData, setEnrollmentData] = useState<EnrollmentData[]>([])
  const [genderData, setGenderData] = useState<GenderData[]>([])
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([])
  const [attendanceData, setAttendanceData] = useState<AttendanceData[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)

  const userId = useSelector((state: StoreState) => state.user).id

  useEffect(() => {
    fetchAnalytics()
  }, [classId])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      const response = await fetch(`/api/classes/${classId}/analytics?userId=${userId}`)

      const data = await response.json()

      if (!response.ok) throw new Error(data.error || 'Failed to fetch analytics')

      setEnrollmentData(data.enrollmentData || [])
      setGenderData(data.genderData || [])
      setPerformanceData(data.performanceData || [])
      setAttendanceData(data.attendanceData || [])
      setSummary(data.analyticsSummary || null)
    } catch (error: any) {
      toast.error(error.message || 'Failed to load analytics')
    } finally {
      setLoading(false)
    }
  }

  const capacityPercentage = useMemo(() => {
    if (!summary || !summary.capacity) return 0

    return Math.round((summary.currentEnrollment / summary.capacity) * 100)
  }, [summary])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">
            Enrollment Trends
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={enrollmentData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="month" />

                <YAxis />

                <Tooltip />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="enrollment"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  name="Enrolled Students"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">
              Gender Distribution
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-65 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={genderData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={85}
                    dataKey="value"
                  >
                    {genderData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>

                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base">
              Average Performance by Subject
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="h-65 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={performanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis type="number" />

                  <YAxis type="category" dataKey="subject" width={90} fontSize={12} />

                  <Tooltip />

                  <Bar dataKey="average" fill="#10b981" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

      </div>

      <Card className="rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base">
            Attendance Trends
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-75 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <CartesianGrid strokeDasharray="3 3" />

                <XAxis dataKey="week" />

                <YAxis domain={[0, 100]} />

                <Tooltip formatter={(value) => `${value}%`} />

                <Legend />

                <Bar
                  dataKey="percentage"
                  fill="#f59e0b"
                  name="Attendance %"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-purple-200 bg-purple-50 rounded-2xl">
        <CardHeader>
          <CardTitle className="text-base text-purple-900">
            Analytics Summary
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">

            <div className="rounded-xl border border-purple-200 bg-white/60 p-4">
              <p className="text-xs text-purple-700 uppercase font-semibold">
                Current Enrollment
              </p>

              <p className="text-2xl font-bold text-purple-900 mt-1">
                {summary?.currentEnrollment || 0}/{summary?.capacity || 0}
              </p>

              <p className="text-xs text-purple-600 mt-1">
                {capacityPercentage}% capacity
              </p>
            </div>

            <div className="rounded-xl border border-purple-200 bg-white/60 p-4">
              <p className="text-xs text-purple-700 uppercase font-semibold">
                Students
              </p>

              <p className="text-2xl font-bold text-purple-900 mt-1">
                {summary?.currentEnrollment || 0}
              </p>

              <p className="text-xs text-purple-600 mt-1">
                Total enrolled students
              </p>
            </div>

            <div className="rounded-xl border border-purple-200 bg-white/60 p-4">
              <p className="text-xs text-purple-700 uppercase font-semibold">
                Avg Performance
              </p>

              <p className="text-2xl font-bold text-purple-900 mt-1">
                {summary?.averagePerformance || 0}%
              </p>

              <p className="text-xs text-purple-600 mt-1">
                Academic performance
              </p>
            </div>

            <div className="rounded-xl border border-purple-200 bg-white/60 p-4">
              <p className="text-xs text-purple-700 uppercase font-semibold">
                Best Subject
              </p>

              <p className="text-xl font-bold text-purple-900 mt-1 truncate">
                {summary?.bestSubject || 'N/A'}
              </p>

              <p className="text-xs text-purple-600 mt-1">
                {summary?.bestSubjectAverage || 0}% average
              </p>
            </div>

          </div>
        </CardContent>
      </Card>

    </div>
  )
}