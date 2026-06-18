import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import connectToDatabase from "@/lib/mongodb";
import Semester from "@/models/Semester";
import { z } from "zod";

// ==========================================
// STRICT ZOD SCHEMAS (THE BOUNCER)
// ==========================================
const SubjectSchema = z.object({
  name: z.string().max(60, "Subject name is too long").optional().default(""),
  // coerce.number() automatically safely converts strings to numbers, and rejects text
  grade: z.coerce.number().min(0).max(100).optional().default(0), 
  units: z.coerce.number().min(0).max(50).optional().default(0)
});

const SemesterSchema = z.object({
  name: z.string().max(50, "Semester name is too long").optional().default("New Semester"),
  subjects: z.array(SubjectSchema).max(40, "Too many subjects in a single semester")
});

const SyncPayloadSchema = z.object({
  semestersData: z.array(SemesterSchema).max(20, "Maximum of 20 semesters allowed per account")
});

// Helper function to extract user session safely on the backend
async function getUserIdFromSession() {
  const session = await getServerSession();
  if (!session?.user?.email) return null;
  return session.user.email;
}

// ==========================================
// 1. GET: Fetch all semesters for the logged-in user
// ==========================================
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
    console.error("GET Semesters Error:", error);
    return NextResponse.json({ message: "Failed to fetch data." }, { status: 500 });
  }
}

// ==========================================
// 2. POST: Save a new semester or update an entire dataset batch
// ==========================================
export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const email = await getUserIdFromSession();
    
    if (!email) {
      return NextResponse.json({ message: "Unauthorized access." }, { status: 401 });
    }

    // Safely parse the raw body text
    const rawBody = await req.json();

    // The Bouncer: Validate the raw body against our strict Zod rules
    // If it fails, Zod throws an error and jumps straight to the catch block
    const safeData = SyncPayloadSchema.parse(rawBody);

    // To prevent data corruption, perform an atomic overwrite/upsert
    // First, clear previous entries for this clean cloud state sync
    await Semester.deleteMany({ userEmail: email });

    // Insert the fresh, mathematically validated structured rows
    const formattedData = safeData.semestersData.map((sem) => ({
      userEmail: email,
      semesterName: sem.name,
      subjects: sem.subjects.map((sub) => ({
        name: sub.name,
        grade: sub.grade,
        units: sub.units
      }))
    }));

    // Only interact with MongoDB using safely formatted data
    await Semester.insertMany(formattedData);

    return NextResponse.json({ message: "Data synced with cloud vault successfully." }, { status: 200 });
    
  } catch (error) {
    console.error("POST Semesters Error:", error);
    
    // Check if the error is a Zod validation failure
    if (error instanceof z.ZodError) {
      // Changed from error.errors to error.issues
      return NextResponse.json({ message: "Invalid data format.", errors: error.issues }, { status: 400 });
    }
    
    return NextResponse.json({ message: "Failed to sync database records." }, { status: 500 });
  }
}