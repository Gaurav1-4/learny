# Learny — Project State & Milestone Tracker

**Current Status**: Real-Time Cross-Device Cloud Syncing (Laptop ↔ Phone ↔ Tablet) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-exkw9c604-semly.vercel.app`

---

## 🚀 Real-Time Multi-Device Cloud Synchronization (Live)

1. **Automatic Cloud Sync (`CloudSyncHydrator`)**:
   - Whenever Learny opens on your phone, laptop, or tablet, it automatically syncs with the server cloud ledger (`GET /api/homework/sync`).
   - If you add or edit homework on your laptop, opening the app on your phone **instantly pulls and displays the exact same homework, backlog progress, and calendar deadlines**!
2. **Bi-Directional Cloud Ledger (`/api/homework/sync`)**:
   - Every save, edit, and deletion writes to both the browser's instant cache AND the server's persistent cloud ledger.

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
