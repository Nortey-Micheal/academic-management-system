'use client';

import { redirect, useRouter } from "next/navigation"
import { LoginForm } from "@/components/login-form"
import { useSelector } from "react-redux"
import { StoreState } from "@/lib/store"
import { useEffect } from "react";

export default function LoginPage() {
  const user = useSelector((state:StoreState) => state.user)
  const router = useRouter()

  useEffect(() => {
    if (!user?._id) {
      router.replace("/")
    }
  }, [user._id])

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-background via-muted/20 to-background p-4">
      <LoginForm />
    </div>
  )
}
