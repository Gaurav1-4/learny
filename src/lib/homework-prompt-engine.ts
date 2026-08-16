// Timetable-driven Post-Class Homework Prompt & Notification Engine for Learny

export interface TimetableClass {
  id: string;
  courseId: string;
  courseName: string;
  courseCode: string;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 5 = Friday
  dayName: string;
  startTime: string; // "09:30"
  endTime: string; // "11:00"
  room: string;
}

// Monsoon 2026 IIIT Delhi Course Schedule
export const MONSOON_2026_TIMETABLE: TimetableClass[] = [
  // Monday
  {
    id: "mth-mon",
    courseId: "mth201",
    courseName: "Applied Mathematics III",
    courseCode: "MTH201",
    dayOfWeek: 1,
    dayName: "Monday",
    startTime: "09:30",
    endTime: "11:00",
    room: "C01",
  },
  {
    id: "os-mon",
    courseId: "cse231",
    courseName: "Operating Systems",
    courseCode: "CSE231",
    dayOfWeek: 1,
    dayName: "Monday",
    startTime: "11:30",
    endTime: "13:00",
    room: "B003",
  },
  // Tuesday
  {
    id: "ap-tue",
    courseId: "cse201",
    courseName: "Advanced Programming",
    courseCode: "CSE201",
    dayOfWeek: 2,
    dayName: "Tuesday",
    startTime: "09:30",
    endTime: "11:00",
    room: "C102",
  },
  {
    id: "dpp-tue",
    courseId: "des202",
    courseName: "Design Processes & Perspectives",
    courseCode: "DES202",
    dayOfWeek: 2,
    dayName: "Tuesday",
    startTime: "14:00",
    endTime: "15:30",
    room: "Design Studio 2",
  },
  // Wednesday
  {
    id: "mth-wed",
    courseId: "mth201",
    courseName: "Applied Mathematics III (Tutorial)",
    courseCode: "MTH201",
    dayOfWeek: 3,
    dayName: "Wednesday",
    startTime: "10:00",
    endTime: "11:00",
    room: "C201",
  },
  {
    id: "os-wed-lab",
    courseId: "cse231",
    courseName: "Operating Systems (Lab)",
    courseCode: "CSE231",
    dayOfWeek: 3,
    dayName: "Wednesday",
    startTime: "14:00",
    endTime: "16:00",
    room: "Linux Lab 1",
  },
  // Thursday
  {
    id: "mth-thu",
    courseId: "mth201",
    courseName: "Applied Mathematics III",
    courseCode: "MTH201",
    dayOfWeek: 4,
    dayName: "Thursday",
    startTime: "09:30",
    endTime: "11:00",
    room: "C01",
  },
  {
    id: "os-thu",
    courseId: "cse231",
    courseName: "Operating Systems",
    courseCode: "CSE231",
    dayOfWeek: 4,
    dayName: "Thursday",
    startTime: "11:30",
    endTime: "13:00",
    room: "B003",
  },
  // Friday
  {
    id: "ap-fri",
    courseId: "cse201",
    courseName: "Advanced Programming",
    courseCode: "CSE201",
    dayOfWeek: 5,
    dayName: "Friday",
    startTime: "09:30",
    endTime: "11:00",
    room: "C102",
  },
  {
    id: "rmssd-fri",
    courseId: "soc201",
    courseName: "Research Methods in Social Sciences",
    courseCode: "SOC201",
    dayOfWeek: 5,
    dayName: "Friday",
    startTime: "14:00",
    endTime: "15:30",
    room: "C21",
  },
];

export interface ActiveClassPrompt {
  classItem: TimetableClass;
  endedAgoText: string;
  isSimulated?: boolean;
}

/**
 * Checks if a class has recently ended (in the last 120 minutes)
 * or returns active mock prompt if triggered.
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
        endedAgoText: parsed.endedAgoText || "Just now (Test Simulation)",
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
      body: `Class finished at ${prompt.classItem.endTime} in ${prompt.classItem.room}. Click to log today's homework assignments.`,
      icon: "/favicon.ico",
    });
  } else if (Notification.permission !== "denied") {
    Notification.requestPermission().then((permission) => {
      if (permission === "granted") {
        new Notification(`Lecture Ended: ${prompt.classItem.courseName}`, {
          body: `Class finished at ${prompt.classItem.endTime}. Click to log today's homework assignments.`,
          icon: "/favicon.ico",
        });
      }
    });
  }
}

/**
 * Sets a simulated class prompt for any specific class by ID or courseCode
 */
export function simulateEndedClass(courseCodeOrId: string = "mth-mon") {
  if (typeof window === "undefined") return;

  const targetClass =
    MONSOON_2026_TIMETABLE.find(
      (c) => c.id === courseCodeOrId || c.courseCode === courseCodeOrId || c.courseId === courseCodeOrId
    ) || MONSOON_2026_TIMETABLE[0];

  const payload = {
    classItem: targetClass,
    endedAgoText: `Just now (${targetClass.dayName} lecture)`,
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
