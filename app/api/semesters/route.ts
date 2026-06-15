import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import Semester from "@/models/Semester";

// Helper function to extract user session safely on the backend
async function getUserIdFromSession() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;
  return session.user.email;
}

// 1. GET: Fetch all semesters for the logged-in user
export async function GET() {
  try {
    await connectToDatabase();
    const email = await getUserIdFromSession();
    if (!email) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    // Find semesters belonging to this specific user profile, sorted by creation timeline
    const semesters = await Semester.find({ userEmail: email }).sort({ createdAt: -1 });
    return NextResponse.json(semesters, { status: 200 });
  } catch (error) {
    return NextResponse.json({ message: "Failed to fetch data." }, { status: 500 });
  }
}

// 2. POST: Save a new semester or update an entire dataset batch
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const email = await getUserIdFromSession();
    if (!email) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    const { semestersData } = await req.json();

    // To prevent data corruption, we perform an atomic overwrite/upsert for the user's data array
    // First, clear previous entries for this clean cloud state sync
    await Semester.deleteMany({ userEmail: email });

    // Insert the fresh, structured semester rows linked to the user's identity
    const formattedData = semestersData.map((sem: any) => ({
      userEmail: email,
      semesterName: sem.name,
      subjects: sem.subjects.map((sub: any) => ({
        name: sub.name,
        grade: Number(sub.grade),
        units: Number(sub.units)
      }))
    }));

    await Semester.insertMany(formattedData);

    return NextResponse.json({ message: "Data synced with cloud vault successfully." }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to sync database records." }, { status: 500 });
  }
}