// 1-Week Backlog Engine for Learny (Zero Fake Data)
// Source of truth: TIMETABLE_CLASSES from weekly-timetable.tsx

import { TIMETABLE_CLASSES, ClassSlot } from "@/lib/timetable-data";
import { OKFRegistry } from "@/lib/okf-indexer";

export interface BacklogLecture {
  id: string;
  dayName: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  dayIndex: number;
  time: string;
  room: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  type: string;
  lectureNumber: number;
  topic?: string;
  homeworkSummary?: string;
  rawInput?: string;
  dueDate?: string;
  problems?: Array<{
    id: string;
    exercise: string;
    qNum: number;
    title: string;
    latex: string;
    topic: string;
    difficulty: "Easy" | "Medium" | "Hard";
    methodOfWork: string;
  }>;
}

const DAY_INDEX_MAP: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
};

// Derive authentic lectures directly from timetable - ZERO fake homework
export const MONSOON_2026_BACKLOG_LECTURES: BacklogLecture[] = TIMETABLE_CLASSES.map(
  (slot, idx) => ({
    id: slot.id,
    dayName: slot.day as "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday",
    dayIndex: DAY_INDEX_MAP[slot.day] || 1,
    time: slot.timeLabel,
    room: slot.room,
    courseId: slot.code.toLowerCase(),
    courseCode: slot.code,
    courseName: slot.subject,
    type: slot.type,
    lectureNumber: idx + 1,
    topic: slot.notes || `${slot.type} Session in ${slot.room}`,
  })
);

export interface BacklogStatus {
  totalCount: number;
  completedCount: number;
  pendingCount: number;
  percentComplete: number;
  isFullyResolved: boolean;
  loggedIds: string[];
}

export function getBacklogStatus(): BacklogStatus {
  if (typeof window === "undefined") {
    return {
      totalCount: MONSOON_2026_BACKLOG_LECTURES.length,
      completedCount: 0,
      pendingCount: MONSOON_2026_BACKLOG_LECTURES.length,
      percentComplete: 0,
      isFullyResolved: false,
      loggedIds: [],
    };
  }

  const raw = localStorage.getItem("learny-backlog-logged-ids");
  const loggedIds: string[] = raw ? JSON.parse(raw) : [];

  const totalCount = MONSOON_2026_BACKLOG_LECTURES.length;
  const completedCount = loggedIds.length;
  const pendingCount = Math.max(0, totalCount - completedCount);
  const percentComplete = Math.round((completedCount / totalCount) * 100);

  return {
    totalCount,
    completedCount,
    pendingCount,
    percentComplete,
    isFullyResolved: completedCount >= totalCount && totalCount > 0,
    loggedIds,
  };
}

/**
 * Gets user-entered homework for a specific backlog lecture (with legacy fake data filter)
 */
export function getLoggedHomeworkForLecture(lectureId: string): {
  rawInput?: string;
  summary?: string;
  problems?: any[];
  dueDate?: string;
} | null {
  if (typeof window === "undefined") return null;

  const raw = localStorage.getItem(`learny-backlog-hw-${lectureId}`);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);

    // Sanity check: If a non-math course has legacy math integrals or "14.2" saved by accident, purge it
    const isMathId = lectureId.includes("mth") || lectureId.includes("m3");
    if (!isMathId && (parsed.rawInput === "14.2 3 5" || parsed.rawInput === "14.2 3 5, 14.3 2, 14.4 1" || JSON.stringify(parsed.problems || []).includes("\\oint"))) {
      localStorage.removeItem(`learny-backlog-hw-${lectureId}`);
      // Also remove from logged IDs so it resets
      const rawLogged = localStorage.getItem("learny-backlog-logged-ids");
      if (rawLogged) {
        const ids: string[] = JSON.parse(rawLogged);
        const filtered = ids.filter((id) => id !== lectureId);
        localStorage.setItem("learny-backlog-logged-ids", JSON.stringify(filtered));
      }
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Saves user's actual typed homework for a backlog lecture and syncs to Calendar & OKF vault
 */
export function saveLectureHomework(
  lecture: BacklogLecture,
  rawInput: string,
  formattedData?: { summary?: string; problems?: any[]; dueDate?: string }
): void {
  if (typeof window === "undefined") return;

  const payload = {
    rawInput,
    summary: formattedData?.summary || rawInput,
    problems: formattedData?.problems || [],
    dueDate: formattedData?.dueDate || new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    savedAt: new Date().toISOString(),
  };

  // 1. Save specific lecture homework
  localStorage.setItem(`learny-backlog-hw-${lecture.id}`, JSON.stringify(payload));

  // 2. Mark lecture ID as logged in backlog list
  const status = getBacklogStatus();
  if (!status.loggedIds.includes(lecture.id)) {
    const updated = [...status.loggedIds, lecture.id];
    localStorage.setItem("learny-backlog-logged-ids", JSON.stringify(updated));
  }

  // 3. Save problems to Course Ledger if any
  if (payload.problems.length > 0) {
    const courseKey = `learny-problems-${lecture.courseId}`;
    const existingProbsRaw = localStorage.getItem(courseKey);
    const existingProbs = existingProbsRaw ? JSON.parse(existingProbsRaw) : [];
    const mergedProbs = [...existingProbs, ...payload.problems];
    localStorage.setItem(courseKey, JSON.stringify(mergedProbs));
  }

  // 4. Inject Scheduled Event into Calendar if homework was entered
  if (rawInput.trim()) {
    const calendarKey = "learny-calendar-custom-events";
    const existingEventsRaw = localStorage.getItem(calendarKey);
    const existingEvents = existingEventsRaw ? JSON.parse(existingEventsRaw) : [];

    const newEvent = {
      id: `backlog-${lecture.id}`,
      title: `${lecture.courseCode} Homework: ${payload.summary}`,
      courseName: lecture.courseName,
      date: payload.dueDate.split("T")[0],
      time: "11:59 PM",
      type: "homework",
      category: "submission",
      description: `Assigned in ${lecture.room} (${lecture.time}): ${rawInput}`,
    };

    const filtered = existingEvents.filter((e: any) => e.id !== newEvent.id);
    filtered.push(newEvent);
    localStorage.setItem(calendarKey, JSON.stringify(filtered));

    // 5. Update OKF Google Drive registry
    const okfLectureId = `iiitd-${lecture.courseId.toLowerCase()}-lec02`;
    OKFRegistry.updateLectureHomework(okfLectureId, rawInput);

    // 6. Sync to Server Ledger API
    try {
      fetch("/api/homework/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lectureId: lecture.id,
          courseCode: lecture.courseCode,
          courseName: lecture.courseName,
          rawInput,
          summary: payload.summary,
          problems: payload.problems,
          dueDate: payload.dueDate,
        }),
      }).catch((e) => console.warn("Background server sync non-blocking error", e));
    } catch {}
  }
}

/**
 * Marks a lecture as reviewed / no homework assigned
 */
export function markLectureNoHomework(lecture: BacklogLecture): void {
  saveLectureHomework(lecture, "", { summary: "No homework assigned" });
}

/**
 * Resets backlog state for clean re-testing
 */
export function resetBacklogState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("learny-backlog-logged-ids");
  MONSOON_2026_BACKLOG_LECTURES.forEach((l) => {
    localStorage.removeItem(`learny-backlog-hw-${l.id}`);
  });
}
