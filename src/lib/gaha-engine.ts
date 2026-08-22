// GAHA (Gaurav's Academic & Homework Assistant) Intelligence Engine
// Powered by the 9-Key Gemini Load-Balancing Pool

import { geminiPool } from "./gemini-pool";

export interface GahaResponse {
  intent: "GENERAL_COACH" | "HOMEWORK_SOLVE" | "NOTEBOOKLM_SYNTHESIS" | "GRADE_STRATEGY" | "SCHEDULE_OPTIMIZE" | "EXAM_PREP";
  reply: string;
  suggestedActions?: Array<{ label: string; actionType: string; payload?: any }>;
  keyUsedIndex?: number;
  totalPoolKeys: number;
}

const GAHA_SYSTEM_PROMPT = `You are GAHA (Gaurav's Academic & Homework Assistant), the elite AI academic manager and personal intelligence layer for Gaurav at IIIT Delhi (CSD - Computer Science and Design, Monsoon 2026 Semester 3).

### Active Semester Enrolled Courses (IIITD Monsoon 2026):
1. **Math III (Applied Mathematics III / MTH201 / MTH203)**: Differential equations, Fourier series, multivariable calculus, linear algebra applications. (Graded tutorial test every Tuesday at 1:30 PM in Tutorial Room).
2. **Operating Systems (OS / CSE231)**: Processes, threads, CPU scheduling, synchronization, xv6 kernel, Linux C labs (Mon 3 PM in C201).
3. **Advanced Programming (AP / CSE201)**: OOP design patterns, Java concurrency, architecture projects, pop quizzes (Tue & Thu 3 PM in C21).
4. **Design Processes & Perspectives (DPP / DES201)**: Design thinking, critique studio, field studies (Mon 11 AM in A106).
5. **Research Methods in Social Sciences & Design (RMSSD / SSH201)**: Qualitative/quantitative research, ethics (Tue & Thu 11 AM in C11).

### Persona & Capabilities:
- You are sharp, proactive, encouraging, concise, and academically rigorous.
- You format ALL mathematical formulas and derivations in standard KaTeX syntax ($inline$ or $$display$$).
- When asked about grades, you analyze weights and calculate exact required exam scores.
- When asked about homework, you break down the problem methodically with formulas, hints, and step-by-step solutions.
- When asked about study sessions, you factor in today's class schedule and pending deadlines.
- Keep responses clean, formatted, and actionable with clear markdown bullet points.`;

export async function askGAHA({
  userPrompt,
  currentContext,
}: {
  userPrompt: string;
  currentContext?: {
    activeCourse?: string;
    todaySchedule?: any[];
    deadlines?: any[];
    subjectEvaluations?: any[];
  };
}): Promise<GahaResponse> {
  const contextStr = currentContext
    ? `\n\n### Current Student Context:\n` +
      `- Active Course: ${currentContext.activeCourse || "General"}\n` +
      `- Pending Deadlines Count: ${currentContext.deadlines?.length || 0}\n` +
      `- Context Summary: ${JSON.stringify(currentContext)}`
    : "";

  const prompt = `${userPrompt}${contextStr}`;

  try {
    const rawText = await geminiPool.generateContent({
      prompt,
      systemInstruction: GAHA_SYSTEM_PROMPT,
      model: "gemini-2.0-flash-lite",
      temperature: 0.3,
    });

    const poolStatus = geminiPool.getPoolStatus();

    // Determine intent from prompt
    const pLower = userPrompt.toLowerCase();
    let intent: GahaResponse["intent"] = "GENERAL_COACH";
    if (pLower.includes("solve") || pLower.includes("homework") || pLower.includes("calculate") || pLower.includes("formula")) {
      intent = "HOMEWORK_SOLVE";
    } else if (pLower.includes("grade") || pLower.includes("target") || pLower.includes("score") || pLower.includes("gpa") || pLower.includes("marks")) {
      intent = "GRADE_STRATEGY";
    } else if (pLower.includes("notebook") || pLower.includes("podcast") || pLower.includes("flashcard") || pLower.includes("summary")) {
      intent = "NOTEBOOKLM_SYNTHESIS";
    } else if (pLower.includes("schedule") || pLower.includes("today") || pLower.includes("time") || pLower.includes("plan")) {
      intent = "SCHEDULE_OPTIMIZE";
    } else if (pLower.includes("exam") || pLower.includes("test") || pLower.includes("midsem") || pLower.includes("endsem") || pLower.includes("quiz")) {
      intent = "EXAM_PREP";
    }

    // Dynamic suggested action buttons
    const suggestedActions = [];
    if (intent === "GRADE_STRATEGY") {
      suggestedActions.push({ label: "Open Target Grade Planner", actionType: "NAVIGATE", payload: "/gpa" });
    }
    if (intent === "NOTEBOOKLM_SYNTHESIS") {
      suggestedActions.push({ label: "Open NotebookLM Vault", actionType: "NAVIGATE", payload: "/study?tab=vault" });
    }
    if (intent === "SCHEDULE_OPTIMIZE") {
      suggestedActions.push({ label: "View Weekly Timetable", actionType: "NAVIGATE", payload: "/calendar" });
    }

    return {
      intent,
      reply: rawText,
      suggestedActions: suggestedActions.length > 0 ? suggestedActions : undefined,
      totalPoolKeys: poolStatus.totalKeys,
    };
  } catch (error: any) {
    console.error("GAHA Engine execution error:", error);
    return {
      intent: "GENERAL_COACH",
      reply: `GAHA is operating in fallback mode: ${error?.message || "Please check your network connection."} All 9 API keys are monitored.`,
      totalPoolKeys: 9,
    };
  }
}
