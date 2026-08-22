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
  const cacheKey = `coursework:${userEmail}:${states.join(",")}`;

  if (!fresh) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ coursework: cached }, {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
          "X-Cache-Status": "HIT",
        },
      });
    }
  }

  try {
    const client = new GoogleClassroomClient(session.accessToken);
    const coursework = await client.getAllCoursework(states);

    // Cache for 90 seconds
    apiCache.set(cacheKey, coursework, 90);

    return NextResponse.json({ coursework }, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        "X-Cache-Status": "MISS",
      },
    });
  } catch (error: any) {
    console.error("API error fetching aggregated coursework:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch coursework" }, { status: 500 });
  }
}
