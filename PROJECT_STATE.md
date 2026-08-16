# Learny — Project State & Milestone Tracker

**Current Status**: Complete Real-Time Post-Class Intelligent Scheduling & Auto-Banner Dismissal Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-a95geya1w-semly.vercel.app`

---

## 🎯 Verified Intelligent Post-Class Workflow (Live)

1. **Auto-Disappearing Backlog Banner**:
   - The 1-Week Backlog Resolver banner on the Dashboard **automatically disappears** once all 15 backlog lectures are reviewed/completed.
2. **Post-Class Trigger & Prompt**:
   - Whenever an authentic timetable class finishes, the system prompts with the Post-Class check-in banner and device notification.
3. **Gemini LLM Intelligent Scheduling Layer (`/api/homework/ai-format`)**:
   - Reads what the student typed and matches it against the authentic timetable evaluation schedule (e.g. Math III Graded Tutorial Test every Tuesday 1:30 PM, OS Lab Wednesday 2:00 PM, DPP Studio Friday 2:00 PM).
   - Generates the exact **Scheduled Deadline** AND schedules a **Smart Prep/Study Session** in the calendar before the deadline.
4. **Immediate Auto-Dismissal & Calendar Injection**:
   - As soon as the student logs homework (or skips), the banner disappears immediately.
   - Events are injected into the Calendar (`learny-calendar-custom-events`) and synced across devices via `/api/homework/sync`.
5. **Strict Zero Fake Data**:
   - Zero hardcoded formulas or imaginary placeholders. All venues, times, and textbook references (Thomas' Calculus 11th Ed for Math III) are authentic.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with post-class banner, auto-clearing backlog, and upcoming deadlines.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with live Classroom materials and KaTeX problem solver.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /study`: Unified Study & Productivity Hub (Flashcards SM-2, NotebookLM Vault, Focus Timer, GPA Planner).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
