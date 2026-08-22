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
  const cacheKey = `coursework:${userEmail}:${courseId}`;

  const cached = apiCache.get(cacheKey);
  if (cached) {
    return NextResponse.json(cached, {
      headers: {
        "Cache-Control": "private, max-age=120, stale-while-revalidate=300",
        "X-Cache-Status": "HIT",
      },
    });
  }

  try {
    const client = new GoogleClassroomClient(session.accessToken);
    const coursework = await client.getCoursework(courseId);
    apiCache.set(cacheKey, coursework, 120);

    return NextResponse.json(coursework, {
      headers: {
        "Cache-Control": "private, max-age=120, stale-while-revalidate=300",
        "X-Cache-Status": "MISS",
      },
    });
  } catch (error: any) {
    console.error("API error fetching coursework:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch coursework" }, { status: 500 });
  }
}
