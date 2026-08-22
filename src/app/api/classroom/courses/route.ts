import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleClassroomClient } from "@/lib/classroom";
import { apiCache } from "@/lib/api-cache";
import { UserSession } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = (await auth()) as UserSession | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized. Please sign in with your Google account." }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const stateParam = searchParams.get("state")?.toUpperCase() || "ACTIVE";
  const fresh = searchParams.get("fresh") === "true";

  let states = ["ACTIVE"];
  if (stateParam === "ARCHIVED") {
    states = ["ARCHIVED"];
  } else if (stateParam === "ALL") {
    states = ["ACTIVE", "ARCHIVED"];
  }

  const userEmail = session.user?.email || "default";
  const cacheKey = `courses:${userEmail}:${states.join(",")}`;

  if (!fresh) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
          "X-Cache-Status": "HIT",
        },
      });
    }
  }

  try {
    const client = new GoogleClassroomClient(session.accessToken);
    const courses = await client.getCourses(states);
    
    // Cache for 120 seconds
    apiCache.set(cacheKey, courses, 120);

    return NextResponse.json(courses, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        "X-Cache-Status": "MISS",
      },
    });
  } catch (error: any) {
    console.error("API error fetching Google Classroom courses:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch courses" }, { status: 500 });
  }
}
