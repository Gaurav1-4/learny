# Learny — Project State & Milestone Tracker

**Current Status**: Complete Apple Ecosystem Native iCloud Calendar (`webcal://`) & Google Calendar Sync Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-ikc33enet-semly.vercel.app`

---

## 🍏 Native Apple Ecosystem (MacBook, iPhone, iPad) Integration (Live)

1. **1-Tap Apple Calendar iCloud Subscription (`webcal://`)**:
   - `webcal://learny.zorx.tech/api/calendar/feed.ics`
   - Automatically prompts native Apple Calendar subscription modal on macOS and iOS.
   - When added to iCloud, all homework deadlines, study blocks, and timetable events sync simultaneously across **MacBook, iPhone, and iPad** with zero configuration.
2. **Native iOS & macOS Widget Support**:
   - Apple Calendar Lock Screen widgets, Dynamic Island / Live Activity alerts, Apple Watch complications, and Mac Menu Bar / Notification Center.
3. **Google Calendar Native API Sync (`/api/calendar/google-sync`)**:
   - Direct two-way sync for Google Calendar.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with post-class banner, auto-clearing backlog, upcoming deadlines, and 1-click cloud sync.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with live Classroom materials and KaTeX problem solver.
- `GET /calendar`: 3-Tab Hub with Weekly Timetable, AI Study Planner, Month View, and Apple Calendar (iCloud) / Google Calendar sync.
- `GET /api/calendar/feed.ics`: Dynamic RFC-compliant Apple Calendar iCal feed.
- `GET /api/calendar/google-sync`: Direct sync to student's primary Google Calendar.
- `GET /study`: Unified Study & Productivity Hub (Flashcards SM-2, NotebookLM Vault, Focus Timer, GPA Planner).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
