import { NextResponse } from "next/server";
import { GahaScheduler } from "@/lib/gaha-scheduler";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get("type");
    const type = typeParam === "NIGHT" ? "NIGHT" : "MORNING";

    const briefing = await GahaScheduler.generateDailyBriefing(type);

    return NextResponse.json({
      success: true,
      briefing,
    });
  } catch (error: any) {
    console.error("API error in briefing route:", error);
    return NextResponse.json({ error: error?.message || "Failed to generate briefing" }, { status: 500 });
  }
}
