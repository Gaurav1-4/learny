/**
 * OKF (Ontological Knowledge Framework) Academic Indexer & Deterministic Retrieval Engine
 * 
 * Provides deterministic, structured metadata tagging for lecture notes, textbooks, and homework
 * enabling instant 0ms retrieval without probabilistic RAG embeddings.
 */

export interface OKFQuestionEntity {
  questionId: string; // e.g. "MTH201-14.2-Q3"
  exerciseSection: string; // "14.2"
  questionNumber: number; // 3
  parentLectureId: string; // "iiitd-mth201-lec02"
  topic: string;
  latexStatement: string;
  methodOfWork: string;
  difficulty: "Easy" | "Medium" | "Hard";
  isMandatory: boolean;
}

export interface OKFDocumentMetadata {
  id: string; // e.g. "iiitd-mth201-lec02"
  courseCode: string; // e.g. "MTH201"
  courseName: string; // e.g. "Math III"
  semester: string; // e.g. "3rd Semester (Monsoon 2026)"
  contentType: "lecture_notes" | "textbook" | "tutorial_sheet" | "assignment" | "syllabus";
  lectureNumber?: number; // e.g. 2
  title: string; // Extracted via NotebookLM (studyonly.co@gmail.com)
  topics: string[]; // Extracted via NotebookLM
  homeworkStatus: "LOGGED" | "PENDING" | "NO_HOMEWORK";
  mandatoryHomework: Array<{
    exercise: string;
    questionNumber: number;
    title: string;
    latex: string;
    methodOfWork: string;
  }>;
  similarPractice: Array<{
    exercise: string;
    questionNumber: number;
    title: string;
    latex: string;
    methodOfWork: string;
    similarTo: number;
  }>;
  storagePath: string; // "Learny Vault/Sem 3/Math III/Notes/Lecture2.pdf"
  driveFileId?: string;
  directDownloadUrl?: string;
  keywords: string[];
  updatedAt: string;
}

const DEFAULT_OKF_DOCUMENTS: OKFDocumentMetadata[] = [
  {
    id: "iiitd-mth201-lec02",
    courseCode: "MTH203",
    courseName: "Multivariate Calculus (Math III)",
    semester: "3rd Semester (Monsoon 2026)",
    contentType: "lecture_notes",
    lectureNumber: 2,
    title: "Lecture 2: Limits in Higher Dimensions & Partial Derivatives",
    topics: ["Multivariable Limits", "Two-Path Test", "Partial Differentiation", "Chain Rule in Higher Dimensions"],
    homeworkStatus: "LOGGED",
    mandatoryHomework: [
      {
        exercise: "14.2",
        questionNumber: 3,
        title: "Two-Path Test for Non-Existence of Limit",
        latex: "\\lim_{(x,y) \\to (0,0)} \\frac{x^2 - y^2}{x^2 + y^2} = \\text{Does Not Exist (DNE)}",
        methodOfWork: "Approach along y=0 gives 1, while approach along x=0 gives -1. Since directional limits differ, the multivariable limit does not exist.",
      },
      {
        exercise: "14.2",
        questionNumber: 5,
        title: "Multivariable Limit via Polar Substitution",
        latex: "\\lim_{(x,y) \\to (0,0)} \\frac{3x^2 y}{x^2 + y^2} = \\lim_{r \\to 0} 3r\\cos^2\\theta\\sin\\theta = 0",
        methodOfWork: "Substitute polar coordinates x=r\\cos\\theta, y=r\\sin\\theta. As r approaches 0, the function converges to 0 independent of angle \\theta.",
      },
      {
        exercise: "14.3",
        questionNumber: 2,
        title: "First-Order Partial Derivatives",
        latex: "f(x,y) = x^3 y^2 + 2xy \\implies \\frac{\\partial f}{\\partial x} = 3x^2 y^2 + 2y, \\quad \\frac{\\partial f}{\\partial y} = 2x^3 y + 2x",
        methodOfWork: "Hold y constant when taking partial derivative with respect to x, and hold x constant when differentiating with respect to y.",
      },
      {
        exercise: "14.4",
        questionNumber: 1,
        title: "Multivariable Chain Rule for Parametric Paths",
        latex: "\\frac{dw}{dt} = \\frac{\\partial w}{\\partial x}\\frac{dx}{dt} + \\frac{\\partial w}{\\partial y}\\frac{dy}{dt}",
        methodOfWork: "Apply the multivariable chain rule tree diagram summing partial derivatives along each parametric component.",
      },
    ],
    similarPractice: [
      {
        exercise: "14.2",
        questionNumber: 4,
        title: "Similar Practice: Limit along Parabolic Paths y = kx^2",
        latex: "\\lim_{(x,y) \\to (0,0)} \\frac{xy^2}{x^2 + y^4} = \\text{DNE (Path dependent on } x = my^2)",
        methodOfWork: "Test the non-linear parabolic curve x = my^2 to show path dependence, proving discontinuity at the origin.",
        similarTo: 3,
      },
    ],
    storagePath: "Learny Vault/Sem 3/Math III/Notes/Lecture2_Limits_PartialDerivatives.pdf",
    keywords: ["math3", "mth203", "thomas calculus", "lecture 2", "limits", "partial derivatives", "chain rule", "14.2", "14.3", "14.4"],
    updatedAt: new Date().toISOString(),
  },
  {
    id: "iiitd-cse231-lec01",
    courseCode: "CSE231",
    courseName: "Operating Systems (OS)",
    semester: "3rd Semester (Monsoon 2026)",
    contentType: "lecture_notes",
    lectureNumber: 1,
    title: "Lecture 1: Processes, Dual Mode Execution & Context Switching",
    topics: ["Dual Mode Protection", "Process Control Block", "Context Switch Latency", "System Calls"],
    homeworkStatus: "NO_HOMEWORK",
    mandatoryHomework: [],
    similarPractice: [],
    storagePath: "Learny Vault/Sem 3/Operating Systems/Notes/Lecture1_Processes_DualMode.pdf",
    keywords: ["os", "lecture 1", "processes", "pcb", "dual mode", "kernel", "user mode"],
    updatedAt: new Date().toISOString(),
  },
];

