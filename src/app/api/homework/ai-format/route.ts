import { NextResponse } from "next/server";
import { geminiPool } from "@/lib/gemini-pool";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { rawInput, courseCode, courseName } = await request.json();

    if (!rawInput || !rawInput.trim()) {
      return NextResponse.json({ error: "No homework text provided" }, { status: 400 });
    }

    const isMath =
      (courseCode || "").toLowerCase().includes("mth") ||
      (courseName || "").toLowerCase().includes("math") ||
      (courseName || "").toLowerCase().includes("calculus");

    const systemPrompt = `You are an expert university professor and assignment formatting engine for IIIT Delhi.
Given a student's raw typed homework input, parse it into structured homework items with accurate titles, topics, and methods of work.

Course Context: ${courseName || "Academic Course"} (${courseCode || "CSE"})
${
  isMath
    ? "Prescribed Textbook: Thomas' Calculus - 11th Edition (George B. Thomas, Maurice D. Weir, Joel Hass). Scope: Chapters 12–16 (Multivariable Calculus, Partial Derivatives, Multiple Integrals, Vector Calculus)."
    : "Subject Domain: Computer Science / Engineering / Design. Do NOT generate complex integrals or math formulas unless the student explicitly entered mathematical equations."
}

Return ONLY a valid JSON object matching this schema:
{
  "summary": "Clear, concise 1-line summary of what the student typed",
  "problems": [
    {
      "id": "item-identifier",
      "exercise": "Assignment / Exercise / Question label",
      "qNum": 1,
      "isMandatory": true,
      "title": "Clear descriptive title derived directly from what the student typed",
      "latex": "KaTeX LaTeX string ONLY if mathematical, otherwise simple formatted text or definition",
      "topic": "Specific course topic",
      "difficulty": "Easy" | "Medium" | "Hard",
      "methodOfWork": "Clear 2-sentence explanation of how to complete this task / solve this problem."
    }
  ],
  "similarPractice": [],
  "okfMarkdown": "OKF formatted markdown block for Google Drive storage"
}`;

    const userPrompt = `Parse and format this homework assignment for ${courseCode || "Course"}:
"${rawInput}"`;

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

  segments.forEach((seg, idx) => {
    const tokens = seg.split(/\s+/);
    if (tokens.length === 0) return;

    const first = tokens[0];
    const rest = tokens.slice(1).join(" ");

    if (isMath && /^\d+\.\d+$/.test(first)) {
      // Thomas Calculus section format e.g. 14.2 3 5
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
      // Computer Science, Design, or general assignments
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
    similarPractice: [],
    okfMarkdown: `# OKF Homework Manifest: ${courseCode}\nAssignment: ${rawInput}\nDate: ${new Date().toISOString()}`,
  };
}
