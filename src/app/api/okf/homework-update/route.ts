import { NextResponse } from "next/server";
import { OKFRegistry } from "@/lib/okf-indexer";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lectureId, rawHomeworkInput } = body;

    if (!lectureId || !rawHomeworkInput) {
      return NextResponse.json(
        { error: "Missing required lectureId or rawHomeworkInput" },
        { status: 400 }
      );
    }

    const updatedDoc = OKFRegistry.updateLectureHomework(lectureId, rawHomeworkInput);

    return NextResponse.json({
      success: true,
      message: `OKF metadata dynamically updated for ${lectureId}!`,
      document: updatedDoc,
    });
  } catch (error: any) {
    console.error("OKF update error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update OKF homework" },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const courseCode = searchParams.get("courseCode") || undefined;
  const lectureNumber = searchParams.get("lectureNumber") ? parseInt(searchParams.get("lectureNumber")!, 10) : undefined;
  const query = searchParams.get("q") || undefined;

  const results = OKFRegistry.query({ courseCode, lectureNumber, query });
  return NextResponse.json({ results });
}
