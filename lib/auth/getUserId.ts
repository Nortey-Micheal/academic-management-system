import { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

interface JwtPayload {
  id: string
  firmId?: string
  role?: string
  iat?: number
  exp?: number
}

export function getUserFromRequest(request: NextRequest): JwtPayload | null {
  try {
    // ✅ READ TOKEN FROM COOKIE
    const token = request.cookies.get("token")?.value

    if (!token) return null

    const payload = jwt.verify(
      token,
      process.env.JWT_TOKEN!
    ) as JwtPayload

    return payload
  } catch (error) {
    console.error("JWT verification failed:", error)
    return null
  }
}

export function getUserId(request: NextRequest): string | null {
  return getUserFromRequest(request)?.id ?? null
}
