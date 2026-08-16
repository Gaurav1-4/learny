# Learny — Project State & Milestone Tracker

**Current Status**: 1-Week Backlog Resolution Hub & Interactive Lecture-by-Lecture Walkthrough (Monday to Friday Monsoon 2026 Schedule, KaTeX Problem Sets, OKF Google Drive Vault Sync & Calendar Auto-Scheduler) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-a35twcne7-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **1-Week Backlog Resolver Engine (`src/lib/backlog-engine.ts`)**:
   - Covers all 10 lectures across Monday–Friday (Applied Math III, OS, Advanced Programming, DPP, RMSSD).
   - Injects KaTeX problem sets ($\oint_C \frac{z^2+1}{z-3} dz = 0$) into course ledgers (`/courses/mth201`, etc.).
   - Auto-schedules study blocks, lab deadlines, and exam milestones directly into **Calendar & Study Planner** (`/calendar`).
   - Syncs OKF metadata embeddings with the Google Drive 5 TB Vault registry.
2. **Interactive Walkthrough Modal (`src/components/backlog/backlog-resolver-modal.tsx`)**:
   - Filter by day: **Monday | Tuesday | Wednesday | Thursday | Friday | All**.
   - Step-by-step lecture walkthrough with KaTeX math rendering, methods of work, and 1-click **"Log Homework & Schedule"**.
   - Fast-track **"⚡ Resolve All 10 at Once"** 1-click batch logger.
   - Live visual progress bar (`X / 10 Logged • Y% Caught Up`).
3. **Dashboard & Calendar Action Banners**:
   - `src/components/dashboard/backlog-action-card.tsx`: High-priority backlog resolver card on Dashboard.
   - `src/components/calendar/calendar-view.tsx`: Header walkthrough trigger in the Calendar and Weekly Timetable.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with post-class banner, 1-week backlog resolver card, and upcoming deadlines.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with direct content stream and KaTeX typography.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar with 1-Week Backlog Walkthrough.
- `GET /study`: Unified Study & Productivity Hub (Flashcards SM-2, NotebookLM Vault, Focus Timer, GPA Planner).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
