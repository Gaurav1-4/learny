# Learny — Project State & Milestone Tracker

**Status**: 21st.dev Custom Components & Animations Deployed to Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-fwkgba5dn-semly.vercel.app`

---

## 1. 21st.dev Components & Animation Engine

- **`BorderBeam` (`src/components/ui/border-beam.tsx`)**:
  - Continuous circulating laser beam traveling around card borders with custom gradients (`#818cf8` to `#c084fc`).
  - Active on Course Workspace Hero Banner.
- **`SpotlightCard` (`src/components/ui/spotlight-card.tsx`)**:
  - Interactive radial cursor spotlight effect on cards.
- **`ShimmerButton` (`src/components/ui/shimmer-button.tsx`)**:
  - Signature 21st.dev animated shimmering button with conic sweep and inner border sheen.
- **Keyframe Engine in `src/app/globals.css`**:
  - `@keyframes border-beam`
  - `@keyframes spin-around`
  - `@keyframes shimmer-slide`

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
