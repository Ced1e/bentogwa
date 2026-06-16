import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();
    await connectToDatabase();

    // 1. Find user with this specific token that hasn't expired yet
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json({ message: "Invalid or expired reset link." }, { status: 400 });
    }

    // 2. Hash the new password securely
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 3. Update user and scrub the temporary tokens from the database
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json({ message: "Password reset successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}