import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AttendanceMarker } from "@/components/attendance-marker"
import AppLayout from "@/components/layouts/applayout"

export default async function AttendancePage() {
  const user = await requireAuth()

  if (!user) {
    redirect("/")
  }

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Attendance Management</h1>
        <p className="text-muted-foreground mt-1">Mark and track student attendance by class and date</p>
      </div>

      <AttendanceMarker />
    </AppLayout>
  )
}
