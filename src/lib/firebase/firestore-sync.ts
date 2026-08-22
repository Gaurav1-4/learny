"use client";

import { db } from "./config";
import { doc, getDoc, setDoc, onSnapshot, serverTimestamp } from "firebase/firestore";

export interface StudentCloudState {
  backlogHomeworkMap?: Record<string, any>;
  homeworkLogs?: any[];
  solvedQuestions?: Record<string, boolean>;
  problemsMap?: Record<string, any[]>;
  calendarEvents?: any[];
  customCalendarEvents?: any[];
  studyDecks?: any[];
  gpaRecords?: any;
  gpaSemesters?: any[];
  subjectEvaluations?: any[];
  prevSemesters?: any[];
  targetGrades?: any[];
  notebookDocuments?: Record<string, any>;
  settings?: any;
  updatedAt?: any;
  lastSyncedAt?: string;
}

export function getStudentIdentifier(): string {
  if (typeof window === "undefined") return "gaurav25212_iiitd_ac_in";
  const sessionUser = localStorage.getItem("learny-user-email");
  if (sessionUser && sessionUser.trim()) {
    return sessionUser.trim().toLowerCase().replace(/[^a-zA-Z0-9_]/g, "_");
  }
  return "gaurav25212_iiitd_ac_in";
}

/**
 * Upload any partial state to Cloud Firestore in real time
 */
export async function pushToFirestore(data: Partial<StudentCloudState>, customStudentId?: string) {
  if (typeof window === "undefined" || !db) return;
  try {
    const studentId = customStudentId || getStudentIdentifier();
    const studentRef = doc(db, "students", studentId);
    await setDoc(studentRef, {
      ...data,
      lastSyncedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
    
    // Also notify other local components and tabs
    window.dispatchEvent(new Event("learny-cloud-synced"));
  } catch (err) {
    console.warn("Firestore sync push warning (offline or permissions):", err);
  }
}

/**
 * Perform a full bidirectional sync: Uploads local changes, downloads cloud updates
 */
export async function syncAllWithFirestore(customStudentId?: string): Promise<StudentCloudState | null> {
  if (typeof window === "undefined" || !db) return null;
  try {
    const studentId = customStudentId || getStudentIdentifier();
    const studentRef = doc(db, "students", studentId);

    // 1. Gather all local state
    const localState: Partial<StudentCloudState> = {};

    const rawBacklogMap = localStorage.getItem("learny-backlog-homework-map");
    if (rawBacklogMap) {
      try { localState.backlogHomeworkMap = JSON.parse(rawBacklogMap); } catch {}
    } else {
      localState.backlogHomeworkMap = {};
    }

    // Also collect all individual backlog lecture items
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith("learny-backlog-hw-")) {
        const lecId = key.replace("learny-backlog-hw-", "");
        try {
          const item = JSON.parse(localStorage.getItem(key) || "{}");
          if (item && localState.backlogHomeworkMap) {
            localState.backlogHomeworkMap[lecId] = item;
          }
        } catch {}
      }
    }

    const rawHwLogs = localStorage.getItem("learny-homework-logs");
    if (rawHwLogs) {
      try { localState.homeworkLogs = JSON.parse(rawHwLogs); } catch {}
    }

    const rawSolved = localStorage.getItem("learny-solved-questions");
    if (rawSolved) {
      try { localState.solvedQuestions = JSON.parse(rawSolved); } catch {}
    }

    const rawEvents = localStorage.getItem("learny-calendar-events");
    if (rawEvents) {
      try { localState.calendarEvents = JSON.parse(rawEvents); } catch {}
    }

    const rawCustomEvents = localStorage.getItem("learny-calendar-custom-events");
    if (rawCustomEvents) {
      try { localState.customCalendarEvents = JSON.parse(rawCustomEvents); } catch {}
    }

    const rawDecks = localStorage.getItem("learny-study-decks");
    if (rawDecks) {
      try { localState.studyDecks = JSON.parse(rawDecks); } catch {}
    }

    const rawGpa = localStorage.getItem("learny-gpa-records") || localStorage.getItem("learny-gpa-data");
    if (rawGpa) {
      try { localState.gpaRecords = JSON.parse(rawGpa); } catch {}
    }

    const rawSubjects = localStorage.getItem("learny_subject_evaluations");
    if (rawSubjects) {
      try { localState.subjectEvaluations = JSON.parse(rawSubjects); } catch {}
    }

    const rawPrevSems = localStorage.getItem("learny_prev_semesters");
    if (rawPrevSems) {
      try { localState.prevSemesters = JSON.parse(rawPrevSems); } catch {}
    }

    const rawTargetGrades = localStorage.getItem("learny_target_grades");
    if (rawTargetGrades) {
      try { localState.targetGrades = JSON.parse(rawTargetGrades); } catch {}
    }

    // 2. Fetch existing Cloud Firestore document
    const snap = await getDoc(studentRef);
    let cloudData: StudentCloudState = {};

    if (snap.exists()) {
      cloudData = snap.data() as StudentCloudState;
      
      // Merge Cloud into Local (Cloud is the master source of truth across devices)
      if (cloudData.backlogHomeworkMap) {
        const mergedBacklog = { ...localState.backlogHomeworkMap, ...cloudData.backlogHomeworkMap };
        localStorage.setItem("learny-backlog-homework-map", JSON.stringify(mergedBacklog));
        Object.keys(mergedBacklog).forEach((lecId) => {
          localStorage.setItem(`learny-backlog-hw-${lecId}`, JSON.stringify(mergedBacklog[lecId]));
        });
        localState.backlogHomeworkMap = mergedBacklog;
      }

      if (cloudData.homeworkLogs && cloudData.homeworkLogs.length > 0) {
        localStorage.setItem("learny-homework-logs", JSON.stringify(cloudData.homeworkLogs));
      }

      if (cloudData.solvedQuestions) {
        const mergedSolved = { ...localState.solvedQuestions, ...cloudData.solvedQuestions };
        localStorage.setItem("learny-solved-questions", JSON.stringify(mergedSolved));
        localState.solvedQuestions = mergedSolved;
      }

      if (cloudData.calendarEvents && cloudData.calendarEvents.length > 0) {
        localStorage.setItem("learny-calendar-events", JSON.stringify(cloudData.calendarEvents));
      }

      if (cloudData.customCalendarEvents && cloudData.customCalendarEvents.length > 0) {
        localStorage.setItem("learny-calendar-custom-events", JSON.stringify(cloudData.customCalendarEvents));
      }

      if (cloudData.studyDecks && cloudData.studyDecks.length > 0) {
        localStorage.setItem("learny-study-decks", JSON.stringify(cloudData.studyDecks));
      }

      if (cloudData.gpaRecords) {
        localStorage.setItem("learny-gpa-records", JSON.stringify(cloudData.gpaRecords));
        localStorage.setItem("learny-gpa-data", JSON.stringify(cloudData.gpaRecords));
      }

      if (cloudData.subjectEvaluations && cloudData.subjectEvaluations.length > 0) {
        localStorage.setItem("learny_subject_evaluations", JSON.stringify(cloudData.subjectEvaluations));
        localState.subjectEvaluations = cloudData.subjectEvaluations;
      }

      if (cloudData.prevSemesters && cloudData.prevSemesters.length > 0) {
        localStorage.setItem("learny_prev_semesters", JSON.stringify(cloudData.prevSemesters));
        localState.prevSemesters = cloudData.prevSemesters;
      }

      if (cloudData.targetGrades && cloudData.targetGrades.length > 0) {
        localStorage.setItem("learny_target_grades", JSON.stringify(cloudData.targetGrades));
        localState.targetGrades = cloudData.targetGrades;
      }

      if (cloudData.problemsMap) {
        Object.keys(cloudData.problemsMap).forEach((cId) => {
          localStorage.setItem(`learny-problems-${cId}`, JSON.stringify(cloudData.problemsMap![cId]));
        });
      }
    }

    // 3. Push the fully merged state back to Firestore so cloud has everything
    await setDoc(studentRef, {
      ...localState,
      lastSyncedAt: new Date().toISOString(),
      updatedAt: serverTimestamp(),
    }, { merge: true });

    return { ...cloudData, ...localState };
  } catch (err) {
    console.warn("Firestore full sync warning:", err);
    return null;
  }
}

