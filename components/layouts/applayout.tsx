'use client'

import type React from "react"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { useSelector } from "react-redux"
import { StoreState } from "@/lib/store"
import { useEffect } from "react"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useSelector((state:StoreState) => state.user)
  const router = useRouter()

  useEffect(() => {
    if (!user?._id) {
      router.replace("/")
    }
  }, [user._id])

  return (
    <div className="flex h-screen flex-col md:flex-row bg-background overflow-hidden">
      <DashboardNav user={user}/>
      <main className="flex-1 overflow-x-scroll container mx-auto p-6">{children}</main>
    </div>
  )
}
