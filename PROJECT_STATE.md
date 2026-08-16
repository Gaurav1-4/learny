# Learny — Project State & Milestone Tracker

**Current Status**: Complete Safari iOS & macOS PWA Support + Live Class End & Homework Mock Simulator Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-d23ue8hsa-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Safari iOS & macOS PWA Support (Fixed & Live)**:
   - Configured `manifest.json`, vector `icon.svg`, and 192x192 & 512x512 app icons.
   - Apple-specific meta tags: `apple-mobile-web-app-capable: yes`, `apple-touch-icon`, `status-bar: black-translucent`.
   - On **iPhone (Safari)**: Tap **Share $\to$ Add to Home Screen** to install as a standalone iOS app!
   - On **Mac (Safari)**: Click **File $\to$ Add to Dock** to install as a desktop app in your Mac Dock!
2. **Live Class End & Homework Mock Simulator (`src/components/dashboard/live-class-mock-simulator.tsx`)**:
   - Interactive demo triggers **"Simulate Lecture 1"** and **"Simulate Lecture 2"**.
   - Displays real-time post-class modal pop-up: *"Math III Lecture Just Ended! Uploaded: Lecture Notes.pdf. What homework was assigned?"*.
   - Voice input microphone & shorthand parser.
   - Executes live:
     1. NotebookLM Topic Extraction.
     2. 5 TB Storage Vault Sync (`Learny Vault/Sem 3/Math III/Notes/Lecture1_Notes_ODEs.pdf`).
     3. OKF Manifest Generation (`iiitd-mth201-lec01`).
     4. Mandatory Questions & Similar Practice Problem Linking.
3. **NotebookLM-Driven Topic Extraction & OKF Manifest (`src/lib/okf-indexer.ts`)**:
   - Zero API token bloat: Full PDFs parsed by NotebookLM under `studyonly.co@gmail.com`.
4. **Real Math III Lecture 2 & Lecture 1 Problem Sets**:
   - **Lecture 2**: *Cauchy Theorem & Formulas (14.2 Q3, Q5 | 14.3 Q2 | 14.4 Q1)*.
   - **Lecture 1**: *Higher-Order Linear ODEs & Wronskian (4.1 Q3, Q4, Q5)*.
5. **Deterministic Non-RAG Retrieval Engine (`OKFRegistry.query`)**:
   - 0ms instant query engine.
6. **Autonomous NotebookLM Session-Cookie Sync Engine (`src/lib/notebooklm-client.ts`)**:
   - Programmatic Google RPC client with session cookie authentication (`__Secure-1PSID`) for 1-click uploads to `studyonly.co@gmail.com`.
7. **9-Key Gemini Academic Email Intelligence Agent (`src/lib/email-filter-agent.ts`)**:
   - Matches incoming `@iiitd.ac.in` emails strictly against **Gaurav's 3rd Sem B.Tech CSD profile**.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with **Live Class End & Homework Mock Simulator**, AI Email Radar, live schedule strip, active courses grid, and upcoming deadlines.
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
