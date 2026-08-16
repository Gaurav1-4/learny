# Learny — Project State & Milestone Tracker

**Status**: Smart Subject Sorting & Personalized IIITD CSD UI Live on Vercel
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-l2m0tqa9t-semly.vercel.app`

---

## 1. Subject Sorting & Personalized UI Features

- **Smart Subject Sorting Controls**:
  - `Priority`: Prioritizes active subjects with coursework and pending deadlines (e.g. `DPP 2026`).
  - `Most Work`: Orders by number of active assignments.
  - `A-Z`: Standard alphabetical sorting.
- **Academic Context & Department Track Chips**:
  - Automatically identifies subject domain:
    - `Design & UX Track`: DPP 2026, VDC, HCI.
    - `Core CS / Algorithms`: DSA.
    - `Software Engineering`: Advanced Programming / OOP.
    - `Systems & Architecture`: Computer Organization (CO / CA).
- **Personalized Header Context**:
  - Displays `IIIT Delhi • B.Tech CSD • 3rd Semester (Monsoon)`.
- **Preloaded Evaluation & CGPA Defaults**:
  - Auto-initializes with Semester 3 subjects and Semester 1 & 2 past records (`8.50` & `8.65` SGPA) on `/gpa`.

---

## 2. All 17 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with real stats, active courses grid, and upcoming deadlines.
- `GET /courses`: Course catalog with Active Courses and Archived Vault tabs.
- `GET /courses/[courseId]`: Course workspace with tabbed coursework, points, grades, and announcements.
- `GET /notebooklm`: NotebookLM Dual-Account Hub, Knowledge Base compiler, and Import/Export bridge.
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /calendar`: Academic Calendar with course color coding and Classroom deadline sync.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /study`: AI Study Decks with SuperMemo SM-2 Spaced Repetition.
- `GET /search`: Unified search across all active and archived courses.
- `GET /settings`: Theme customizer, full JSON backup/restore hub, and Google account information.
- `GET /api/auth/[...nextauth]`: Google OAuth handler.
- `GET /api/auth/status`: Credentials status endpoint.
- `GET /api/classroom/courses?state=...`: Real Classroom courses with state filter (`ACTIVE`, `ARCHIVED`, `ALL`).
- `GET /api/classroom/courses/[courseId]`: Single course API.
- `GET /api/classroom/courses/[courseId]/coursework`: Coursework API.
- `GET /api/classroom/courses/[courseId]/announcements`: Announcements API.
- `GET /api/classroom/courses/[courseId]/submissions`: Student submissions and grades API.
- `GET /api/classroom/coursework?state=...`: Aggregated coursework API.
- `GET /api/classroom/search?q=...`: Multi-course search API.
