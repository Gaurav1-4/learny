# Learny — Project State & Milestone Tracker

**Current Status**: Real KaTeX Math Typesetting & Clean Zero-Clutter Math Workspace Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-9fr7l0vu1-semly.vercel.app`

---

## 🎯 Deployed & Verified Systems

1. **Real KaTeX Mathematical Typesetting (`src/components/ui/math-view.tsx`)**:
   - Integrated KaTeX engine with `katex/dist/katex.min.css`.
   - Every complex contour integral, fraction, exponential, and derivative renders as **true textbook-grade mathematical typography** ($\oint_C \frac{z^2+1}{z-3} dz = 0, \quad C: |z|=1$, $\int_0^{1+i\pi} e^{2z} dz$, etc.) instead of raw text code blocks.
   - Inline math strings inside explanations (e.g. `$z_0 = i$`, `$|z|=2$`, `$\to 0$`) are parsed and rendered seamlessly with `<FormattedMathText />`.
2. **Complete Elimination of Nested "Box-in-a-Box" UI Clutter**:
   - Removed 6 stacked levels of nested grey boxes.
   - Clean, flat editorial problem cards that flow naturally.
   - "Enter Homework" (Voice + Shorthand) is now a sleek modal triggered from `[ Update Homework ]`.
   - "Method of Work" (Cauchy Theorem + Step 1/Step 2) is a clean reference sheet triggered from `[ Method of Work ]`.
   - Filter segmented control: `All (6)`, `Mandatory (4)`, `Similar Practice (2)` with clear completion counter `2 / 4`.
3. **100% Mobile & Safari PWA Support**:
   - Native bottom navigation bar with safe-area padding on iPhone Safari.
   - "Add to Home Screen" on iOS & "Add to Dock" on macOS Safari.
4. **NotebookLM-Driven Topic Extraction & OKF Manifest (`src/lib/okf-indexer.ts`)**:
   - Zero API token bloat: Full PDFs parsed by NotebookLM under `studyonly.co@gmail.com`.
5. **Autonomous NotebookLM Session-Cookie Sync Engine (`src/lib/notebooklm-client.ts`)**:
   - Programmatic Google RPC client with session cookie authentication (`__Secure-1PSID`) for 1-click uploads.
6. **9-Key Gemini Academic Email Intelligence Agent (`src/lib/email-filter-agent.ts`)**:
   - Matches incoming `@iiitd.ac.in` emails strictly against **Gaurav's 3rd Sem B.Tech CSD profile**.

---

## 🌐 All 20 Production Routes Live

- `GET /`: Landing page with authentic Google Classroom sign-in.
- `GET /dashboard`: Student dashboard with Live Class End & Homework Mock Simulator, AI Email Radar, and active courses.
- `GET /courses`: Course catalog with Active Courses and Archived Vault.
- `GET /courses/[courseId]`: Course workspace with **KaTeX Typeset Problem Sets, Erwin Kreyszig Similar Practice, OS/AP Tutor, DPP/RMSSD Notes**.
- `GET /notebooklm`: NotebookLM Dual-Account Hub with 1-Click Auto-Sync, 5 TB Vault, and Cookie Connector.
- `GET /gpa`: Subject Evaluations, Multi-Semester CGPA, Target Grade Planner, and Quick Table.
- `GET /calendar`: 3-Tab Hub: Weekly Timetable, AI Study Planner, and Month Deadlines Calendar.
- `GET /timer`: Focus Timer & Pomodoro deep-work module with Web Audio API synthesis chime.
- `GET /study`: AI Study Decks with SuperMemo SM-2 Spaced Repetition.
- `GET /search`: Unified search across all active and archived courses.
- `GET /settings`: Student Profile & POR Editor, 9-Key AI Pool Status, dual-account status, full JSON backup/restore hub.
