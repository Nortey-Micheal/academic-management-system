import { type NextRequest, NextResponse } from "next/server"
// import { getDb } from "@/lib/mongodb"
import { verifyPassword, createToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    // const db = await getDb()
    // const user = await db.collection("users").findOne({ email })

    // if (!user) {
    //   return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    // }

    // const isValid = await verifyPassword(password, user.password)

    // if (!isValid) {
    //   return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    // }

    // const token = await createToken({
    //   _id: user._id.toString(),
    //   email: user.email,
    //   name: user.name,
    //   role: user.role,
    //   createdAt: user.createdAt,
    // })

    const cookieStore = await cookies()
    // cookieStore.set("auth-token", token, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production",
    //   sameSite: "lax",
    //   maxAge: 60 * 60 * 24 * 7, // 7 days
    // })

    return NextResponse.json({
      user: {
        // _id: user._id.toString(),
        // email: user.email,
        // name: user.name,
        // role: user.role,
      },
    })
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
