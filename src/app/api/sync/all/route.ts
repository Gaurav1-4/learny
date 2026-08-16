import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

const DATA_DIR = path.join(process.cwd(), ".data");
const CLOUD_STORE_FILE = path.join(DATA_DIR, "student-cloud-state.json");

function ensureStoreExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(CLOUD_STORE_FILE)) {
      fs.writeFileSync(CLOUD_STORE_FILE, JSON.stringify({}, null, 2), "utf8");
    }
  } catch (err) {
    console.warn("Could not create server sync data directory", err);
  }
}

function readCloudStore(): Record<string, any> {
  ensureStoreExists();
  try {
    const raw = fs.readFileSync(CLOUD_STORE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeCloudStore(data: Record<string, any>) {
  ensureStoreExists();
  try {
    fs.writeFileSync(CLOUD_STORE_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not write server sync store", err);
  }
}

// POST: Upload client state from any device (Desktop or Phone) to Cloud
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      backlogLoggedIds,
      backlogHomeworkMap,
      calendarEvents,
      courseProblemsMap,
    } = body;

    const store = readCloudStore();

    // Merge backlog logged IDs
    if (Array.isArray(backlogLoggedIds) && backlogLoggedIds.length > 0) {
      const existingIds = store.backlogLoggedIds || [];
      store.backlogLoggedIds = Array.from(new Set([...existingIds, ...backlogLoggedIds]));
    }

    // Merge individual backlog lecture homework
    if (backlogHomeworkMap && typeof backlogHomeworkMap === "object") {
      store.backlogHomeworkMap = {
        ...(store.backlogHomeworkMap || {}),
        ...backlogHomeworkMap,
      };
    }

    // Merge calendar custom events
    if (Array.isArray(calendarEvents) && calendarEvents.length > 0) {
      const existingEvents = store.calendarEvents || [];
      const eventMap = new Map<string, any>();
      existingEvents.forEach((e: any) => eventMap.set(e.id, e));
      calendarEvents.forEach((e: any) => eventMap.set(e.id, e));
      store.calendarEvents = Array.from(eventMap.values());
    }

    // Merge course problems
    if (courseProblemsMap && typeof courseProblemsMap === "object") {
      store.courseProblemsMap = {
        ...(store.courseProblemsMap || {}),
        ...courseProblemsMap,
      };
    }

    store.lastUpdated = new Date().toISOString();
    writeCloudStore(store);

    return NextResponse.json({
      success: true,
      message: "State successfully synced to cloud!",
      store,
    });
  } catch (error: any) {
    console.error("Cloud state upload error:", error);
    return NextResponse.json({ error: error?.message || "Sync failed" }, { status: 500 });
  }
}

// GET: Retrieve merged cloud state for any device
export async function GET() {
  const store = readCloudStore();
  return NextResponse.json({
    success: true,
    store,
  });
}
