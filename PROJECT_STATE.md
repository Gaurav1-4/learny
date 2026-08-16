# Learny — Project State & Milestone Tracker

**Current Status**: 100% Dynamic Classroom Data Engine (All Fake/Hardcoded Mock Suites Removed) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-gtfsfd7l7-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **100% Elimination of Hardcoded Mock/Fake Suites**:
   - **Dynamic Subject Study Tutor (`SubjectWorkflowSuite`)**: Completely deleted static hardcoded lecture cards ("Processes & Fork Syscall", "SOLID Principles", "Nielsen's Heuristics"). The AI study tutor now dynamically binds to the **actual `materials` and lecture notes uploaded by instructors in Google Classroom**.
   - **Contextual 1-Click AI Study Prompts**: Generated on-the-fly for any selected lecture material:
     - 🎓 Step-by-step conceptual teaching
     - ❓ High-probability midsem exam quiz questions
     - 💡 Edge cases & common pitfalls
     - 📝 Flashcards for SuperMemo SM-2 review
   - **Dynamic Math III Homework & Practice**: Formatted using real KaTeX mathematical typography ($\oint_C \frac{z^2+1}{z-3} dz = 0$), dynamically bound to live user homework input and OKF indexer.
2. **Pure Live Email Intelligence Feed (`/api/gmail/academic-alerts`)**:
   - Removed all hardcoded mock `@iiitd.ac.in` notices (`iiitd-notice-1`, etc.).
   - Fetches and filters messages strictly from the user's authentic connected Gmail inbox.
3. **Complete Course Content Engine & Attachments**:
   - **Course Materials API (`/api/classroom/courses/[courseId]/materials`)**: Fetches all lecture notes, reading materials, reference PDFs, and slide decks uploaded as Google Classroom `courseWorkMaterials`.
   - **Attachment & Drive Link Badges**: Every attached PDF, Google Drive file, YouTube video, external link, or Google Form renders with dedicated icons and direct 1-click open links.
   - **Unified "All Content" Timeline**: Automatically displays all Materials, Assignments, and Announcements in one consolidated view.
4. **100% Mobile & Safari PWA Support**:
   - Native bottom navigation bar with safe-area padding on iPhone Safari.
   - "Add to Home Screen" on iOS & "Add to Dock" on macOS Safari.
5. **NotebookLM-Driven Topic Extraction & OKF Manifest (`src/lib/okf-indexer.ts`)**:
   - Zero API token bloat: Full PDFs parsed by NotebookLM under `studyonly.co@gmail.com`.
6. **Autonomous NotebookLM Session-Cookie Sync Engine (`src/lib/notebooklm-client.ts`)**:
   - Programmatic Google RPC client with session cookie authentication (`__Secure-1PSID`) for 1-click uploads.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with Live Class End & Homework Mock Simulator, AI Email Radar, and active courses.
- `GET /courses`: Course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Course workspace with **All Content Feed, Notes & Lecture Materials, Attached Drive PDFs, Assignments, KaTeX Math Typesetting, Dynamic AI Tutor**.
- `GET /api/classroom/courses/[courseId]/materials`: Dedicated Course Materials & Slides API.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /study`: AI Study Decks with SuperMemo SM-2 Spaced Repetition.
- `GET /search`: Unified search across all active and archived courses.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
