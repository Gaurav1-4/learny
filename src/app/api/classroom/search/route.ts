import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleClassroomClient } from "@/lib/classroom";
import { UserSession } from "@/types";

export async function GET(request: NextRequest) {
  const session = (await auth()) as UserSession | null;
  if (!session?.accessToken) {
    return NextResponse.json({ error: "Unauthorized. Please sign in with your Google account." }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const q = searchParams.get("q");

  if (!q) {
    return NextResponse.json({ error: "Search query 'q' is required" }, { status: 400 });
  }

  const query = q.toLowerCase();
  const results = [];

  try {
    const client = new GoogleClassroomClient(session.accessToken);
    // Search both active and archived courses
    const courses = await client.getAllCourses();

    for (const course of courses) {
      try {
        const [coursework, announcements] = await Promise.all([
          client.getCoursework(course.id),
          client.getAnnouncements(course.id),
        ]);

        const matchingCoursework = coursework.filter(
          (cw) =>
            cw.title?.toLowerCase().includes(query) ||
            cw.description?.toLowerCase().includes(query)
        );

        const matchingAnnouncements = announcements.filter(
          (ann) => ann.text?.toLowerCase().includes(query)
        );

        if (
          matchingCoursework.length > 0 ||
          matchingAnnouncements.length > 0 ||
          course.name?.toLowerCase().includes(query) ||
          course.section?.toLowerCase().includes(query)
        ) {
          results.push({
            course: {
              id: course.id,
              name: course.name,
              section: course.section,
              courseState: course.courseState,
            },
            coursework: matchingCoursework,
            announcements: matchingAnnouncements,
          });
        }
      } catch (err) {
        console.error(`Error searching course ${course.id}:`, err);
      }
    }

    return NextResponse.json(results);
  } catch (error: any) {
    console.error("API error during search:", error);
    return NextResponse.json({ error: error.message || "Failed to search" }, { status: 500 });
  }
}
