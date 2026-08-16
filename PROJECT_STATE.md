# Learny — Project State & Milestone Tracker

**Current Status**: Universal Course Content Engine (Guaranteed KaTeX Problem Sets, Interactive Study Tutors & Live Classroom Stream) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-dbcdiexxm-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Course Content Engine**:
   - **Math & Calculus Courses (MTH203, MTH201, Linear Algebra, Calculus)**:
     - KaTeX textbook-grade problem sets ($\oint_C \frac{z^2+1}{z-3} dz = 0$), Method-of-Work proofs, and voice/shorthand homework logger.
   - **System, Programming & Design Courses (OS, AP, DSA, DPP, RMSSD)**:
     - Dynamic **Syllabus Mastery Modules** and **4 High-Yield Contextual AI Prompts** (Foundations, Midsem Quizzes, Exam Traps, and SM-2 Flashcards).
   - **Live Classroom Stream**:
     - Real-time connection to Google Classroom `materials`, `coursework`, `announcements`, and direct Drive attachment openers.
2. **Ultra-Clean Minimalist UI**:
   - Monochrome slate design system (`#09090b` / `#27272a`).
   - Compact single-line headers with zero stacked banner clutter.
   - 4-tab native mobile bottom navigation.
3. **Strict Temporal Deadline Separation**:
   - Compares all course due dates against `new Date()`.
   - `Upcoming Deadlines` strictly displays future items (`dueDate >= now`), while past items are isolated in `Overdue`.
4. **Email Extraction**:
   - Cleaned Gmail scopes and email widgets from Learny; prepared for dedicated Zobox app (`zobox.zorx.tech`).

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with action items and upcoming deadlines.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with direct content stream and KaTeX typography.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /study`: AI Study Decks with SuperMemo SM-2 Spaced Repetition.
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
