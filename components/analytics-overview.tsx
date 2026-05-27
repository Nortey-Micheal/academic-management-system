"use client"

import { useEffect, useMemo, useState } from "react"

import {
  Users,
  GraduationCap,
  BookOpen,
  CalendarDays,
  Trophy,
  AlertTriangle,
  BarChart3,
} from "lucide-react"

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import AnalyticsFilters from "./analytics-filter"

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#9333ea"]

export default function AnalyticsPage() {

  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)

  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [classId, setClassId] = useState("")

  const [tab, setTab] = useState("overview")

  /* ---------------- FETCH ---------------- */

  const fetchAnalytics = async () => {
    setLoading(true)

    const params = new URLSearchParams()
    if (startDate) params.append("startDate", startDate)
    if (endDate) params.append("endDate", endDate)
    if (classId) params.append("classId", classId)

    const res = await fetch(`/api/analytics?${params}`)
    const data = await res.json()

    setAnalytics(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  /* ---------------- DERIVED ---------------- */

  const attendanceRate = useMemo(() => {
    if (!analytics?.attendanceSummary) return 0

    const total = analytics.attendanceSummary.reduce(
      (a: number, c: any) => a + c._count,
      0
    )

    const present =
      analytics.attendanceSummary.find(
        (i: any) => i.status === "present"
      )?._count || 0

    return total === 0
      ? 0
      : ((present / total) * 100).toFixed(1)
  }, [analytics])

  /* ---------------- LOADING ---------------- */

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-28 w-full rounded-3xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="p-10 text-center text-muted-foreground">
        No analytics data available
      </div>
    )
  }

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-10 pb-20">

      {/* HERO (UNCHANGED STYLE) */}
      <div className="rounded-3xl bg-linear-to-r from-blue-600 to-indigo-700 text-white p-8 shadow-lg">

        <div className="flex flex-col lg:flex-row justify-between gap-6">

          <div>
            <Badge className="bg-white/20 text-white">
              Academic Analytics
            </Badge>

            <h1 className="text-4xl font-bold mt-3">
              School Insights Dashboard
            </h1>

            <p className="text-blue-100 mt-2 max-w-xl">
              Deep academic intelligence across attendance, performance and engagement.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 min-w-75">

            <MiniBox label="Year" value={analytics?.academicYear?.year} />
            <MiniBox label="Term" value={`Term ${analytics?.activeTerm?.termNumber}`} />

          </div>

        </div>
      </div>

      {/* FILTERS (IMPROVED BUT CLEAN) */}
      <AnalyticsFilters />

      {/* KPI GRID (UNCHANGED STYLE) */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">

        <Kpi title="Students" value={analytics.overview.totalStudents} icon={<Users />} color="bg-blue-400"/>
        <Kpi title="Attendance" value={`${attendanceRate}%`} icon={<CalendarDays />} color="bg-yellow-400"/>
        <Kpi title="Teachers" value={analytics.overview.totalTeachers} icon={<GraduationCap />} color="bg-green-400"/>
        <Kpi title="Subjects" value={analytics.overview.totalSubjects} icon={<BookOpen />} color="bg-red-400"/>

      </div>

      {/* INSIGHTS (MORE DENSE, STILL SAME STYLE) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <Card className="rounded-3xl bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertTriangle className="w-5 h-5" />
              Risk Signals
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-2">
            <Row label="Low attendance" value="12 students" />
            <Row label="Missing assessments" value="4 classes" />
            <Row label="Weak performance classes" value="2" />
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Trophy className="w-5 h-5" />
              Top Students
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-2">
            {analytics.topStudents?.slice(0, 3).map((s: any, i: number) => (
              <div key={s.id} className="flex justify-between text-sm">
                <span>#{i + 1} {s.name}</span>
                <span className="font-bold">{s.average}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>System Overview</CardTitle>
          </CardHeader>

          <CardContent className="space-y-2 text-sm">
            <Row label="Classes" value={analytics.overview.totalClasses} />
            <Row label="Active Students" value={analytics.overview.activeStudents} />
            <Row label="Subjects" value={analytics.overview.totalSubjects} />
          </CardContent>
        </Card>

      </div>

      {/* TABS (UPGRADED STRUCTURE, SAME STYLE) */}
      <Tabs value={tab} onValueChange={setTab}>

        <TabsList className="grid grid-cols-4 rounded-2xl p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="academic">Academic</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 mt-6">

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            <Chart title="Gender Distribution">
              <PieChartComp data={analytics.genderDistribution} />
            </Chart>

            <Chart title="Class Enrollment">
              <BarChartComp data={analytics.classEnrollment} x="grade" y="currentEnrollment" />
            </Chart>

          </div>

        </TabsContent>

        {/* ACADEMIC */}
        <TabsContent value="academic" className="space-y-6">

          <Chart title="Subject Performance">
            <BarChartComp data={analytics.subjectPerformance} x="subject" y="average" color="#16a34a" />
          </Chart>

        </TabsContent>

        {/* ATTENDANCE */}
        <TabsContent value="attendance" className="space-y-6">

          <Chart title="Attendance Trend">
            <LineChartComp data={analytics.attendanceTrend} />
          </Chart>

        </TabsContent>

        {/* INSIGHTS */}
        <TabsContent value="insights" className="space-y-6">

          <Chart title="Attendance by Class">
            <BarChartComp data={analytics.attendanceByClass} x="classId" y="rate" color="#9333ea" />
          </Chart>

        </TabsContent>

      </Tabs>

    </div>
  )
}

