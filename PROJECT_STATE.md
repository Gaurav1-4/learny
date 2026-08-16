# Learny — Project State & Milestone Tracker

**Current Status**: Complete Math III Homework Suite, Voice Input & Similar Practice Generator Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-23sbefyt2-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Math III (`MTH201`) Mandatory Homework & Similar Practice Generator**:
   - Categorizes questions into **"🔴 Mandatory Homework (Assigned by Prof)"** vs **"🟢 Spare Time Practice (Same Method of Work)"**.
   - Solves the professor's rule: *"Solve assigned homework questions + all similar textbook questions sharing the same method of work"*.
   - If user/prof inputs `14.1 1`, it extracts:
     - Mandatory: `Ex 14.1 #1` (Line integral on parabolic path $\int_C \text{Re}(z) dz$).
     - Similar Bonus Practice: `Ex 14.1 #2` (Straight line path), `Ex 14.1 #3` (Semicircle $|z|=1$), `Ex 14.1 #4` (Conjugate functions).
2. **🎙️ Web Speech API Voice Input**:
   - Click the microphone button and speak: *"Exercise 14.1 Question 1"* or *"Section 4.1 Questions 3 to 8"*.
   - Live speech transcription automatically populates and resolves the problem ledger in real time.
3. **📖 Textbook "Method of Work" Guide (The Bible - Erwin Kreyszig)**:
   - Formulated 4-step algorithm recipes and LaTeX formulas for active topics (Complex Line Integrals, Cauchy's Theorem, Higher-Order Linear ODEs, Green's & Stokes' Theorems).
4. **Operating Systems (`CSE231`) & AP (`CSE201`) Conversational Lecture Tutor**:
   - High-yield short notes per lecture with 1-click conversational study mode and pre-crafted tutor prompts.
5. **DPP 2026 (`DES201`) & RMSSD (`SSH201`) Master Quality Notes**:
   - Zero-loss documentation of design frameworks, heuristic evaluations, qualitative coding, and statistics.
6. **Autonomous NotebookLM Session-Cookie Sync Engine (`src/lib/notebooklm-client.ts`)**:
   - Programmatic Google RPC client with session cookie authentication (`__Secure-1PSID`) for 1-click uploads to `studyonly.co@gmail.com`.
7. **9-Key Gemini Academic Email Intelligence Agent (`src/lib/email-filter-agent.ts`)**:
   - Matches incoming `@iiitd.ac.in` emails strictly against **Gaurav's 3rd Sem B.Tech CSD profile**.
   - Continuous user feedback memory loop (**"👍 Relevant"** / **"👎 Spam"**).
   - Autonomous **"Apply to Timetable"** button for room changes and rescheduled tutorial slots.

---

## 🌐 All 19 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with AI Email Radar, live schedule strip, active courses grid, and upcoming deadlines.
- `GET /courses`: Course catalog with Active Courses and Archived Vault tabs + multi-mode sorting.
- `GET /courses/[courseId]`: Course workspace with **Academic Study Suite (Math III Voice Input, Shorthand Parser, Similar Practice, OS/AP Tutor, DPP/RMSSD Notes)**, coursework, points, and announcements.
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
