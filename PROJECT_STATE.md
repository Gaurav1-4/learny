# Learny — Project State & Milestone Tracker

**Current Status**: Complete Elimination of Stacked Banners & Minimalist Single-Header Mobile Course Workspace Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-7qmx5vmb5-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Eliminated Stacked Banners & Nested Box Clutter in Course View**:
   - **Deleted Huge 200px Course Banner**: Replaced with a compact, Apple-grade top bar containing just the section and course title, plus a 1-click Google Classroom button.
   - **Deleted Nested Ledger Box**: Replaced the 200px nested `iiitd-mth201-lec02` card with a clean, compact single-line toolbar with `All (6) | Mandatory (4) | Similar (2)` and `[ Method ]` / `[ + Homework ]` buttons.
   - **Fixed Course Mapping**: Stopped injecting MTH201 Chapter 14 Cauchy problem sets into MTH203 Multivariate Calculus. Only courses matching MTH201 show the Math III problem sets.
   - **Clean Zero-State**: If a course has 0 materials and 0 assignments in Classroom, it renders a clean, quiet empty state with a direct Classroom open button, saving ~400px of vertical clutter on mobile phones.
2. **Strict Temporal Deadline Separation (`DeadlineList`)**:
   - Evaluates each deadline against `new Date()`.
   - **`Upcoming Deadlines`**: Strictly displays future deadlines (`dueDate >= now`), sorted soonest-first.
   - **`Overdue Deadlines`**: Isolated under a dedicated separate tab.
3. **Fixed Gmail Full Inbox Sync (`src/lib/gmail.ts`)**:
   - Queries all recent inbox messages (`in:inbox`, up to 25 emails) in parallel without narrow keyword dropping.
   - Added **"Action Items" vs "All Emails"** toggle in the College Email Radar.
4. **Zero-Duplication Senior Mobile Architecture**:
   - **4 Clean Bottom Tabs**: `Dashboard`, `Courses`, `Schedule`, and `Study & Tools`.
   - Removed duplicate course grids, redundant shortcut cards, and nested links.
5. **Real KaTeX Mathematical Typesetting (`src/components/ui/math-view.tsx`)**:
   - Complex integrals ($\oint_C \frac{z^2+1}{z-3} dz = 0$), derivatives, and fractions render as true textbook-grade mathematical typography.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with action items, deadlines, and college email radar.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with direct content stream and KaTeX typography.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /study`: AI Study Decks with SuperMemo SM-2 Spaced Repetition.
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
