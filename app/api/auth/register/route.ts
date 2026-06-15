import { NextResponse } from "next/server";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    // 1. Grab the data from the frontend form
    const { name, email, password, course, university } = await req.json();

    // 2. Validate that the required fields aren't empty
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields." }, { status: 400 });
    }

    // 3. Connect to the database
    await connectToDatabase();

    // 4. Check if the user already exists to prevent duplicate accounts
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "An account with this email already exists." }, { status: 409 });
    }

    // 5. Scramble (Hash) the password for security
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Create the new user in MongoDB
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      course,
      university
    });

    return NextResponse.json({ message: "User registered successfully!" }, { status: 201 });

  } catch (error) {
    console.error("Registration Error:", error);
    return NextResponse.json({ message: "An error occurred during registration." }, { status: 500 });
  }
}