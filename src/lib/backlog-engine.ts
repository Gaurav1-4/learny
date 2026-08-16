// 1-Week Backlog Engine & Authentic Monsoon 2026 Timetable Dataset for Learny
// Source of truth: TIMETABLE_CLASSES from weekly-timetable.tsx

import { OKFRegistry } from "@/lib/okf-indexer";

export interface BacklogLecture {
  id: string;
  dayName: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday";
  dayIndex: number; // 1 = Mon, 2 = Tue, 3 = Wed, 4 = Thu, 5 = Fri
  time: string;
  room: string;
  courseId: string;
  courseCode: string;
  courseName: string;
  type: string;
  lectureNumber: number;
  topic: string;
  homeworkSummary: string;
  rawInput: string;
  dueDate: string; // ISO date string
  problems: Array<{
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

// 100% Authentic IIITD Monsoon 2026 Timetable Slots
export const MONSOON_2026_BACKLOG_LECTURES: BacklogLecture[] = [
  // --- MONDAY ---
  {
    id: "mon-dpp-lec",
    dayName: "Monday",
    dayIndex: 1,
    time: "11:00 AM – 12:30 PM",
    room: "A106",
    courseId: "des201",
    courseCode: "DES201",
    courseName: "DPP (Design Processes & Perspectives)",
    type: "Lecture",
    lectureNumber: 1,
    topic: "Design Studio Ideation, Case Studies & Critique",
    homeworkSummary: "Activity 1: 3 Stakeholder Empathy Maps & Needfinding Synthesis",
    rawInput: "DPP Activity 1 Empathy map 3 interviews",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "dpp-act1-q1",
        exercise: "Activity 1",
        qNum: 1,
        title: "Empathy Map Synthesis (Says, Thinks, Does, Feels)",
        latex: "\\text{Need} = \\text{Verb phrase describing latent user friction}",
        topic: "Design Research & Needfinding",
        difficulty: "Easy",
        methodOfWork: "Synthesize interview quotes into the 4 empathy quadrants to uncover unmet user desires.",
      },
    ],
  },
  {
    id: "mon-os-lec",
    dayName: "Monday",
    dayIndex: 1,
    time: "3:00 – 4:30 PM",
    room: "C201",
    courseId: "cse231",
    courseCode: "CSE231",
    courseName: "Operating Systems (OS)",
    type: "Lecture",
    lectureNumber: 1,
    topic: "Processes, Threads, CPU Scheduling & Concurrency",
    homeworkSummary: "Homework Set 1: Process Hierarchy & Fork State Tracing",
    rawInput: "OS HW1 Process fork tracing questions 1-4",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "os-hw1-q1",
        exercise: "HW Set 1",
        qNum: 1,
        title: "Process Tree State Tracing with Nested fork()",
        latex: "N_{\\text{processes}} = 2^k, \\quad \\text{for } k=3 \\text{ sequential fork() calls}",
        topic: "Process Hierarchy & Address Spaces",
        difficulty: "Medium",
        methodOfWork: "Trace each fork branch. Parent and child duplicate state, yielding 2^k processes.",
      },
    ],
  },

  // --- TUESDAY ---
  {
    id: "tue-rmssd-lec",
    dayName: "Tuesday",
    dayIndex: 2,
    time: "11:00 AM – 12:30 PM",
    room: "C11",
    courseId: "ssh201",
    courseCode: "SSH201",
    courseName: "RMSSD (Research Methods in Social Sciences & Design)",
    type: "Lecture",
    lectureNumber: 1,
    topic: "Qualitative/Quantitative Research Methodologies",
    homeworkSummary: "Reading Summary 1: Triangulation in Empirical Study Design",
    rawInput: "RMSSD Reading summary 1 Triangulation",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "ssh-read1-q1",
        exercise: "Summary 1",
        qNum: 1,
        title: "Methodological Triangulation for Construct Validity",
        latex: "\\text{Validity} = \\text{Survey Metrics (Quant) } \\cap \\text{ In-depth Interviews (Qual)}",
        topic: "Research Design Methodologies",
        difficulty: "Easy",
        methodOfWork: "Explain how multi-method convergence validates qualitative and quantitative findings.",
      },
    ],
  },
  {
    id: "tue-m3-tut",
    dayName: "Tuesday",
    dayIndex: 2,
    time: "1:30 – 3:00 PM",
    room: "Tutorial Room",
    courseId: "mth201",
    courseCode: "MTH201",
    courseName: "Math III Tutorial (Graded Weekly Test)",
    type: "Test",
    lectureNumber: 1,
    topic: "Cauchy's Integral Theorem & Closed Contour Integration",
    homeworkSummary: "Ex 14.2 Q3, Q5 • Path Independence Drills",
    rawInput: "14.2 3 5, 14.3 2",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "14.2-3",
        exercise: "Ex 14.2",
        qNum: 3,
        title: "Cauchy's Integral Theorem on Unit Circle",
        latex: "\\oint_C \\frac{z^2 + 1}{z - 3} \\, dz = 0, \\quad C: |z| = 1",
        topic: "Cauchy's Integral Theorem",
        difficulty: "Medium",
        methodOfWork: "Identify pole at z=3. Since z=3 is outside |z|=1, the integrand is analytic inside C. By Cauchy's Theorem, integral is 0.",
      },
      {
        id: "14.2-5",
        exercise: "Ex 14.2",
        qNum: 5,
        title: "Path Independence Evaluation of Exponential Integral",
        latex: "\\int_{0}^{1+i\\pi} e^{2z} \\, dz = \\left[ \\frac{e^{2z}}{2} \\right]_0^{1+i\\pi} = \\frac{e^2 - 1}{2}",
        topic: "Path Independence & Complex Antiderivatives",
        difficulty: "Easy",
        methodOfWork: "e^{2z} is entire, so its integral is path-independent. Integrate using the fundamental theorem of complex calculus.",
      },
    ],
  },
  {
    id: "tue-ap-lec",
    dayName: "Tuesday",
    dayIndex: 2,
    time: "3:00 – 4:30 PM",
    room: "C21",
    courseId: "cse201",
    courseCode: "CSE201",
    courseName: "Advanced Programming (AP)",
    type: "Lecture",
    lectureNumber: 1,
    topic: "OOP Principles, Design Patterns & Dynamic Dispatch",
    homeworkSummary: "Lab 1: Polymorphic Shape Hierarchy & VTable Pointer Analysis",
    rawInput: "AP Lab 1 Shape hierarchy classes",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "ap-lab1-q1",
        exercise: "Lab 1",
        qNum: 1,
        title: "Dynamic Dispatch Resolution via VTable Pointer",
        latex: "\\text{VTable}[\\text{slot}] \\to \\&\\text{Circle::computeArea}()",
        topic: "Virtual Function Dispatch",
        difficulty: "Medium",
        methodOfWork: "Define abstract base class Shape with pure virtual computeArea() and derive concrete subclasses.",
      },
    ],
  },
  {
    id: "tue-m3-lec",
    dayName: "Tuesday",
    dayIndex: 2,
    time: "4:30 – 6:00 PM",
    room: "C201",
    courseId: "mth201",
    courseCode: "MTH201",
    courseName: "Math III Lecture",
    type: "Lecture",
    lectureNumber: 1,
    topic: "Cauchy's Integral Formula at Interior Poles",
    homeworkSummary: "Ex 14.3 Q2 • Singularity Evaluation",
    rawInput: "14.3 2, 14.4 1",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "14.3-2",
        exercise: "Ex 14.3",
        qNum: 2,
        title: "Cauchy's Integral Formula at Interior Singularity",
        latex: "\\oint_C \\frac{e^z}{z - i} \\, dz = 2\\pi i f(i) = 2\\pi i e^i, \\quad C: |z| = 2",
        topic: "Cauchy's Integral Formula",
        difficulty: "Medium",
        methodOfWork: "Interior pole z_0 = i is strictly inside |z|=2. Apply Cauchy's Integral Formula: \\oint_C \\frac{f(z)}{z - z_0} dz = 2\\pi i f(z_0).",
      },
    ],
  },

  // --- WEDNESDAY ---
  {
    id: "wed-os-tut",
    dayName: "Wednesday",
    dayIndex: 3,
    time: "8:30 – 9:30 AM",
    room: "C101",
    courseId: "cse231",
    courseCode: "CSE231",
    courseName: "OS Tutorial",
    type: "Tutorial",
    lectureNumber: 2,
    topic: "OS Problem Solving & Concurrency Synchronization",
    homeworkSummary: "Tutorial Sheet 1: Critical Section & Peterson's Algorithm",
    rawInput: "OS Tut 1 Petersons algorithm questions",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "os-tut1-q1",
        exercise: "Tut Sheet 1",
        qNum: 1,
        title: "Peterson's Algorithm Mutual Exclusion Proof",
        latex: "\\text{flag}[i] = \\text{true}; \\quad \\text{turn} = j;",
        topic: "Mutual Exclusion & Deadlock Freedom",
        difficulty: "Medium",
        methodOfWork: "Prove mutual exclusion, progress, and bounded waiting by analyzing the while loop invariants.",
      },
    ],
  },
  {
    id: "wed-ap-tut",
    dayName: "Wednesday",
    dayIndex: 3,
    time: "2:00 – 3:00 PM",
    room: "Tutorial Room",
    courseId: "cse201",
    courseCode: "CSE201",
    courseName: "AP Tutorial",
    type: "Tutorial",
    lectureNumber: 2,
    topic: "Java Code Reviews & Design Pattern Refactoring",
    homeworkSummary: "Tutorial Drill: Refactoring Monolithic Code with Factory Pattern",
    rawInput: "AP Tut Drill Factory pattern refactoring",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "ap-tut-q1",
        exercise: "Tut Drill",
        qNum: 1,
        title: "Factory Method Interface Decoupling",
        latex: "\\text{ShapeFactory}::\\text{create}(\\text{\"circle\"}) \\to \\text{new Circle}()",
        topic: "Creational Design Patterns",
        difficulty: "Easy",
        methodOfWork: "Encapsulate object instantiation logic inside factory class to decouple client code.",
      },
    ],
  },
  {
    id: "wed-os-lec",
    dayName: "Wednesday",
    dayIndex: 3,
    time: "3:00 – 4:30 PM",
    room: "C201",
    courseId: "cse231",
    courseCode: "CSE231",
    courseName: "OS Lecture",
    type: "Lecture",
    lectureNumber: 2,
    topic: "Memory Management, Paging, Virtual Memory & TLB",
    homeworkSummary: "Practice Sheet 2: Effective Memory Access Time with TLB Hit Ratio",
    rawInput: "OS Practice 2 EMAT TLB calculations",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "os-emat-q1",
        exercise: "Practice 2",
        qNum: 1,
        title: "Effective Memory Access Time (EMAT) Formula",
        latex: "\\text{EMAT} = h \\cdot (t_{\\text{TLB}} + t_{\\text{mem}}) + (1 - h) \\cdot (t_{\\text{TLB}} + 2t_{\\text{mem}})",
        topic: "Paging & TLB Performance",
        difficulty: "Medium",
        methodOfWork: "Calculate average access time weighted by hit ratio h and penalty of 2 memory lookups on page fault.",
      },
    ],
  },

  // --- THURSDAY ---
  {
    id: "thu-rmssd-lab",
    dayName: "Thursday",
    dayIndex: 4,
    time: "9:30 – 11:00 AM",
    room: "C01",
    courseId: "ssh201",
    courseCode: "SSH201",
    courseName: "RMSSD Lab",
    type: "Lab",
    lectureNumber: 2,
    topic: "Statistical Data Analysis, SPSS/R Studio Assignments",
    homeworkSummary: "Lab Sheet 1: ANOVA & Regression Modelling on Survey Datasets",
    rawInput: "RMSSD Lab 1 ANOVA regressions",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "ssh-lab1-q1",
        exercise: "Lab Sheet 1",
        qNum: 1,
        title: "F-Statistic in One-Way ANOVA",
        latex: "F = \\frac{\\text{MS}_{\\text{between}}}{\\text{MS}_{\\text{within}}} = \\frac{\\text{SS}_{\\text{between}} / (k - 1)}{\\text{SS}_{\\text{within}} / (N - k)}",
        topic: "Hypothesis Testing & Variance Analysis",
        difficulty: "Medium",
        methodOfWork: "Compute mean squares between and within groups to test the null hypothesis across treatment means.",
      },
    ],
  },
  {
    id: "thu-dpp-lec",
    dayName: "Thursday",
    dayIndex: 4,
    time: "11:00 AM – 12:30 PM",
    room: "A106",
    courseId: "des201",
    courseCode: "DES201",
    courseName: "DPP Lecture",
    type: "Lecture",
    lectureNumber: 2,
    topic: "Design Frameworks, Heuristic Evaluations & Usability Testing",
    homeworkSummary: "Activity 2: Nielsen's 10 Heuristics Audit on Mobile Interface",
    rawInput: "DPP Activity 2 Heuristic audit 5 screens",
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "dpp-act2-q1",
        exercise: "Activity 2",
        qNum: 1,
        title: "Nielsen's 10 Usability Heuristics Severity Grading",
        latex: "\\text{Severity} \\in \\{0: \\text{No issue}, 1: \\text{Cosmetic}, 2: \\text{Minor}, 3: \\text{Major}, 4: \\text{Catastrophe}\\}",
        topic: "Usability Engineering & Heuristics",
        difficulty: "Easy",
        methodOfWork: "Audit UI screens against Visibility of System Status, Error Prevention, and User Control principles.",
      },
    ],
  },
  {
    id: "thu-ap-lec",
    dayName: "Thursday",
    dayIndex: 4,
    time: "3:00 – 4:30 PM",
    room: "C21",
    courseId: "cse201",
    courseCode: "CSE201",
    courseName: "AP Lecture",
    type: "Lecture",
    lectureNumber: 2,
    topic: "SOLID Architecture & Structural Design Patterns",
    homeworkSummary: "Mini-Assignment 1: Decoupled Observer Pattern Event Notification",
    rawInput: "AP Mini-assignment 1 Observer pattern",
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "ap-solid-q1",
        exercise: "Mini-Assignment 1",
        qNum: 1,
        title: "Open/Closed Principle via Interface Abstractions",
        latex: "\\text{Class is Open for Extension, Closed for Modification}",
        topic: "SOLID Principles & Architecture",
        difficulty: "Medium",
        methodOfWork: "Implement Strategy pattern to allow new algorithm behaviors without modifying existing orchestrator code.",
      },
    ],
  },
  {
    id: "thu-m3-lec",
    dayName: "Thursday",
    dayIndex: 4,
    time: "4:30 – 6:00 PM",
    room: "C102",
    courseId: "mth201",
    courseCode: "MTH201",
    courseName: "Math III Lecture",
    type: "Lecture",
    lectureNumber: 2,
    topic: "Complex Analysis, Cauchy's Derivative Formula & Higher Derivatives",
    homeworkSummary: "Ex 14.4 Q1, Q2 • Higher-Order Contour Derivatives",
    rawInput: "14.4 1 2",
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "14.4-1",
        exercise: "Ex 14.4",
        qNum: 1,
        title: "Higher-Order Derivative Formula on Contour",
        latex: "\\oint_C \\frac{\\cos z}{(z - \\pi)^2} \\, dz = 2\\pi i f'(\\pi) = 2\\pi i (-\\sin \\pi) = 0, \\quad C: |z| = 4",
        topic: "Cauchy's Derivative Formula",
        difficulty: "Hard",
        methodOfWork: "Apply Cauchy's Derivative Formula: f'(z_0) = \\frac{1}{2\\pi i} \\oint_C \\frac{f(z)}{(z - z_0)^2} dz with f(z) = \\cos z, f'(z) = -\\sin z.",
      },
    ],
  },

  // --- FRIDAY ---
  {
    id: "fri-rmssd-lec",
    dayName: "Friday",
    dayIndex: 5,
    time: "11:00 AM – 12:30 PM",
    room: "C11",
    courseId: "ssh201",
    courseCode: "SSH201",
    courseName: "RMSSD Lecture",
    type: "Lecture",
    lectureNumber: 3,
    topic: "Design Research Synthesis, Thematic Coding & Interview Analysis",
    homeworkSummary: "Summary 2: Thematic Affinity Clustering of Qualitative Interviews",
    rawInput: "RMSSD Summary 2 Affinity clustering",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "ssh-aff1-q1",
        exercise: "Summary 2",
        qNum: 1,
        title: "Inductive Thematic Coding Pipeline",
        latex: "\\text{Raw Transcripts} \\to \\text{Codes} \\to \\text{Themes} \\to \\text{Theoretical Framework}",
        topic: "Qualitative Data Analysis",
        difficulty: "Easy",
        methodOfWork: "Code raw qualitative transcript quotes into emergent affinity clusters to extract overarching design themes.",
      },
    ],
  },
  {
    id: "fri-dpp-practice",
    dayName: "Friday",
    dayIndex: 5,
    time: "2:00 – 4:30 PM",
    room: "A106",
    courseId: "des201",
    courseCode: "DES201",
    courseName: "DPP Practice Session",
    type: "Practice",
    lectureNumber: 3,
    topic: "Design Prototyping & Physical Computing Studio",
    homeworkSummary: "Deliverable 1: Paper & Interactive Wireframe Prototypes",
    rawInput: "DPP Deliverable 1 Wireframe prototypes",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "dpp-proto-q1",
        exercise: "Deliverable 1",
        qNum: 1,
        title: "Low-Fidelity vs High-Fidelity Prototype Feedback Iterations",
        latex: "\\text{Iteration Speed} \\propto \\frac{1}{\\text{Prototype Fidelity}}",
        topic: "Iterative Rapid Prototyping",
        difficulty: "Easy",
        methodOfWork: "Build rapid paper prototypes to validate information architecture before high-fidelity visual styling.",
      },
    ],
  },
];

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
    isFullyResolved: completedCount >= totalCount,
    loggedIds,
  };
}

