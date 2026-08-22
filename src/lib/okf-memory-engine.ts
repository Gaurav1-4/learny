/**
 * OKF (Ontological Knowledge Framework) Long-Term Memory Engine for GAHA
 * 
 * Provides deterministic knowledge graphs, topic mastery tracking, KaTeX formula indexing,
 * and homework problem mapping across all 5 active courses in Semester 3 CSD.
 */

import { pushToFirestore } from "./firebase/firestore-sync";

export interface OKFConcept {
  id: string; // e.g. "mth201-limits-twopath"
  courseCode: string; // "MTH201" | "CSE231" | "CSE201" | "DES201" | "SSH201"
  courseName: string;
  module: string;
  topic: string;
  weekNumber: number;
  masteryPercentage: number; // 0 to 100
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  latexFormulas: string[];
  methodOfWork: string;
  keyTakeaways: string[];
  solvedProblemsCount: number;
  lastReviewedDate?: string;
}

export interface OKFSubjectMemory {
  courseCode: string;
  courseName: string;
  credits: number;
  overallMastery: number; // 0 to 100%
  completedLectures: number;
  totalLectures: number;
  concepts: OKFConcept[];
  urgentReviewTopics: string[];
}

export interface OKFMemoryState {
  lastUpdated: string;
  overallSemesterMastery: number;
  subjects: Record<string, OKFSubjectMemory>;
}

