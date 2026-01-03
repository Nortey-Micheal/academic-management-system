import type React from "react"
import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { DashboardNav } from "@/components/dashboard-nav"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/")
  }

  return (
    <div className="min-h-screen relative bg-background">
      <DashboardNav user={session} />
      <main className="container mx-auto p-6">{children}</main>
    </div>
  )
}
