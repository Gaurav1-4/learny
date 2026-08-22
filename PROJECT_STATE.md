# Learny — Project State & Milestone Tracker

**Current Status**: GAHA Chatbot Fixed & Verified (Gemini 3.5 Flash Lite + Multi-Key Failover), Single-User Auth Lock, 100% Firebase Cloud Storage, Premium Dashboard & 1-to-1 Automatic NotebookLM Mapping Deployed
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URL**: [https://learny.zorx.tech](https://learny.zorx.tech)

---

## 🛠️ Chatbot Fix & Model Upgrade (Resolved)
- **Root Cause**: The pool was targeting `gemini-2.0-flash-lite`, which returned 404 (deprecated endpoint).
- **Resolution**:
  - Upgraded model target in `src/lib/gemini-pool.ts` and `src/lib/gaha-engine.ts` to active supported endpoints: `gemini-3.5-flash-lite` and `gemini-3.6-flash`.
  - Added seamless multi-key failover handling for 403/429 status codes.
  - Verified live with live test queries returning full KaTeX derivations and course context with 200 OK.

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
