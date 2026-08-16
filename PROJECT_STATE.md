# Learny — Project State & Milestone Tracker

**Current Status**: Phase 1 MVP Complete & Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-qj6hxcms2-semly.vercel.app`

---

## 🎯 Phase 1 MVP (Completed & Live)

1. **IIITD CSD 3rd Semester Weekly Timetable (`/calendar?tab=timetable`)**:
   - Mapped to exact IIITD schedule (Monday to Friday, 8:30 AM – 6:00 PM).
   - Room numbers: `A106`, `C11`, `C201`, `C21`, `C102`, `C01`.
   - 1-Click iCal (`.ics`) & Google Calendar sync for all classes.
2. **Autonomous AI Study Planner & Prep Matrix (`/calendar?tab=planner`)**:
   - **Math III Tuesday Test Readiness Engine**: Monday free blocks (8:30–11:00 AM, 1:00–3:00 PM) scheduled for problem sets.
   - **OS Pre-Lecture Memorization Radar**: Concept retention before Mon/Wed lectures and Wed 8:30 AM tutorial.
   - **AP Surprise Quiz Survival Radar**: Daily OOP & SOLID code drills before Tue/Thu 3 PM lectures.
   - **Autonomous Homework Scheduler**: Auto-assigns assignments to optimal free timetable slots.
3. **Continuous Subject Evaluations & Multi-Semester CGPA (`/gpa`)**:
   - Math III, OS, AP, DPP 2026, RMSSD continuous weights (Labs, Quizzes, Midsem, Endsem).
   - Semester 1 (`8.50 SGPA`) & Semester 2 (`8.65 SGPA`) past history with live degree CGPA.
4. **Google Classroom Real-Time Ingestion**:
   - Instant live sync on page load/visit + 60s background polling + zero cache latency.
5. **UI/UX Pro Max Design System**:
   - 21st.dev signature components (`BorderBeam`, `SpotlightCard`, `ShimmerButton`), glassmorphism, Framer Motion animations.

---

## 🚀 Phase 2 Roadmap (Planned)

- **Native iOS Web Push Notifications**:
  - PWA standalone mode for iPhone Home Screen.
  - Native lock-screen alerts 15 minutes before classes and Monday morning test alarms.
- **College Gmail Academic Scanner (`@iiitd.ac.in`)**:
  - Ingestion of professor emails for room changes, class cancellations, and deadline extensions.
- **Automated Pre-Lecture 5-Minute Revision Sheets**:
  - 1-click summary sheets and active recall questions generated via NotebookLM before walking into class.