export class OKFRegistry {
  private static storageKey = "learny_okf_manifest_registry";

  static getAllDocuments(): OKFDocumentMetadata[] {
    if (typeof window === "undefined") {
      return DEFAULT_OKF_DOCUMENTS;
    }
    const saved = localStorage.getItem(this.storageKey);
    if (!saved) {
      localStorage.setItem(this.storageKey, JSON.stringify(DEFAULT_OKF_DOCUMENTS));
      return DEFAULT_OKF_DOCUMENTS;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return DEFAULT_OKF_DOCUMENTS;
    }
  }

  static getDocumentById(id: string): OKFDocumentMetadata | undefined {
    const docs = this.getAllDocuments();
    return docs.find((d) => d.id === id);
  }

  static saveDocument(doc: OKFDocumentMetadata): void {
    if (typeof window === "undefined") return;
    const docs = this.getAllDocuments();
    const existingIdx = docs.findIndex((d) => d.id === doc.id);
    if (existingIdx >= 0) {
      docs[existingIdx] = doc;
    } else {
      docs.push(doc);
    }
    localStorage.setItem(this.storageKey, JSON.stringify(docs));
  }

  /**
   * Dynamically updates the homework section of a lecture based on user input
   */
  static updateLectureHomework(lectureId: string, rawHomeworkInput: string): OKFDocumentMetadata | null {
    const doc = this.getDocumentById(lectureId);
    if (!doc) return null;

    // Parse input e.g. "14.2 3 5, 14.3 2, 14.4 1"
    const sections = rawHomeworkInput.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean);
    const newMandatory: OKFDocumentMetadata["mandatoryHomework"] = [];
    const newSimilar: OKFDocumentMetadata["similarPractice"] = [];

    sections.forEach((secStr) => {
      const match = secStr.match(/^(\d+\.\d+)\s*(.*)$/);
      if (match) {
        const exercise = match[1];
        const rawNums = match[2].match(/\d+/g) || ["1"];
        rawNums.forEach((nStr) => {
          const qNum = parseInt(nStr, 10);
          newMandatory.push({
            exercise,
            questionNumber: qNum,
            title: `Assigned Question ${qNum} in Section ${exercise}`,
            latex: `\\text{Solve Problem } ${qNum} \\text{ from Section } ${exercise}`,
            methodOfWork: `Standard textbook method for Section ${exercise}: evaluate boundary conditions and compute step-by-step.`,
          });

          // Generate a similar practice problem
          newSimilar.push({
            exercise,
            questionNumber: qNum + 1,
            title: `Similar Practice Question ${qNum + 1} (Same Method as Q${qNum})`,
            latex: `\\text{Practice Problem } ${qNum + 1} \\text{ in Section } ${exercise}`,
            methodOfWork: `Analogous to Question ${qNum}: follow the exact same integration/differentiation technique with modified constants.`,
            similarTo: qNum,
          });
        });
      }
    });

    doc.homeworkStatus = newMandatory.length > 0 ? "LOGGED" : "NO_HOMEWORK";
    doc.mandatoryHomework = newMandatory;
    doc.similarPractice = newSimilar;
    doc.updatedAt = new Date().toISOString();

    this.saveDocument(doc);
    return doc;
  }

  /**
   * Deterministic Non-RAG query engine
   * Matches query parameters directly against structured OKF manifest
   */
  static query({
    courseCode,
    lectureNumber,
    topic,
    query,
  }: {
    courseCode?: string;
    lectureNumber?: number;
    topic?: string;
    query?: string;
  }): OKFDocumentMetadata[] {
    const docs = this.getAllDocuments();
    return docs.filter((doc) => {
      if (courseCode && doc.courseCode.toLowerCase() !== courseCode.toLowerCase()) {
        return false;
      }
      if (lectureNumber !== undefined && doc.lectureNumber !== lectureNumber) {
        return false;
      }
      if (topic && !doc.topics.some((t) => t.toLowerCase().includes(topic.toLowerCase()))) {
        return false;
      }
      if (query) {
        const q = query.toLowerCase();
        const matchesKeyword = doc.keywords.some((k) => k.includes(q));
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesTopic = doc.topics.some((t) => t.toLowerCase().includes(q));
        if (!matchesKeyword && !matchesTitle && !matchesTopic) return false;
      }
      return true;
    });
  }
}
