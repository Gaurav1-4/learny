# Learny — Project State & Milestone Tracker

**Current Status**: 100% Feature Verification & Unified Study Suite Hub (Flashcards, NotebookLM, Focus Timer, GPA & Timetable) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-ilh6vhp3z-semly.vercel.app`

---

## 🎯 Full System & Feature Verification (All 10 Core Systems 100% Live)

1. **Academic Dashboard (`/dashboard`)**:
   - Live Google Classroom sync & active course counter.
   - Strict temporal separation (`Upcoming` strictly `dueDate >= now`, `Overdue` isolated).
   - 1-click Quick Launch to Courses.
2. **Courses Catalog & Lecture Stream (`/courses`, `/courses/[courseId]`)**:
   - Active and Archived Classroom courses with instant search.
   - Lecture materials with 1-click Google Drive PDF, YouTube, and link openers.
   - Assignment grades and submission status trackers.
3. **KaTeX Problem Sets & Homework Logger (`SubjectWorkflowSuite`)**:
   - Complex Contour Integrals ($\oint_C \frac{z^2+1}{z-3} dz = 0$), Path Independence, and Cauchy Formulas.
   - Voice and Shorthand homework logger (`14.2 3 5, 14.3 2, 14.4 1`).
   - Step-by-step Method of Work proofs.
4. **AI Study Companion & Syllabus Prompts (`/courses/[courseId]`)**:
   - 4 Contextual AI prompts per course (Foundations, Midsem Quizzes, Exam Pitfalls, SM-2 flashcard generator).
5. **Academic Schedule & Timetable (`/calendar`)**:
   - **Tab 1: Weekly Timetable**: Monsoon 2026 course schedule with classroom venues, labs, and tutorials.
   - **Tab 2: AI Study Planner**: Autonomous study prep matrix and spaced repetition scheduler.
   - **Tab 3: Month View**: Monthly deadline calendar with custom milestone events.
6. **AI Study Decks & SuperMemo SM-2 (`/study?tab=decks`)**:
   - SuperMemo SM-2 Spaced Repetition engine with Again/Hard/Good/Easy interval calculation.
   - Flashcards flip card player and interactive multiple-choice quiz runner.
   - IIIT Delhi 3rd Sem CSD deck loader + JSON/Markdown import & export.
7. **NotebookLM Dual-Account Hub (`/notebooklm` & `/study?tab=notebooklm`)**:
   - Dual-Account Switcher (Personal & College `@iiitd.ac.in` email).
   - 5 TB Vault Drive Bridge & 1-Click Auto-Sync.
   - Cookie Connector for seamless background sync.
8. **Focus Timer & Pomodoro Chamber (`/timer` & `/study?tab=timer`)**:
   - 25m Focus / 5m Break / 15m Long Break Pomodoro timer with Web Audio API chime synthesis.
   - Session task tracker and daily focus streak log.
9. **GPA, CGPA & Continuous Evaluation Hub (`/gpa` & `/study?tab=gpa`)**:
   - Continuous Evaluation tracker per subject (Assignments, Midsem, Lab Quizzes, Endsem).
   - Multi-Semester CGPA calculator with Indian 10-point scale.
   - **Target Grade Planner**: Exact required score on remaining endsem exam to hit target letter grade.
10. **Settings, Profile & JSON Backup (`/settings`)**:
    - Student Profile & POR Editor.
    - 9-Key AI Pool Status & Dual-Account Token Monitor.
    - 1-Click Full JSON Data Backup & Restore Hub.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with action items and upcoming deadlines.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with direct content stream and KaTeX typography.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /study`: Unified Study & Productivity Hub (Flashcards SM-2, NotebookLM Vault, Focus Timer, GPA Planner).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
