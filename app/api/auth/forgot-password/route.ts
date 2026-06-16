import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    await connectToDatabase();

    const user = await User.findOne({ email });
    if (!user) {
      // Security best practice: Don't reveal if an email exists or not
      return NextResponse.json({ message: "If that email exists, a reset link was generated." }, { status: 200 });
    }

    // 1. Generate a random secure token
    const resetToken = crypto.randomBytes(32).toString("hex");
    
    // 2. Set expiration to 1 hour from now
    const resetTokenExpiry = new Date(Date.now() + 3600000); 

    // 3. Save the token to the user in MongoDB
    user.resetToken = resetToken;
    user.resetTokenExpiry = resetTokenExpiry;
    await user.save();

    // 4. Generate the reset link
    // Vercel provides the host URL automatically, otherwise fallback to localhost
    const baseUrl = process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000';
    const resetLink = `${baseUrl}/?reset=${resetToken}`;

    // Normally, you would use Nodemailer or Resend here to email 'resetLink' to 'user.email'
    // For this implementation, we will pass it back to the client so you can copy-paste it to test!
    console.log("PASSWORD RESET LINK GENERATED:", resetLink);

    return NextResponse.json({ 
      message: "Success", 
      devLink: resetLink // Removing this in a real production environment!
    }, { status: 200 });

  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json({ message: "An error occurred." }, { status: 500 });
  }
}