"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  Users,
  ClipboardCheck,
  FileText,
  Calendar,
  LogOut,
  X,
  Menu,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { User } from "@/lib/auth"
import { useLogout } from "@/hooks/useLogout"
import Image from "next/image"
import { Button } from "./ui/button"
import { useState } from "react"


interface DashboardNavProps {
  user: User
}

const navItems = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: BarChart3,
    roles: ["admin", "headteacher", "academic_officer", "teacher"],
  },
  {
    href: "/students",
    label: "Students",
    icon: Users,
    roles: ["admin", "headteacher", "academic_officer", "teacher"],
  },
  {
    href: "/classes",
    label: "Classes",
    icon: Users,
    roles: ["admin", "headteacher"],
  },
  {
    href: "/attendance",
    label: "Attendance",
    icon: ClipboardCheck,
    roles: ["admin", "headteacher", "academic_officer", "teacher"],
  },
  {
    href: "/assessments",
    label: "Assessments",
    icon: FileText,
    roles: ["admin", "headteacher", "academic_officer", "teacher"],
  },
  {
    href: "/reports",
    label: "Reports",
    icon: FileText,
    roles: ["admin", "headteacher", "academic_officer"],
  },
  {
    href: "/analytics",
    label: "Analytics",
    icon: BarChart3,
    roles: ["admin", "headteacher"],
  },
  {
    href: "/timetable",
    label: "Timetable",
    icon: Calendar,
    roles: ["admin", "headteacher", "academic_officer", "teacher"],
  },
]

export default function DashboardNav({ user }: DashboardNavProps) {
  const [isOpen, setIsOpen] = useState(false)

  const pathname = usePathname()
  const router = useRouter()
  const { logout } = useLogout()


  // 🔐 Input validation
  if (!user || !user.role) {
    return null
  }

  const allowedNavItems = navItems.filter((item) =>
    item.roles.includes(user.role)
  )

  const handleLogout = async () => {
    logout()
  }

  return (
    <>
      <div className="md:hidden sticky top-0 z-40 bg-blue-400/90 backdrop-blur-md text-primary-foreground p-2 flex items-center justify-between">
        <div className="flex items-center">
          <Image width={60} height={50} src={'/logo.webp'} alt="Mount Olives School Logo"/>
          <span className="font-semibold">Mount Olives School</span>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsOpen(!isOpen)} className="text-primary-foreground">
          {isOpen ? <X className="h-5 w-5" /> : <Menu style={{width: 30,height:30}} className="h-45 w-45" />}
        </Button>
      </div>
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform md:relative md:translate-x-0 flex flex-col justify-between",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div>
          <div className="hidden md:flex items-center h-16 px-3  text-primary font-bold text-lg">
            <Image width={60} height={50} src={'/logo.webp'} alt="Mount Olives School Logo"/>
            {/* <p>Mount Olive's School</p> */}
            <span className="font-semibold">Mount Olive's School</span>
          </div>
          <div className="md:hidden flex items-center h-16 px-3  text-primary font-bold text-">
            <Image width={40} height={30} src={'/logo.webp'} alt="Mount Olives School Logo"/>
            {/* <p>Mount Olive's School</p> */}
            <span className="font-semibold">Mount Olives School</span>
          </div>
          <div className="border-y p-4 text-sm text-slate-600">
            <span className="text-sm text-muted-foreground">
              {user.firstName} •{" "}
              <span className="capitalize">{user.role.replace("_", " ")}</span>
            </span>
          </div>
          <nav className="p-4 space-y-2">
            {allowedNavItems.map((item) => {
              const Icon = item.icon
              const isActive =
                pathname === item.href ||
                pathname.startsWith(item.href + "/")
              return (
                  <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-sm font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="p-4 w-full">
          <Button
            onClick={handleLogout}
            className="flex items-center w-full border-t-2 text-sm  hover:text-destructive transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  )
}
