import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User"; // Using the User model we created earlier!

// Fetch the user's current profile data
export async function GET() {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const user = await User.findOne({ email: session.user.email });
    if (!user) return NextResponse.json({ message: "User not found" }, { status: 404 });

    return NextResponse.json({ 
      name: user.name, 
      course: user.course, 
      university: user.university 
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch profile." }, { status: 500 });
  }
}

// Update the user's profile data
export async function PUT(req: Request) {
  try {
    await connectToDatabase();
    const session = await getServerSession();
    if (!session?.user?.email) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const { name, course, university } = await req.json();

    await User.findOneAndUpdate(
      { email: session.user.email },
      { name, course, university },
      { new: true } // Returns the updated document
    );

    return NextResponse.json({ message: "Profile updated successfully." }, { status: 200 });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ message: "Failed to update profile." }, { status: 500 });
  }
}