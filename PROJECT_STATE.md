# Learny — Project State & Milestone Tracker

**Current Status**: Complete NotebookLM Topic Extraction, Real Lecture 2 (14.2, 14.3, 14.4) Problems, and Dynamic OKF Tagging Pipeline Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-gelji80rz-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **NotebookLM-Driven Topic Extraction & OKF Manifest (`src/lib/okf-indexer.ts`)**:
   - Zero API token bloat: Full PDFs are parsed by NotebookLM (`studyonly.co@gmail.com`) to extract the exact **Authoritative Topic Name & Key Concepts**.
   - Structured OKF Manifest attached to every lecture and textbook PDF.
2. **User-Driven Dynamic Homework Lifecycle (`POST /api/okf/homework-update`)**:
   - Homework is taken strictly from your voice/text inputs.
   - If the professor uploads a PDF before you enter homework, the document is tagged with `homeworkStatus: "PENDING"`.
   - As soon as you log your homework (e.g. `14.2 3 5, 14.3 2, 14.4 1`), the OKF manifest dynamically updates and links the question entities without re-uploading the file!
3. **Real Math III Lecture 2 Problem Set**:
   - **Ex 14.2 #3 & #5**: *Cauchy's Integral Theorem & Path Independence*.
   - **Ex 14.3 #2**: *Cauchy's Integral Formula at Interior Singularity*.
   - **Ex 14.4 #1**: *Higher-Order Derivative Formula*.
   - **Similar Practice**: *Contour around triangle (14.2 #4)* & *Rational pole evaluation (14.3 #3)*.
4. **Deterministic Non-RAG Retrieval Engine (`OKFRegistry.query`)**:
   - Instant 0ms lookup by course code, lecture number, topic, or keyword (*"Give me Lecture 1 notes of OS"*).
5. **Math III Voice Input & Shorthand Form**:
   - Web Speech API microphone input + shorthand parser (`14.2 3 5, 14.3 2, 14.4 1`).
6. **Operating Systems (`CSE231`) & AP (`CSE201`) Conversational Tutor**:
   - High-yield short notes per lecture with 1-click conversational study mode and pre-crafted tutor prompts.
7. **DPP 2026 (`DES201`) & RMSSD (`SSH201`) Master Quality Notes**:
   - Zero-loss documentation of design frameworks, heuristic evaluations, qualitative coding, and statistics.
8. **Autonomous NotebookLM Session-Cookie Sync Engine (`src/lib/notebooklm-client.ts`)**:
   - Programmatic Google RPC client with session cookie authentication (`__Secure-1PSID`) for 1-click uploads to `studyonly.co@gmail.com`.
9. **9-Key Gemini Academic Email Intelligence Agent (`src/lib/email-filter-agent.ts`)**:
   - Matches incoming `@iiitd.ac.in` emails strictly against **Gaurav's 3rd Sem B.Tech CSD profile**.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with AI Email Radar, live schedule strip, active courses grid, and upcoming deadlines.
- `GET /courses`: Course catalog with Active Courses and Archived Vault tabs + multi-mode sorting.
- `GET /courses/[courseId]`: Course workspace with **Academic Study Suite (NotebookLM Topics, OKF Manifests, Math III Voice Input, Similar Practice, OS/AP Tutor, DPP/RMSSD Notes)**, coursework, points, and announcements.
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
- `POST /api/okf/homework-update`: Dynamic OKF homework updater and deterministic search API route.
- `GET /api/classroom/courses?state=...`: Real Classroom courses with state filter (`ACTIVE`, `ARCHIVED`, `ALL`).
- `GET /api/classroom/courses/[courseId]`: Single course API.
- `GET /api/classroom/courses/[courseId]/coursework`: Coursework API.
- `GET /api/classroom/courses/[courseId]/announcements`: Announcements API.
- `GET /api/classroom/courses/[courseId]/submissions`: Student submissions and grades API.
- `GET /api/classroom/coursework?state=...`: Aggregated coursework API.
- `GET /api/classroom/search?q=...`: Multi-course search API.
