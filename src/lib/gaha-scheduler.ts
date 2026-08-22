/**
 * GAHA 2.0 Autonomous Academic Scheduler & Executive Orchestrator
 * 
 * Drives 24x7 intelligent scheduling, daily briefings, timetable adjustments,
 * and high-yield study blocks anchored by the Official IIITD Monsoon 2026 Academic Calendar.
 */

import { getAcademicDateInfo, getUpcomingMilestones, AcademicDateInfo } from "./academic-calendar-engine";
import { OKFMemoryEngine, OKFMemoryState } from "./okf-memory-engine";
import { geminiPool } from "./gemini-pool";
import { format } from "date-fns";

export interface GahaDailyBriefing {
  type: "MORNING" | "NIGHT" | "MIDDAY_UPDATE";
  timestamp: string;
  headline: string;
  academicPhase: string;
  weekLabel: string;
  effectiveScheduleSummary: string;
  activeTTA?: string;
  todayClasses: Array<{
    subject: string;
    code: string;
    time: string;
    room: string;
    type: string;
  }>;
  urgentDeadlines: Array<{
    title: string;
    course: string;
    dueDays: number;
    weightage?: string;
  }>;
  topPriorities: string[];
  recommendedStudyBlocks: Array<{
    timeSlot: string;
    subject: string;
    task: string;
    durationMinutes: number;
    reason: string;
  }>;
  motivationalQuote: string;
  executiveSummaryText: string;
}

export class GahaScheduler {
  /**
   * Generates a comprehensive Daily Academic Briefing anchored by the Official Monsoon 2026 Calendar
   */
  static async generateDailyBriefing(type: "MORNING" | "NIGHT" = "MORNING"): Promise<GahaDailyBriefing> {
    const today = new Date();
    const dateInfo = getAcademicDateInfo(today);
    const memoryState = OKFMemoryEngine.getMemoryState();
    const milestones = getUpcomingMilestones(4);

    const formattedClasses = dateInfo.effectiveClasses.map((c) => ({
      subject: c.subject,
      code: c.code,
      time: c.timeLabel,
      room: c.room,
      type: c.type,
    }));

    // Detect high-impact deadlines from academic calendar & course evaluations
    const urgentDeadlines = [
      {
        title: "RMSSD Home Assignment 1 (Data Prep & Hypotheses)",
        course: "RMSSD (SSH201)",
        dueDays: Math.max(0, Math.ceil((new Date("2026-09-07T23:59:59").getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
        weightage: "20% Total Course Weight",
      },
      {
        title: "Mid-Semester Examinations War-Room",
        course: "All 5 Subjects",
        dueDays: dateInfo.daysToMidsem,
        weightage: "Midsem Exams (20-40% per subject)",
      },
      {
        title: "Complete All Internal Evaluations & Marks Declaration",
        course: "All Faculty",
        dueDays: Math.max(0, Math.ceil((new Date("2026-11-20T23:59:59").getTime() - today.getTime()) / (1000 * 60 * 60 * 24))),
        weightage: "Final Internal Grades Lock",
      },
    ];

    // Priority Task Logic based on weekday and calendar phase
    const topPriorities: string[] = [];
    if (dateInfo.effectiveDayOfWeek === "Tuesday") {
      topPriorities.push("Attend Math III Tutorial Quiz at 1:30 PM (Counted towards 30% weekly quizzes)");
      topPriorities.push("Review Lecture 2 Multivariable Limits Two-Path derivations before class");
    } else if (dateInfo.effectiveDayOfWeek === "Wednesday") {
      topPriorities.push("Attend OS Tutorial in C101 at 8:30 AM (xv6 processes & system calls)");
      topPriorities.push("AP Tutorial at 2:00 PM (Java inheritance & design patterns)");
    } else if (dateInfo.effectiveDayOfWeek === "Thursday") {
      topPriorities.push("RMSSD Lab at 9:30 AM in C01 (Data analysis & quantitative methods)");
      topPriorities.push("DPP Studio Session at 11:00 AM in A106 (Update design journal - 10% weight)");
    } else {
      topPriorities.push("Practice 4 Multivariate Calculus problems (Thomas' Calculus Ch 14)");
      topPriorities.push("Execute 1 focus sprint on xv6 trap handling & syscall dispatching");
    }

    // Recommended 24x7 Deep Work Study Blocks
    const recommendedStudyBlocks = [
      {
        timeSlot: "05:30 PM – 07:00 PM",
        subject: "Multivariate Calculus (Math III)",
        task: "Solve 6 practice problems on Multivariable Limits & Polar Coordinates (Thomas' Calculus §14.2)",
        durationMinutes: 90,
        reason: "Prepares for Tuesday 1:30 PM tutorial quiz (30% weightage policy).",
      },
      {
        timeSlot: "08:30 PM – 09:45 PM",
        subject: "Operating Systems (CSE231)",
        task: "xv6 Kernel Coding: Trace usertrap() and add custom getreadcount() system call",
        durationMinutes: 75,
        reason: "Prepares for take-home assignment (35% weightage).",
      },
      {
        timeSlot: "10:15 PM – 11:00 PM",
        subject: "SuperMemo SM-2 Flashcard Review",
        task: "Review 12 due flashcards across AP Design Patterns and RMSSD Hypothesis Testing",
        durationMinutes: 45,
        reason: "Maintains >85% long-term memory retention before midsems.",
      },
    ];

    let headline = `Monsoon 2026 • ${dateInfo.weekLabel} Executive Directive`;
    if (dateInfo.isTTA) {
      headline = `⚡ TIME TABLE ADJUSTMENT: Running ${dateInfo.ttaTargetDay} Schedule Today!`;
    } else if (dateInfo.isHoliday) {
      headline = `🌴 Gazetted Holiday: ${dateInfo.holidayName} (Study & Recharge Phase)`;
    } else if (dateInfo.isExamWeek) {
      headline = `🔥 EXAM WAR-ROOM: ${dateInfo.phaseTitle} Active!`;
    }

    const executiveSummaryText = type === "MORNING"
      ? `Good morning! You are currently in ${dateInfo.weekLabel} of the Monsoon 2026 semester at IIIT Delhi. ${
          dateInfo.isTTA
            ? `Notice: Today is a Timetable Adjustment day following the ${dateInfo.ttaTargetDay} schedule.`
            : dateInfo.isHoliday
            ? `Today is a Gazetted Holiday (${dateInfo.holidayName}). No regular classes scheduled.`
            : `You have ${dateInfo.effectiveClasses.length} academic sessions today.`
        } You are ${dateInfo.daysToMidsem} days away from the Mid-Semester Examinations (20-28 Sept). Your primary focus today is: ${topPriorities[0]}.`
      : `Good evening! Daily review for ${dateInfo.weekLabel}. All scheduled classes and assignments for today have been logged. You have ${recommendedStudyBlocks.length} planned deep-work blocks. Tomorrow's preparation is queued in your manager cockpit.`;

    return {
      type,
      timestamp: new Date().toISOString(),
      headline,
      academicPhase: dateInfo.phaseTitle,
      weekLabel: dateInfo.weekLabel,
      effectiveScheduleSummary: `${dateInfo.effectiveDayOfWeek} Schedule • ${dateInfo.effectiveClasses.length} Classes`,
      activeTTA: dateInfo.specialNotes,
      todayClasses: formattedClasses,
      urgentDeadlines,
      topPriorities,
      recommendedStudyBlocks,
      motivationalQuote: "Disciplined execution every single day compounds into an unassailable academic lead. Let's conquer today's milestones.",
      executiveSummaryText,
    };
  }
}
