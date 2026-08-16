# Learny — Project State & Milestone Tracker

**Status**: Production Complete • OAuth Token Auto-Refresh & Re-Authentication Implemented
**Tech Stack**: Next.js 15 App Router + TypeScript + Tailwind CSS + Google Classroom API + NextAuth v5 + SuperMemo SM-2 + Web Audio API + LocalStorage

---

## 1. Verified Deliverables & Build Status

- **OAuth 2.0 Auto-Refresh & Token Validation Fix**:
  - `src/lib/auth.ts`: Implemented automatic token refresh via Google's `https://oauth2.googleapis.com/token` endpoint when the 1-hour access token approaches expiration.
  - `src/lib/classroom.ts`: Configured `new google.auth.OAuth2(clientId, clientSecret)` with token validation.
  - `src/app/(app)/dashboard/page.tsx`: Added one-click **"Sign in Again with Google Classroom"** action that clears stale previous sessions and fetches live tokens with full classroom scopes.
- **Build Verification**: Compiled with **0 errors, 0 warnings across all 17 production routes/endpoints**.

---

## 2. All 17 Production Routes

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

---

## 3. How to Run
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) and sign in!
