import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const DATA_DIR = path.join(process.cwd(), ".data");
    const CLOUD_STORE_FILE = path.join(DATA_DIR, "student-cloud-state.json");

    let events: any[] = [];
    if (fs.existsSync(CLOUD_STORE_FILE)) {
      try {
        const raw = fs.readFileSync(CLOUD_STORE_FILE, "utf8");
        const parsed = JSON.parse(raw);
        events = parsed.calendarEvents || [];
      } catch {}
    }

    const pad = (n: number) => String(n).padStart(2, "0");
    const formatIcsDate = (dateStr: string, timeStr?: string) => {
      const defaultTime = timeStr || "11:59 PM";
      const [timePart, modifier] = defaultTime.trim().split(/\s+/);
      let [hours, minutes] = (timePart || "12:00").split(":").map(Number);
      if (modifier?.toUpperCase() === "PM" && hours < 12) hours += 12;
      if (modifier?.toUpperCase() === "AM" && hours === 12) hours = 0;

      const d = new Date(`${dateStr}T${pad(hours)}:${pad(minutes || 0)}:00+05:30`);
      return d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    let icsContent = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Learny//IIITD Academic Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "X-WR-CALNAME:Learny Academic Schedule",
      "X-WR-TIMEZONE:Asia/Kolkata",
    ];

    events.forEach((evt, idx) => {
      const start = formatIcsDate(evt.date, evt.time);
      const uid = `learny-${evt.id || idx}-${Date.now()}@learny.zorx.tech`;

      icsContent.push(
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").split(".")[0]}Z`,
        `DTSTART:${start}`,
        `SUMMARY:${evt.title}`,
        `DESCRIPTION:${(evt.description || "").replace(/\n/g, "\\n")}`,
        "STATUS:CONFIRMED",
        "END:VEVENT"
      );
    });

    icsContent.push("END:VCALENDAR");

    return new NextResponse(icsContent.join("\r\n"), {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": 'attachment; filename="learny-academic-schedule.ics"',
      },
    });
  } catch (error: any) {
    return new NextResponse("Error generating calendar feed", { status: 500 });
  }
}
