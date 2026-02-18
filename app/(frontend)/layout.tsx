import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { redirect } from "next/navigation"
import ReduxProvider from "@/lib/store/provider"
import { Toaster } from "sonner"
import { useSelector } from "react-redux"
import { StoreState } from "@/lib/store"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "MOS Management System",
  description: "Comprehensive school management platform for student records, attendance, assessments, and reporting",
  icons: {
    icon: [
      {
        url: "/logo-dark.webp",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo-dark.webp",
        media: "(prefers-color-scheme: dark)",
      },
    ],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="en">
      <body className={`font-sans antialiased min-h-screen bg-background`}>
        <Toaster position="top-center" richColors/>
        <ReduxProvider>
          <div className="">{children}</div>
        </ReduxProvider>
      </body>
    </html>
  )
}
