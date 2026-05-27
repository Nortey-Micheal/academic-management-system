"use client"

import { useEffect, useMemo, useState } from "react"

import {
  Users,
  GraduationCap,
  School,
  BookOpen,
  TrendingUp,
  UserCheck,
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
  CardDescription,
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

const COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#dc2626", "#9333ea"]

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [selectedView, setSelectedView] = useState("overview")

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      const res = await fetch("/api/analytics")
      const data = await res.json()
      setAnalytics(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const attendanceRate = useMemo(() => {
    if (!analytics?.attendanceSummary) return 0

    const total = analytics.attendanceSummary.reduce(
      (acc: number, curr: any) => acc + curr._count,
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

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-24 w-full rounded-3xl" />

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-3xl" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10 pb-20">

      {/* HERO */}
      <div className="rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-8 shadow-lg">
        <div className="flex flex-col lg:flex-row justify-between gap-6">

          <div>
            <Badge className="bg-white/20 text-white">
              Academic Analytics
            </Badge>

            <h1 className="text-4xl font-bold mt-3">
              School Insights Dashboard
            </h1>

            <p className="text-blue-100 mt-2 max-w-xl">
              Real-time insights into students, teachers, attendance and performance.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 min-w-[300px]">

            <div className="bg-white/10 p-4 rounded-2xl">
              <p className="text-sm text-blue-100">Year</p>
              <p className="text-xl font-bold">
                {analytics?.academicYear?.year || "—"}
              </p>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl">
              <p className="text-sm text-blue-100">Term</p>
              <p className="text-xl font-bold">
                Term {analytics?.activeTerm?.termNumber || "—"}
              </p>
            </div>

          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-5">

        <KpiCard
          title="Students"
          value={analytics?.overview?.totalStudents}
          icon={<Users />}
          color="bg-blue-600"
        />

        <KpiCard
          title="Attendance"
          value={`${attendanceRate}%`}
          icon={<CalendarDays />}
          color="bg-green-600"
        />

        <KpiCard
          title="Teachers"
          value={analytics?.overview?.totalTeachers}
          icon={<GraduationCap />}
          color="bg-orange-600"
        />

        <KpiCard
          title="Subjects"
          value={analytics?.overview?.totalSubjects}
          icon={<BookOpen />}
          color="bg-purple-600"
        />

      </div>

      {/* INSIGHTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        <Card className="rounded-3xl bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-900">
              <AlertTriangle className="w-5 h-5" />
              Attention Needed
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <Row label="Low attendance students" value="12" />
            <Row label="Missing assessments" value="4" />
            <Row label="Weak classes" value="2" />
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-900">
              <Trophy className="w-5 h-5" />
              Top Students
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-3">
            {analytics?.topStudents?.slice(0, 3).map((s: any, i: number) => (
              <div key={s.id} className="flex justify-between text-sm">
                <span>#{i + 1} {s.name}</span>
                <span className="font-bold">{s.average}%</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-3xl bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle>Overview</CardTitle>
          </CardHeader>

          <CardContent className="space-y-3 text-sm">
            <Row label="Classes" value={analytics?.overview?.totalClasses} />
            <Row label="Active Students" value={analytics?.overview?.activeStudents} />
            <Row label="Subjects" value={analytics?.overview?.totalSubjects} />
          </CardContent>
        </Card>

      </div>

      {/* TABS NAVIGATION */}
      <Tabs value={selectedView} onValueChange={setSelectedView}>

        <TabsList className="grid grid-cols-4 w-full rounded-2xl p-1">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="attendance">Attendance</TabsTrigger>
        </TabsList>

        {/* OVERVIEW */}
        <TabsContent value="overview" className="space-y-6 mt-6">

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

            <ChartCard title="Gender Distribution">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.genderDistribution?.map((i: any) => ({
                      name: i.gender,
                      value: i._count,
                    }))}
                    dataKey="value"
                    outerRadius={110}
                    label
                  >
                    {analytics?.genderDistribution?.map((_: any, i: number) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </ChartCard>

            <ChartCard title="Class Enrollment">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.classEnrollment}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="grade" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="currentEnrollment" fill="#2563eb" />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>

          </div>

        </TabsContent>

        {/* STUDENTS */}
        <TabsContent value="students" className="space-y-6 mt-6">

          <ChartCard title="Subject Performance">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analytics?.subjectPerformance}>
                <XAxis dataKey="subject" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="average" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </TabsContent>

        {/* TEACHERS */}
        <TabsContent value="teachers" className="space-y-6 mt-6">

          <ChartCard title="Teacher Workload">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={analytics?.teacherPerformance}>
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="subjects" fill="#9333ea" />
                <Bar dataKey="classes" fill="#f59e0b" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

        </TabsContent>

        {/* ATTENDANCE */}
        <TabsContent value="attendance" className="space-y-6 mt-6">

          <ChartCard title="Attendance Trend">
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={analytics?.attendanceTrend}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="attendanceRate"
                  stroke="#2563eb"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

        </TabsContent>

      </Tabs>

    </div>
  )
}

/* ---------------- HELPERS ---------------- */

function KpiCard({ title, value, icon, color }: any) {
  return (
    <Card className="rounded-3xl">
      <CardContent className="pt-6 flex justify-between">
        <div>
          <div className="flex items-center justify-center gap-2">
            <div className={`w-12 h-12 md:hidden rounded-2xl ${color} text-white flex items-center justify-center`}>
              {icon}
            </div>
            <p className="text-sm text-muted-foreground">{title}</p>
          </div>
          <p className="text-3xl font-bold mt-2">{value}</p>
        </div>

        <div className={`w-12 h-12 hidden md:block rounded-2xl ${color} text-white flex items-center justify-center`}>
          {icon}
        </div>
      </CardContent>
    </Card>
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

function ChartCard({ title, children }: any) {
  return (
    <Card className="rounded-3xl">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}