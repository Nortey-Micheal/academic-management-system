"use client"

import { useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  GraduationCap,
  Users,
  ClipboardCheck,
  FileText,
  BarChart3,
  Calendar,
  UserCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import type { User } from "@/lib/auth"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useLogout } from "@/hooks/useLogout"

interface DashboardNavProps {
  user: User
}

const navItems = [
  { href: "/dashboard", icon: BarChart3, label: "Dashboard" },
  { href: "/students", icon: Users, label: "Students" },
  { href: "/classes", icon: Users, label: "Classes" },
  { href: "/attendance", icon: ClipboardCheck, label: "Attendance" },
  { href: "/assessments", icon: FileText, label: "Assessments" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/timetable", icon: Calendar, label: "Timetable" },
]

export function DashboardNav({ user }: DashboardNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const pathname = usePathname()
  const { logout } = useLogout()

  const handleLogout = async () => {
    setLoading(true)
    logout()
  }

  return (
    <>
      {/* Mobile menu button */}
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
          "fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
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
          <p>Logged in as {user.role}</p>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
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
          <div className="pt-4 mt-4 border-t border-sidebar-border">
            <button className="w-full flex items-center gap-3 px-4 py-2 text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Mobile overlay */}
      {isOpen && <div className="fixed inset-0 z-40 bg-black/50 md:hidden" onClick={() => setIsOpen(false)} />}
    </>
  )
}
