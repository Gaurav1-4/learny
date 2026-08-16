# Learny — Project State & Milestone Tracker

**Current Status**: Complete Senior Mobile Redesign (Zero Duplication, Clean 4-Tab Navigation, Full Gmail Inbox Sync) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-lxqxg0bdb-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Zero-Duplication Senior Mobile Architecture**:
   - **4 Clean Bottom Tabs (Mobile)**:
     1. `Dashboard` (`/dashboard`): Daily action items, upcoming deadlines, and college email radar.
     2. `Courses` (`/courses`): The single source of truth for subjects, lecture slides, assignments, and math problem sets.
     3. `Schedule` (`/calendar`): Timetable & Deadlines Calendar.
     4. `Study & Tools` (`/study`): Spaced Repetition Decks, Focus Timer, GPA Planner, and NotebookLM Vault.
   - **Completely Eliminated Duplication**:
     - Removed redundant full Course Grid on Dashboard (courses live strictly in `/courses`).
     - Removed duplicate "Quick Shortcuts" that repeated the navigation bar.
     - Removed duplicate NotebookLM / Calendar links from headers and footers.
2. **Fixed Gmail Full Inbox Sync (`src/lib/gmail.ts`)**:
   - Removed the overly narrow keyword search filter that previously dropped legitimate college emails.
   - Now fetches all recent inbox messages (`in:inbox`, up to 25 emails) in parallel with clean metadata parsing.
   - Added **"Action Items" vs "All Emails"** toggle in the College Email Radar.
3. **Clean Monochrome Design System**:
   - Eliminated all rainbow gradients, neon badge slop, and glowing background blur spheres across the entire application.
   - Refactored `/courses` to clean, high-contrast monochrome cards with instant search and active/archived tabs.
4. **Real KaTeX Mathematical Typesetting (`src/components/ui/math-view.tsx`)**:
   - Integrated KaTeX engine with `katex/dist/katex.min.css`.
   - Every complex contour integral, fraction, exponential, and derivative renders as **true textbook-grade mathematical typography** ($\oint_C \frac{z^2+1}{z-3} dz = 0, \quad C: |z|=1$, $\int_0^{1+i\pi} e^{2z} dz$, etc.).
5. **Complete Course Content Engine & Attachments**:
   - **Course Materials API (`/api/classroom/courses/[courseId]/materials`)**: Fetches all lecture notes, reading materials, reference PDFs, and slide decks uploaded as Google Classroom `courseWorkMaterials`.
   - **Attachment & Drive Link Badges**: Every attached PDF, Google Drive file, YouTube video, external link, or Google Form renders with dedicated icons and direct 1-click open links.

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
