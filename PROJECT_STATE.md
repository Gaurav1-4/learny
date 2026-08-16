# Learny — Project State & Milestone Tracker

**Current Status**: Prescribed Textbook Locked to Thomas' Calculus (11th Edition) Chapters 12–16 Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-hcqhdqqpm-semly.vercel.app`

---

## 🎯 Official Prescribed Textbook for Math III (MTH203 Multivariate Calculus)

- **Book**: **Thomas' Calculus (11th Edition)** by George B. Thomas, Maurice D. Weir, Joel Hass, Frank R. Giordano.
- **Prescribed Scope**: **Chapters 12 – 16**:
  - **Chapter 12**: Vectors and the Geometry of Space
  - **Chapter 13**: Vector-Valued Functions and Motion in Space
  - **Chapter 14**: Partial Derivatives (Limits, Directional Derivatives, Gradient, Tangent Planes, Lagrange Multipliers)
  - **Chapter 15**: Multiple Integrals (Double/Triple Integrals, Polar, Cylindrical, Spherical Substitutions)
  - **Chapter 16**: Integration in Vector Fields (Line Integrals, Green's Theorem, Surface Integrals, Stokes' Theorem, Divergence Theorem)
- **AI Anchoring**: All homework problem parsers, KaTeX renderers, and NotebookLM study prompts are locked 100% to this textbook and syllabus.

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
