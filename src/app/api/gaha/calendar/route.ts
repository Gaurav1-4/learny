import { NextResponse } from "next/server";
import { getAcademicDateInfo, getUpcomingMilestones, ACADEMIC_MILESTONES_2026 } from "@/lib/academic-calendar-engine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get("date");
    const targetDate = dateParam ? new Date(dateParam) : new Date();

    const dateInfo = getAcademicDateInfo(targetDate);
    const upcomingMilestones = getUpcomingMilestones(8);

    return NextResponse.json({
      success: true,
      current: dateInfo,
      upcomingMilestones,
      allMilestones: ACADEMIC_MILESTONES_2026,
    });
  } catch (error: any) {
    console.error("API error in calendar route:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch academic calendar" }, { status: 500 });
  }
}
