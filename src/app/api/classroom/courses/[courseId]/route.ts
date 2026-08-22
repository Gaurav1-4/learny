import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleClassroomClient } from "@/lib/classroom";
import { apiCache } from "@/lib/api-cache";
import { UserSession } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const session = (await auth()) as UserSession | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized. Please sign in with your Google account." }, { status: 401 });
  }

  const courseId = (await params).courseId;
  const userEmail = session.user?.email || "default";
  const cacheKey = `course:${userEmail}:${courseId}`;

  const cached = apiCache.get(cacheKey);
  if (cached) {
    return NextResponse.json({ course: cached }, {
      headers: {
        "Cache-Control": "private, max-age=120, stale-while-revalidate=300",
        "X-Cache-Status": "HIT",
      },
    });
  }

  try {
    const client = new GoogleClassroomClient(session.accessToken);
    const course = await client.getCourse(courseId);
    if (!course) {
      return NextResponse.json({ error: "Course not found" }, { status: 404 });
    }
    
    apiCache.set(cacheKey, course, 180);

    return NextResponse.json({ course }, {
      headers: {
        "Cache-Control": "private, max-age=120, stale-while-revalidate=300",
        "X-Cache-Status": "MISS",
      },
    });
  } catch (error: any) {
    console.error("API error fetching single course:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch course" }, { status: 500 });
  }
}
