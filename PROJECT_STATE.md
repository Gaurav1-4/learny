# Learny — Project State & Milestone Tracker

**Current Status**: Complete UI Decluttering & Minimalist Linear/Apple Design System Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-ltrbtbm8d-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Complete UI Decluttering & Minimalist Linear/Apple Design System**:
   - **Elimination of AI Slop**: Removed all neon purple-on-black, green-on-black, blur glow spheres, and pulsating dots.
   - **Cohesive Theme**: Deep charcoal slate (`#09090b` / `#121215`), razor-thin borders (`#27272a`), and crisp, high-contrast monochrome typography.
   - **Cognitive Offloading**: Simplified headers, single primary actions per card, and collapsible details for complex derivations.
2. **100% Mobile & Phone UI Overhaul (`src/components/layout/mobile-nav.tsx`)**:
   - **Native iOS/Android Bottom Navigation Bar**: Fixed at the bottom with safe-area insets (`pb-safe`). 5 primary thumb tabs:
     - 📊 **Dashboard** (`/dashboard`)
     - 📚 **Courses** (`/courses`)
     - 📅 **Calendar** (`/calendar`)
     - 🤖 **NotebookLM** (`/notebooklm`)
     - ⚙️ **Settings** (`/settings`)
   - **Top Mobile Header**: Brand logo + Search shortcut + Slide-out Navigation Drawer for secondary tools (GPA Calculator, Focus Timer, SM-2 Study Decks, Search, and Sign Out).
   - **Main Layout Container**: Removed hardcoded `ml-64` on phone screens (`ml-0 md:ml-64 p-3.5 sm:p-6 pb-28 md:pb-8`). Full viewport containment with zero horizontal overflow or cutoffs.
   - **Desktop Sidebar**: Hidden on mobile (`hidden md:flex`).
3. **Safari iOS & macOS PWA Support (Fixed & Live)**:
   - Configured `manifest.json`, vector `icon.svg`, and 192x192 & 512x512 app icons.
   - On **iPhone (Safari)**: Tap **Share $\to$ Add to Home Screen** to install as a standalone native-feeling iOS app.
   - On **Mac (Safari)**: Click **File $\to$ Add to Dock** to install as a Mac app in your Dock.
4. **Clean, Focused Math III Study Suite**:
   - Collapsible **"Method of Work"** reference card (saves 50% screen real estate until needed).
   - Minimalist homework entry box (Voice + Shorthand).
   - Clean, quiet problem cards with crisp LaTeX equations and straightforward completion checkboxes.
5. **Quiet Email Radar & Post-Class Simulator**:
   - Understated academic notice card with simple relevant/spam feedback.
   - Minimalist simulation dialog for end-of-class workflows.
6. **NotebookLM-Driven Topic Extraction & OKF Manifest (`src/lib/okf-indexer.ts`)**:
   - Zero API token bloat: Full PDFs parsed by NotebookLM under `studyonly.co@gmail.com`.
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
