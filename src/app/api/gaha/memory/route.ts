import { NextResponse } from "next/server";
import { OKFMemoryEngine, INITIAL_OKF_STATE } from "@/lib/okf-memory-engine";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (query) {
      const results = OKFMemoryEngine.searchKnowledgeBase(query);
      return NextResponse.json({ success: true, results });
    }

    const state = OKFMemoryEngine.getMemoryState();
    return NextResponse.json({ success: true, memoryState: state });
  } catch (error: any) {
    console.error("API error in memory route:", error);
    return NextResponse.json({ error: error?.message || "Failed to fetch OKF memory" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { conceptId, deltaMastery, customState } = body;

    if (customState) {
      OKFMemoryEngine.saveMemoryState(customState);
      return NextResponse.json({ success: true, message: "OKF memory state updated successfully" });
    }

    if (conceptId && deltaMastery !== undefined) {
      const updated = OKFMemoryEngine.updateConceptMastery(conceptId, deltaMastery);
      return NextResponse.json({ success: true, concept: updated });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (error: any) {
    console.error("API error updating memory route:", error);
    return NextResponse.json({ error: error?.message || "Failed to update OKF memory" }, { status: 500 });
  }
}
