import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GmailClient } from "@/lib/gmail";
import { EmailFilterAgent, FilteredAcademicNotice, DEFAULT_STUDENT_PROFILE } from "@/lib/email-filter-agent";

export const dynamic = "force-dynamic";

// In-memory feedback store (also persisted in client localStorage)
let feedbackMemory: { subject: string; userMarkedAs: "relevant" | "spam" }[] = [];

export async function GET(request: Request) {
  const session = await auth();
  const { searchParams } = new URL(request.url);
  const includeFiltered = searchParams.get("all") === "true";

  let rawList: Array<{
    id: string;
    sender: string;
    senderName: string;
    subject: string;
    snippet: string;
    date: string;
  }> = [];

  // If live Gmail session exists, query live messages
  if (session && (session as any).accessToken) {
    try {
      const client = new GmailClient((session as any).accessToken);
      const liveNotices = await client.getAcademicNotices();
      if (liveNotices && liveNotices.length > 0) {
        rawList = liveNotices.map((n) => ({
          id: n.id,
          sender: n.sender,
          senderName: n.senderName,
          subject: n.subject,
          snippet: n.snippet,
          date: n.date,
        }));
      }
    } catch (e: any) {
      console.warn("Live Gmail query warning:", e?.message);
    }
  }

  // Analyze through Gemini 9-Key Email Filter Agent
  const analyzedNotices: FilteredAcademicNotice[] = await Promise.all(
    rawList.map((msg) =>
      EmailFilterAgent.analyzeEmail(msg, DEFAULT_STUDENT_PROFILE, feedbackMemory)
    )
  );

  // Return only relevant notices by default (or all if specified)
  const finalNotices = includeFiltered
    ? analyzedNotices
    : analyzedNotices.filter((n) => n.isRelevant);

  return NextResponse.json({
    notices: finalNotices,
    totalRawScanned: rawList.length,
    relevantCount: finalNotices.length,
    filteredOutCount: rawList.length - finalNotices.length,
  });
}

// User Feedback Endpoint (Mark as Relevant / Mark as Spam)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { subject, feedback } = body; // feedback: "relevant" | "spam"

    if (subject && (feedback === "relevant" || feedback === "spam")) {
      feedbackMemory = feedbackMemory.filter((f) => f.subject !== subject);
      feedbackMemory.push({ subject, userMarkedAs: feedback });
      // Keep last 30 feedback items in memory
      if (feedbackMemory.length > 30) {
        feedbackMemory = feedbackMemory.slice(-30);
      }
      return NextResponse.json({ success: true, memorySize: feedbackMemory.length });
    }

    return NextResponse.json({ error: "Invalid feedback payload" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
