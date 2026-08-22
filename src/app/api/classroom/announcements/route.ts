import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleClassroomClient } from "@/lib/classroom";
import { apiCache } from "@/lib/api-cache";
import { UserSession } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = (await auth()) as UserSession | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const fresh = searchParams.get("fresh") === "true";
  const userEmail = session.user?.email || "default";
  const cacheKey = `announcements:${userEmail}`;

  if (!fresh) {
    const cached = apiCache.get(cacheKey);
    if (cached) {
      return NextResponse.json({ announcements: cached }, {
        headers: {
          "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
          "X-Cache-Status": "HIT",
        },
      });
    }
  }

  try {
    const client = new GoogleClassroomClient(session.accessToken);
    const courses = await client.getCourses();
    const activeCourses = courses.filter((c) => c.courseState === "ACTIVE");

    const allAnnouncements: any[] = [];

    await Promise.all(
      activeCourses.map(async (course) => {
        try {
          const anns = await client.getAnnouncements(course.id);
          anns.forEach((a) => {
            allAnnouncements.push({
              ...a,
              courseName: course.name,
              courseCode: course.section || course.name.split(" ")[0] || "COURSE",
            });
          });
        } catch (e) {
          // ignore single course failure
        }
      })
    );

    // Sort newest first
    allAnnouncements.sort((a, b) => {
      const timeA = new Date(a.creationTime || a.updateTime || 0).getTime();
      const timeB = new Date(b.creationTime || b.updateTime || 0).getTime();
      return timeB - timeA;
    });

    // Cache for 90 seconds
    apiCache.set(cacheKey, allAnnouncements, 90);

    return NextResponse.json({ announcements: allAnnouncements }, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=120",
        "X-Cache-Status": "MISS",
      },
    });
  } catch (error: any) {
    console.error("API error fetching aggregated announcements:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}
