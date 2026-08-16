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
    const announcements = await client.getAnnouncements(courseId);
    return NextResponse.json(announcements);
  } catch (error: any) {
    console.error("API error fetching announcements:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch announcements" }, { status: 500 });
  }
}
