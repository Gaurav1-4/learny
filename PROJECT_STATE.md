# Learny — Project State & Milestone Tracker

**Current Status**: Complete Google Calendar Native OAuth API Sync & Apple Calendar iCal (.ics) Feed Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-431nn7dth-semly.vercel.app`

---

## 📅 Google Calendar & Apple Calendar Integration (Live)

1. **Google Calendar OAuth Sync (`/api/calendar/google-sync`)**:
   - Integrated with NextAuth v5 authorization scopes (`calendar.events`, `calendar.readonly`).
   - Uses `googleapis` v3 to insert academic deadlines (with 30-min + 10-min alerts) and focus study sessions directly into the student's primary Google Calendar.
2. **Apple Calendar iCal Feed (`/api/calendar/feed.ics`)**:
   - Generates an RFC-compliant `.ics` iCalendar feed for 1-tap subscription on iPhone, iPad, and Mac.
3. **One-Click Calendar Controls**:
   - In **Schedule & Timetable (`/calendar`)**, added prominent **"Sync Google Calendar"** and **"Apple iCal"** buttons.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with post-class banner, auto-clearing backlog, upcoming deadlines, and 1-click cloud sync.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with live Classroom materials and KaTeX problem solver.
- `GET /calendar`: 3-Tab Hub with Weekly Timetable, AI Study Planner, Month View, and Google Calendar / Apple iCal sync.
- `GET /api/calendar/google-sync`: Direct sync to student's primary Google Calendar.
- `GET /api/calendar/feed.ics`: Dynamic Apple Calendar feed for iPhone & Mac.
- `GET /study`: Unified Study & Productivity Hub (Flashcards SM-2, NotebookLM Vault, Focus Timer, GPA Planner).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
