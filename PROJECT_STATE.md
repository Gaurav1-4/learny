# Learny — Project State & Milestone Tracker

**Current Status**: Complete Dual-Account Architecture with `studyonly.co@gmail.com` (5 TB Storage & NotebookLM) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-7l7ibkq7s-semly.vercel.app`

---

## 🎯 Dual-Account Architecture Configured

1. **Academic Account (`gaurav25212@iiitd.ac.in`)**:
   - Google Classroom synchronization (active courses like `DPP 2026` + archived vault).
   - College Gmail Academic Scanner (`gmail.readonly`) for room changes, pop quizzes, and TA notices.
2. **Storage & NotebookLM Powerhouse (`studyonly.co@gmail.com`)**:
   - **5 TB Cloud Storage** configuration.
   - NotebookLM Pro Deep Audio Overview & Source Synthesis engine.
   - 1-Click Course Knowledge Base export to `studyonly.co@gmail.com`.
   - 1-Click Launch button directly to `https://notebooklm.google.com`.
3. **IIITD CSD 3rd Semester Weekly Timetable & AI Study Planner**:
   - Mapped to exact schedule (Monday to Friday, 8:30 AM – 6:00 PM).
   - Math III Tuesday Test readiness, OS pre-lecture recall, AP surprise quiz drills.
   - 1-Click iCal (`.ics`) & Google Calendar export.

---

## 🌐 All 18 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with College Email Radar, live schedule strip, active courses grid, and upcoming deadlines.
- `GET /courses`: Course catalog with Active Courses and Archived Vault tabs + multi-mode sorting.
- `GET /courses/[courseId]`: Course workspace with tabbed coursework, points, grades, and announcements.
- `GET /notebooklm`: NotebookLM Dual-Account Hub (`studyonly.co@gmail.com` 5 TB Storage & College sync).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /study`: AI Study Decks with SuperMemo SM-2 Spaced Repetition.
- `GET /search`: Unified search across all active and archived courses.
- `GET /settings`: Theme customizer, dual-account status, full JSON backup/restore hub.
- `GET /api/auth/[...nextauth]`: Google OAuth handler with Classroom & Gmail scopes.
- `GET /api/auth/status`: Credentials status endpoint.
- `GET /api/gmail/academic-alerts`: Live academic notice scanner.
- `GET /api/classroom/courses?state=...`: Real Classroom courses with state filter (`ACTIVE`, `ARCHIVED`, `ALL`).
- `GET /api/classroom/courses/[courseId]`: Single course API.
- `GET /api/classroom/courses/[courseId]/coursework`: Coursework API.
- `GET /api/classroom/courses/[courseId]/announcements`: Announcements API.
- `GET /api/classroom/courses/[courseId]/submissions`: Student submissions and grades API.
- `GET /api/classroom/coursework?state=...`: Aggregated coursework API.
- `GET /api/classroom/search?q=...`: Multi-course search API.
