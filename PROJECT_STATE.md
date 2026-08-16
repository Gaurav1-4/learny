# Learny — Project State & Milestone Tracker

**Current Status**: 100% Zero-Fake-Data Backlog Resolver & Clean User Input Logger Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-pbxghlu2a-semly.vercel.app`

---

## 🛡️ STRICT SYSTEM RULE: ZERO FAKE DATA

> [!IMPORTANT]
> **RULE: ZERO FAKE DATA**:
> All timetable slots, lecture times, course codes, and venues across the entire application MUST strictly derive from `TIMETABLE_CLASSES` in `src/components/calendar/weekly-timetable.tsx`.
> All synthetic homework questions, placeholder formulas, and fake mock assignments have been 100% eradicated.
> Lectures start with clean input fields where the student types their actual homework assigned by their instructor, or marks "No Homework".

---

## 🎯 1-Week Backlog Resolver (Clean User Logger)

- Displays each authentic class from the Monsoon 2026 timetable (Day, Time, Venue, Course).
- Zero pre-populated fake questions or formulas.
- Input box: **"Enter homework assigned by your professor:"** (with **[No Homework]** and **[⚡ Save & Sync to Calendar]**).
- Real entered homework is formatted with Gemini and synchronized to `/calendar` and the student's Google Drive OKF registry.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with post-class banner, 1-week backlog resolver, and upcoming deadlines.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with live Classroom materials and KaTeX problem solver.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar with 1-Week Backlog Walkthrough.
- `GET /study`: Unified Study & Productivity Hub (Flashcards SM-2, NotebookLM Vault, Focus Timer, GPA Planner).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
