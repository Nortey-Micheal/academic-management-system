import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"
import { DashboardNav } from "@/components/dashboard-nav"
import { getSession } from "@/lib/auth"
import { redirect } from "next/navigation"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Academic Management System",
  description: "Comprehensive school management platform for student records, attendance, assessments, and reporting",
  generator: "v0.app",
  icons: {
    icon: [
      // {
      //   url: "/icon-light-32x32.png",
      //   media: "(prefers-color-scheme: light)",
      // },
      // {
      //   url: "/icon-dark-32x32.png",
      //   media: "(prefers-color-scheme: dark)",
      // },
      // {
      //   url: "/icon.svg",
      //   type: "image/svg+xml",
      // },
    ],
    apple: "/apple-icon.png",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  const session = await getSession()
  
  if (!session) {
    redirect("/")
  }

  return (
    <html lang="en">
      <body className={`font-sans antialiased min-h-screen bg-background`}>
        <div>
          <main className="">{children}</main>
        </div>
      </body>
    </html>
  )
}
