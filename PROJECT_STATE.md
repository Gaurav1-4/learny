# Learny — Project State & Milestone Tracker

**Status**: IIITD CSD 3rd Semester & Historical Curriculum Integration Live on Vercel
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-1atobf88n-semly.vercel.app`

---

## 1. IIITD CSD 3rd Semester Data & Academic Roadmaps

- **Continuous Subject Evaluations Preset (`/gpa`)**:
  - `DPP 2026: Design Processes & Perspectives`: Critique (25%), Studio Assignments (25%), Midsem (20%), Final Portfolio (30%).
  - `Data Structures & Algorithms (DSA)`: Lab Quizzes (15%), Programming Assignments (20%), Midsem (25%), Endsem (40%).
  - `Advanced Programming (AP / OOP)`: OOP Labs (20%), Project (20%), Midsem (25%), Endsem (35%).
  - `Computer Organization (CO / CA)`: Assembly Labs (20%), Assignments (15%), Midsem (25%), Endsem (40%).
  - `Visual Design & Communication (VDC)`: Typography & Layout (30%), Prototype (35%), Final Showcase (35%).
- **Multi-Semester CGPA Records**:
  - `Semester 1 (Monsoon)`: IP, DC, M1, SM, COM (16 credits, 8.50 SGPA).
  - `Semester 2 (Winter)`: DS, BE, M2, CD (16 credits, 8.65 SGPA).
  - Dynamic degree Cumulative CGPA calculation engine.
- **AI Study Decks & Flashcards (`/study`)**:
  - Pre-packaged SM-2 decks with active recall cards and practice quizzes for DPP 2026 (Double Diamond, Affinity Mapping, Usability Heuristics), DSA (Dijkstra, Dynamic Programming, AVL Trees), and AP (SOLID principles, Singleton & Builder patterns).
- **Google Classroom Live Sync**:
  - All active and archived courses are queried live from `gaurav25212@iiitd.ac.in`.

---

## 2. All 17 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with real stats, active courses grid, and upcoming deadlines.
- `GET /courses`: Course catalog with Active Courses and Archived Vault tabs.
- `GET /courses/[courseId]`: Course workspace with tabbed coursework, points, grades, and announcements.
- `GET /notebooklm`: NotebookLM Dual-Account Hub, Knowledge Base compiler, and Import/Export bridge.
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /calendar`: Academic Calendar with course color coding and Classroom deadline sync.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /study`: AI Study Decks with SuperMemo SM-2 Spaced Repetition.
- `GET /search`: Unified search across all active and archived courses.
- `GET /settings`: Theme customizer, full JSON backup/restore hub, and Google account information.
- `GET /api/auth/[...nextauth]`: Google OAuth handler.
- `GET /api/auth/status`: Credentials status endpoint.
- `GET /api/classroom/courses?state=...`: Real Classroom courses with state filter (`ACTIVE`, `ARCHIVED`, `ALL`).
- `GET /api/classroom/courses/[courseId]`: Single course API.
- `GET /api/classroom/courses/[courseId]/coursework`: Coursework API.
- `GET /api/classroom/courses/[courseId]/announcements`: Announcements API.
- `GET /api/classroom/courses/[courseId]/submissions`: Student submissions and grades API.
- `GET /api/classroom/coursework?state=...`: Aggregated coursework API.
- `GET /api/classroom/search?q=...`: Multi-course search API.
