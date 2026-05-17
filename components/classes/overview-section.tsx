import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Users,
  BookOpen,
  User,
  Award,
  GraduationCap,
  School,
} from 'lucide-react'

interface ClassData {
  name: string
  academicYear: string
  capacity: number
  enrollment: number
  teacher: string
  level: string
  status: string
}

export function OverviewSection({
  classData,
}: {
  classData: ClassData
}) {
  const occupancyRate = Math.round(
    (classData?.enrollment / classData?.capacity) * 100
  )

  const availableSeats =
    classData.capacity - classData.enrollment

  return (
    <div className="space-y-6">
      {/* HERO CARD */}
      <Card className="overflow-hidden border-0 shadow-sm bg-gradient-to-r from-primary/10 via-background to-background">
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            {/* Left */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 flex-wrap">
                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <School className="h-7 w-7 text-primary" />
                </div>

                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                    {classData.name}
                  </h1>

                  <p className="text-sm text-muted-foreground mt-1">
                    {classData.level} •{' '}
                    {classData.academicYear}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <Badge
                  variant={
                    classData.status === 'active'
                      ? 'default'
                      : 'secondary'
                  }
                  className="capitalize"
                >
                  {classData.status}
                </Badge>

                <div className="text-sm text-muted-foreground">
                  {availableSeats} seat
                  {availableSeats !== 1 && 's'} available
                </div>
              </div>
            </div>

            {/* Right */}
            <div className="w-full lg:w-72 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Occupancy
                </span>

                <span className="font-semibold">
                  {occupancyRate}%
                </span>
              </div>

              <Progress value={occupancyRate} />

              <div className="flex justify-between text-xs text-muted-foreground">
                <span>
                  {classData.enrollment} enrolled
                </span>

                <span>
                  {classData.capacity} capacity
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm hover:shadow-md transition-all lg:p-5 p-2">
          <CardContent className="lg:p-5 p-2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className='flex justify-center items-center gap-1'>
                  <div className="h-11 lg:hidden w-11 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Enrollment
                  </p>
                </div>

                <h3 className="text-3xl font-bold">
                  {classData.enrollment}
                </h3>

                <p className="text-xs text-muted-foreground">
                  Students enrolled
                </p>
              </div>

              <div className="h-11 w-11 hidden  rounded-xl bg-primary/10 lg:flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all lg:p-5 p-2">
          <CardContent className="lg:p-5 p-2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex justify-center items-center gap-2">
                  <div className="h-11 w-11 lg:hidden rounded-xl bg-primary/10 flex items-center justify-center">
                    <Award className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Capacity
                  </p>
                </div>

                <h3 className="text-3xl font-bold">
                  {classData.capacity}
                </h3>

                <p className="text-xs text-muted-foreground">
                  Maximum students
                </p>
              </div>

              <div className="h-11 w-11 hidden rounded-xl bg-primary/10 lg:flex items-center justify-center">
                <Award className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all lg:p-5 p-2">
          <CardContent className="lg:p-5 p-2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-11 w-11 lg:hidden rounded-xl bg-primary/10 flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Class Teacher
                  </p>
                </div>

                <h3 className="text-lg font-semibold leading-tight">
                  {classData.teacher}
                </h3>

                <p className="text-xs text-muted-foreground">
                  Assigned instructor
                </p>
              </div>
              <div className="h-11 w-11 hidden rounded-xl bg-primary/10 lg:flex items-center justify-center">
                <User className="h-5 w-5 text-primary" />
              </div>
              
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm hover:shadow-md transition-all lg:p-5 p-2">
          <CardContent className="lg:p-5 p-2">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-11 w-11 lg:hidden rounded-xl bg-primary/10 flex items-center justify-center">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Level
                  </p>
                </div>

                <h3 className="text-lg font-semibold w-full text-wrap">
                  {classData.level}
                </h3>

                <p className="text-xs text-muted-foreground">
                  Academic stage
                </p>
              </div>

              <div className="h-11 w-11 hidden rounded-xl bg-primary/10 lg:flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* DETAILS */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">
                Class Information
              </h2>

              <p className="text-sm text-muted-foreground mt-1">
                Overview of the class details and setup
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Class Name
              </p>

              <p className="font-semibold text-base">
                {classData.name}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Academic Year
              </p>

              <p className="font-semibold text-base">
                {classData.academicYear}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Level
              </p>

              <p className="font-semibold text-base">
                {classData.level}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Status
              </p>

              <Badge
                variant={
                  classData.status === 'active'
                    ? 'default'
                    : 'secondary'
                }
                className="capitalize"
              >
                {classData.status}
              </Badge>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Teacher
              </p>

              <p className="font-semibold text-base">
                {classData.teacher}
              </p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
                Available Seats
              </p>

              <p className="font-semibold text-base">
                {availableSeats}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}