import { NextResponse } from "next/server";
import { geminiPool } from "@/lib/gemini-pool";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { rawInput, courseCode, courseName, currentDay, classEndTime, room } = await request.json();

    if (!rawInput || !rawInput.trim()) {
      return NextResponse.json({ error: "No homework text provided" }, { status: 400 });
    }

    const isMath =
      (courseCode || "").toLowerCase().includes("mth") ||
      (courseName || "").toLowerCase().includes("math") ||
      (courseName || "").toLowerCase().includes("calculus");

    const todayDateStr = new Date().toISOString().split("T")[0];

    const systemPrompt = `You are an expert university academic advisor, STEM professor, and intelligent calendar scheduler for IIIT Delhi.
Your task is to analyze a student's raw typed homework input after a class, format it with authentic precision, and use intelligent timetable reasoning to schedule both the assignment deadline AND optimal prep study blocks.

=== STUDENT'S AUTHENTIC TIMETABLE & EVALUATION SCHEDULE (MONSOON 2026) ===
- Monday:
  * 11:00 AM – 12:30 PM: DES201 DPP (Design Processes & Perspectives, Room A106)
  * 03:00 PM – 04:30 PM: CSE231 OS (Operating Systems, Room C201)
- Tuesday:
  * 11:00 AM – 12:30 PM: SSH201 RMSSD (Research Methods, Room C11)
  * 01:30 PM – 03:00 PM: MTH201/MTH203 Math III (🔥 WEEKLY GRADED TUTORIAL TEST in Tutorial Room)
  * 03:00 PM – 04:30 PM: CSE201 AP (Advanced Programming, Room C21 - pop quizzes)
  * 04:30 PM – 06:00 PM: MTH201 Math III Lecture (Room C201)
- Wednesday:
  * 08:30 AM – 09:30 AM: CSE231 OS Tutorial (Room C101 - problem solving drills)
  * 02:00 PM – 03:00 PM: CSE201 AP Tutorial (Tutorial Room - Java code review)
  * 03:00 PM – 04:30 PM: CSE231 OS Lecture (Room C201)
- Thursday:
  * 09:30 AM – 11:00 AM: SSH201 RMSSD Lab (Room C01 - statistical R assignments)
  * 11:00 AM – 12:30 PM: DES201 DPP Lecture (Room A106)
  * 03:00 PM – 04:30 PM: CSE201 AP Lecture (Room C21)
  * 04:30 PM – 06:00 PM: MTH201 Math III Lecture (Room C102)
- Friday:
  * 11:00 AM – 12:30 PM: SSH201 RMSSD Lecture (Room C11)
  * 02:00 PM – 04:30 PM: DES201 DPP Practice Session (Room A106 - studio critique)

=== COURSE CONTEXT ===
Course: ${courseName || "Academic Course"} (${courseCode || "CSE"})
Current Reference Date: ${todayDateStr}
${
  isMath
    ? "Prescribed Textbook: Thomas' Calculus - 11th Edition (George B. Thomas, Maurice D. Weir, Joel Hass). Scope: Chapters 12–16 (Multivariable Limits, Partial Derivatives, Multiple Integrals, Vector Integration / Green's & Stokes' Theorems)."
    : "Subject Domain: Computer Science / Engineering / Design. Do NOT output mathematical formulas unless the student explicitly entered math equations."
}

=== INTELLIGENT SCHEDULING RULES ===
1. Analyze when the professor will check this homework or when the student has a graded test/lab evaluation for this course.
   - For Math III: Align submission / test prep before Tuesday 1:30 PM (Weekly Graded Tutorial Test).
   - For OS: Align lab submissions before Wednesday 2:00 PM or Friday.
   - For AP: Align before Wednesday 2:00 PM AP Tutorial or next lecture.
   - For DPP / RMSSD: Align with next Studio / Lab critique.
2. Schedule a "smartPrepBlock" (optimal 1-2 hour study session) in the student's calendar BEFORE the deadline.

Return ONLY a valid JSON object matching this schema:
{
  "summary": "Clear concise 1-line summary of what the student typed",
  "problems": [
    {
      "id": "unique-id",
      "exercise": "Section or Task label",
      "qNum": 1,
      "isMandatory": true,
      "title": "Clear descriptive title derived directly from what was typed",
      "latex": "KaTeX LaTeX string if math/calculus, otherwise simple text",
      "topic": "Specific course topic",
      "difficulty": "Easy" | "Medium" | "Hard",
      "methodOfWork": "Clear 2-sentence method explaining how to solve/complete this."
    }
  ],
  "smartSchedule": {
    "dueDate": "YYYY-MM-DD (calculated based on next checking slot/test)",
    "dueTime": "HH:MM (e.g. 01:30 PM or 11:59 PM)",
    "dueReason": "Reason for deadline (e.g. 'Math III Graded Tutorial Test in Tutorial Room')",
    "prepBlock": {
      "date": "YYYY-MM-DD",
      "time": "07:00 PM – 08:30 PM",
      "title": "Course Prep & Practice Session",
      "description": "Recommended focus session before deadline"
    }
  },
  "okfMarkdown": "OKF formatted markdown block for Google Drive storage"
}`;

    const userPrompt = `Student typed the following homework after ${courseCode || "class"}:
"${rawInput}"

Process this homework with authentic precision, align it with the student's evaluation schedule, and calculate the optimal deadline and prep block.`;

    const rawResponse = await geminiPool.generateContent({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
      temperature: 0.2,
    });

    const jsonMatch = rawResponse.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("Could not parse JSON response from Gemini");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    return NextResponse.json({
      success: true,
      data: parsed,
    });
  } catch (error: any) {
    console.error("AI Homework formatting error:", error);

    const body = await request.json().catch(() => ({ rawInput: "" }));
    const rawInput = body.rawInput || "";
    const courseCode = body.courseCode || "CSE";
    const courseName = body.courseName || "Course";

    const fallbackProblems = parseDeterministicHomework(rawInput, courseCode, courseName);

    return NextResponse.json({
      success: true,
      data: fallbackProblems,
      fallback: true,
    });
  }
}

