// Timetable-driven Post-Class Homework Prompt & Notification Engine for Learny
// Source of truth: TIMETABLE_CLASSES from weekly-timetable.tsx

import { TIMETABLE_CLASSES, ClassSlot } from "@/components/calendar/weekly-timetable";

export interface TimetableClass {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 5 = Friday
  dayName: string;
  startTime: string; // "11:00"
  endTime: string; // "12:30"
  timeLabel: string;
  room: string;
  type: string;
}

const DAY_MAP: Record<string, number> = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
};

// Derive authentic Monsoon 2026 timetable from the calendar's single source of truth
export const MONSOON_2026_TIMETABLE: TimetableClass[] = TIMETABLE_CLASSES.map((slot) => ({
  id: slot.id,
  courseId: slot.code.toLowerCase(),
  courseName: slot.subject,
  courseCode: slot.code,
  dayOfWeek: DAY_MAP[slot.day] || 1,
  dayName: slot.day,
  startTime: slot.startTime,
  endTime: slot.endTime,
  timeLabel: slot.timeLabel,
  room: slot.room,
  type: slot.type,
}));

export interface ActiveClassPrompt {
  classItem: TimetableClass;
  endedAgoText: string;
  isSimulated?: boolean;
}

/**
 * Checks if an authentic class from the calendar has recently ended (in the last 90 minutes)
 */
export function getRecentlyEndedClass(): ActiveClassPrompt | null {
  if (typeof window === "undefined") return null;

  // 1. Check for simulated prompt first
  const sim = localStorage.getItem("learny-simulated-class-prompt");
  if (sim) {
    try {
      const parsed = JSON.parse(sim);
      return {
        classItem: parsed.classItem,
        endedAgoText: parsed.endedAgoText || "Just now",
        isSimulated: true,
      };
    } catch {
      localStorage.removeItem("learny-simulated-class-prompt");
    }
  }

  // 2. Check today's real schedule
  const now = new Date();
  const currentDay = now.getDay();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const todayClasses = MONSOON_2026_TIMETABLE.filter((c) => c.dayOfWeek === currentDay);

  for (const item of todayClasses) {
    const [endH, endM] = item.endTime.split(":").map(Number);
    const endMinutes = endH * 60 + endM;

    // Check if class ended between 0 and 90 minutes ago
    const diff = currentMinutes - endMinutes;
    if (diff >= 0 && diff <= 90) {
      const todayKey = `${now.toISOString().split("T")[0]}-${item.id}`;
      const logged = localStorage.getItem(`learny-hw-logged-${todayKey}`);

      if (!logged) {
        return {
          classItem: item,
          endedAgoText: diff === 0 ? "Just now" : `${diff}m ago`,
          isSimulated: false,
        };
      }
    }
  }

  return null;
}

/**
 * Triggers a native Web Notification for the ended class
 */
export function triggerPostClassNotification(prompt: ActiveClassPrompt) {
  if (typeof window === "undefined" || !("Notification" in window)) return;

  if (Notification.permission === "granted") {
    new Notification(`Lecture Ended: ${prompt.classItem.courseName}`, {
      body: `Class finished at ${prompt.classItem.timeLabel} in ${prompt.classItem.room}. Click to log today's homework assignments.`,
      icon: "/favicon.ico",
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(`Lecture Ended: ${prompt.classItem.courseName}`, {
          body: `Class finished in ${prompt.classItem.room}. Click to log today's homework assignments.`,
          icon: "/favicon.ico",
        });
      }
    });
  }
}

/**
 * Sets a simulated class prompt for any specific authentic class by ID or courseCode
 */
export function simulateEndedClass(courseCodeOrId: string = "mon-dpp-lec") {
  if (typeof window === "undefined") return;

  const targetClass =
    MONSOON_2026_TIMETABLE.find(
      (c) => c.id === courseCodeOrId || c.courseCode === courseCodeOrId || c.courseId === courseCodeOrId
    ) || MONSOON_2026_TIMETABLE[0];

  const payload = {
    classItem: targetClass,
    endedAgoText: `Just now (${targetClass.dayName} • ${targetClass.timeLabel})`,
  };

  localStorage.setItem("learny-simulated-class-prompt", JSON.stringify(payload));
  triggerPostClassNotification({
    classItem: targetClass,
    endedAgoText: "Just now",
    isSimulated: true,
  });
}

/**
 * Dismisses or marks homework prompt as resolved for today
 */
export function dismissClassPrompt(prompt: ActiveClassPrompt) {
  if (typeof window === "undefined") return;

  if (prompt.isSimulated) {
    localStorage.removeItem("learny-simulated-class-prompt");
  } else {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(`learny-hw-logged-${today}-${prompt.classItem.id}`, "skipped");
  }
}
