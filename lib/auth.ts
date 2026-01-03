// import { getDb } from "./mongodb"
import bcrypt from "bcryptjs"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export type UserRole = "admin" | "teacher" | "academic_officer" | "headteacher"

export interface User {
  _id: string
  email: string
  name: string
  role: UserRole
  createdAt: Date
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// export async function createToken(user: User): Promise<string> {
//   return new SignJWT({ userId: user._id, role: user.role })
//     .setProtectedHeader({ alg: "HS256" })
//     .setIssuedAt()
//     .setExpirationTime("7d")
//     .sign(JWT_SECRET)
// }

// export async function verifyToken(token: string) {
//   try {
//     const verified = await jwtVerify(token, JWT_SECRET)
//     return verified.payload
//   } catch (err) {
//     return null
//   }
// }

export async function getSession() {
  // const cookieStore = await cookies()
  // const token = cookieStore.get("auth-token")

  // if (!token) {
  //   return null
  // }

  // const payload = await verifyToken(token.value)
  // if (!payload) {
  //   return null
  // }

  // const db = await getDb()
  // const user = await db.collection("users").findOne({ _id: payload.userId })

  // if (!user) {
  //   return null
  // }

  return {
    _id: "User101",
    email: "admin@school.com",
    name: "Nortey Michael",
    role: "teacher",
    createdAt: new Date(),
  } as User
}

export async function requireAuth(allowedRoles?: UserRole[]) {
  const session = await getSession()

  if (!session) {
    return null
  }

  if (allowedRoles && !allowedRoles.includes(session.role)) {
    return null
  }

  return session
}
