import { AssessmentsList } from "@/components/assessments-list"
import AppLayout from "@/components/layouts/applayout"

export default async function AssessmentsPage() {

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Assessments & Grading</h1>
        <p className="text-muted-foreground mt-1">Create assessments and enter student grades</p>
      </div>

      <AssessmentsList />
    </AppLayout>
  )
}
