import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { connectToDB } from "@/lib/db/mongodb";
import jwt from 'jsonwebtoken'
import { User } from "@/app/(backend)/models/user/userSchema";

const JWT_SECRET = process.env.JWT_TOKEN as string;

export async function POST(req: Request) {
  try {
    const { firstName, lastName, email, password, role } = await req.json();

    await connectToDB();

    const existing = await User.findOne({ email });

    if (existing) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      role
    });

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      message: "Login successful",
      token,
      user: {
        ...user._doc,
        password: undefined,
      },
    });

    // SET cookie on the response you return
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      // path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
      } catch (err: any) {
        return NextResponse.json(
          { message: "Server error", error: err.message },
          { status: 500 }
        );
      }
    }
