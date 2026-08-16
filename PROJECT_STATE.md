# Learny — Project State & Milestone Tracker

**Current Status**: Complete Bi-Directional Cloud State Sync Engine (`/api/sync/all`) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-dor7292hz-semly.vercel.app`

---

## 🚀 Unified Multi-Device Cloud State Synchronization (Live)

1. **The Core Issue Identified**:
   - The desktop had saved the 15/15 backlog state into its browser `localStorage` **prior** to the creation of the cloud server sync endpoint.
   - The "Sync" button in the dashboard was only requesting Google Classroom courses from Google's API, rather than syncing browser backlog records.
2. **The Complete Fix (`/api/sync/all` + `CloudSyncHydrator`)**:
   - **Automatic Push on Desktop**: Opening the app on your desktop immediately uploads your 15/15 completed backlog and calendar events to the cloud server.
   - **Automatic Pull on Phone**: Opening the app on your phone immediately pulls all 15/15 completed backlog records and populates your phone.
   - **Dashboard "Sync" Button**: Clicking the "Sync" button in the dashboard now runs a full push-and-pull sync across all devices, with a live green toast confirmation.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with post-class banner, auto-clearing backlog, upcoming deadlines, and 1-click cloud sync.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with live Classroom materials and KaTeX problem solver.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /study`: Unified Study & Productivity Hub (Flashcards SM-2, NotebookLM Vault, Focus Timer, GPA Planner).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
