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

// In-Memory & LocalStorage Registry for OKF Manifests
const DEFAULT_OKF_DOCUMENTS: OKFDocumentMetadata[] = [
  {
    id: "iiitd-mth201-lec02",
    courseCode: "MTH201",
    courseName: "Math III (Applied Mathematics III)",
    semester: "3rd Semester (Monsoon 2026)",
    contentType: "lecture_notes",
    lectureNumber: 2,
    title: "Lecture 2: Cauchy's Integral Theorem & Path Independence",
    topics: ["Complex Line Integrals", "Cauchy's Integral Theorem", "Analytic Functions", "Path Independence"],
    homeworkStatus: "LOGGED",
    mandatoryHomework: [
      {
        exercise: "14.2",
        questionNumber: 3,
        title: "Cauchy's Integral Theorem on Unit Circle",
        latex: "\\oint_C \\frac{z^2 + 1}{z - 3} \\, dz = 0, \\quad C: |z| = 1",
        methodOfWork: "The pole at z = 3 lies strictly outside the contour |z| = 1. Therefore, f(z) is analytic everywhere inside and on C. By Cauchy's Integral Theorem, the integral evaluates to 0.",
      },
      {
        exercise: "14.2",
        questionNumber: 5,
        title: "Path Independence Evaluation",
        latex: "\\int_{0}^{1+i\\pi} e^{2z} \\, dz = \\left[ \\frac{e^{2z}}{2} \\right]_{0}^{1+i\\pi} = \\frac{e^{2+2i\\pi} - 1}{2} = \\frac{e^2 - 1}{2}",
        methodOfWork: "Since e^{2z} is an entire function, its integral is path-independent. Integrate using the fundamental theorem of complex calculus.",
      },
      {
        exercise: "14.3",
        questionNumber: 2,
        title: "Cauchy's Integral Formula at Interior Pole",
        latex: "\\oint_C \\frac{e^z}{z - i} \\, dz = 2\\pi i f(i) = 2\\pi i e^i, \\quad C: |z| = 2",
        methodOfWork: "Identify interior singularity z_0 = i inside |z| = 2. Apply Cauchy's Integral Formula: \\oint_C \\frac{f(z)}{z - z_0} dz = 2\\pi i f(z_0).",
      },
      {
        exercise: "14.4",
        questionNumber: 1,
        title: "Higher-Order Derivative Formula",
        latex: "\\oint_C \\frac{\\cos z}{(z - \\pi)^2} \\, dz = 2\\pi i f'(\\pi) = 2\\pi i (-\\sin \\pi) = 0, \\quad C: |z| = 4",
        methodOfWork: "Apply the derivative formula f'(z_0) = \\frac{1}{2\\pi i} \\oint_C \\frac{f(z)}{(z - z_0)^2} dz with f(z) = \\cos z.",
      },
    ],
    similarPractice: [
      {
        exercise: "14.2",
        questionNumber: 4,
        title: "Similar Practice: Contour Integral around Triangle (Same Method as Q3)",
        latex: "\\oint_C (z^3 + 2z) \\, dz = 0, \\quad C: \\text{Triangle vertices at } 0, 1, i",
        methodOfWork: "Polynomials are entire functions (analytic everywhere in the complex plane). By Cauchy's Theorem, the closed contour integral is identically 0.",
        similarTo: 3,
      },
      {
        exercise: "14.3",
        questionNumber: 3,
        title: "Similar Practice: Cauchy Integral with Rational Pole (Same Method as 14.3 Q2)",
        latex: "\\oint_C \\frac{z^2 + 4}{z - 1} \\, dz = 2\\pi i (1^2 + 4) = 10\\pi i, \\quad C: |z| = 3",
        methodOfWork: "Pole at z = 1 lies inside contour |z| = 3. Apply Cauchy's formula directly with f(z) = z^2 + 4.",
        similarTo: 2,
      },
    ],
    storagePath: "Learny Vault/Sem 3/Math III/Notes/Lecture2_ComplexLineIntegrals.pdf",
    keywords: ["math3", "lecture 2", "cauchy", "integral theorem", "14.2", "14.3", "14.4", "line integral"],
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
