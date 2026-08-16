# Learny — Project State & Milestone Tracker

**Current Status**: Complete System with College Gmail Academic Scanner Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-ou761p6b1-semly.vercel.app`

---

## 🎯 Completed Features

1. **College Gmail Academic Scanner (`@iiitd.ac.in`)**:
   - OAuth scope `gmail.readonly` integrated.
   - `GmailClient` queries and classifies messages into: *Room Changes*, *Surprise Quiz Alerts*, *Deadline Extensions*, *Class Cancellations*, and *New Lecture Notes*.
   - **`EmailAlertsWidget`** rendered on Dashboard with real-time sync and 1-click **"Apply to Timetable"** actions.
2. **IIITD CSD 3rd Semester Weekly Timetable (`/calendar?tab=timetable`)**:
   - Exact IIITD schedule (Monday to Friday, 8:30 AM – 6:00 PM).
   - Room numbers (`A106`, `C11`, `C201`, `C21`, `C102`, `C01`).
   - 1-Click iCal (`.ics`) & Google Calendar export.
3. **Autonomous AI Study Planner & Prep Matrix (`/calendar?tab=planner`)**:
   - **Math III Tuesday Test Readiness Engine**: Monday free blocks (8:30–11:00 AM, 1:00–3:00 PM) scheduled for problem sets.
   - **OS Pre-Lecture Memorization Radar**: Concept retention before Mon/Wed lectures and Wed 8:30 AM tutorial.
   - **AP Surprise Quiz Survival Radar**: Daily OOP & SOLID code drills before Tue/Thu 3 PM lectures.
   - **Autonomous Homework Scheduler**: Auto-assigns assignments into free timetable slots.
4. **Continuous Subject Evaluations & Multi-Semester CGPA (`/gpa`)**:
   - Math III, OS, AP, DPP 2026, RMSSD continuous weights (Labs, Quizzes, Midsem, Endsem).
   - Semester 1 (`8.50 SGPA`) & Semester 2 (`8.65 SGPA`) past history with live degree CGPA.
5. **Google Classroom Real-Time Ingestion**:
   - Instant live sync on page load/visit + 60s background polling + zero cache latency.
6. **UI/UX Pro Max Design System**:
   - 21st.dev signature components (`BorderBeam`, `SpotlightCard`, `ShimmerButton`), glassmorphism, Framer Motion animations.

---

## 🌐 All 18 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with College Email Radar, live schedule strip, active courses grid, and upcoming deadlines.
- `GET /courses`: Course catalog with Active Courses and Archived Vault tabs + multi-mode sorting.
- `GET /courses/[courseId]`: Course workspace with tabbed coursework, points, grades, and announcements.
- `GET /notebooklm`: NotebookLM Dual-Account Hub, Knowledge Base compiler, and Import/Export bridge.
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /study`: AI Study Decks with SuperMemo SM-2 Spaced Repetition.
- `GET /search`: Unified search across all active and archived courses.
- `GET /settings`: Theme customizer, full JSON backup/restore hub, and Google account information.
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
