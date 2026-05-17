'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import {
  ArrowLeft,
  Users,
  BookOpen,
  Calendar,
  BarChart3,
  Settings,
  ClipboardList,
  Plus,
  Download,
  Edit2,
  MoreVertical,
  Loader2,
  GraduationCap,
  School,
} from 'lucide-react'
import Link from 'next/link'
import { OverviewSection } from '@/components/classes/overview-section'
import { StudentsTab } from '@/components/classes/students-tab'
import { SubjectsTab } from '@/components/classes/subjects-tab'
import { AttendanceTab } from '@/components/classes/attendance-tab'
import { AssessmentsTab } from '@/components/classes/assessments-tab'
import { AnalyticsTab } from '@/components/classes/analytics-tab'
import { SettingsTab } from '@/components/classes/settings-tab'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface ClassDetail {
  id: string
  grade: number
  section: string
  academicYear: string
  capacity: number
  currentEnrollment: number
  level: string
  classTeacher?: {
    id: string
    user?: {
      firstName: string
      lastName: string
    }
  } | null
}

export default function ClassDetailPage({
  params,
}: {
  params: { classId: string }
}) {
  const [activeTab, setActiveTab] =
    useState('overview')

  const [classData, setClassData] =
    useState<ClassDetail | null>(null)

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClass()
  }, [params.classId])

  const fetchClass = async () => {
    try {
      setLoading(true)

      const response = await fetch(
        `/api/classes/${params.classId}`
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(
          data.error || 'Failed to fetch class'
        )
      }

      setClassData(data.class)
    } catch (error: any) {
      toast.error(
        error.message || 'Failed to fetch class'
      )
    } finally {
      setLoading(false)
    }
  }

  const classTeacherName = useMemo(() => {
    if (!classData?.classTeacher) {
      return 'Not Assigned'
    }

    return `${
      classData.classTeacher.user?.firstName || ''
    } ${
      classData.classTeacher.user?.lastName || ''
    }`
  }, [classData])

  const transformedClassData = useMemo(() => {
    if (!classData) return null

    return {
      ...classData,
      name: `Basic ${classData.grade}${classData.section}`,
      status: 'active',
      enrollment: classData.currentEnrollment,
      teacher: classTeacherName,
    }
  }, [classData, classTeacherName])

  const occupancyRate = classData
    ? Math.round(
        (classData.currentEnrollment /
          classData.capacity) *
          100
      )
    : 0

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />

          <p className="text-sm text-muted-foreground">
            Loading class details...
          </p>
        </div>
      </div>
    )
  }

  if (!classData || !transformedClassData) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-muted-foreground">
        Class not found
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* HERO HEADER */}
      <div className="border-b bg-background lg:sticky lg:top-0 z-40 lg:backdrop-blur supports-[backdrop-filter]:lg:bg-background/90">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2 sm:py-4 lg:py-5">
            
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between lg:gap-5">

            {/* LEFT */}
            <div className="flex items-start gap-3 sm:gap-4">

                <Link href="/classes" className='hidden md:block'>
                    <Button
                        variant="outline"
                        size="icon"
                        className="rounded-xl h-9 w-9 sm:h-10 sm:w-10"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>

                <div className="space-y-1 sm:space-y-2 overflow-hidden">

                {/* TOP SECTION */}
                <div className="flex mb-2 items-center gap-3 sm:gap-4">
                    <Link href="/classes" className='md:hidden'>
                        <Button
                            variant="outline"
                            size="icon"
                            className="rounded-xl h-9 w-9 sm:h-10 sm:w-10"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                    </Link>

                    <div className="h-9 w-9 sm:h-12 sm:w-12 lg:h-14 lg:w-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                    <School className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    </div>

                    <div className="min-w-0">

                    <div className="flex items-center gap-2 sm:gap-3 flex-wrap">

                        <h1 className="text-base sm:text-lg lg:text-3xl font-bold tracking-tight leading-tight truncate">
                        Basic {classData.grade}{classData.section}
                        </h1>

                        <Badge className="text-xs px-2 py-0.5">
                        Active
                        </Badge>

                    </div>

                    <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 sm:mt-1 hidden sm:block">
                        {classData.level} • {classData.academicYear}
                    </p>

                    </div>

                </div>

                {/* QUICK STATS */}
                <div className="w-full overflow-hidden">
                    <div className="flex gap-2 overflow-x-auto w-full pb-1 scrollbar-hide">
                        
                        <Card className="shadow-none border bg-background min-w-[120px] sm:min-w-[140px] py-2 lg:py-6 shrink-0">
                            <CardContent className="px-3 py-2 flex items-center gap-2">
                                <Users className="h-4 w-4 text-primary shrink-0" />

                                <div>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                                        Students
                                    </p>

                                    <p className="text-xs sm:text-sm font-semibold">
                                        {classData.currentEnrollment}/{classData.capacity}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-none border bg-background min-w-[120px] sm:min-w-[140px] py-2 lg:py-6 shrink-0">
                            <CardContent className="px-3 py-2 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-primary shrink-0" />

                                <div>
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                                        Occupancy
                                    </p>

                                    <p className="text-xs sm:text-sm font-semibold">
                                        {occupancyRate}%
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="shadow-none border bg-background min-w-[140px] sm:min-w-[180px] py-2 lg:py-6 shrink-0">
                            <CardContent className="px-3 py-2 flex items-center gap-2">
                                <BookOpen className="h-4 w-4 text-primary shrink-0" />

                                <div className="min-w-0">
                                    <p className="text-[10px] sm:text-xs text-muted-foreground">
                                        Teacher
                                    </p>

                                    <p className="text-xs sm:text-sm font-semibold truncate max-w-[120px] sm:max-w-[180px]">
                                        {classTeacherName}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
            </div>

            {/* ACTIONS */}
            <div className="flex flex-wrap lg:flex-nowrap gap-2 w-full lg:w-auto">

                <Button
                    variant="outline"
                    className="gap-2 rounded-xl h-9 sm:h-10 text-xs sm:text-sm flex-1 lg:flex-none"
                    >
                        <Download className="h-4 w-4" />
                    Export
                </Button>

                <Button
                className="gap-2 rounded-xl h-9 sm:h-10 text-xs sm:text-sm flex-1 lg:flex-none"
                >
                <Edit2 className="h-4 w-4" />
                Edit
                </Button>

                <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button
                    variant="outline"
                    size="icon"
                    className="rounded-xl h-9 w-9 sm:h-10 sm:w-10"
                    >
                    <MoreVertical className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end">
                    <DropdownMenuItem>Archive Class</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                    Delete Class
                    </DropdownMenuItem>
                </DropdownMenuContent>
                </DropdownMenu>

            </div>

            </div>
        </div>
      </div>

      {/* MAIN */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-2"
        >
          {/* TABS */}
          <div className="w-full overflow-x-auto scrollbar-hide">
            <TabsList className="flex lg:grid lg:grid-cols-7 rounded-2xl p-1 h-auto bg-background border gap-2 min-w-max lg:min-w-0 w-full scrollbar-hide">
                <TabsTrigger
                  value="overview"
                  className="gap-2 rounded-xl py-3"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger
                  value="students"
                  className="gap-2 rounded-xl py-3"
                >
                  <Users className="h-4 w-4" />
                  <span>Students</span>
                </TabsTrigger>
                <TabsTrigger
                  value="subjects"
                  className="gap-2 rounded-xl py-3"
                >
                  <BookOpen className="h-4 w-4" />
                  <span>Subjects</span>
                </TabsTrigger>
                <TabsTrigger
                  value="attendance"
                  className="gap-2 rounded-xl py-3"
                >
                  <Calendar className="h-4 w-4" />
                  <span>Attendance</span>
                </TabsTrigger>
                <TabsTrigger
                  value="assessments"
                  className="gap-2 rounded-xl py-3"
                >
                  <ClipboardList className="h-4 w-4" />
                  <span>Assessments</span>
                </TabsTrigger>
                <TabsTrigger
                  value="analytics"
                  className="gap-2 rounded-xl py-3"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Analytics</span>
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="gap-2 rounded-xl py-3"
                >
                  <Settings className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>
          </div>

          {/* OVERVIEW */}
          <TabsContent value="overview">
            <OverviewSection
              classData={transformedClassData}
            />
          </TabsContent>

          {/* STUDENTS */}
          <TabsContent
            value="students"
            className="space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Students
                </h2>

                <p className="text-sm text-muted-foreground">
                  Manage students in this class
                </p>
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="gap-2 rounded-xl"
                >
                  <Download className="h-4 w-4" />
                  Export
                </Button>

                <Button className="gap-2 rounded-xl">
                  <Plus className="h-4 w-4" />
                  Add Student
                </Button>
              </div>
            </div>

            <StudentsTab classId={classData.id}/>
          </TabsContent>

          {/* SUBJECTS */}
          <TabsContent
            value="subjects"
            className="space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Subjects
                </h2>

                <p className="text-sm text-muted-foreground">
                  Manage subjects and teachers
                </p>
              </div>

              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Assign Teacher
              </Button>
            </div>

            <SubjectsTab classId={classData.id} />
          </TabsContent>

          {/* ATTENDANCE */}
          <TabsContent
            value="attendance"
            className="space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Attendance
                </h2>

                <p className="text-sm text-muted-foreground">
                  Monitor daily attendance
                </p>
              </div>

              <Button className="gap-2 rounded-xl">
                <Plus className="h-4 w-4" />
                Mark Attendance
              </Button>
            </div>

            <AttendanceTab classId={classData.id} />
          </TabsContent>

          {/* ASSESSMENTS */}
          <TabsContent
            value="assessments"
            className="space-y-5"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h2 className="text-xl font-semibold">
                  Assessments
                </h2>

                <p className="text-sm text-muted-foreground">
                  Track class performance and reports
                </p>
              </div>

              <Button className="gap-2 rounded-xl">
                <Download className="h-4 w-4" />
                Generate Report
              </Button>
            </div>

            <AssessmentsTab classId={classData.id} />
          </TabsContent>

          {/* ANALYTICS */}
          <TabsContent
            value="analytics"
            className="space-y-5"
          >
            <div>
              <h2 className="text-xl font-semibold">
                Analytics
              </h2>

              <p className="text-sm text-muted-foreground">
                Performance insights and trends
              </p>
            </div>

            <AnalyticsTab classId={classData.id} />
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent
            value="settings"
            className="space-y-5"
          >
            <div>
              <h2 className="text-xl font-semibold">
                Settings
              </h2>

              <p className="text-sm text-muted-foreground">
                Configure class settings
              </p>
            </div>

            <SettingsTab
              classData={transformedClassData}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}