function parseDeterministicHomework(rawInput: string, courseCode: string = "CSE", courseName: string = "Course") {
  const isMath =
    courseCode.toLowerCase().includes("mth") ||
    courseName.toLowerCase().includes("math") ||
    courseName.toLowerCase().includes("calculus");

  const segments = rawInput.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  const problems: any[] = [];

  // Calculate default deadline: 3 days ahead
  const defaultDueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const prepDate = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  segments.forEach((seg, idx) => {
    const tokens = seg.split(/\s+/);
    if (tokens.length === 0) return;

    const first = tokens[0];

    if (isMath && /^\d+\.\d+$/.test(first)) {
      const qNums = tokens.slice(1).map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));
      const questions = qNums.length > 0 ? qNums : [1];

      questions.forEach((q) => {
        problems.push({
          id: `thomas-${first}-${q}`,
          exercise: `Section ${first}`,
          qNum: q,
          isMandatory: true,
          title: `Thomas' Calculus 11th Ed — Section ${first}, Question ${q}`,
          latex: `\\text{Thomas' Calculus 11th Ed: Section } ${first}, \\text{ Question } ${q}`,
          topic: `Multivariable Calculus (Chapter ${first.split(".")[0]})`,
          difficulty: "Medium",
          methodOfWork: `Solve Problem ${q} in Section ${first} following standard multivariable methods from Thomas' Calculus 11th Edition.`,
        });
      });
    } else {
      problems.push({
        id: `task-${idx + 1}`,
        exercise: `Task ${idx + 1}`,
        qNum: idx + 1,
        isMandatory: true,
        title: seg,
        latex: `\\text{${courseCode} Assignment: } \\text{${seg.replace(/[^a-zA-Z0-9\s_-]/g, "")}}`,
        topic: `${courseName} Practice`,
        difficulty: "Medium",
        methodOfWork: `Complete ${seg} as instructed by the course professor.`,
      });
    }
  });

  return {
    summary: rawInput ? `Assigned: ${rawInput}` : "No homework assigned",
    problems,
    smartSchedule: {
      dueDate: defaultDueDate,
      dueTime: isMath ? "01:30 PM" : "11:59 PM",
      dueReason: isMath ? "Math III Weekly Graded Tutorial Test" : `${courseName} Class Evaluation`,
      prepBlock: {
        date: prepDate,
        time: "07:00 PM – 08:30 PM",
        title: `${courseCode} Focus Prep Session`,
        description: `Study block to complete ${rawInput}`,
      },
    },
    okfMarkdown: `# OKF Homework Manifest: ${courseCode}\nAssignment: ${rawInput}\nDate: ${new Date().toISOString()}`,
  };
}
