import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

// Server-side persistent storage for student homework entries
const DATA_DIR = path.join(process.cwd(), ".data");
const STORE_FILE = path.join(DATA_DIR, "homework-ledger.json");

function ensureStoreExists() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORE_FILE)) {
      fs.writeFileSync(STORE_FILE, JSON.stringify({}, null, 2), "utf8");
    }
  } catch (err) {
    console.warn("Could not create server data directory", err);
  }
}

function readStore(): Record<string, any> {
  ensureStoreExists();
  try {
    const raw = fs.readFileSync(STORE_FILE, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeStore(data: Record<string, any>) {
  ensureStoreExists();
  try {
    fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.warn("Could not write server store", err);
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { lectureId, courseCode, courseName, rawInput, summary, problems, dueDate } = body;

    if (!lectureId) {
      return NextResponse.json({ error: "Missing lectureId" }, { status: 400 });
    }

    const store = readStore();
    store[lectureId] = {
      lectureId,
      courseCode,
      courseName,
      rawInput,
      summary,
      problems: problems || [],
      dueDate: dueDate || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    writeStore(store);

    return NextResponse.json({
      success: true,
      message: `Homework for ${lectureId} synced to server ledger!`,
      entry: store[lectureId],
    });
  } catch (error: any) {
    console.error("Failed to sync homework to server:", error);
    return NextResponse.json({ error: error?.message || "Sync failed" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const store = readStore();
  const { searchParams } = new URL(request.url);
  const lectureId = searchParams.get("lectureId");

  if (lectureId) {
    return NextResponse.json({ entry: store[lectureId] || null });
  }

  return NextResponse.json({ entries: store });
}