/**
 * Real-time listener for live sync across devices (MacBook <-> iPhone)
 */
export function listenToFirestoreSync(callback?: (state: StudentCloudState) => void, customStudentId?: string) {
  if (typeof window === "undefined" || !db) return () => {};

  try {
    const studentId = customStudentId || getStudentIdentifier();
    const studentRef = doc(db, "students", studentId);

    const unsubscribe = onSnapshot(studentRef, (snap) => {
      if (!snap.exists()) return;
      const cloudData = snap.data() as StudentCloudState;

      // Hydrate local storage if changed on another device (e.g. iPhone)
      if (cloudData.backlogHomeworkMap) {
        localStorage.setItem("learny-backlog-homework-map", JSON.stringify(cloudData.backlogHomeworkMap));
        Object.keys(cloudData.backlogHomeworkMap).forEach((lecId) => {
          localStorage.setItem(`learny-backlog-hw-${lecId}`, JSON.stringify(cloudData.backlogHomeworkMap![lecId]));
        });
      }

      if (cloudData.homeworkLogs) {
        localStorage.setItem("learny-homework-logs", JSON.stringify(cloudData.homeworkLogs));
      }

      if (cloudData.solvedQuestions) {
        localStorage.setItem("learny-solved-questions", JSON.stringify(cloudData.solvedQuestions));
      }

      if (cloudData.calendarEvents) {
        localStorage.setItem("learny-calendar-events", JSON.stringify(cloudData.calendarEvents));
      }

      if (cloudData.customCalendarEvents) {
        localStorage.setItem("learny-calendar-custom-events", JSON.stringify(cloudData.customCalendarEvents));
      }

      if (cloudData.studyDecks) {
        localStorage.setItem("learny-study-decks", JSON.stringify(cloudData.studyDecks));
      }

      if (cloudData.gpaRecords) {
        localStorage.setItem("learny-gpa-records", JSON.stringify(cloudData.gpaRecords));
        localStorage.setItem("learny-gpa-data", JSON.stringify(cloudData.gpaRecords));
      }

      if (cloudData.subjectEvaluations) {
        localStorage.setItem("learny_subject_evaluations", JSON.stringify(cloudData.subjectEvaluations));
      }

      if (cloudData.prevSemesters) {
        localStorage.setItem("learny_prev_semesters", JSON.stringify(cloudData.prevSemesters));
      }

      if (cloudData.targetGrades) {
        localStorage.setItem("learny_target_grades", JSON.stringify(cloudData.targetGrades));
      }

      if (cloudData.problemsMap) {
        Object.keys(cloudData.problemsMap).forEach((cId) => {
          localStorage.setItem(`learny-problems-${cId}`, JSON.stringify(cloudData.problemsMap![cId]));
        });
      }

      window.dispatchEvent(new Event("learny-cloud-synced"));
      if (callback) callback(cloudData);
    });

    return unsubscribe;
  } catch (err) {
    console.warn("Firestore listener error:", err);
    return () => {};
  }
}
