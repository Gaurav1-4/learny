// 1-Week Backlog Engine & Monsoon 2026 Lecture Dataset for Learny

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

export const MONSOON_2026_BACKLOG_LECTURES: BacklogLecture[] = [
  // 1. Monday - Math III
  {
    id: "mth201-lec01",
    dayName: "Monday",
    dayIndex: 1,
    time: "09:30 AM - 11:00 AM",
    room: "C01",
    courseId: "mth201",
    courseCode: "MTH201",
    courseName: "Applied Mathematics III",
    lectureNumber: 1,
    topic: "Complex Line Integrals & Cauchy's Integral Theorem",
    homeworkSummary: "Ex 14.2 Q3, Q5 • Ex 14.3 Q2 • Ex 14.4 Q1",
    rawInput: "14.2 3 5, 14.3 2, 14.4 1",
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "14.2-3",
        exercise: "Ex 14.2",
        qNum: 3,
        title: "Cauchy's Integral Theorem on Unit Circle",
        latex: "\\oint_C \\frac{z^2 + 1}{z - 3} \\, dz = 0, \\quad C: |z| = 1",
        topic: "Cauchy's Integral Theorem & Path Independence",
        difficulty: "Medium",
        methodOfWork: "Identify pole at z=3. Since z=3 lies strictly outside contour |z|=1, the integrand is analytic everywhere inside C. By Cauchy's Theorem, the closed contour integral is 0.",
      },
      {
        id: "14.2-5",
        exercise: "Ex 14.2",
        qNum: 5,
        title: "Path Independence Evaluation of Exponential Integral",
        latex: "\\int_{0}^{1+i\\pi} e^{2z} \\, dz = \\left[ \\frac{e^{2z}}{2} \\right]_0^{1+i\\pi} = \\frac{e^{2+2i\\pi}-1}{2} = \\frac{e^2 - 1}{2}",
        topic: "Path Independence & Complex Antiderivative",
        difficulty: "Easy",
        methodOfWork: "Because e^{2z} is entire (analytic everywhere in complex plane), its integral is strictly path-independent. Integrate using standard fundamental theorem of calculus.",
      },
      {
        id: "14.3-2",
        exercise: "Ex 14.3",
        qNum: 2,
        title: "Cauchy's Integral Formula with Singularity at Interior Pole",
        latex: "\\oint_C \\frac{e^z}{z - i} \\, dz = 2\\pi i f(i) = 2\\pi i e^i, \\quad C: |z| = 2",
        topic: "Cauchy's Integral Formula",
        difficulty: "Medium",
        methodOfWork: "Interior pole z_0 = i is inside |z|=2. Apply Cauchy's Integral Formula: \\oint_C \\frac{f(z)}{z - z_0} dz = 2\\pi i f(z_0) with f(z) = e^z.",
      },
    ],
  },
  // 2. Monday - Operating Systems
  {
    id: "cse231-lec01",
    dayName: "Monday",
    dayIndex: 1,
    time: "11:30 AM - 01:00 PM",
    room: "B003",
    courseId: "cse231",
    courseCode: "CSE231",
    courseName: "Operating Systems",
    lectureNumber: 1,
    topic: "Process Hierarchy, fork() System Call & IPC Pipes",
    homeworkSummary: "Homework Set 1: Process Tree Fork Tracing & Pipe Buffer Capacity",
    rawInput: "HW1 Process fork tracing questions 1-4",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "os-hw1-q1",
        exercise: "HW Set 1",
        qNum: 1,
        title: "Process Tree State Tracing with Nested fork()",
        latex: "N_{\\text{processes}} = 2^k, \\quad \\text{for } k=3 \\text{ sequential fork() calls}",
        topic: "Process Creation & Memory Duplication",
        difficulty: "Medium",
        methodOfWork: "Trace each fork() branch. Parent and child each execute subsequent lines, yielding 2^k processes.",
      },
    ],
  },
  // 3. Tuesday - Advanced Programming
  {
    id: "cse201-lec01",
    dayName: "Tuesday",
    dayIndex: 2,
    time: "09:30 AM - 11:00 AM",
    room: "C102",
    courseId: "cse201",
    courseCode: "CSE201",
    courseName: "Advanced Programming",
    lectureNumber: 1,
    topic: "Object-Oriented Polymorphism, Virtual Tables & Interface Contracts",
    homeworkSummary: "Lab 1: Polymorphic Shape Hierarchy & Dynamic Dispatch",
    rawInput: "AP Lab 1 Shape hierarchy classes",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "ap-lab1-q1",
        exercise: "Lab 1",
        qNum: 1,
        title: "Dynamic Dispatch Resolution via VTable Pointer",
        latex: "\\text{VTable}[\\text{slot}] \\to \\&\\text{Circle::computeArea}()",
        topic: "Virtual Functions & Dynamic Binding",
        difficulty: "Medium",
        methodOfWork: "Implement abstract base class Shape with pure virtual method computeArea(). Inherit Circle and Rectangle.",
      },
    ],
  },
  // 4. Tuesday - DPP
  {
    id: "des202-lec01",
    dayName: "Tuesday",
    dayIndex: 2,
    time: "02:00 PM - 03:30 PM",
    room: "Design Studio 2",
    courseId: "des202",
    courseCode: "DES202",
    courseName: "Design Processes & Perspectives",
    lectureNumber: 1,
    topic: "Stanford d.school Needfinding & Empathy Mapping",
    homeworkSummary: "Activity 1: Empathy Map Synthesis & 3 Extreme User Interviews",
    rawInput: "DPP Activity 1 Empathy map 3 interviews",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "dpp-act1-q1",
        exercise: "Activity 1",
        qNum: 1,
        title: "Empathy Map Synthesis (Says, Thinks, Does, Feels)",
        latex: "\\text{Need} = \\text{Verb phrase describing human yearning}",
        topic: "Qualitative User Needfinding",
        difficulty: "Easy",
        methodOfWork: "Group interview observations into Says, Thinks, Does, Feels quadrants to infer latent needs and insights.",
      },
    ],
  },
  // 5. Wednesday - Math III Tutorial
  {
    id: "mth201-tut01",
    dayName: "Wednesday",
    dayIndex: 3,
    time: "10:00 AM - 11:00 AM",
    room: "C201",
    courseId: "mth201",
    courseCode: "MTH201",
    courseName: "Applied Mathematics III (Tutorial)",
    lectureNumber: 2,
    topic: "Green's Theorem & Closed Contour Parameterization",
    homeworkSummary: "Tutorial Sheet 1: Problems 1–4 on Line Integrals in the Plane",
    rawInput: "Tutorial Sheet 1 Problems 1-4",
    dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "mth-tut1-q1",
        exercise: "Tut Sheet 1",
        qNum: 1,
        title: "Green's Theorem Double Integral Conversion",
        latex: "\\oint_{\\partial D} (L \\, dx + M \\, dy) = \\iint_D \\left( \\frac{\\partial M}{\\partial x} - \\frac{\\partial L}{\\partial y} \\right) dA",
        topic: "Green's Theorem in 2D",
        difficulty: "Medium",
        methodOfWork: "Compute partial derivatives \\partial M/\\partial x and \\partial L/\\partial y, then integrate over the bounded triangular domain D.",
      },
    ],
  },
  // 6. Wednesday - OS Linux Lab
  {
    id: "cse231-lab01",
    dayName: "Wednesday",
    dayIndex: 3,
    time: "02:00 PM - 04:00 PM",
    room: "Linux Lab 1",
    courseId: "cse231",
    courseCode: "CSE231",
    courseName: "Operating Systems (Lab)",
    lectureNumber: 2,
    topic: "POSIX Pthreads, Mutex Locks & Thread Synchronization",
    homeworkSummary: "Lab 1: Multi-threaded Matrix Multiplication in C with pthread_create",
    rawInput: "OS Lab 1 Multi-threaded matrix multiply",
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "os-lab1-q1",
        exercise: "Lab 1",
        qNum: 1,
        title: "Partitioning Rows Across N Worker Pthreads",
        latex: "\\text{RowRange}(i) = \\left[ \\frac{i \\cdot M}{N}, \\frac{(i+1) \\cdot M}{N} \\right)",
        topic: "Parallel POSIX Threads",
        difficulty: "Hard",
        methodOfWork: "Divide output matrix rows among N threads. Pass slice struct pointer to pthread_create and wait via pthread_join.",
      },
    ],
  },
  // 7. Thursday - Math III
  {
    id: "mth201-lec02",
    dayName: "Thursday",
    dayIndex: 4,
    time: "09:30 AM - 11:00 AM",
    room: "C01",
    courseId: "mth201",
    courseCode: "MTH201",
    courseName: "Applied Mathematics III",
    lectureNumber: 3,
    topic: "Cauchy's Derivative Formula & Singularities",
    homeworkSummary: "Ex 14.3 Q4 • Ex 14.4 Q2, Q5",
    rawInput: "14.3 4, 14.4 2 5",
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "14.4-2",
        exercise: "Ex 14.4",
        qNum: 2,
        title: "Higher-Order Derivative Formula on Contour",
        latex: "\\oint_C \\frac{\\cos z}{(z - \\pi)^2} \\, dz = 2\\pi i f'(\\pi) = 2\\pi i (-\\sin \\pi) = 0, \\quad C: |z| = 4",
        topic: "Derivatives of Analytic Functions",
        difficulty: "Hard",
        methodOfWork: "Apply Cauchy's Derivative Formula: f'(z_0) = \\frac{1}{2\\pi i} \\oint_C \\frac{f(z)}{(z - z_0)^2} dz with f(z) = \\cos z, f'(z) = -\\sin z.",
      },
    ],
  },
  // 8. Thursday - Operating Systems
  {
    id: "cse231-lec02",
    dayName: "Thursday",
    dayIndex: 4,
    time: "11:30 AM - 01:00 PM",
    room: "B003",
    courseId: "cse231",
    courseCode: "CSE231",
    courseName: "Operating Systems",
    lectureNumber: 3,
    topic: "CPU Scheduling Algorithms (FCFS, SJF, Round Robin)",
    homeworkSummary: "Practice Sheet: Turnaround Time, Waiting Time & Gantt Charts",
    rawInput: "OS CPU Scheduling Gantt chart calculations",
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "os-sched-q1",
        exercise: "Scheduling Sheet",
        qNum: 1,
        title: "Average Turnaround & Waiting Time for Round Robin (Quantum = 2ms)",
        latex: "T_{\\text{turnaround}} = T_{\\text{completion}} - T_{\\text{arrival}}, \\quad T_{\\text{wait}} = T_{\\text{turnaround}} - T_{\\text{burst}}",
        topic: "CPU Preemptive Scheduling",
        difficulty: "Medium",
        methodOfWork: "Construct preemptive Gantt chart with time slice Q=2ms. Tabulate completion times and compute averages.",
      },
    ],
  },
  // 9. Friday - Advanced Programming
  {
    id: "cse201-lec02",
    dayName: "Friday",
    dayIndex: 5,
    time: "09:30 AM - 11:00 AM",
    room: "C102",
    courseId: "cse201",
    courseCode: "CSE201",
    courseName: "Advanced Programming",
    lectureNumber: 2,
    topic: "Design Patterns: Factory Method & Observer Pattern",
    homeworkSummary: "Mini-Assignment 1: Stock Ticker Observer Notification System",
    rawInput: "AP Mini-assignment 1 Observer pattern stock ticker",
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "ap-dp-q1",
        exercise: "Mini-Assignment 1",
        qNum: 1,
        title: "Decoupled Event Publisher/Subscriber Interface",
        latex: "\\text{Subject}::\\text{notifyObservers}() \\implies \\forall o \\in \\text{observers}, \\, o.\\text{update}(\\text{price})",
        topic: "Behavioral Design Patterns",
        difficulty: "Medium",
        methodOfWork: "Implement Subject interface with attach/detach methods and Observer interface with update() callback.",
      },
    ],
  },
  // 10. Friday - RMSSD
  {
    id: "soc201-lec01",
    dayName: "Friday",
    dayIndex: 5,
    time: "02:00 PM - 03:30 PM",
    room: "C21",
    courseId: "soc201",
    courseCode: "SOC201",
    courseName: "Research Methods in Social Sciences",
    lectureNumber: 1,
    topic: "Qualitative vs Quantitative Research Methodologies & Case Studies",
    homeworkSummary: "Reading Summary 1: Triangulation & Mixed-Method Study Design",
    rawInput: "RMSSD Reading summary 1 Triangulation",
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    problems: [
      {
        id: "soc-read1-q1",
        exercise: "Summary 1",
        qNum: 1,
        title: "Methodological Triangulation for Validity",
        latex: "\\text{Validity} = \\text{Convergence of Survey (Quant) } \\cap \\text{ In-depth Interviews (Qual)}",
        topic: "Social Science Research Design",
        difficulty: "Easy",
        methodOfWork: "Synthesize 1-page summary explaining how combining qualitative interviews with quantitative metrics validates findings.",
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
 * Logs a single backlog lecture, writes KaTeX problems, and schedules in Calendar & OKF vault
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
    title: `${lecture.courseCode} Homework: ${lecture.topic}`,
    courseName: lecture.courseName,
    date: lecture.dueDate.split("T")[0],
    time: "11:59 PM",
    type: "homework",
    category: "submission",
    description: lecture.homeworkSummary,
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
 * Fast-track: logs all 10 lectures in the 1-week backlog at once
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
