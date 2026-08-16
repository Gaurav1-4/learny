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

  // Base raw notices for IIITD CSD 3rd Semester
  const rawAcademicMessages = [
    {
      id: "iiitd-notice-1",
      sender: "ap-instructor@iiitd.ac.in",
      senderName: "Prof. CSE201 Instructor",
      subject: "CSE201: Notice regarding Structural Design Patterns & Tuesday Session",
      snippet: "Please note that Tuesday's 3:00 PM lecture in Room C21 will feature a live code design challenge on SOLID principles. Attendance and active participation are mandatory.",
      date: new Date(Date.now() - 3600000 * 2).toISOString(),
    },
    {
      id: "iiitd-notice-2",
      sender: "mth201-ta@iiitd.ac.in",
      senderName: "Math III Head TA",
      subject: "MTH201: Tuesday 1:30 PM Graded Tutorial Test Guidelines",
      snippet: "Tutorial Sheet 3 problems on Green's theorem and surface integrals will be tested this Tuesday at 1:30 PM in the tutorial room. Calculators are allowed.",
      date: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: "iiitd-notice-3",
      sender: "os-admin@iiitd.ac.in",
      senderName: "Operating Systems TA",
      subject: "CSE231: OS Tutorial Venue Shift for Wednesday 8:30 AM",
      snippet: "Due to projector maintenance in C101, Wednesday's 8:30 AM OS tutorial is shifted to Room C102. Please be seated by 8:25 AM.",
      date: new Date(Date.now() - 3600000 * 8).toISOString(),
    },
    {
      id: "iiitd-notice-4-spam",
      sender: "pg-coordinator@iiitd.ac.in",
      senderName: "M.Tech CSE Coordinator",
      subject: "M.Tech 2nd Year: Thesis Submission Deadline and Defense Timelines",
      snippet: "All 2nd year M.Tech thesis drafts must be submitted to the academic office by Friday 5 PM. Late submissions will face grade penalties.",
      date: new Date(Date.now() - 3600000 * 10).toISOString(),
    },
    {
      id: "iiitd-notice-5-spam",
      sender: "placement-cell@iiitd.ac.in",
      senderName: "IIITD Placement Cell",
      subject: "Final Year B.Tech: Phase 2 Placement Drive Registration",
      snippet: "Registration link for 4th year B.Tech students for Phase 2 company interviews is now active on the portal.",
      date: new Date(Date.now() - 3600000 * 14).toISOString(),
    },
  ];

  let rawList = rawAcademicMessages;

  // If live Gmail session exists, query live messages
  if (session && (session as any).accessToken) {
    try {
      const client = new GmailClient((session as any).accessToken);
      const liveNotices = await client.getAcademicNotices();
      if (liveNotices.length > 0) {
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
      console.warn("Live Gmail query warning, using academic feed:", e?.message);
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
