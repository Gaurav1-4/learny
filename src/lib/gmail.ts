import { google } from "googleapis";

export interface AcademicNotice {
  id: string;
  sender: string;
  senderName: string;
  subject: string;
  snippet: string;
  date: string;
  category: "Room Change" | "Surprise Quiz Alert" | "Deadline Extension" | "Class Cancellation" | "New Lecture Notes" | "General Academic Notice";
  urgency: "Urgent" | "High" | "Normal";
  subjectCode: "Math III" | "OS" | "AP" | "DPP" | "RMSSD" | "General";
  actionableSummary: string;
}

export class GmailClient {
  private auth: any;

  constructor(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    this.auth = oauth2Client;
  }

  async getAcademicNotices(): Promise<AcademicNotice[]> {
    try {
      const gmail = google.gmail({ version: "v1", auth: this.auth });

      // Query academic keywords
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 15,
        q: "quiz OR test OR exam OR \"room change\" OR \"rescheduled\" OR cancelled OR assignment OR deadline OR tutorial OR lecture OR slides OR iiitd",
      });

      const messages = response.data.messages || [];
      const notices: AcademicNotice[] = [];

      for (const msg of messages.slice(0, 8)) {
        if (!msg.id) continue;
        try {
          const detail = await gmail.users.messages.get({
            userId: "me",
            id: msg.id,
            format: "metadata",
            metadataHeaders: ["From", "Subject", "Date"],
          });

          const headers = detail.data.payload?.headers || [];
          const fromHeader = headers.find((h) => h.name?.toLowerCase() === "from")?.value || "Professor / TA";
          const subjectHeader = headers.find((h) => h.name?.toLowerCase() === "subject")?.value || "Academic Notice";
          const dateHeader = headers.find((h) => h.name?.toLowerCase() === "date")?.value || new Date().toISOString();
          const snippet = detail.data.snippet || "";

          // Extract sender name from "Name <email@domain>"
          const senderNameMatch = fromHeader.match(/^([^<]+)/);
          const senderName = senderNameMatch ? senderNameMatch[1].trim().replace(/['"]/g, "") : fromHeader;

          // Classify Category, Urgency & Subject
          const lowerText = `${subjectHeader} ${snippet}`.toLowerCase();

          let category: AcademicNotice["category"] = "General Academic Notice";
          let urgency: AcademicNotice["urgency"] = "Normal";

          if (lowerText.includes("room") || lowerText.includes("shift") || lowerText.includes("venue") || lowerText.includes("rescheduled")) {
            category = "Room Change";
            urgency = "Urgent";
          } else if (lowerText.includes("quiz") || lowerText.includes("surprise") || lowerText.includes("pop quiz") || lowerText.includes("test")) {
            category = "Surprise Quiz Alert";
            urgency = "Urgent";
          } else if (lowerText.includes("deadline") || lowerText.includes("extended") || lowerText.includes("extension")) {
            category = "Deadline Extension";
            urgency = "High";
          } else if (lowerText.includes("cancel") || lowerText.includes("no class") || lowerText.includes("suspended")) {
            category = "Class Cancellation";
            urgency = "Urgent";
          } else if (lowerText.includes("slides") || lowerText.includes("notes") || lowerText.includes("material")) {
            category = "New Lecture Notes";
            urgency = "Normal";
          }

          let subjectCode: AcademicNotice["subjectCode"] = "General";
          if (lowerText.includes("math") || lowerText.includes("mth") || lowerText.includes("calculus")) {
            subjectCode = "Math III";
          } else if (lowerText.includes("os") || lowerText.includes("operating") || lowerText.includes("cse231")) {
            subjectCode = "OS";
          } else if (lowerText.includes("ap") || lowerText.includes("programming") || lowerText.includes("cse201") || lowerText.includes("java")) {
            subjectCode = "AP";
          } else if (lowerText.includes("dpp") || lowerText.includes("design") || lowerText.includes("des201")) {
            subjectCode = "DPP";
          } else if (lowerText.includes("rmssd") || lowerText.includes("ssh201") || lowerText.includes("research")) {
            subjectCode = "RMSSD";
          }

          notices.push({
            id: msg.id,
            sender: fromHeader,
            senderName,
            subject: subjectHeader,
            snippet,
            date: dateHeader,
            category,
            urgency,
            subjectCode,
            actionableSummary: snippet.slice(0, 180),
          });
        } catch (e) {
          console.error("Error reading message details:", e);
        }
      }

      return notices;
    } catch (error) {
      console.error("Error in GmailClient.getAcademicNotices:", error);
      throw error;
    }
  }
}
