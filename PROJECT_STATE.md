# Learny — Project State & Milestone Tracker

**Current Status**: Live Post-Class Web Notifications & Multi-Class Notification Simulator Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-37245q7h7-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Post-Class Timetable Notification Engine (`src/lib/homework-prompt-engine.ts`)**:
   - Automated triggers synchronized with the Monsoon 2026 course schedule.
   - Triggers native Web Notifications & interactive Dashboard Check-in Banners.
   - Multi-class simulator: test notifications for any of the 10 timetable classes on demand.
2. **1-Week Backlog Resolver Walkthrough (`src/components/backlog/backlog-resolver-modal.tsx`)**:
   - Monday to Friday lecture-by-lecture walkthrough with KaTeX problem sets, methods of work, and auto-scheduling into the Calendar & OKF Google Drive vault.
3. **Gemini 1.5 Flash AI KaTeX Formatter (`/api/homework/ai-format`)**:
   - 9-Key Gemini pool parses shorthand typing into authentic mathematical LaTeX statements.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with post-class notification banner, 1-week backlog resolver, and upcoming deadlines.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with direct content stream and KaTeX typography.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar with 1-Week Backlog Walkthrough.
- `GET /study`: Unified Study & Productivity Hub (Flashcards SM-2, NotebookLM Vault, Focus Timer, GPA Planner).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
