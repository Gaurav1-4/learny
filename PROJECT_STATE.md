# Learny — Project State & Milestone Tracker

**Current Status**: 100% Grounded in Live Google Classroom Uploaded Textbooks, Slides & Drive PDFs Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-fooa5h9ks-semly.vercel.app`

---

## 🎯 Grounded Google Classroom Materials Workflow

1. **Direct Google Classroom PDF & Textbook Access**:
   - The app reads `courseWorkMaterials`, `announcements`, and `courseWork` directly from your enrolled Google Classroom courses.
   - Whatever textbook PDF, syllabus document, or lecture slide your professor uploaded to Classroom is fetched with 1-click **Google Drive / PDF / YouTube** badges.
2. **AI Study Prompts Grounded in Your Real Classroom Files**:
   - The AI Tutor, problem solver, and study prompts ground directly on the **actual title, description, and Drive files posted in your Classroom stream**.
   - No assumptions about textbooks or syllabi.
3. **100% Authentic Monsoon 2026 Timetable**:
   - Strictly derives all lecture timings, rooms, and course codes from the authentic IIITD timetable.

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
