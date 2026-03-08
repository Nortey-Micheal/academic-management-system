'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { UserRole } from './generated/prisma/enums'

export interface CurrentUser {
  id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
}

interface AuthContextType {
  currentUser: CurrentUser | null
  login: (user: CurrentUser) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Load user from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('currentUser')
    if (stored) {
      try {
        setCurrentUser(JSON.parse(stored))
      } catch (e) {
        console.error('Failed to parse stored user:', e)
      }
    }
    setIsLoading(false)
  }, [])

  const login = (user: CurrentUser) => {
    setCurrentUser(user)
    localStorage.setItem('currentUser', JSON.stringify(user))
  }

  const logout = () => {
    setCurrentUser(null)
    localStorage.removeItem('currentUser')
  }

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    // throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Authorization helper functions
export function canEditStaff(role: UserRole): boolean {
  return role === 'ADMIN' || role === 'HEADTEACHER'
}

export function canViewStaff(role: UserRole): boolean {
  return true // All authenticated users can view staff
}