/* ---------------- HELPERS (STYLE PRESERVED) ---------------- */

function Kpi({
  title,
  value,
  icon,
  color,
  trend,
  subtitle,
  loading,
}: any) {
  return (
    <Card className="rounded-3xl hover:shadow-md transition-shadow duration-300">
      <CardContent className="pt-6 flex justify-between items-start">

        {/* LEFT SIDE */}
        <div className="space-y-2">

          <div className="flex items-center gap-2">

            <div
              className={`w-9 h-9 md:hidden rounded-lg ${color} text-white flex items-center justify-center shadow-sm`}
            >
              {icon}
            </div>

            <p className="text-sm text-muted-foreground font-medium">
              {title}
            </p>

          </div>

          {/* VALUE */}
          <div className="flex items-end gap-3">

            <p className="text-3xl font-bold tracking-tight">
              {loading ? (
                <span className="animate-pulse text-muted-foreground">
                  ---
                </span>
              ) : (
                value
              )}
            </p>

            {/* TREND */}
            {trend && !loading && (
              <span
                className={`text-xs font-medium px-2 py-1 rounded-full
                  ${
                    trend > 0
                      ? "bg-green-100 text-green-700"
                      : trend < 0
                      ? "bg-red-100 text-red-700"
                      : "bg-gray-100 text-gray-600"
                  }`}
              >
                {trend > 0 && "+"}
                {trend}%
              </span>
            )}

          </div>

          {/* SUBTITLE */}
          {subtitle && (
            <p className="text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}

        </div>

        {/* RIGHT ICON */}
        <div
          className={`w-12 h-12 hidden md:flex rounded-2xl ${color} text-white items-center justify-center shadow-md`}
        >
          {icon}
        </div>

      </CardContent>
    </Card>
  )
}

function MiniBox({ label, value }: any) {
  return (
    <div className="bg-white/10 p-4 rounded-2xl">
      <p className="text-sm text-blue-100">{label}</p>
      <p className="text-xl font-bold">{value || "—"}</p>
    </div>
  )
}

function Row({ label, value }: any) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span className="font-bold">{value}</span>
    </div>
  )
}

function Chart({ title, children }: any) {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

/* chart wrappers */

function PieChartComp({ data }: any) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie data={data?.map((i: any) => ({ name: i.gender, value: i._count }))} dataKey="value" outerRadius={110}>
          {data?.map((_: any, i: number) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  )
}

function BarChartComp({ data, x, y, color = "#2563eb" }: any) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey={x} />
        <YAxis />
        <Tooltip />
        <Bar dataKey={y} fill={color} />
      </BarChart>
    </ResponsiveContainer>
  )
}

function LineChartComp({ data }: any) {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="attendanceRate" stroke="#2563eb" strokeWidth={3} />
      </LineChart>
    </ResponsiveContainer>
  )
}