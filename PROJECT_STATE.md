# Learny — Project State & Milestone Tracker

**Current Status**: Automated Post-Class Homework Engine (Timetable Detection, Dashboard Banner, Web Notifications, Gemini 1.5 Flash KaTeX Formatter & OKF Google Drive Storage) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-3o9qsxi2u-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Post-Class Timetable Detection Engine (`src/lib/homework-prompt-engine.ts`)**:
   - Compares current time against Monsoon 2026 course timetable (Applied Math III, OS, AP, DSA, DPP, RMSSD).
   - Automatically detects when a lecture has concluded in the last 90 minutes.
   - Triggers native browser Web Notifications: *"Lecture Ended: [Course Name] — Click to log today's homework"*.
2. **Dashboard Post-Class Check-In Banner (`src/components/dashboard/post-class-banner.tsx`)**:
   - Renders a prominent check-in banner at the top of the Dashboard when a class ends.
   - Includes **[ ✍️ Log Homework ]**, **[ No Homework / Skip ]**, and on-demand **[ 🧪 Simulate Class Ended ]** test button.
3. **Gemini 1.5 Flash AI KaTeX Formatter (`/api/homework/ai-format`)**:
   - Uses the 9-Key Gemini rotation pool to parse shorthand typing (`14.2 3 5, 14.3 2, 14.4 1` or plain text).
   - Generates authentic mathematical LaTeX statements ($\oint_C \frac{z^2+1}{z-3} dz = 0$), exercise numbers, and step-by-step methods of work.
4. **OKF (Ontological Knowledge Framework) & Google Drive Storage**:
   - Generates structured OKF markdown metadata embeddings and updates the course's Problem Ledger + Google Drive NotebookLM vault registry.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with post-class banner, action items, and upcoming deadlines.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with direct content stream and KaTeX typography.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /study`: Unified Study & Productivity Hub (Flashcards SM-2, NotebookLM Vault, Focus Timer, GPA Planner).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
