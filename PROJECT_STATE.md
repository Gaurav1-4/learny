# Learny — Project State & Milestone Tracker

**Current Status**: 100% Mobile & Phone UI Overhaul (Native iOS/Android Bottom Navigation Bar, Mobile Header Drawer, Responsive Containers & Touch Inputs) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-gis0s586t-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **100% Mobile & Phone UI Overhaul (`src/components/layout/mobile-nav.tsx`)**:
   - **Native iOS/Android Bottom Navigation Bar**: Fixed at the bottom with safe-area insets (`pb-safe`) and frosted glass blur. 5 primary thumb tabs:
     - 📊 **Dashboard** (`/dashboard`)
     - 📚 **Courses** (`/courses`)
     - 📅 **Calendar** (`/calendar`)
     - 🤖 **NotebookLM** (`/notebooklm`)
     - ⚙️ **Settings** (`/settings`)
   - **Top Mobile Header**: Brand logo + Search shortcut + Slide-out Navigation Drawer for secondary tools (GPA Calculator, Focus Timer, SM-2 Study Decks, Search, and Sign Out).
   - **Main Layout Container**: Removed hardcoded `ml-64` on phone screens (`ml-0 md:ml-64 p-3.5 sm:p-6 pb-28 md:pb-8`). Full viewport containment with zero horizontal overflow or cutoffs.
   - **Desktop Sidebar**: Hidden on mobile (`hidden md:flex`).
2. **Safari iOS & macOS PWA Support (Fixed & Live)**:
   - Configured `manifest.json`, vector `icon.svg`, and 192x192 & 512x512 app icons.
   - On **iPhone (Safari)**: Tap **Share $\to$ Add to Home Screen** to install as a standalone native-feeling iOS app.
   - On **Mac (Safari)**: Click **File $\to$ Add to Dock** to install as a Mac app in your Dock.
3. **Responsive Mobile Dashboard & Course Workspaces**:
   - `StatsCards`: Responsive 2x2 grid on mobile screens (`grid-cols-2 lg:grid-cols-4`).
   - `CourseCards`: Mobile-proportioned padding (`p-4 sm:p-6`) and typography.
   - `EmailAlertsWidget`: Responsive header stacking for small phone viewports.
   - `SubjectWorkflowSuite`: Horizontal touch scrolling (`overflow-x-auto scrollbar-none`) on all complex LaTeX equations and formula blocks.
   - `Course Detail`: Smooth horizontal sliding tabs and touch-friendly header banner.
   - `Landing Page`: Mobile-first hero sizing and full-width Google Classroom sign-in button.
4. **Live Class End & Homework Mock Simulator (`src/components/dashboard/live-class-mock-simulator.tsx`)**:
   - Interactive demo triggers **"Simulate Lecture 1"** and **"Simulate Lecture 2"**.
   - Displays real-time post-class modal pop-up: *"Math III Lecture Just Ended! Uploaded: Lecture Notes.pdf. What homework was assigned?"*.
   - Voice input microphone & shorthand parser.
5. **NotebookLM-Driven Topic Extraction & OKF Manifest (`src/lib/okf-indexer.ts`)**:
   - Zero API token bloat: Full PDFs parsed by NotebookLM under `studyonly.co@gmail.com`.
6. **Real Math III Lecture 2 & Lecture 1 Problem Sets**:
   - **Lecture 2**: *Cauchy Theorem & Formulas (14.2 Q3, Q5 | 14.3 Q2 | 14.4 Q1)*.
   - **Lecture 1**: *Higher-Order Linear ODEs & Wronskian (4.1 Q3, Q4, Q5)*.
7. **Deterministic Non-RAG Retrieval Engine (`OKFRegistry.query`)**:
   - 0ms instant query engine.
8. **Autonomous NotebookLM Session-Cookie Sync Engine (`src/lib/notebooklm-client.ts`)**:
   - Programmatic Google RPC client with session cookie authentication (`__Secure-1PSID`) for 1-click uploads to `studyonly.co@gmail.com`.
9. **9-Key Gemini Academic Email Intelligence Agent (`src/lib/email-filter-agent.ts`)**:
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
