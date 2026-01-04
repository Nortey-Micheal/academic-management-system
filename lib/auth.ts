// import { getDb } from "./mongodb"
import bcrypt from "bcryptjs"
import { useSelector } from "react-redux"
import { StoreState } from "./store"

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "your-secret-key-change-in-production")

export type UserRole = "admin" | "teacher" | "academic_officer" | "headteacher"

export interface User {
  _id: string
  email: string
  firstName: string
  lastName: string
  role: UserRole
  createdAt: Date
  status: ['active' | 'inactive']
  updatedAt: Date
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


