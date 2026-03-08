'use client'

import type React from "react"
import { useRouter } from "next/navigation"
import DashboardNav from "@/components/dashboard-nav"
import { useSelector } from "react-redux"
import { StoreState } from "@/lib/store"
import { useEffect } from "react"
import { Button } from "../ui/button"
import { useLogout } from "@/hooks/useLogout"

export default function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = useSelector((state:StoreState) => state.user)
  const router = useRouter()
  const {logout} = useLogout()

  useEffect(() => {
    if (!user?.id) {
      router.replace("/")
    }
  }, [user.id])

  if (user.status === 'inactive') {
    return (
      <div className="w-screen h-screen flex justify-center items-center flex-col gap-6">
        <p>Your account is currently inactive. Please wait until it is actived before you can use it</p>
        <Button onClick={logout}>Log Out</Button>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col md:flex-row bg-background overflow-hidden">
      <DashboardNav user={user}/>
      <main className="flex-1 overflow-x-scroll container mx-auto p-6">{children}</main>
    </div>
  )
}
