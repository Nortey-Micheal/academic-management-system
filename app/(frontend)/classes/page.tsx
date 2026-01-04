import { ClassesTable } from "@/components/classes-table"
import AppLayout from "@/components/layouts/applayout"

export default async function ClassesPage() {
  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Class Management</h1>
        <p className="text-muted-foreground mt-1">Manage classes and view enrollment statistics</p>
      </div>

      <ClassesTable />
    </AppLayout>
  )
}
