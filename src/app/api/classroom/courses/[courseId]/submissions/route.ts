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
    const submissions = await client.getStudentSubmissions(courseId);
    return NextResponse.json(submissions);
  } catch (error: any) {
    console.error("API error fetching submissions:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch submissions" }, { status: 500 });
  }
}
