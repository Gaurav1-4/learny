# Learny — Project State & Milestone Tracker

**Current Status**: Complete Minimalist UI Polish Across Entire Application Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-10ofji93c-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Ultra-Clean, Unified Design System**:
   - **Monochrome Slate Aesthetic**: Standardized across all 20 routes (`#09090b` canvas, `#27272a` subtle borders, high-contrast white/zinc typography, zero glowing AI slop/rainbow gradients).
   - **Minimalist Page Headers**: Standardized compact header format:
     - Small top context breadcrumb (`Monsoon 2026 • IIIT Delhi`, `SuperMemo SM-2 • Active Recall`, `Academic Progress`)
     - Clean, sharp title (`text-xl font-bold text-white`)
     - Flat segmented tabs (`bg-zinc-950` container, `bg-zinc-800` active indicator)
2. **Decluttered Dashboard**:
   - 100% focused on active deadlines and quick-jump to courses.
   - Clean summary card with accurate active count (`dueDate >= now`) and isolated overdue tab.
   - Removed all email widgets and duplicate shortcuts.
3. **Streamlined Courses & Classroom View**:
   - Compact single-line course header with direct Google Classroom link.
   - Zero stacked 200px banners.
   - Direct KaTeX mathematical typesetting for problem sets ($\oint_C \frac{z^2+1}{z-3} dz = 0$).
4. **4-Tab Mobile Navigation**:
   - Native bottom navigation bar: `Dashboard`, `Courses`, `Schedule`, `Study & Tools`.
   - Zero navigation duplication.

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
