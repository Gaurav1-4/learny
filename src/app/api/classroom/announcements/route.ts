import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleClassroomClient } from "@/lib/classroom";
import { UserSession } from "@/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = (await auth()) as UserSession | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json({ announcements: allAnnouncements });
  } catch (error: any) {
    console.error("API error fetching aggregated announcements:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch announcements" },
      { status: 500 }
    );
  }
}
