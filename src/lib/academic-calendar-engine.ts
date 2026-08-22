// Official IIIT Delhi Monsoon 2026 Academic Calendar Engine ("The Bible & Heart")
// Governs all timetable adjustments (TTA), gazetted holidays (GH), exams, recesses, and deadlines.

import { TIMETABLE_CLASSES, ClassSlot } from "./timetable-data";
import { format, isSameDay, differenceInDays } from "date-fns";

export interface AcademicDateInfo {
  date: Date;
  dateStr: string; // "YYYY-MM-DD"
  weekNumber: number; // 0 to 23
  weekLabel: string; // e.g. "Week 2 (Aug)"
  phase: "REGULAR" | "MIDSEM_EXAMS" | "MID_RECESS" | "ENDSEM_EXAMS" | "PRESENTATIONS" | "WINTER_VACATION" | "MODULE";
  phaseTitle: string;
  isHoliday: boolean;
  holidayName?: string;
  isTTA: boolean;
  ttaTargetDay?: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  effectiveDayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";
  effectiveClasses: ClassSlot[];
  isExamWeek: boolean;
  daysToMidsem: number;
  daysToEndsem: number;
  specialNotes?: string;
}

export interface AcademicMilestone {
  id: string;
  title: string;
  dateStr: string;
  category: "EXAM" | "HOLIDAY" | "TTA" | "DEADLINE" | "RECESS" | "EVENT";
  description: string;
  important?: boolean;
}

// 1. Gazetted Holidays Matrix (Monsoon 2026)
export const GAZETTED_HOLIDAYS_2026: Record<string, string> = {
  "2026-08-15": "Independence Day",
  "2026-08-26": "Id-e-Milad",
  "2026-09-04": "Janmashtami",
  "2026-10-02": "Mahatma Gandhi Birthday",
  "2026-10-20": "Dussehra",
  "2026-10-26": "Maharishi Valmiki Jayanti",
  "2026-11-08": "Diwali",
  "2026-11-24": "Guru Nanak's Birthday",
  "2026-12-25": "Christmas Day",
};

// 2. Official Timetable Adjustments (TTA) Matrix (Monsoon 2026)
export const TIMETABLE_ADJUSTMENTS_2026: Record<string, { targetDay: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday"; reason: string }> = {
  "2026-08-22": { targetDay: "Friday", reason: "Time Table Adjustment: Friday TT (TT-Fri³)" },
  "2026-09-08": { targetDay: "Friday", reason: "Foundation Day / TTA: Friday TT (TT-Fri⁴)" },
  "2026-09-12": { targetDay: "Wednesday", reason: "Time Table Adjustment: Wednesday TT (TT-Wed⁵)" },
  "2026-09-19": { targetDay: "Tuesday", reason: "Time Table Adjustment: Tuesday TT (TT-Tue⁵)" },
  "2026-10-10": { targetDay: "Monday", reason: "Time Table Adjustment: Monday TT (TT-Mon⁸)" },
  "2026-11-21": { targetDay: "Monday", reason: "Time Table Adjustment: Monday TT (TT-Mon¹²)" },
  "2026-11-25": { targetDay: "Tuesday", reason: "Time Table Adjustment: Tuesday TT (TT-Tue¹³)" },
  "2026-11-26": { targetDay: "Friday", reason: "Last Day of Class / TTA: Friday TT (TT-Fri¹³)" },
};

// 3. Official Academic Milestones
export const ACADEMIC_MILESTONES_2026: AcademicMilestone[] = [
  { id: "m-1", title: "1st Day of Class (Monsoon 2026)", dateStr: "2026-08-10", category: "EVENT", description: "Classes begin for Semester 3 CSD", important: true },
  { id: "m-2", title: "Last Day of Add / Drop", dateStr: "2026-08-14", category: "DEADLINE", description: "Final course registration deadline" },
  { id: "m-3", title: "ESYA Technical Fest", dateStr: "2026-08-28", category: "EVENT", description: "Annual technical fest of IIIT Delhi (Aug 28-29)" },
  { id: "m-5", title: "Mid-Semester Examinations", dateStr: "2026-09-20", category: "EXAM", description: "Midsem Exam Period (20 Sept – 28 Sept 2026)", important: true },
  { id: "m-6", title: "Mid Recess-I (UG Vacation)", dateStr: "2026-09-29", category: "RECESS", description: "Mid-semester vacation (29 Sept – 1 Oct 2026)" },
  { id: "m-7", title: "Last Day of Late Drop", dateStr: "2026-10-05", category: "DEADLINE", description: "Late drop course deadline" },
  { id: "m-8", title: "Convocation 2026", dateStr: "2026-10-31", category: "EVENT", description: "IIIT Delhi Annual Convocation" },
  { id: "m-9", title: "Mid Recess-II (UG Vacation)", dateStr: "2026-11-09", category: "RECESS", description: "Second mid-semester break (9 Nov – 10 Nov 2026)" },
  { id: "m-10", title: "*Complete All Internal Evaluations", dateStr: "2026-11-20", category: "DEADLINE", description: "All internal assessment marks & grades must be declared before Endsems", important: true },
  { id: "m-11", title: "Last Day of Class (Monsoon 2026)", dateStr: "2026-11-26", category: "EVENT", description: "Final lecture day of the semester (Follows Friday TT)", important: true },
  { id: "m-12", title: "End-Semester Examinations", dateStr: "2026-11-29", category: "EXAM", description: "Final End-Sem Exams (29 Nov – 8 Dec 2026)", important: true },
  { id: "m-13", title: "Presentations & Exam Copies Review", dateStr: "2026-12-09", category: "EVENT", description: "BTP/CW/SG presentations and exam copies shown to students (Dec 9-11)" },
  { id: "m-14", title: "Winter Vacation Begins", dateStr: "2026-12-15", category: "RECESS", description: "Winter vacation commences for students", important: true },
  { id: "m-15", title: "1st Day of Class (Winter 2027)", dateStr: "2027-01-11", category: "EVENT", description: "Commencement of Winter 2027 Semester 4" },
];

