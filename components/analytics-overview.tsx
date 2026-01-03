"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  Cell,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Legend,
} from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import type { Class } from "@/lib/types"

export function AnalyticsOverview() {
  const [classes, setClasses] = useState<Class[]>([])
  const [selectedClass, setSelectedClass] = useState("all")
  const [attendanceData, setAttendanceData] = useState<any[]>([])
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClasses()
    fetchAnalytics()
  }, [selectedClass])

  const fetchClasses = async () => {
    try {
      const response = await fetch("/api/classes")
      const data = await response.json()
      setClasses(data.classes)
    } catch (error) {
      console.error("[v0] Error fetching classes:", error)
    }
  }

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      // Mock data for visualization - in production, fetch from API
      setAttendanceData([
        { day: "Mon", present: 285, absent: 15 },
        { day: "Tue", present: 290, absent: 10 },
        { day: "Wed", present: 280, absent: 20 },
        { day: "Thu", present: 295, absent: 5 },
        { day: "Fri", present: 275, absent: 25 },
      ])

      setPerformanceData([
        { grade: "A", count: 45 },
        { grade: "B", count: 85 },
        { grade: "C", count: 120 },
        { grade: "D", count: 35 },
        { grade: "F", count: 15 },
      ])
    } catch (error) {
      console.error("[v0] Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Analytics Overview</CardTitle>
          <CardDescription>View performance metrics and attendance trends</CardDescription>
          <div className="space-y-2 pt-4">
            <Label>Filter by Class</Label>
            <Select value={selectedClass} onValueChange={setSelectedClass}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="All classes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Classes</SelectItem>
                {classes?.map((c) => (
                  <SelectItem key={c._id} value={c._id!}>
                    {c.className}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Attendance Trend</CardTitle>
            <CardDescription>Student attendance for the current week</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : (
              <ChartContainer
                config={{
                  present: {
                    label: "Present",
                    color: "hsl(var(--chart-1))",
                  },
                  absent: {
                    label: "Absent",
                    color: "hsl(var(--chart-2))",
                  },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="present" fill="var(--color-present)" name="Present" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="absent" fill="var(--color-absent)" name="Absent" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>Overall student performance breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="h-80 flex items-center justify-center text-muted-foreground">Loading...</div>
            ) : (
              <ChartContainer
                config={{
                  count: {
                    label: "Students",
                    color: "hsl(var(--chart-1))",
                  },
                }}
                className="h-80"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={performanceData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {performanceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Class Performance Comparison</CardTitle>
          <CardDescription>Average scores across different classes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="h-80 flex items-center justify-center text-muted-foreground">Loading...</div>
          ) : (
            <ChartContainer
              config={{
                average: {
                  label: "Average Score",
                  color: "hsl(var(--chart-1))",
                },
              }}
              className="h-80"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={[
                    { class: "Grade 10A", average: 78 },
                    { class: "Grade 10B", average: 82 },
                    { class: "Grade 11A", average: 75 },
                    { class: "Grade 11B", average: 80 },
                    { class: "Grade 12A", average: 85 },
                  ]}
                >
                  <XAxis dataKey="class" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="var(--color-average)"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Top Performers</CardTitle>
            <CardDescription>Students with highest grades</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Sample Student 1", grade: "A+", percentage: "95%" },
                { name: "Sample Student 2", grade: "A+", percentage: "94%" },
                { name: "Sample Student 3", grade: "A", percentage: "92%" },
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.percentage}</p>
                  </div>
                  <div className="px-3 py-1 rounded-md bg-green-100 text-green-700 font-semibold">{student.grade}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
            <CardDescription>Students requiring support</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Sample Student 4", grade: "D", percentage: "48%" },
                { name: "Sample Student 5", grade: "D", percentage: "46%" },
                { name: "Sample Student 6", grade: "F", percentage: "42%" },
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.percentage}</p>
                  </div>
                  <div className="px-3 py-1 rounded-md bg-red-100 text-red-700 font-semibold">{student.grade}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attendance Alerts</CardTitle>
            <CardDescription>Low attendance warnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { name: "Sample Student 7", rate: "72%", days: 8 },
                { name: "Sample Student 8", rate: "68%", days: 11 },
                { name: "Sample Student 9", rate: "65%", days: 13 },
              ].map((student, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                  <div>
                    <p className="font-medium">{student.name}</p>
                    <p className="text-sm text-muted-foreground">{student.days} days absent</p>
                  </div>
                  <div className="px-3 py-1 rounded-md bg-amber-100 text-amber-700 font-semibold">{student.rate}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
