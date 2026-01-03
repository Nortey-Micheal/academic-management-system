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
    <div className="flex h-screen flex-col md:flex-row bg-background overflow-hidden">
      <DashboardNav user={session}/>
      <main className="flex-1 overflow-x-scroll container mx-auto p-6">{children}</main>
    </div>
  )
}
