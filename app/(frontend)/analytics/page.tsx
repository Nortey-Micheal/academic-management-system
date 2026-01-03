import { requireAuth } from "@/lib/auth"
import { redirect } from "next/navigation"
import { AnalyticsOverview } from "@/components/analytics-overview"
import AppLayout from "@/components/layouts/applayout"

export default async function AnalyticsPage() {
  const user = await requireAuth()

  if (!user) {
    redirect("/")
  }

  return (
    <AppLayout>
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Analytics & Reports</h1>
        <p className="text-muted-foreground mt-1">Comprehensive insights into academic performance and attendance</p>
      </div>
      <AnalyticsOverview />
    </AppLayout>
  )
}
