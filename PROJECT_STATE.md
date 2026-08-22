# Learny — Project State & Milestone Tracker

**Current Status**: GAHA Intelligence Layer (9-Key Pool), Single-User Auth Lock, 100% Firebase Cloud Storage, Premium Dashboard & 1-to-1 Automatic NotebookLM Mapping Deployed
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URL**: [https://learny.zorx.tech](https://learny.zorx.tech)

---

## 🧠 1. GAHA Academic Intelligence Layer (9-Key Gemini Pool)
- **Identity & Role**: **GAHA** (*Gaurav's Academic & Homework Assistant*), your personal AI academic manager tailored to IIIT Delhi Monsoon 2026 courses (*Math III, OS, AP, DPP, RMSSD*).
- **9-Key Load-Balancing Infrastructure**:
  - Automatically load-balances requests across all 9 Gemini API keys with round-robin execution and instant 0ms failover (capacity of 13,500 requests/day).
- **Multi-Domain Intelligence Engine**:
  1. **Homework & KaTeX Math**: Step-by-step mathematical problem decomposition with formulas and hints.
  2. **NotebookLM Synthesis**: Auto-generation of 2-host audio podcasts, video explainer scenes, SM-2 flashcard decks, and executive briefings.
  3. **Target Grade Calculus**: Calculates required scores on midsems and endsems to guarantee your target GPA.
  4. **Schedule & Backlog Planning**: Dynamic planning around your class timetable and pending deadlines.
- **Floating GAHA Copilot**:
  - Global floating pill with 9-node live health indicator (`⚡ GAHA: 9 Engines Online`).
  - Expandable copilot drawer with KaTeX math rendering, quick action chips, and key pool monitor.

---

## 🔒 2. Strict Single-User Security Lock
- NextAuth Google OAuth is strictly locked exclusively to **`gaurav25212@iiitd.ac.in`**.
- Any unauthorized email trying to sign in is immediately rejected with an Access Denied block.

---

## ☁️ 3. 100% Cloud-First Architecture (Firebase Firestore)
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

## 📓 4. Automatic 1-to-1 Document-to-NotebookLM Mapping & Editor
- Every document, lecture slide, and PDF across all courses is automatically provisioned and mapped to its own unique Google NotebookLM Notebook (`notebookId`, `notebookUrl`, `notebookTitle`).
- Full user editing for titles, custom URLs, personal notes, and SM-2 flashcards.

---

## ✨ 5. Ultra-Clean, High-Information Density Dashboard
- Clean layout with live `☁️ Firebase Cloud Synced` pill and one-click sync.
- Compact smart homework banner.
- High-density 3-column split:
  1. **📋 Pending Assignments** with countdowns and points.
  2. **🔔 Recent Academic Notifications & Announcements** from professors across all courses.
  3. **📅 Today's Live Class Timetable & Room Guide** (*A106, C201, C11, C21*).
