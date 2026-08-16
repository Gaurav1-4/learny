# Learny — Project State & Milestone Tracker

**Current Status**: 9-Key Gemini Academic Email Intelligence, Feedback Learning Loop & 5 TB Cloud Vault Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-jc0w3o028-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **9-Key Gemini Load-Balancing Pool (`src/lib/gemini-pool.ts`)**:
   - 9 Google AI Studio keys pooled together (**13,500 free requests/day**).
   - Round-Robin distribution with zero-lag 0ms 429 rate-limit failover.
2. **Personalized Academic Email Intelligence Agent (`src/lib/email-filter-agent.ts`)**:
   - Matches incoming `@iiitd.ac.in` emails strictly against **Gaurav's 3rd Sem B.Tech CSD profile** (Math III, OS, AP, DPP, RMSSD, and POR roles).
   - Filters out M.Tech announcements, 4th-year placements, and non-relevant campus noise.
   - Extracts actionable room shifts, rescheduled slots, and quiz warnings.
3. **Continuous User Feedback Memory Loop**:
   - Direct **"👍 Relevant"** and **"👎 Not for me / Spam"** buttons on each email card.
   - Saves feedback in persistent memory to fine-tune future AI classifications.
4. **Autonomous Timetable & Calendar Sync**:
   - **"Apply to Timetable"** button to automatically shift class rooms and tutorial slots based on email notices.
5. **5 TB Google Drive Cloud Vault (`studyonly.co@gmail.com`)**:
   - Mapped cloud directory structure (`Sem 3 / Math III / Lectures`, `Sem 3 / OS / Notes`) ready for future instant search and document retrieval (*"Give me Lecture 1 notes of OS"*).
6. **Student Academic Profile & POR Editor in Settings (`/settings`)**:
   - Editable student name, college, branch, semester, and positions of responsibility.
   - Live 9-Key Pool health dashboard.

---

## 🌐 All 18 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with AI Email Radar, live schedule strip, active courses grid, and upcoming deadlines.
- `GET /courses`: Course catalog with Active Courses and Archived Vault tabs + multi-mode sorting.
- `GET /courses/[courseId]`: Course workspace with tabbed coursework, points, grades, and announcements.
- `GET /notebooklm`: NotebookLM Dual-Account Hub (`studyonly.co@gmail.com` 5 TB Storage & Document Vault).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /study`: AI Study Decks with SuperMemo SM-2 Spaced Repetition.
- `GET /search`: Unified search across all active and archived courses.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
- `GET /api/auth/[...nextauth]`: Google OAuth handler with Classroom & Gmail scopes.
- `GET /api/auth/status`: Credentials status endpoint.
- `GET, POST /api/gmail/academic-alerts`: Live academic notice scanner with 9-key Gemini AI filtering and feedback submission.
- `GET /api/classroom/courses?state=...`: Real Classroom courses with state filter (`ACTIVE`, `ARCHIVED`, `ALL`).
- `GET /api/classroom/courses/[courseId]`: Single course API.
- `GET /api/classroom/courses/[courseId]/coursework`: Coursework API.
- `GET /api/classroom/courses/[courseId]/announcements`: Announcements API.
- `GET /api/classroom/courses/[courseId]/submissions`: Student submissions and grades API.
- `GET /api/classroom/coursework?state=...`: Aggregated coursework API.
- `GET /api/classroom/search?q=...`: Multi-course search API.
