# Learny — Project State & Milestone Tracker

**Current Status**: Strict Temporal Deadline Separation (Upcoming strictly future `dueDate >= now` vs Overdue isolated) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-79z19zi85-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Strict Temporal Deadline Separation (`DeadlineList`)**:
   - Compares all course due dates against `new Date()`.
   - **`Upcoming Deadlines`** tab: Strictly contains future deadlines (`dueDate >= now`), sorted soonest-first (e.g. "Due in 2 days", "Due in 5 days"). Past/overdue items are **completely excluded** from this view.
   - **`Overdue Deadlines`** tab: Dedicated separate tab for past unsubmitted assignments (`dueDate < now`).
   - Summary card on Dashboard displays the accurate count of active future deadlines.
2. **Zero-Duplication Senior Mobile Architecture**:
   - **4 Clean Bottom Tabs (Mobile)**:
     1. `Dashboard` (`/dashboard`): Daily action items, upcoming deadlines, and college email radar.
     2. `Courses` (`/courses`): The single source of truth for subjects, lecture slides, assignments, and math problem sets.
     3. `Schedule` (`/calendar`): Timetable & Deadlines Calendar.
     4. `Study & Tools` (`/study`): Spaced Repetition Decks, Focus Timer, GPA Planner, and NotebookLM Vault.
   - Completely eliminated redundant course grids on Dashboard, duplicate shortcut buttons, and redundant headers.
3. **Fixed Gmail Full Inbox Sync (`src/lib/gmail.ts`)**:
   - Queries all recent inbox messages (`in:inbox`, up to 25 emails) in parallel without narrow keyword dropping.
   - Added **"Action Items" vs "All Emails"** toggle in the College Email Radar.
4. **Real KaTeX Mathematical Typesetting (`src/components/ui/math-view.tsx`)**:
   - Complex integrals ($\oint_C \frac{z^2+1}{z-3} dz = 0$), derivatives, and fractions render as true textbook-grade mathematical typography.
5. **Complete Course Content Engine & Attachments**:
   - Fetches all lecture notes, reading materials, reference PDFs, and slide decks from Google Classroom `courseWorkMaterials`.
   - Renders direct 1-click open links for attached Google Drive PDFs, YouTube videos, and forms.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with action items, deadlines, and college email radar.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Course workspace with **All Content Feed, Notes & Lecture Materials, Attached Drive PDFs, Assignments, KaTeX Math Typesetting, Dynamic AI Tutor**.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /study`: AI Study Decks with SuperMemo SM-2 Spaced Repetition.
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
