import { redirect } from "next/navigation"
import { StudentsTable } from "@/components/students-table"
import AppLayout from "@/components/layouts/applayout"

export default async function StudentsPage() {

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Student Management</h1>
        <p className="text-muted-foreground mt-1">Manage student records and class assignments</p>
      </div>

      <StudentsTable />
    </AppLayout>
  )
}
