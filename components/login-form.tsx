"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Image from "next/image"
import { Separator } from "./ui/separator"
import Link from "next/link"
import { useLogin } from "@/hooks/useLogin"
import { Eye, EyeClosed } from "lucide-react"
import { getSchoolConfig } from "@/config"

export function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const { login, loading } = useLogin()
  const [isVisble,setIsVisible] = useState<boolean>(false)
  const school = getSchoolConfig()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    login(email,password)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="space-y-1">
        <div className="flex items-center justify-center">
          <div className="flex items-center justify-center rounded-xl ">
            <Image alt={`${school.name}'s logo`} width={200} height={200} src={school.branding.logo}/>
          </div>
        </div>
        <CardTitle className="text-2xl text-center">Welcome Back</CardTitle>
        <CardDescription className="text-center">Sign in to access the {school.name}'s Academic Management System</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@school.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={isVisble ? 'text' : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button onClick={() => setIsVisible(!isVisble)} type="button" className=" absolute right-2 top-2">
                {isVisble ? <EyeClosed /> : <Eye />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </Button>

          <Separator />

          <p className="text-sm text-center">Don't have an account? <Link className="underline text-blue-700 ml-3 " href={'/auth/signup'}>Sign Up</Link></p>

        </form>
      </CardContent>
    </Card>
  )
}
