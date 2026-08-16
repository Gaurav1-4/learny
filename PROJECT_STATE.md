# Learny — Project State & Milestone Tracker

**Current Status**: Autonomous NotebookLM Session-Cookie Sync Engine & 1-Click Upload to `studyonly.co@gmail.com` Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-1co9tcyxp-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Autonomous NotebookLM RPC Client (`src/lib/notebooklm-client.ts`)**:
   - Programmatic Google RPC client authenticating via `studyonly.co@gmail.com` session cookies (`__Secure-1PSID`).
   - Automatically creates subject notebooks (e.g. *Math III*, *Operating Systems*) and uploads course materials into `studyonly.co@gmail.com`'s workspace.
2. **1-Click Auto-Upload to NotebookLM (`/notebooklm`)**:
   - **"⚡ Auto-Upload to NotebookLM"** button pushes compiled Classroom notes and assignments directly into NotebookLM without manual copy-pasting.
   - Includes the **Session Cookie Connector** to save the `studyonly.co@gmail.com` session token securely in your browser.
3. **5 TB Google Drive Cloud Vault (`studyonly.co@gmail.com`)**:
   - Mapped cloud directory structure ready for future instant search and document retrieval (*"Give me Lecture 1 notes of OS"*).
4. **9-Key Gemini Academic Email Intelligence Agent (`src/lib/email-filter-agent.ts`)**:
   - Matches incoming `@iiitd.ac.in` emails strictly against **Gaurav's 3rd Sem B.Tech CSD profile**.
   - Filters out M.Tech announcements, 4th-year placements, and non-relevant campus noise.
   - Continuous user feedback memory loop (**"👍 Relevant"** / **"👎 Spam"**).
   - Autonomous **"Apply to Timetable"** button for room changes and rescheduled tutorial slots.
5. **IIITD CSD 3rd Semester Weekly Timetable & AI Study Planner**:
   - Mapped to exact schedule (Monday to Friday, 8:30 AM – 6:00 PM) with 1-click Google Calendar & iCal export.

---

## 🌐 All 19 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with AI Email Radar, live schedule strip, active courses grid, and upcoming deadlines.
- `GET /courses`: Course catalog with Active Courses and Archived Vault tabs + multi-mode sorting.
- `GET /courses/[courseId]`: Course workspace with tabbed coursework, points, grades, and announcements.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /study`: AI Study Decks with SuperMemo SM-2 Spaced Repetition.
- `GET /search`: Unified search across all active and archived courses.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
- `GET /api/auth/[...nextauth]`: Google OAuth handler with Classroom & Gmail scopes.
- `GET /api/auth/status`: Credentials status endpoint.
- `GET, POST /api/gmail/academic-alerts`: Live academic notice scanner with 9-key Gemini AI filtering and feedback submission.
- `POST /api/notebooklm/auto-sync`: Autonomous NotebookLM background upload route.
- `GET /api/classroom/courses?state=...`: Real Classroom courses with state filter (`ACTIVE`, `ARCHIVED`, `ALL`).
- `GET /api/classroom/courses/[courseId]`: Single course API.
- `GET /api/classroom/courses/[courseId]/coursework`: Coursework API.
- `GET /api/classroom/courses/[courseId]/announcements`: Announcements API.
- `GET /api/classroom/courses/[courseId]/submissions`: Student submissions and grades API.
- `GET /api/classroom/coursework?state=...`: Aggregated coursework API.
- `GET /api/classroom/search?q=...`: Multi-course search API.
