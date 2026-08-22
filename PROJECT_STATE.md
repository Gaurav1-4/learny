# Learny — Project State & Milestone Tracker

**Current Status**: Single-User Auth Lock, 100% Firebase Cloud Storage & Premium Dashboard Deployed
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URL**: [https://learny.zorx.tech](https://learny.zorx.tech)

---

## 🔒 1. Strict Single-User Security Lock
- NextAuth Google OAuth is strictly locked exclusively to **`gaurav25212@iiitd.ac.in`**.
- Any unauthorized email trying to sign in is immediately rejected with an Access Denied block.

---

## ☁️ 2. 100% Cloud-First Architecture (Firebase Firestore)
- All user data is stored centrally in Cloud Firestore under `students/gaurav25212_iiitd_ac_in`:
  1. **Course Evaluations & Marks**: `subjectEvaluations`, `prevSemesters`, component weights, and marks obtained.
  2. **Target Grades & GPA**: Target calculations and multi-semester records.
  3. **Homework Ledgers & KaTeX Problems**: `problemsMap`, `homeworkInputs`, `solvedQuestions`.
  4. **1-Week Backlog**: `backlogHomeworkMap`, `homeworkLogs`.
  5. **Custom Calendar Events**: Auto-scheduled deadlines and timetable overrides.
  6. **Google NotebookLM Study Assets**: Flashcards (SM-2), video/audio scripts, briefing docs.
  7. **User Settings & Themes**.
- Real-time bidirectional synchronization across your **MacBook and iPhone**.

---

## ✨ 3. Ultra-Clean, High-Information Density Dashboard
- **Header**: Minimalist and sleek with `☁️ Firebase Cloud Synced` live status pill and one-click sync.
- **Smart Homework Banner**: Minimal, non-intrusive single-card notification (only shown if homework needs logging, dismissible).
- **High-Density 3-Column Grid**:
  1. **📋 Pending Assignments**: Color-coded course badges, countdowns (*"Due in 2 days"*, *"Overdue"*), max points, and 1-click links.
  2. **🔔 Recent Academic Notifications**: Live feed of professor/TA announcements across all courses with relative timestamps and attachment links.
  3. **📅 Today's Schedule & Room Guide**: Clean timeline with live room numbers (*A106, C201, C11, C21*) and test indicators + quick shortcuts.
