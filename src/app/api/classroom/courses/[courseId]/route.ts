import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleClassroomClient } from "@/lib/classroom";
import { UserSession } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = (await auth()) as UserSession | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized. Please sign in with your Google account." }, { status: 401 });
  }

  const courseId = (await params).courseId;

  try {
    const client = new GoogleClassroomClient(session.accessToken);
    const course = await client.getCourse(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    return NextResponse.json({ course });
  } catch (error: any) {
    console.error("API error fetching single course:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch course" }, { status: 500 });
  }
}
