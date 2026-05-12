// import { NextResponse } from "next/server";
// import crypto from "crypto";
// import { connectToDB } from "@/lib/db/mongodb";
// import { User } from "@/app/(backend)/models/user/userSchema";

// export async function POST(req: Request) {
//   try {
//     await connectToDB();

//     const { email } = await req.json();

//     if (!email) {
//       return NextResponse.json(
//         { message: "Email is required" },
//         { status: 400 }
//       );
//     }

//     // Find user
//     const user = await User.findOne({ email });
//     if (!user) {
//       return NextResponse.json(
//         { message: "No account found with this email" },
//         { status: 404 }
//       );
//     }

//     // Generate token
//     const resetToken = crypto.randomBytes(32).toString("hex");

//     // Hash token before saving (security best practice)
//     const hashedToken = crypto
//       .createHash("sha256")
//       .update(resetToken)
//       .digest("hex");

//     user.resetPasswordToken = hashedToken;
//     user.resetPasswordExpires = new Date(Date.now() + 1000 * 60 * 10); // 10 minutes
//     await user.save();

//     const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password/${resetToken}`;

//     return NextResponse.json(
//       {
//         message: "Password reset link generated",
//         resetUrl, // remove in production – email it instead
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("Forgot password error:", error);
//     return NextResponse.json(
//       { message: "Something went wrong" },
//       { status: 500 }
//     );
//   }
// }