// Initial Pre-Populated Master Knowledge Base for Monsoon 2026 CSD Courses
export const INITIAL_OKF_STATE: OKFMemoryState = {
  lastUpdated: new Date().toISOString(),
  overallSemesterMastery: 78,
  subjects: {
    MTH201: {
      courseCode: "MTH201",
      courseName: "Multivariate Calculus (Math III)",
      credits: 4,
      overallMastery: 82,
      completedLectures: 6,
      totalLectures: 26,
      urgentReviewTopics: ["Two-Path Test for Non-Existence", "Polar Coordinates Substitution in Limits"],
      concepts: [
        {
          id: "mth201-limits-twopath",
          courseCode: "MTH201",
          courseName: "Math III",
          module: "Chapter 14: Partial Derivatives",
          topic: "Multivariable Limits & Continuity",
          weekNumber: 1,
          masteryPercentage: 85,
          difficulty: "Intermediate",
          latexFormulas: [
            "\\lim_{(x,y) \\to (0,0)} \\frac{x^2 - y^2}{x^2 + y^2} = \\text{DNE}",
            "x = r\\cos\\theta, \\quad y = r\\sin\\theta \\implies \\lim_{r \\to 0} f(r\\cos\\theta, r\\sin\\theta)",
          ],
          methodOfWork: "Approach along paths y=kx. If limit depends on slope k, or if limit along x=0 != limit along y=0, limit DNE.",
          keyTakeaways: ["Limit must be identical along ALL infinite approaching paths", "Switch to polar coordinates when x^2 + y^2 is in denominator"],
          solvedProblemsCount: 8,
          lastReviewedDate: "2026-08-20",
        },
        {
          id: "mth201-partial-derivatives",
          courseCode: "MTH201",
          courseName: "Math III",
          module: "Chapter 14: Partial Derivatives",
          topic: "First & Second Order Partial Derivatives",
          weekNumber: 2,
          masteryPercentage: 90,
          difficulty: "Beginner",
          latexFormulas: [
            "f_x(x,y) = \\lim_{h \\to 0} \\frac{f(x+h, y) - f(x,y)}{h}",
            "f_{xy} = \\frac{\\partial^2 f}{\\partial y \\partial x} = f_{yx} \\quad (\\text{Clairaut's Theorem})",
          ],
          methodOfWork: "Treat other variables as constants when differentiating with respect to the target variable.",
          keyTakeaways: ["Clairaut's theorem guarantees equality of mixed partials if continuous", "Used heavily in tangent planes and linearization"],
          solvedProblemsCount: 12,
          lastReviewedDate: "2026-08-21",
        },
        {
          id: "mth201-chain-rule",
          courseCode: "MTH201",
          courseName: "Math III",
          module: "Chapter 14: Partial Derivatives",
          topic: "Multivariable Chain Rule",
          weekNumber: 2,
          masteryPercentage: 75,
          difficulty: "Intermediate",
          latexFormulas: [
            "\\frac{dz}{dt} = \\frac{\\partial z}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial z}{\\partial y}\\frac{dy}{dt}",
            "\\frac{\\partial z}{\\partial u} = \\frac{\\partial z}{\\partial x}\\frac{\\partial x}{\\partial u} + \\frac{\\partial z}{\\partial y}\\frac{\\partial y}{\\partial u}",
          ],
          methodOfWork: "Construct tree diagram of independent and intermediate variables. Sum paths connecting root to leaf.",
          keyTakeaways: ["Always draw the variable tree diagram before computing derivatives", "Parametric curve tangents use single total derivative"],
          solvedProblemsCount: 5,
        },
      ],
    },
    CSE231: {
      courseCode: "CSE231",
      courseName: "Operating Systems (Section A)",
      credits: 4,
      overallMastery: 76,
      completedLectures: 5,
      totalLectures: 26,
      urgentReviewTopics: ["xv6 Context Switching", "System Call Traps & User/Kernel Transition"],
      concepts: [
        {
          id: "os-process-lifecycle",
          courseCode: "CSE231",
          courseName: "Operating Systems",
          module: "Process Management & System Calls",
          topic: "Process States & fork()/exec() Lifecycle",
          weekNumber: 1,
          masteryPercentage: 88,
          difficulty: "Intermediate",
          latexFormulas: [
            "\\text{fork}() \\implies \\text{Child PID } = 0, \\text{ Parent PID } > 0",
            "\\text{Context Switch Time} = T_{\\text{save}} + T_{\\text{sched}} + T_{\\text{restore}}",
          ],
          methodOfWork: "Understand PCB (Process Control Block) contents: registers, PC, stack pointer, file descriptor table.",
          keyTakeaways: ["fork() duplicates memory space via Copy-On-Write (COW)", "execvp() replaces address space with new binary"],
          solvedProblemsCount: 6,
          lastReviewedDate: "2026-08-19",
        },
        {
          id: "os-xv6-syscalls",
          courseCode: "CSE231",
          courseName: "Operating Systems",
          module: "xv6 Kernel Architecture",
          topic: "Traps & User-to-Kernel Boundary",
          weekNumber: 2,
          masteryPercentage: 70,
          difficulty: "Advanced",
          latexFormulas: [
            "\\text{ECALL instruction} \\implies \\text{Trap handler switches } \\text{satp} \\text{ page table}",
          ],
          methodOfWork: "Trace syscall: user call -> usertrap() -> syscall() -> sys_xxx() -> usertrapret() -> sret.",
          keyTakeaways: ["Kernel stack is separate from user stack for security", "Arguments retrieved via argint(), argaddr()"],
          solvedProblemsCount: 4,
        },
      ],
    },
    CSE201: {
      courseCode: "CSE201",
      courseName: "Advanced Programming",
      credits: 4,
      overallMastery: 80,
      completedLectures: 5,
      totalLectures: 26,
      urgentReviewTopics: ["Java Concurrency & Thread Synchronization", "Factory & Singleton Pattern"],
      concepts: [
        {
          id: "ap-oop-patterns",
          courseCode: "CSE201",
          courseName: "Advanced Programming",
          module: "Design Patterns & Object-Oriented Architecture",
          topic: "Creational & Structural Patterns",
          weekNumber: 1,
          masteryPercentage: 85,
          difficulty: "Intermediate",
          latexFormulas: [
            "\\text{SOLID} = \\text{Single Resp, Open/Closed, Liskov, Interface Seg, Dependency Inv}",
          ],
          methodOfWork: "Separate object instantiation from usage through Factory and Abstract Factory abstractions.",
          keyTakeaways: ["Prefer composition over inheritance", "Program to interfaces, not implementations"],
          solvedProblemsCount: 7,
          lastReviewedDate: "2026-08-20",
        },
      ],
    },
    SSH201: {
      courseCode: "SSH201",
      courseName: "RMSSD (Quantitative Methods Pre-Midsem)",
      credits: 4,
      overallMastery: 75,
      completedLectures: 4,
      totalLectures: 24,
      urgentReviewTopics: ["Hypothesis Testing & p-values", "Assignment 1 Data Preparation (Due 7 Sept)"],
      concepts: [
        {
          id: "rmssd-hypothesis-testing",
          courseCode: "SSH201",
          courseName: "RMSSD",
          module: "Module 1: Quantitative Research Design",
          topic: "Hypothesis Testing & Variable Types",
          weekNumber: 1,
          masteryPercentage: 75,
          difficulty: "Intermediate",
          latexFormulas: [
            "z = \\frac{\\bar{x} - \\mu}{\\sigma / \\sqrt{n}}, \\quad t = \\frac{\\bar{x} - \\mu}{s / \\sqrt{n}}",
            "p < \\alpha \\ (0.05) \\implies \\text{Reject } H_0",
          ],
          methodOfWork: "Formulate null hypothesis H0 and alternative H1. Calculate test statistic and compare p-value to alpha.",
          keyTakeaways: ["Home Assignment 1 is due Sept 7th (20% weight)", "Distinguish between Independent vs Dependent variables"],
          solvedProblemsCount: 4,
        },
      ],
    },
    DES201: {
      courseCode: "DES201",
      courseName: "Design Processes & Perspectives (DPP)",
      credits: 4,
      overallMastery: 84,
      completedLectures: 4,
      totalLectures: 24,
      urgentReviewTopics: ["Field Study User Personas", "Design Journal Maintenance (10% weight)"],
      concepts: [
        {
          id: "dpp-design-thinking",
          courseCode: "DES201",
          courseName: "DPP",
          module: "Design Thinking & Observation",
          topic: "Empathy Mapping & Field Studies",
          weekNumber: 1,
          masteryPercentage: 88,
          difficulty: "Beginner",
          latexFormulas: [
            "\\text{Design Double Diamond} = \\text{Discover} \\to \\text{Define} \\to \\text{Develop} \\to \\text{Deliver}",
          ],
          methodOfWork: "Conduct semi-structured interviews, observe user pain points, synthesize affinity diagrams.",
          keyTakeaways: ["Journal maintenance is continuous (10% weight)", "Mid-term jury presentation is 20% weight"],
          solvedProblemsCount: 5,
        },
      ],
    },
  },
};

