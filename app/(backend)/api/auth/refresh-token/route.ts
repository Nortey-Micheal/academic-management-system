import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    // Read refresh token from cookies
    const refreshToken = req.cookies.get("token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { message: "No refresh token provided" },
        { status: 401 }
      );
    }

    // Verify refresh token
    const user = jwt.verify(
      refreshToken,
      process.env.JWT_TOKEN!
    ) as { id: string; role: string };

    // Generate a new access token
    const newAccessToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_TOKEN!,
      { expiresIn: "7d" }
    );

    const isProduction = process.env.NODE_ENV === "production";

    const response = NextResponse.json(
      { message: "Access token refreshed" },
      { status: 200 }
    );

    // Set access token cookie
    response.cookies.set({
      name: "token",
      value: newAccessToken,
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? "none" : "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      ...(isProduction && { partitioned: true }), // Only allowed in secure mode
    });

    return response;
  } catch (error) {
    console.error("Refresh token error:", error);

    return NextResponse.json(
      { message: "Invalid or expired refresh token" },
      { status: 403 }
    );
  }
}