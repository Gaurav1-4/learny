# Learny — Project State & Milestone Tracker

**Current Status**: Complete Subject-Specific Academic Intelligence & Math III Shorthand Parser Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-ebpoubn6g-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Math III (`MTH201`) Shorthand Parser & Textbook Problem Ledger**:
   - Parses professor shorthand like `4.1 3 4 5 6 7 8` into **Section 4.1 + Questions [3, 4, 5, 6, 7, 8]**.
   - Cross-references against the clean Classroom reference textbook (*Erwin Kreyszig - Advanced Engineering Mathematics*), completely bypassing messy handwriting.
   - Interactive Problem Ledger with question numbers, crisp LaTeX equations, difficulty tags, and step-by-step proofs for Tuesday tutorial test readiness.
2. **Operating Systems (`CSE231`) & AP (`CSE201`) Conversational Lecture Tutor**:
   - High-yield short notes per lecture.
   - **1-Click Conversational Study Mode** with pre-written prompts:
     - *"Teach me this lecture step-by-step with analogies."*
     - *"Quiz me on potential midsem exam questions."*
     - *"Explain the hardest concept / concurrency edge cases simply."*
   - Pre-crafted **1-Click NotebookLM Launchers** under `studyonly.co@gmail.com`.
3. **DPP 2026 (`DES201`) & RMSSD (`SSH201`) Master Quality Notes**:
   - Zero-loss documentation of design frameworks, heuristic evaluations, qualitative coding, and SPSS/R quantitative statistics.
4. **Autonomous NotebookLM Session-Cookie Sync Engine (`src/lib/notebooklm-client.ts`)**:
   - Programmatic Google RPC client with session cookie authentication (`__Secure-1PSID`) for 1-click uploads to `studyonly.co@gmail.com`.
5. **9-Key Gemini Academic Email Intelligence Agent (`src/lib/email-filter-agent.ts`)**:
   - Matches incoming `@iiitd.ac.in` emails strictly against **Gaurav's 3rd Sem B.Tech CSD profile**.
   - Continuous user feedback memory loop (**"👍 Relevant"** / **"👎 Spam"**).
   - Autonomous **"Apply to Timetable"** button for room changes and rescheduled tutorial slots.
6. **5 TB Google Drive Cloud Vault (`studyonly.co@gmail.com`)**:
   - Structured directory tree ready for future instant search (*"Give me Lecture 1 notes of OS"*).

---

## 🌐 All 19 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with AI Email Radar, live schedule strip, active courses grid, and upcoming deadlines.
- `GET /courses`: Course catalog with Active Courses and Archived Vault tabs + multi-mode sorting.
- `GET /courses/[courseId]`: Course workspace with **Academic Study Suite (Math III Shorthand Parser, OS/AP Tutor, DPP/RMSSD Notes)**, coursework, points, and announcements.
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
