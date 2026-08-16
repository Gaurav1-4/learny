import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleClassroomClient } from "@/lib/classroom";
import { UserSession } from "@/types";

export async function GET(request: NextRequest) {
  const session = (await auth()) as UserSession | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized. Please sign in with your Google account." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const stateParam = searchParams.get("state")?.toUpperCase() || "ACTIVE";

  let states = ["ACTIVE"];
  if (stateParam === "ARCHIVED") {
    states = ["ARCHIVED"];
  } else if (stateParam === "ALL") {
    states = ["ACTIVE", "ARCHIVED"];
  }

  try {
    const client = new GoogleClassroomClient(session.accessToken);
    const courses = await client.getCourses(states);
    return NextResponse.json(courses);
  } catch (error: any) {
    console.error("API error fetching Google Classroom courses:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch courses" }, { status: 500 });
  }
}
