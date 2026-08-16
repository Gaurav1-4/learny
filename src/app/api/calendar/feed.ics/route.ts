import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { TIMETABLE_CLASSES } from "@/lib/timetable-data";

export const dynamic = "force-dynamic";

const DAY_RRULE_MAP: Record<string, { byDay: string; offsetDays: number }> = {
  Monday: { byDay: "MO", offsetDays: 0 },
  Tuesday: { byDay: "TU", offsetDays: 1 },
  Wednesday: { byDay: "WE", offsetDays: 2 },
  Thursday: { byDay: "TH", offsetDays: 3 },
  Friday: { byDay: "FR", offsetDays: 4 },
};

function formatLocalIcs(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());
  return `${year}${month}${day}T${hours}${minutes}${seconds}`;
}

function parseTimeToLocalDate(baseMondayDateStr: string, offsetDays: number, timeStr: string): Date {
  const [hours, mins] = timeStr.split(":").map(Number);
  const base = new Date(`${baseMondayDateStr}T00:00:00+05:30`);
  base.setDate(base.getDate() + offsetDays);
  base.setHours(hours, mins || 0, 0, 0);
  return base;
}

export async function GET() {
  try {
    const DATA_DIR = path.join(process.cwd(), ".data");
    const CLOUD_STORE_FILE = path.join(DATA_DIR, "student-cloud-state.json");

    let cloudCustomEvents: any[] = [];
    let backlogHwMap: Record<string, any> = {};

    if (fs.existsSync(CLOUD_STORE_FILE)) {
      try {
        const raw = fs.readFileSync(CLOUD_STORE_FILE, "utf8");
        const parsed = JSON.parse(raw);
        cloudCustomEvents = parsed.calendarEvents || [];
        backlogHwMap = parsed.backlogHomeworkMap || {};
      } catch {}
    }

    // Base semester reference Monday: Aug 10, 2026
    const baseMondayStr = "2026-08-10";

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

    // 1. RECURRING WEEKLY TIMETABLE CLASSES (Monsoon 2026)
    TIMETABLE_CLASSES.forEach((slot) => {
      const dayInfo = DAY_RRULE_MAP[slot.day] || { byDay: "MO", offsetDays: 0 };
      const startDt = parseTimeToLocalDate(baseMondayStr, dayInfo.offsetDays, slot.startTime);
      const endDt = parseTimeToLocalDate(baseMondayStr, dayInfo.offsetDays, slot.endTime);

      const uid = `class-${slot.id}@learny.zorx.tech`;
      const isTest = slot.isTest || slot.type === "Test";

      icsLines.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${formatLocalIcs(new Date())}Z`,
        `DTSTART;TZID=Asia/Kolkata:${formatLocalIcs(startDt)}`,
        `DTEND;TZID=Asia/Kolkata:${formatLocalIcs(endDt)}`,
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

    // 2. LOGGED HOMEWORK & AI-SCHEDULED FOCUS SESSIONS
    Object.keys(backlogHwMap).forEach((lecId) => {
      const hw = backlogHwMap[lecId];
      if (!hw || !hw.rawInput || !hw.rawInput.trim()) return;

      const dueDateStr = (hw.dueDate || "2026-08-18").split("T")[0];
      const dueStart = new Date(`${dueDateStr}T23:59:00+05:30`);
      const dueEnd = new Date(`${dueDateStr}T23:59:59+05:30`);

      icsLines.push(
        "BEGIN:VEVENT",
        `UID:hw-${lecId}-${Date.now()}@learny.zorx.tech`,
        `DTSTAMP:${formatLocalIcs(new Date())}Z`,
        `DTSTART;TZID=Asia/Kolkata:${formatLocalIcs(dueStart)}`,
        `DTEND;TZID=Asia/Kolkata:${formatLocalIcs(dueEnd)}`,
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

    // 3. CUSTOM CALENDAR EVENTS
    cloudCustomEvents.forEach((evt, idx) => {
      const dateStr = evt.date || "2026-08-18";
      const timeStr = evt.time || "11:59 PM";

      const [timePart, modifier] = timeStr.trim().split(/\s+/);
      let [hours, minutes] = (timePart || "12:00").split(":").map(Number);
      if (modifier?.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (modifier?.toUpperCase() === "AM" && hours === 12) hours = 0;

      const pad = (n: number) => String(n).padStart(2, "0");
      const startDt = new Date(`${dateStr}T${pad(hours)}:${pad(minutes || 0)}:00+05:30`);
      const endDt = new Date(startDt.getTime() + 60 * 60 * 1000);

      icsLines.push(
        "BEGIN:VEVENT",
        `UID:custom-${evt.id || idx}@learny.zorx.tech`,
        `DTSTAMP:${formatLocalIcs(new Date())}Z`,
        `DTSTART;TZID=Asia/Kolkata:${formatLocalIcs(startDt)}`,
        `DTEND;TZID=Asia/Kolkata:${formatLocalIcs(endDt)}`,
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
