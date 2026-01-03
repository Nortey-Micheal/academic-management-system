import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ReportCardGenerator } from "@/components/report-card-generator"
import AppLayout from "@/components/layouts/applayout"

export default async function ReportsPage() {
  const user = await requireAuth()

  if (!user) {
    redirect("/")
  }

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Report Cards</h1>
        <p className="text-muted-foreground mt-1">Generate and print comprehensive student report cards</p>
      </div>

      <ReportCardGenerator />
    </AppLayout>
  )
}
