import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { TIMETABLE_CLASSES } from "@/lib/timetable-data";
import { getStudentCloudStateServer } from "@/lib/firebase/server-sync";

export const dynamic = "force-dynamic";

const DAY_RRULE_MAP: Record<string, { byDay: string; offsetDays: number }> = {
  Monday: { byDay: "MO", offsetDays: 0 },
  Tuesday: { byDay: "TU", offsetDays: 1 },
  Wednesday: { byDay: "WE", offsetDays: 2 },
  Thursday: { byDay: "TH", offsetDays: 3 },
  Friday: { byDay: "FR", offsetDays: 4 },
};

function formatIsoToIcsDate(dateStr: string, timeStr: string): string {
  const [year, month, day] = dateStr.split("-");
  const [hours, mins] = timeStr.split(":").map(Number);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${year}${month}${day}T${pad(hours)}${pad(mins || 0)}00`;
}

export async function GET() {
  try {
    const DATA_DIR = path.join(process.cwd(), ".data");
    const CLOUD_STORE_FILE = path.join(DATA_DIR, "student-cloud-state.json");

    let cloudCustomEvents: any[] = [];
    let backlogHwMap: Record<string, any> = {};

    // 1. Read from local cache if present
    if (fs.existsSync(CLOUD_STORE_FILE)) {
      try {
        const raw = fs.readFileSync(CLOUD_STORE_FILE, "utf8");
        const parsed = JSON.parse(raw);
        cloudCustomEvents = parsed.calendarEvents || [];
        backlogHwMap = parsed.backlogHomeworkMap || {};
      } catch {}
    }

    // 2. Fetch directly from Firebase Firestore Cloud Database
    try {
      const firestoreData = await getStudentCloudStateServer("default_student");
      if (firestoreData) {
        if (firestoreData.backlogHomeworkMap) {
          backlogHwMap = { ...backlogHwMap, ...firestoreData.backlogHomeworkMap };
        }
        if (Array.isArray(firestoreData.calendarEvents) && firestoreData.calendarEvents.length > 0) {
          const eventMap = new Map<string, any>();
          cloudCustomEvents.forEach((e) => eventMap.set(e.id, e));
          firestoreData.calendarEvents.forEach((e: any) => eventMap.set(e.id, e));
          cloudCustomEvents = Array.from(eventMap.values());
        }
      }
    } catch {}

    const pad = (n: number) => String(n).padStart(2, "0");
    const nowUtc = new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    const icsLines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Learny//IIIT Delhi Academic Schedule//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Learny Academic Schedule",
      "X-WR-TIMEZONE:Asia/Kolkata",
      "X-WR-CALDESC:IIIT Delhi Monsoon 2026 Academic Schedule, Classes, Tests & Homework",
      "BEGIN:VTIMEZONE",
      "TZID:Asia/Kolkata",
      "TZURL:http://tzurl.org/zoneinfo-outlook/Asia/Kolkata",
      "X-LIC-LOCATION:Asia/Kolkata",
      "BEGIN:STANDARD",
      "TZOFFSETFROM:+0530",
      "TZOFFSETTO:+0530",
      "TZNAME:IST",
      "DTSTART:19700101T000000",
      "END:STANDARD",
      "END:VTIMEZONE",
    ];

    // IIIT Delhi campus Apple Maps address & GPS coordinates
    const IIITD_LOCATION = "IIIT Delhi, Okhla Industrial Estate, Phase III, Near Govind Puri Metro Station, New Delhi, Delhi 110020, India";
    const IIITD_GEO = "28.5459;77.2732";

    // 1. RECURRING WEEKLY TIMETABLE CLASSES (Monsoon 2026 starting Monday Aug 10)
    TIMETABLE_CLASSES.forEach((slot) => {
      const dayInfo = DAY_RRULE_MAP[slot.day] || { byDay: "MO", offsetDays: 0 };
      const startDayNum = 10 + dayInfo.offsetDays;
      const [startH, startM] = slot.startTime.split(":").map(Number);
      const [endH, endM] = slot.endTime.split(":").map(Number);

      const startIcs = `202608${pad(startDayNum)}T${pad(startH)}${pad(startM || 0)}00`;
      const endIcs = `202608${pad(startDayNum)}T${pad(endH)}${pad(endM || 0)}00`;

      const uid = `class-${slot.id}@learny.zorx.tech`;
      const isTest = slot.isTest || slot.type === "Test";

      icsLines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${nowUtc}`,
        `DTSTART;TZID=Asia/Kolkata:${startIcs}`,
        `DTEND;TZID=Asia/Kolkata:${endIcs}`,
        `RRULE:FREQ=WEEKLY;BYDAY=${dayInfo.byDay};UNTIL=20261215T235959Z`,
        `SUMMARY:${isTest ? "🔥 " : ""}${slot.code}: ${slot.subject} (${slot.type})`,
        `LOCATION:Room ${slot.room}, ${IIITD_LOCATION}`,
        `GEO:${IIITD_GEO}`,
        `DESCRIPTION:${slot.notes || slot.subject}\\nRoom: ${slot.room}\\nCampus: IIIT Delhi (Monsoon 2026)`,
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        "TRIGGER:-PT15M",
        "ACTION:DISPLAY",
        `DESCRIPTION:Reminder: ${slot.code} in Room ${slot.room} starts in 15 minutes`,
        "END:VALARM",
        "END:VEVENT"
      );
    });

    // 2. LOGGED HOMEWORK & AI-SCHEDULED FOCUS SESSIONS (From Backlog & Live entries)
    Object.keys(backlogHwMap).forEach((lecId) => {
      const hw = backlogHwMap[lecId];
      if (!hw || !hw.rawInput || !hw.rawInput.trim()) return;

      const dueDateStr = (hw.dueDate || "2026-08-18").split("T")[0];
      const startIcs = `${dueDateStr.replace(/-/g, "")}T235900`;
      const endIcs = `${dueDateStr.replace(/-/g, "")}T235959`;

      icsLines.push(
        "BEGIN:VEVENT",
        `UID:hw-${lecId}-${Date.now()}@learny.zorx.tech`,
        `DTSTAMP:${nowUtc}`,
        `DTSTART;TZID=Asia/Kolkata:${startIcs}`,
        `DTEND;TZID=Asia/Kolkata:${endIcs}`,
        `SUMMARY:📝 ${hw.courseCode || "Course"} Homework: ${hw.summary || hw.rawInput}`,
        `LOCATION:Room ${hw.room || "C201"}, ${IIITD_LOCATION}`,
        `GEO:${IIITD_GEO}`,
        `DESCRIPTION:Assignment: ${hw.rawInput}\\nCourse: ${hw.courseName || hw.courseCode || ""}\\nStatus: Logged via Learny`,
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        "TRIGGER:-PT3H",
        "ACTION:DISPLAY",
        `DESCRIPTION:Homework Due Today: ${hw.summary || hw.rawInput}`,
        "END:VALARM",
        "END:VEVENT"
      );
    });

    // 3. CUSTOM CALENDAR EVENTS & STUDY SESSIONS
    cloudCustomEvents.forEach((evt, idx) => {
      const dateStr = evt.date || "2026-08-18";
      const timeStr = evt.time || "11:59 PM";

      const [timePart, modifier] = timeStr.trim().split(/\s+/);
      let [hours, minutes] = (timePart || "12:00").split(":").map(Number);
      if (modifier?.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (modifier?.toUpperCase() === "AM" && hours === 12) hours = 0;

      const startIcs = `${dateStr.replace(/-/g, "")}T${pad(hours)}${pad(minutes || 0)}00`;
      const endIcs = `${dateStr.replace(/-/g, "")}T${pad(Math.min(23, hours + 1))}${pad(minutes || 0)}00`;

      icsLines.push(
        "BEGIN:VEVENT",
        `UID:custom-${evt.id || idx}@learny.zorx.tech`,
        `DTSTAMP:${nowUtc}`,
        `DTSTART;TZID=Asia/Kolkata:${startIcs}`,
        `DTEND;TZID=Asia/Kolkata:${endIcs}`,
        `SUMMARY:${evt.title}`,
        `LOCATION:${IIITD_LOCATION}`,
        `GEO:${IIITD_GEO}`,
        `DESCRIPTION:${(evt.description || "").replace(/\n/g, "\\n")}`,
        "STATUS:CONFIRMED",
        "BEGIN:VALARM",
        "TRIGGER:-PT30M",
        "ACTION:DISPLAY",
        `DESCRIPTION:Upcoming: ${evt.title}`,
        "END:VALARM",
        "END:VEVENT"
      );
    });

    icsLines.push("END:VCALENDAR");

    return new NextResponse(icsLines.join("\r\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'inline; filename="learny-academic-schedule.ics"',
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    });
  } catch (error: any) {
    console.error("Error generating iCal feed:", error);
    return new NextResponse("Error generating calendar feed", { status: 500 });
  }
}
