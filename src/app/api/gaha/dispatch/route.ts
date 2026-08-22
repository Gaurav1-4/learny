import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { askGAHA } from "@/lib/gaha-engine";
import { geminiPool } from "@/lib/gemini-pool";
import { UserSession } from "@/types";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const session = (await auth()) as UserSession | null;
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { prompt, context } = body;

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    const gahaResult = await askGAHA({
      userPrompt: prompt,
      currentContext: context,
    });

    const poolStatus = geminiPool.getPoolStatus();

    return NextResponse.json({
      success: true,
      data: gahaResult,
      pool: poolStatus,
    });
  } catch (error: any) {
    console.error("GAHA Dispatch API Error:", error);
    return NextResponse.json(
      { error: error?.message || "GAHA intelligence processing failed" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const poolStatus = geminiPool.getPoolStatus();
    return NextResponse.json({
      manager: "GAHA (Gaurav's Academic & Homework Assistant)",
      status: "ONLINE",
      pool: poolStatus,
      totalCapacity: `${poolStatus.totalKeys * 1500} requests/day`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to query GAHA pool status" }, { status: 500 });
  }
}
