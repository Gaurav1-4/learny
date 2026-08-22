# Learny — Project State & Milestone Tracker

**Current Status**: Single-User Auth Lock, 100% Firebase Cloud Storage, Premium Dashboard & 1-to-1 Automatic NotebookLM Mapping Deployed
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
  6. **Google NotebookLM Dedicated Mappings**: 1-to-1 mapped notebooks (`notebookMappings`), SM-2 flashcards, and briefing docs.
  7. **User Settings & Themes**.
- Real-time bidirectional synchronization across your **MacBook and iPhone**.

---

## 📓 3. Automatic 1-to-1 Document-to-NotebookLM Mapping & Editor
- **Automatic Provisioning**: Every single document, lecture slide, and PDF across all courses is automatically provisioned and mapped to its own unique Google NotebookLM Notebook (`notebookId`, `notebookUrl`, `notebookTitle`).
- **Full User Editing**:
  - Click **"Edit Mapping"** in any document's study view to customize the Notebook Title, paste a custom Google NotebookLM URL, or add personal lecture notes/exam hints.
  - Automatically saves and syncs to Firebase Cloud Firestore in real time.
- **Dedicated Study Assets for Every Document**:
  - 2-Host Conversational Audio Overview Podcast with synchronized transcript and speech player.
  - Concept Video Explainer with visual breakdown.
  - SuperMemo SM-2 Active Recall Flashcards with 4-level difficulty grading.
  - Executive Briefing Document with key definitions and exam traps.
  - Grounded Document Q&A Chat.

---

## ✨ 4. Ultra-Clean, High-Information Density Dashboard
- Minimalist header with live `☁️ Firebase Cloud Synced` pill and one-click sync.
- Compact smart homework banner (only shown if a class recently finished or unlogged homework remains).
- High-density 3-column split:
  1. **📋 Pending Assignments** with countdowns and points.
  2. **🔔 Recent Academic Notifications & Announcements** from professors across all courses.
  3. **📅 Today's Live Class Timetable & Room Guide** (*A106, C201, C11, C21*).
