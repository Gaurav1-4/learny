import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GoogleCalendarClient, AcademicCalendarPayload } from "@/lib/google-calendar";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth();
    const accessToken = (session as any)?.accessToken;

    if (!accessToken) {
      return NextResponse.json(
        { error: "Not authenticated with Google. Please sign in to sync with Google Calendar." },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const events: AcademicCalendarPayload[] = body.events || [];

    if (!Array.isArray(events) || events.length === 0) {
      return NextResponse.json({ error: "No calendar events provided to sync" }, { status: 400 });
    }

    const client = new GoogleCalendarClient(accessToken);
    const results = await client.syncBatch(events);

    const successful = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${successful} events to your primary Google Calendar!`,
      syncedCount: successful,
      totalCount: events.length,
      results,
    });
  } catch (error: any) {
    console.error("Google Calendar sync error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to sync events to Google Calendar" },
      { status: 500 }
    );
  }
}
