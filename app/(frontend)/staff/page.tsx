import { redirect } from "next/navigation"
import { AttendanceMarker } from "@/components/attendance-marker"
import AppLayout from "@/components/layouts/applayout"
import StaffDetails from "@/components/staff-page"

export default async function StaffPage() {
  return (
    <AppLayout>
        <StaffDetails />
    </AppLayout>
  )
}
