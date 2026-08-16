import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { GmailClient, AcademicNotice } from "@/lib/gmail";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();

  // Fallback demo/sample notices for IIITD CSD Sem 3 if session token hasn't refreshed or on errors
  const fallbackNotices: AcademicNotice[] = [
    {
      id: "demo-gmail-1",
      sender: "ap-instructor@iiitd.ac.in",
      senderName: "Prof. AP Course Instructor",
      subject: "AP: Important Notice regarding Design Patterns & Class Preparation",
      snippet: "Please ensure all structural design patterns and SOLID principles are thoroughly revised before Tuesday's 3:00 PM lecture in Room C21. Rapid evaluation will be conducted.",
      date: new Date(Date.now() - 3600000 * 2).toISOString(),
      category: "Surprise Quiz Alert",
      urgency: "Urgent",
      subjectCode: "AP",
      actionableSummary: "Revise SOLID & Structural patterns. Rapid evaluation anticipated in Room C21.",
    },
    {
      id: "demo-gmail-2",
      sender: "mth201-ta@iiitd.ac.in",
      senderName: "Math III Head TA",
      subject: "MTH201: Tutorial Sheet 3 & Tuesday Graded Test Logistics",
      snippet: "Tutorial Sheet 3 problem solutions have been uploaded to Classroom. The graded tutorial test will take place on Tuesday at 1:30 PM sharp in the designated tutorial rooms.",
      date: new Date(Date.now() - 3600000 * 5).toISOString(),
      category: "Surprise Quiz Alert",
      urgency: "Urgent",
      subjectCode: "Math III",
      actionableSummary: "Tutorial Sheet 3 solutions posted. Graded test on Tuesday 1:30 PM sharp.",
    },
    {
      id: "demo-gmail-3",
      sender: "os-ta@iiitd.ac.in",
      senderName: "Operating Systems TA",
      subject: "OS Tutorial: Wednesday 8:30 AM Venue Reminder",
      snippet: "This is a reminder that the OS tutorial on Wednesday at 8:30 AM will be held in Room C101. Please bring your synchronization problem sheets.",
      date: new Date(Date.now() - 3600000 * 12).toISOString(),
      category: "Room Change",
      urgency: "High",
      subjectCode: "OS",
      actionableSummary: "Wednesday 8:30 AM tutorial venue confirmed in Room C101.",
    },
  ];

  if (!session || !(session as any).accessToken) {
    return NextResponse.json({
      notices: fallbackNotices,
      source: "demo",
    });
  }

  try {
    const accessToken = (session as any).accessToken;
    const client = new GmailClient(accessToken);
    const liveNotices = await client.getAcademicNotices();

    if (liveNotices.length > 0) {
      return NextResponse.json({
        notices: liveNotices,
        source: "live",
      });
    }

    return NextResponse.json({
      notices: fallbackNotices,
      source: "demo",
    });
  } catch (error: any) {
    console.warn("Gmail API query warning (returning academic fallback):", error?.message);
    return NextResponse.json({
      notices: fallbackNotices,
      source: "demo",
    });
  }
}
