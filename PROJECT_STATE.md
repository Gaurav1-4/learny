# Learny — Project State & Milestone Tracker

**Current Status**: 100% Authentic Calendar Timetable Synchronization (Strict Zero-Fake-Data Rule Enforced) Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-2elcyqzhl-semly.vercel.app`

---

## 🛡️ STRICT SYSTEM RULE: ZERO FAKE DATA & SINGLE SOURCE OF TRUTH

> [!IMPORTANT]
> **RULE: ZERO FAKE DATA**:
> All timetable slots, lecture times, course codes, and venues across the entire application (Backlog Resolver, Notifications, Dashboard, Post-Class Prompts, and Calendar) MUST strictly derive from `TIMETABLE_CLASSES` in `src/components/calendar/weekly-timetable.tsx`.
> No hardcoded or mismatched placeholder schedules are permitted.

---

## 🎯 Authentic IIITD Monsoon 2026 Timetable (Single Source of Truth)

1. **Monday**:
   - `11:00 AM – 12:30 PM` • **Room A106** • `DES201` **DPP (Design Processes & Perspectives)**
   - `3:00 – 4:30 PM` • **Room C201** • `CSE231` **Operating Systems (OS)**
2. **Tuesday**:
   - `11:00 AM – 12:30 PM` • **Room C11** • `SSH201` **RMSSD (Research Methods in Social Sciences & Design)**
   - `1:30 – 3:00 PM` • **Tutorial Room** • `MTH201` **Math III Tutorial (Graded Weekly Test)**
   - `3:00 – 4:30 PM` • **Room C21** • `CSE201` **Advanced Programming (AP)**
   - `4:30 – 6:00 PM` • **Room C201** • `MTH201` **Math III Lecture**
3. **Wednesday**:
   - `8:30 – 9:30 AM` • **Room C101** • `CSE231` **OS Tutorial**
   - `2:00 – 3:00 PM` • **Tutorial Room** • `CSE201` **AP Tutorial**
   - `3:00 – 4:30 PM` • **Room C201** • `CSE231` **OS Lecture**
4. **Thursday**:
   - `9:30 – 11:00 AM` • **Room C01** • `SSH201` **RMSSD Lab**
   - `11:00 AM – 12:30 PM` • **Room A106** • `DES201` **DPP Lecture**
   - `3:00 – 4:30 PM` • **Room C21** • `CSE201` **AP Lecture**
   - `4:30 – 6:00 PM` • **Room C102** • `MTH201` **Math III Lecture**
5. **Friday**:
   - `11:00 AM – 12:30 PM` • **Room C11** • `SSH201` **RMSSD Lecture**
   - `2:00 – 4:30 PM` • **Room A106** • `DES201` **DPP Practice Session**

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with verified post-class banner and 1-week backlog resolver.
- `GET /courses`: Clean course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Minimalist course workspace with direct content stream and KaTeX typography.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /study`: Unified Study & Productivity Hub (Flashcards SM-2, NotebookLM Vault, Focus Timer, GPA Planner).
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
