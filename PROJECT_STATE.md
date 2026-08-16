# Learny — Project State & Milestone Tracker

**Current Status**: Real-Time Form Submission & Cross-Device Cloud Syncing (Laptop ↔ Phone ↔ Tablet) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-69n4tri7i-semly.vercel.app`

---

## 🛠️ Fixed: Form State & Real Homework Persistence

1. **Root Cause**: `handleSaveHomework` was reading an uninitialized input map key when the form was submitted, causing it to fall back to empty string and mark `No homework assigned`.
2. **The Fix**:
   - Explicitly tied the `<form onSubmit>` to direct input value evaluation.
   - Any text typed by the student (e.g. `Activity 1: 3 interviews & empathy mapping`) is sent to Gemini KaTeX / course parser and saved to both local device storage and the cloud server ledger (`/api/homework/sync`).
   - If the student explicitly clicks **[No Homework]**, only then is `No homework assigned` recorded.

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
