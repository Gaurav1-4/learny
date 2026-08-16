import { google, calendar_v3 } from "googleapis";

export interface AcademicCalendarPayload {
  id?: string;
  title: string;
  courseName?: string;
  description?: string;
  date: string; // "YYYY-MM-DD"
  time?: string; // "11:59 PM" or "01:30 PM"
  type?: "homework" | "study" | "exam" | "class";
}

export class GoogleCalendarClient {
  private calendar: calendar_v3.Calendar;

  constructor(accessToken: string) {
    if (!accessToken) {
      throw new Error("No Google OAuth access token provided. Please sign in again.");
    }
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({ access_token: accessToken });
    this.calendar = google.calendar({ version: "v3", auth: oauth2Client });
  }

  /**
   * Parses human time string (e.g. "01:30 PM", "11:59 PM") and returns ISO start and end strings in Asia/Kolkata
   */
  private parseEventTimes(dateStr: string, timeStr?: string, durationMinutes: number = 60) {
    const defaultTime = timeStr || "11:59 PM";
    const [timePart, modifier] = defaultTime.trim().split(/\s+/);
    let [hours, minutes] = (timePart || "12:00").split(":").map(Number);

    if (modifier?.toUpperCase() === "PM" && hours < 12) hours += 12;
    if (modifier?.toUpperCase() === "AM" && hours === 12) hours = 0;

    const pad = (n: number) => String(n).padStart(2, "0");
    const startTimeIso = `${dateStr}T${pad(hours)}:${pad(minutes || 0)}:00+05:30`;

    // Calculate end time
    const startDate = new Date(`${dateStr}T${pad(hours)}:${pad(minutes || 0)}:00+05:30`);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60 * 1000);
    const endHours = endDate.getHours();
    const endMins = endDate.getMinutes();
    const endTimeIso = `${dateStr}T${pad(endHours)}:${pad(endMins)}:00+05:30`;

    return { start: startTimeIso, end: endTimeIso };
  }

  /**
   * Inserts an academic homework deadline or focus prep session into Google Calendar
   */
  async insertAcademicEvent(event: AcademicCalendarPayload) {
    const isDeadline = event.type === "homework" || event.type === "exam";
    const duration = isDeadline ? 30 : 90; // 30 min deadline vs 90 min study block
    const { start, end } = this.parseEventTimes(event.date, event.time, duration);

    const colorId = isDeadline ? "11" : "9"; // 11 = Flamingo (Deadline), 9 = Blueberry (Study)

    const response = await this.calendar.events.insert({
      calendarId: "primary",
      requestBody: {
        summary: event.title,
        description: `${event.description || ""}\n\n📚 Synced automatically via Learny Academic Workspace`,
        start: {
          dateTime: start,
          timeZone: "Asia/Kolkata",
        },
        end: {
          dateTime: end,
          timeZone: "Asia/Kolkata",
        },
        colorId,
        reminders: {
          useDefault: false,
          overrides: [
            { method: "popup", minutes: 30 },
            { method: "popup", minutes: 10 },
          ],
        },
        extendedProperties: {
          private: {
            source: "learny-app",
            learnyEventId: event.id || `learny-${Date.now()}`,
            courseName: event.courseName || "",
          },
        },
      },
    });

    return response.data;
  }

  /**
   * Batch syncs all custom calendar events to primary Google Calendar
   */
  async syncBatch(events: AcademicCalendarPayload[]) {
    const results = [];
    for (const evt of events) {
      try {
        const res = await this.insertAcademicEvent(evt);
        results.push({ id: evt.id, success: true, googleEventId: res.id, link: res.htmlLink });
      } catch (err: any) {
        console.warn(`Failed to insert Google Calendar event "${evt.title}":`, err?.message);
        results.push({ id: evt.id, success: false, error: err?.message });
      }
    }
    return results;
  }
}
