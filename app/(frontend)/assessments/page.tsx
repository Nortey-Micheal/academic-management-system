import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AssessmentsList } from "@/components/assessments-list"
import AppLayout from "@/components/layouts/applayout"

export default async function AssessmentsPage() {
  const user = await requireAuth()

  if (!user) {
    redirect("/")
  }

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
