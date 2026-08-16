import { geminiPool } from "./gemini-pool";

export interface StudentProfile {
  name: string;
  institute: string;
  branch: string;
  semester: number;
  enrolledCourses: { code: string; name: string }[];
  positionsOfResponsibility: string[];
}

export const DEFAULT_STUDENT_PROFILE: StudentProfile = {
  name: "Gaurav",
  institute: "IIIT Delhi (Indraprastha Institute of Information Technology Delhi)",
  branch: "B.Tech Computer Science & Design (CSD)",
  semester: 3,
  enrolledCourses: [
    { code: "DES201", name: "DPP 2026: Design Processes & Perspectives" },
    { code: "CSE231", name: "Operating Systems (OS)" },
    { code: "CSE201", name: "Advanced Programming (AP / OOP)" },
    { code: "MTH201", name: "Math III (Applied Mathematics III)" },
    { code: "SSH201", name: "RMSSD (Research Methods in Social Sciences & Design)" },
  ],
  positionsOfResponsibility: [
    "Design Lead / Student Representative",
    "IIITD CSD 2024-2028 Cohort Member",
  ],
};

export interface FilteredAcademicNotice {
  id: string;
  sender: string;
  senderName: string;
  subject: string;
  snippet: string;
  date: string;
  isRelevant: boolean;
  relevanceScore: number;
  relevanceReason: string;
  category: "Room Change" | "Surprise Quiz Alert" | "Deadline Extension" | "Class Cancellation" | "New Lecture Notes" | "POR / Club Notice" | "General Academic Notice";
  urgency: "Urgent" | "High" | "Normal";
  subjectCode: "Math III" | "OS" | "AP" | "DPP" | "RMSSD" | "POR" | "General";
  actionableSummary: string;
  userFeedback?: "relevant" | "spam";
  scheduleUpdate?: {
    actionType: "ROOM_CHANGE" | "RESCHEDULE" | "CANCEL" | "DEADLINE";
    courseCode: string;
    newRoom?: string;
    newTime?: string;
    date?: string;
    summary: string;
  };
}

export class EmailFilterAgent {
  public static async analyzeEmail(
    email: { id: string; sender: string; senderName: string; subject: string; snippet: string; date: string },
    profile: StudentProfile = DEFAULT_STUDENT_PROFILE,
    feedbackMemory: { subject: string; userMarkedAs: "relevant" | "spam" }[] = []
  ): Promise<FilteredAcademicNotice> {
    const memoryContext = feedbackMemory.length > 0
      ? `User Prior Feedback Memory:\n${feedbackMemory.map((m) => `- "${m.subject}" -> Marked as ${m.userMarkedAs}`).join("\n")}`
      : "";

    const prompt = `
You are the personal AI Academic Chief of Staff for a student at IIIT Delhi.
Analyze the following college email and determine if it is strictly relevant to this specific student.

Student Profile:
- Name: ${profile.name}
- Institute: ${profile.institute}
- Branch: ${profile.branch} (Semester ${profile.semester})
- Enrolled Courses: ${profile.enrolledCourses.map((c) => `${c.code}: ${c.name}`).join(", ")}
- Positions of Responsibility (POR): ${profile.positionsOfResponsibility.join(", ")}

${memoryContext}

Email Received:
- From: ${email.senderName} <${email.sender}>
- Subject: ${email.subject}
- Date: ${email.date}
- Content Snippet: ${email.snippet}

Evaluate:
1. Is this email directly relevant to the student's enrolled 3rd semester CSD courses or POR? (If it is for 4th year, M.Tech, unrelated branches, or general non-actionable campus spam, set isRelevant=false).
2. Category: "Room Change" | "Surprise Quiz Alert" | "Deadline Extension" | "Class Cancellation" | "New Lecture Notes" | "POR / Club Notice" | "General Academic Notice"
3. Urgency: "Urgent" | "High" | "Normal"
4. Subject Code: "Math III" | "OS" | "AP" | "DPP" | "RMSSD" | "POR" | "General"
5. If it announces a room change, rescheduled slot, or cancelled class, extract the scheduleUpdate object.

Output strictly valid JSON with this format:
{
  "isRelevant": boolean,
  "relevanceScore": number,
  "relevanceReason": "short explanation why it matters or doesn't matter to this student",
  "category": "Room Change",
  "urgency": "Urgent",
  "subjectCode": "OS",
  "actionableSummary": "concise 1-sentence action item",
  "scheduleUpdate": {
    "actionType": "ROOM_CHANGE" | "RESCHEDULE" | "CANCEL" | "DEADLINE",
    "courseCode": "OS",
    "newRoom": "C102",
    "newTime": "8:30 AM",
    "summary": "OS Tutorial moved to Room C102"
  }
}
`;

    try {
      const responseText = await geminiPool.generateContent({
        prompt,
        temperature: 0.1,
      });

      // Parse JSON from response (strip any markdown code fences if present)
      const cleanJson = responseText.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleanJson);

      return {
        id: email.id,
        sender: email.sender,
        senderName: email.senderName,
        subject: email.subject,
        snippet: email.snippet,
        date: email.date,
        isRelevant: parsed.isRelevant ?? true,
        relevanceScore: parsed.relevanceScore ?? (parsed.isRelevant ? 90 : 20),
        relevanceReason: parsed.relevanceReason || "Directly relevant to your semester timetable.",
        category: parsed.category || "General Academic Notice",
        urgency: parsed.urgency || "Normal",
        subjectCode: parsed.subjectCode || "General",
        actionableSummary: parsed.actionableSummary || email.snippet.slice(0, 150),
        scheduleUpdate: parsed.scheduleUpdate || undefined,
      };
    } catch (err) {
      console.warn("AI Email Filter fallback for message:", email.id, err);

      // Graceful rule-based heuristic fallback
      const lower = `${email.subject} ${email.snippet}`.toLowerCase();
      const isRelevant = lower.includes("mth201") || lower.includes("cse231") || lower.includes("cse201") || lower.includes("des201") || lower.includes("ssh201") || lower.includes("csd") || lower.includes("math") || lower.includes("operating") || lower.includes("ap");

      return {
        id: email.id,
        sender: email.sender,
        senderName: email.senderName,
        subject: email.subject,
        snippet: email.snippet,
        date: email.date,
        isRelevant,
        relevanceScore: isRelevant ? 85 : 30,
        relevanceReason: isRelevant ? "Matched course code in email content." : "General campus notice.",
        category: lower.includes("room") ? "Room Change" : lower.includes("quiz") ? "Surprise Quiz Alert" : "General Academic Notice",
        urgency: lower.includes("urgent") || lower.includes("room") || lower.includes("quiz") ? "Urgent" : "Normal",
        subjectCode: lower.includes("math") ? "Math III" : lower.includes("os") ? "OS" : lower.includes("ap") ? "AP" : "General",
        actionableSummary: email.snippet.slice(0, 150),
      };
    }
  }
}