/**
 * Logs a single authentic backlog lecture, writes KaTeX problems, and schedules in Calendar & OKF vault
 */
export function logBacklogLecture(lecture: BacklogLecture): void {
  if (typeof window === "undefined") return;

  // 1. Add ID to logged list
  const status = getBacklogStatus();
  if (!status.loggedIds.includes(lecture.id)) {
    const updated = [...status.loggedIds, lecture.id];
    localStorage.setItem("learny-backlog-logged-ids", JSON.stringify(updated));
  }

  // 2. Save KaTeX problems to Course Ledger
  const courseKey = `learny-problems-${lecture.courseId}`;
  const existingProbsRaw = localStorage.getItem(courseKey);
  const existingProbs = existingProbsRaw ? JSON.parse(existingProbsRaw) : [];
  const mergedProbs = [...existingProbs, ...lecture.problems];
  localStorage.setItem(courseKey, JSON.stringify(mergedProbs));

  // 3. Save raw input to Course Shorthand
  localStorage.setItem(`learny-hw-input-${lecture.courseId}`, lecture.rawInput);

  // 4. Inject Scheduled Event / Milestone into Calendar
  const calendarKey = "learny-calendar-custom-events";
  const existingEventsRaw = localStorage.getItem(calendarKey);
  const existingEvents = existingEventsRaw ? JSON.parse(existingEventsRaw) : [];

  const newEvent = {
    id: `backlog-${lecture.id}`,
    title: `${lecture.courseCode}: ${lecture.topic}`,
    courseName: lecture.courseName,
    date: lecture.dueDate.split("T")[0],
    time: "11:59 PM",
    type: "homework",
    category: "submission",
    description: `${lecture.homeworkSummary} (${lecture.room} • ${lecture.time})`,
  };

  if (!existingEvents.some((e: any) => e.id === newEvent.id)) {
    existingEvents.push(newEvent);
    localStorage.setItem(calendarKey, JSON.stringify(existingEvents));
  }

  // 5. Invalidate / update OKF registry
  const okfLectureId = `iiitd-${lecture.courseId.toLowerCase()}-lec02`;
  OKFRegistry.updateLectureHomework(okfLectureId, lecture.rawInput);
}

/**
 * Fast-track: logs all 15 authentic lectures in the 1-week backlog at once
 */
export function resolveAllBacklog(): void {
  MONSOON_2026_BACKLOG_LECTURES.forEach((lec) => {
    logBacklogLecture(lec);
  });
}

/**
 * Resets backlog state for clean re-testing
 */
export function resetBacklogState(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("learny-backlog-logged-ids");
}
