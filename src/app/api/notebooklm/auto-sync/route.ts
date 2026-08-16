import { NextResponse } from "next/server";
import { NotebookLMClient } from "@/lib/notebooklm-client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { courseName, courseCode, markdownContent, sessionCookies } = body;

    if (!courseName || !markdownContent) {
      return NextResponse.json(
        { error: "Missing required courseName or markdownContent" },
        { status: 400 }
      );
    }

    const client = new NotebookLMClient(sessionCookies);
    const result = await client.autoSyncCourse({
      courseName,
      courseCode,
      markdownContent,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("NotebookLM auto-sync error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to auto-sync to NotebookLM" },
      { status: 500 }
    );
  }
}
