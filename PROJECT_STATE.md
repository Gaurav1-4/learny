# Learny — Project State & Milestone Tracker

**Status**: Deployed to Production on Vercel (Live & Verified)
**Production URLs**: 
- `https://learny-delta.vercel.app`
- `https://learny-3718yrqw5-semly.vercel.app`
- Target Custom Subdomain: `https://learny.zorx.tech`

---

## 1. Deployment Details

- **Vercel Project**: `semly/learny`
- **Environment Variables Injected**:
  - `AUTH_SECRET`
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL` (`https://learny.zorx.tech` / `https://learny-delta.vercel.app`)
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- **Git State**: Local repository committed cleanly on `main` branch.

---

## 2. All 17 Live Routes

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