/**
 * Calculates full academic date metadata for any date in the academic year
 */
export function getAcademicDateInfo(targetDate: Date = new Date()): AcademicDateInfo {
  const dateStr = format(targetDate, "yyyy-MM-dd");
  const dayName = format(targetDate, "EEEE") as AcademicDateInfo["effectiveDayOfWeek"];

  // Week calculation relative to Aug 10, 2026 (Week 1)
  const semesterStart = new Date("2026-08-10T00:00:00");
  const diffDays = differenceInDays(targetDate, semesterStart);
  let weekNumber = Math.floor(diffDays / 7) + 1;
  if (diffDays < 0) weekNumber = 0;

  const monthLabel = format(targetDate, "MMM");
  const weekLabel = `Week ${weekNumber} (${monthLabel})`;

  // Key Phase Definitions
  const midsemStart = new Date("2026-09-20T00:00:00");
  const midsemEnd = new Date("2026-09-28T23:59:59");
  const midRecess1Start = new Date("2026-09-29T00:00:00");
  const midRecess1End = new Date("2026-10-01T23:59:59");
  const midRecess2Start = new Date("2026-11-09T00:00:00");
  const midRecess2End = new Date("2026-11-10T23:59:59");
  const endsemStart = new Date("2026-11-29T00:00:00");
  const endsemEnd = new Date("2026-12-08T23:59:59");
  const presentationStart = new Date("2026-12-09T00:00:00");
  const presentationEnd = new Date("2026-12-11T23:59:59");
  const winterVacationStart = new Date("2026-12-15T00:00:00");

  let phase: AcademicDateInfo["phase"] = "REGULAR";
  let phaseTitle = `Regular Academic Classes (${weekLabel})`;

  if (targetDate >= midsemStart && targetDate <= midsemEnd) {
    phase = "MIDSEM_EXAMS";
    phaseTitle = "🔥 Mid-Semester Examinations War-Room";
  } else if (targetDate >= midRecess1Start && targetDate <= midRecess1End) {
    phase = "MID_RECESS";
    phaseTitle = "🏖️ Mid Recess-I (UG Break)";
  } else if (targetDate >= midRecess2Start && targetDate <= midRecess2End) {
    phase = "MID_RECESS";
    phaseTitle = "🏖️ Mid Recess-II (UG Break)";
  } else if (targetDate >= endsemStart && targetDate <= endsemEnd) {
    phase = "ENDSEM_EXAMS";
    phaseTitle = "🔥 End-Semester Examinations War-Room";
  } else if (targetDate >= presentationStart && targetDate <= presentationEnd) {
    phase = "PRESENTATIONS";
    phaseTitle = "📑 Project Presentations & Exam Paper Reviews";
  } else if (targetDate >= winterVacationStart) {
    phase = "WINTER_VACATION";
    phaseTitle = "❄️ Winter Vacation";
  }

  // Check Gazetted Holiday
  const holidayName = GAZETTED_HOLIDAYS_2026[dateStr];
  const isHoliday = Boolean(holidayName) || dayName === "Sunday";

  // Check Timetable Adjustment (TTA)
  const tta = TIMETABLE_ADJUSTMENTS_2026[dateStr];
  const isTTA = Boolean(tta);
  const ttaTargetDay = tta ? tta.targetDay : undefined;

  // Resolve Effective Timetable Day
  let effectiveDay: AcademicDateInfo["effectiveDayOfWeek"] = dayName;
  if (isTTA && ttaTargetDay) {
    effectiveDay = ttaTargetDay;
  }

  // Get Effective Classes running today
  let effectiveClasses: ClassSlot[] = [];
  if (!isHoliday && phase === "REGULAR") {
    effectiveClasses = TIMETABLE_CLASSES.filter((c) => c.day === effectiveDay);
  }

  const daysToMidsem = Math.max(0, differenceInDays(midsemStart, targetDate));
  const daysToEndsem = Math.max(0, differenceInDays(endsemStart, targetDate));

  let specialNotes: string | undefined;
  if (isTTA) specialNotes = tta.reason;
  else if (holidayName) specialNotes = `Gazetted Holiday: ${holidayName}`;
  else if (phase === "MIDSEM_EXAMS") specialNotes = "Midsem Exams active - classes suspended.";
  else if (phase === "ENDSEM_EXAMS") specialNotes = "Endsem Exams active - classes suspended.";

  return {
    date: targetDate,
    dateStr,
    weekNumber,
    weekLabel,
    phase,
    phaseTitle,
    isHoliday,
    holidayName,
    isTTA,
    ttaTargetDay,
    effectiveDayOfWeek: effectiveDay,
    effectiveClasses,
    isExamWeek: phase === "MIDSEM_EXAMS" || phase === "ENDSEM_EXAMS",
    daysToMidsem,
    daysToEndsem,
    specialNotes,
  };
}

/**
 * Returns list of upcoming academic milestones relative to today
 */
export function getUpcomingMilestones(limit: number = 6): AcademicMilestone[] {
  const todayStr = format(new Date(), "yyyy-MM-dd");
  return ACADEMIC_MILESTONES_2026.filter((m) => m.dateStr >= todayStr).slice(0, limit);
}
