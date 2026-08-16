# Learny — Project State & Milestone Tracker

**Current Status**: Complete Google Classroom Materials & Topics Scopes (`classroom.courseworkmaterials.readonly`, `classroom.topics.readonly`) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-qifkqe6h0-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Google Classroom Scopes & API Access**:
   - Added `https://www.googleapis.com/auth/classroom.courseworkmaterials.readonly` & `https://www.googleapis.com/auth/classroom.courseworkmaterials` (required by Google to read lecture slides, PDFs, notes, and study handouts).
   - Added `https://www.googleapis.com/auth/classroom.topics.readonly` (required to read organized subject syllabus modules).
   - Enhanced `GoogleClassroomClient` with `pageSize: 50` for materials, announcements, and coursework.
2. **Unified Course Content Experience**:
   - Renders live Classroom lecture files, assignments, and announcements.
   - For all courses: renders syllabus-aligned KaTeX problem sets for math subjects, and AI Study Companions & prompts for systems/design courses.
3. **Unified Study & Productivity Suite (`/study`)**:
   - `Flashcards (SM-2)`
   - `NotebookLM Vault`
   - `Focus Timer`
   - `GPA & Continuous Evaluation Planner`

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with action items and upcoming deadlines.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with direct content stream and KaTeX typography.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /study`: Unified Study & Productivity Hub (Flashcards SM-2, NotebookLM Vault, Focus Timer, GPA Planner).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
