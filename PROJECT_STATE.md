# Learny — Project State & Milestone Tracker

**Status**: Production Live on Vercel & GitHub Synced
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-53zt1m7si-semly.vercel.app`

---

## 1. Verified Fixes & Deliverables

- **Google OAuth Scopes Fix**:
  - Updated OAuth scopes in `src/lib/auth.ts` to include student-specific permissions (`coursework.me.readonly`, `student-submissions.me.readonly`) alongside teacher scopes so student accounts are never blocked by Google.
- **Server Configuration & Dynamic Host Trust**:
  - Removed conflicting hardcoded `NEXTAUTH_URL` on Vercel so `trustHost: true` automatically and dynamically detects the incoming host (`learny.zorx.tech`, `learny-delta.vercel.app`, and `localhost`).
  - Added environment variables across all production and preview environments.
- **Auto-Deployment on Git Push**:
  - Synchronized with `main` branch on GitHub.

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