export class OKFMemoryEngine {
  private static STORAGE_KEY = "learny_okf_memory_state";

  /**
   * Retrieves active OKF memory state from localStorage or cloud Firestore
   */
  static getMemoryState(): OKFMemoryState {
    if (typeof window === "undefined") return INITIAL_OKF_STATE;
    try {
      const local = localStorage.getItem(this.STORAGE_KEY);
      if (local) return JSON.parse(local);
    } catch {}
    return INITIAL_OKF_STATE;
  }

  /**
   * Saves updated memory state to localStorage and triggers background Firestore sync
   */
  static saveMemoryState(state: OKFMemoryState) {
    state.lastUpdated = new Date().toISOString();
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(state));
      } catch {}
      // Sync to Firebase Cloud Firestore under student's persistent profile
      pushToFirestore({
        okfMemory: state,
        lastManagerSync: new Date().toISOString(),
      }).catch(() => {});
    }
  }

  /**
   * Updates topic mastery percentage for a concept
   */
  static updateConceptMastery(conceptId: string, deltaMastery: number): OKFConcept | null {
    const state = this.getMemoryState();
    for (const subKey of Object.keys(state.subjects)) {
      const subject = state.subjects[subKey];
      const concept = subject.concepts.find((c) => c.id === conceptId);
      if (concept) {
        concept.masteryPercentage = Math.min(100, Math.max(0, concept.masteryPercentage + deltaMastery));
        concept.lastReviewedDate = new Date().toISOString().split("T")[0];
        
        // Recalculate subject mastery
        const total = subject.concepts.reduce((acc, c) => acc + c.masteryPercentage, 0);
        subject.overallMastery = Math.round(total / subject.concepts.length);
        
        this.saveMemoryState(state);
        return concept;
      }
    }
    return null;
  }

  /**
   * Searches concepts, formulas, and methods across all subjects in 0ms
   */
  static searchKnowledgeBase(query: string): OKFConcept[] {
    const state = this.getMemoryState();
    const q = query.toLowerCase().trim();
    if (!q) return [];

    const results: OKFConcept[] = [];
    for (const sub of Object.values(state.subjects)) {
      for (const concept of sub.concepts) {
        if (
          concept.topic.toLowerCase().includes(q) ||
          concept.module.toLowerCase().includes(q) ||
          concept.methodOfWork.toLowerCase().includes(q) ||
          concept.latexFormulas.some((f) => f.toLowerCase().includes(q)) ||
          concept.keyTakeaways.some((t) => t.toLowerCase().includes(q))
        ) {
          results.push(concept);
        }
      }
    }
    return results;
  }
}
