import AssessmentPage from "@/components/assessment-page"
import { ClassesTable } from "@/components/classes-table"
import AppLayout from "@/components/layouts/applayout"

export default async function ClassesPage() {
  return (
    <AppLayout>

      <AssessmentPage />
    </AppLayout>
  )
}
