import { NextResponse } from "next/server";
import { geminiPool } from "@/lib/gemini-pool";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { rawInput, courseCode, courseName } = await request.json();

    if (!rawInput || !rawInput.trim()) {
      return NextResponse.json({ error: "No homework text provided" }, { status: 400 });
    }

    const systemPrompt = `You are an expert university STEM professor and mathematical formatting engine for IIIT Delhi.
Given a student's raw typed or spoken homework input (e.g. "14.2 3 5, 14.3 2, 14.4 1" or "Problems 3 and 5 from section 14.2 on Cauchy's theorem"), you must parse and structure it into a complete list of homework problems with authentic LaTeX statements and step-by-step methods of work.

Course Context: ${courseName || "Applied Mathematics III"} (${courseCode || "MTH201"})

Return ONLY a valid JSON object with the following schema:
{
  "summary": "Short readable summary of assigned homework",
  "problems": [
    {
      "id": "exercise-qNum (e.g. 14.2-3)",
      "exercise": "Ex 14.2",
      "qNum": 3,
      "isMandatory": true,
      "title": "Clear descriptive title of problem",
      "latex": "Authentic mathematical LaTeX string for KaTeX (e.g. \\\\oint_C \\\\frac{z^2+1}{z-3} \\\\, dz = 0, \\\\quad C: |z|=1)",
      "topic": "Topic name (e.g. Cauchy's Integral Theorem & Path Independence)",
      "difficulty": "Easy" | "Medium" | "Hard",
      "methodOfWork": "Clear 2-sentence step-by-step mathematical proof / method explaining how to solve it."
    }
  ],
  "similarPractice": [
    {
      "id": "exercise-similarNum",
      "exercise": "Ex 14.2",
      "qNum": 4,
      "isMandatory": false,
      "similarTo": 3,
      "title": "Similar Practice: Descriptive title",
      "latex": "Similar mathematical LaTeX formula",
      "topic": "Topic name",
      "difficulty": "Medium",
      "methodOfWork": "Similar method of work."
    }
  ],
  "okfMarkdown": "OKF formatted markdown block containing metadata frontmatter and LaTeX problem equations for Google Drive storage"
}`;

    const userPrompt = `Parse and format the following homework input:
"${rawInput}"`;

    const rawResponse = await geminiPool.generateContent({
      prompt: userPrompt,
      systemInstruction: systemPrompt,
      temperature: 0.2,
    });

    // Extract JSON from response
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

    // Fallback deterministic regex parser
    const { rawInput, courseCode } = await request.json().catch(() => ({ rawInput: "14.2 3 5" }));
    const fallbackProblems = parseDeterministicHomework(rawInput, courseCode);

    return NextResponse.json({
      success: true,
      data: fallbackProblems,
      fallback: true,
    });
  }
}

function parseDeterministicHomework(rawInput: string, courseCode?: string) {
  const segments = rawInput.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
  const problems: any[] = [];
  const similarPractice: any[] = [];

  segments.forEach((seg) => {
    const tokens = seg.split(/\s+/);
    if (tokens.length === 0) return;

    const exercise = tokens[0];
    const questionNums = tokens.slice(1).map((n) => parseInt(n, 10)).filter((n) => !isNaN(n));

    if (questionNums.length === 0) {
      questionNums.push(1);
    }

    questionNums.forEach((qNum) => {
      problems.push({
        id: `${exercise}-${qNum}`,
        exercise: `Ex ${exercise}`,
        qNum,
        isMandatory: true,
        title: `Section ${exercise} — Question ${qNum}`,
        latex: `\\oint_C f(z) \\, dz \\quad (\\text{Section } ${exercise}, \\text{ Question } ${qNum})`,
        topic: `Section ${exercise} Problem Set`,
        difficulty: "Medium",
        methodOfWork: `Apply standard fundamental theorems and evaluate boundary conditions for Section ${exercise}.`,
      });

      similarPractice.push({
        id: `${exercise}-${qNum + 1}-sim`,
        exercise: `Ex ${exercise}`,
        qNum: qNum + 1,
        isMandatory: false,
        similarTo: qNum,
        title: `Similar Practice: Section ${exercise} Q${qNum + 1}`,
        latex: `\\oint_C g(z) \\, dz \\quad (\\text{Practice } ${exercise}.${qNum + 1})`,
        topic: `Section ${exercise} Practice`,
        difficulty: "Medium",
        methodOfWork: `Use identical boundary analysis as Question ${qNum}.`,
      });
    });
  });

  return {
    summary: `Assigned: ${rawInput}`,
    problems,
    similarPractice,
    okfMarkdown: `# OKF Homework Manifest: ${courseCode || "MTH201"}\nRaw Input: ${rawInput}\nDate: ${new Date().toISOString()}`,
  };
}
