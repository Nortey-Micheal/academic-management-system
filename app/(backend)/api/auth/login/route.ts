import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connectToDB } from "@/lib/db/mongodb";
import { User } from "@/app/(backend)/models/user/userSchema";

const JWT_SECRET = process.env.JWT_TOKEN as string;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    await connectToDB();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json({ message: "Invalid Login Credentials" }, { status: 404 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid Login Credentials" },
        { status: 400 }
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Create response object
    const res = NextResponse.json({
      message: "Login successful",
      token,
      user: {
        ...user._doc,
        password: undefined,
      },
    });

    // Attach cookie
    res.cookies.set({
      name: "token",
      value: token,
      httpOnly: true,
      // path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { message: "Server error", error: err.message },
      { status: 500 }
    );
  }
}
