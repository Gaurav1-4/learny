# Learny — Project State & Milestone Tracker

**Current Status**: Email Intelligence Completely Extracted to Zobox & Learny Dedicated 100% to Academic Core Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-pj409vecd-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Complete Removal of Email Logic from Learny**:
   - **Google OAuth Scopes Cleaned**: Removed `"https://www.googleapis.com/auth/gmail.readonly"` from `src/lib/auth.ts`. Learny strictly requests Google Classroom permissions only.
   - **Dashboard Decluttered**: Removed the email alerts radar widget from the Dashboard. The Dashboard is now 100% focused on active deadlines and course sync.
   - **Email Intelligence Extracted**: Ready for deployment in the dedicated **Zobox** project (`https://zobox.zorx.tech`).
2. **Minimalist Course Detail View**:
   - Eliminated stacked 200px banners and nested boxes.
   - Compact top bar with direct Google Classroom link.
   - Real KaTeX mathematical typography ($\oint_C \frac{z^2+1}{z-3} dz = 0$) for problem sets.
3. **Strict Temporal Deadline Separation (`DeadlineList`)**:
   - **`Upcoming Deadlines`**: Strictly future deadlines (`dueDate >= now`), sorted soonest-first.
   - **`Overdue Deadlines`**: Isolated under a dedicated separate tab.
4. **Senior Mobile 4-Tab Architecture**:
   - `Dashboard`, `Courses`, `Schedule`, and `Study & Tools`.
   - Zero duplication across navigation and content views.

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
