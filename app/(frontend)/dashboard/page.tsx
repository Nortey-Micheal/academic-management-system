'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, FileText, TrendingUp, Award, ClipboardCheck } from "lucide-react"
// import { getDb } from "@/lib/mongodb"
import Link from "next/link"
import AppLayout from "@/components/layouts/applayout"
import { useSelector } from "react-redux"
import { StoreState } from "@/lib/store"

export default function DashboardPage() {
  const user = useSelector((state:StoreState) => state.user)

  // if (!user) {
  //   redirect("/")
  // }

  // const db = await getDb()

  // const totalStudents = await db.collection("students").countDocuments({ status: "active" })
  // const totalClasses = await db.collection("classes").countDocuments()
  // const totalAssessments = await db.collection("assessments").countDocuments()

  // Calculate attendance rate for the current week
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 7)
  // Dummy data used when DB/auth are disabled during local development
  const totalStudents = 120
  const totalClasses = 8
  const totalAssessments = 34
  // numeric percent (no trailing %), components add % where needed
  const attendanceRate = 92.3

  // const weekAttendance = await db
  //   .collection("attendance")
  //   .find({ date: { $gte: weekStart } })
  //   .toArray()

  // const attendanceRate =
  //   weekAttendance.length > 0
  //     ? (
  //         (weekAttendance.filter((a) => a.status === "present" || a.status === "late").length / weekAttendance.length) *
  //         100
  //       ).toFixed(1)
  //     : "0"

  const stats = [
    {
      title: "Total Students",
      value: totalStudents.toString(),
      description: "Enrolled this term",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      href: "/dashboard/students",
    },
    {
      title: "Attendance Rate",
      value: `${attendanceRate}%`,
      description: "This week",
      icon: UserCheck,
      color: "text-green-600",
      bgColor: "bg-green-50",
      href: "/dashboard/attendance",
    },
    {
      title: "Total Classes",
      value: totalClasses.toString(),
      description: "Active classes",
      icon: Award,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      href: "/dashboard/classes",
    },
    {
      title: "Assessments",
      value: totalAssessments.toString(),
      description: "Total created",
      icon: FileText,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      href: "/dashboard/assessments",
    },
  ]

  const quickActions = [
    {
      title: "Mark Attendance",
      description: "Record today's student attendance",
      icon: ClipboardCheck,
      href: "/dashboard/attendance",
    },
    {
      title: "Add Student",
      description: "Enroll a new student",
      icon: Users,
      href: "/dashboard/students",
    },
    {
      title: "Create Assessment",
      description: "Set up a new test or assignment",
      icon: FileText,
      href: "/dashboard/assessments",
    },
    {
      title: "View Analytics",
      description: "Check performance insights",
      icon: TrendingUp,
      href: "/dashboard/analytics",
    },
  ]

  return (
    <AppLayout>
      <div className="mb-0 pb-25">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {user.firstName}. Here&apos;s what&apos;s happening with your school.
          </p>
        </div>
        <div className="grid gap-6 grid-cols-2 lg:grid-cols-4 mb-5">
          {stats.map((stat) => (
            <Link key={stat.title} href={stat.href}>
              <Card className="transition-all hover:shadow-lg cursor-pointer">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2 mb-5">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks and shortcuts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {quickActions.map((action) => (
                  <Link key={action.title} href={action.href}>
                    <Button variant="outline" className="w-full justify-start h-auto py-4 bg-transparent">
                      <action.icon className="w-5 h-5 mr-3" />
                      <div className="text-left">
                        <div className="font-semibold">{action.title}</div>
                        <div className="text-sm text-muted-foreground">{action.description}</div>
                      </div>
                    </Button>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest updates and changes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="p-2 rounded-lg bg-blue-100">
                    <Users className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">New students enrolled</p>
                    <p className="text-xs text-muted-foreground">{totalStudents} students in the system</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="p-2 rounded-lg bg-green-100">
                    <UserCheck className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Weekly attendance recorded</p>
                    <p className="text-xs text-muted-foreground">Average rate: {attendanceRate}%</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-3 rounded-lg border">
                  <div className="p-2 rounded-lg bg-purple-100">
                    <FileText className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Assessments created</p>
                    <p className="text-xs text-muted-foreground">{totalAssessments} active assessments</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>All systems operational</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium">Student Management</p>
                  <p className="text-xs text-muted-foreground">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium">Attendance Tracking</p>
                  <p className="text-xs text-muted-foreground">Operational</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-lg border bg-muted/30">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div>
                  <p className="text-sm font-medium">Grading System</p>
                  <p className="text-xs text-muted-foreground">Operational</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
