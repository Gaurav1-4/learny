# Learny — Project State & Milestone Tracker

**Current Status**: Complete Zero Fake Data Enforcement Across All Courses & Thomas' Calculus Integration Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-4l6q0gkf0-semly.vercel.app`

---

## 🛡️ STRICT SYSTEM RULE: ZERO FAKE DATA & PROPER DOMAIN SEPARATION

> [!IMPORTANT]
> **RULE: ZERO FAKE DATA & STRICT DOMAIN SEPARATION**:
> 1. Non-math courses (e.g. Operating Systems `CSE231`, Advanced Programming `CSE201`, DPP `DES201`, RMSSD `SSH201`) MUST NEVER contain math formulas or calculus exercises unless explicitly entered by the user.
> 2. Math III / Calculus (`MTH203` / `MTH201`) is locked 100% to **Thomas' Calculus (11th Edition)** by George B. Thomas, Maurice D. Weir, Joel Hass (Chapters 12–16: Multivariable Limits, Partial Derivatives, Multiple Integrals, Vector Integration).
> 3. All legacy mock data in `localStorage` is automatically purged.

---

## 🎯 Verified System Components

1. **Clean Homework Logger (`HomeworkLoggerModal`)**:
   - Initial text is strictly empty (`""`).
   - Dynamic placeholders tailored to each specific course.
2. **AI Homework Parser (`/api/homework/ai-format`)**:
   - Strictly domain-aware: outputs clean tasks for CS/Design and Thomas Calculus multivariable problems for Math.
   - Removed all fallback complex integrals (`\oint_C f(z) dz`).
3. **Course Workspaces (`/courses/[courseId]`)**:
   - Live Google Classroom Prescribed Materials and Stream.
   - Grounded problem sets and study prompts.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with post-class banner, 1-week backlog resolver, and upcoming deadlines.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with live Classroom materials and KaTeX problem solver.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar with 1-Week Backlog Walkthrough.
- `GET /study`: Unified Study & Productivity Hub (Flashcards SM-2, NotebookLM Vault, Focus Timer, GPA Planner).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
