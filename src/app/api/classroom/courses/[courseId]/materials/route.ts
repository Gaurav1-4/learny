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
  const cacheKey = `materials:${userEmail}:${courseId}`;

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
    const materials = await client.getCourseWorkMaterials(courseId);
    apiCache.set(cacheKey, materials, 120);

    return NextResponse.json(materials, {
      headers: {
        "Cache-Control": "private, max-age=120, stale-while-revalidate=300",
        "X-Cache-Status": "MISS",
      },
    });
  } catch (error: any) {
    console.error("API error fetching course materials:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch materials" }, { status: 500 });
  }
}
