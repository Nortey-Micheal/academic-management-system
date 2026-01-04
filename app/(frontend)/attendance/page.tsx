import { redirect } from "next/navigation"
import { AttendanceMarker } from "@/components/attendance-marker"
import AppLayout from "@/components/layouts/applayout"

export default async function AttendancePage() {
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
