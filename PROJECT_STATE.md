# Learny — Project State & Milestone Tracker

**Current Status**: GAHA 2.0 24x7 Academic Executive Manager Live & Operational, Official IIITD Monsoon 2026 Academic Calendar Engine Fully Integrated as "The Heart & Bible", OKF (Ontological Knowledge Framework) Long-Term Memory Synced to Cloud Firestore, Fluid Swipe & Click Navigation Active App-Wide, Complete IIITD Monsoon 2026 Evaluation Suite Active, Single-User Auth Lock, Premium Dashboard & 1-to-1 Automatic NotebookLM Mapping Deployed
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URL**: [https://learny.zorx.tech](https://learny.zorx.tech)

**Project Milestones**:
- [x] Integrate GAHA 2.0 with OKF Memory Graph & Daily Briefings.
- [x] Phase 1 of GAHA 2.0 Life Manager (Timeline UI, Conflict Engine, Auto-Postpone).

---

## 🏛️ GAHA 2.0 — 24x7 Autonomous Academic Executive Manager (Deployed)
- **Official Academic Calendar Engine (`src/lib/academic-calendar-engine.ts`)**:
  - Encodes the complete IIIT Delhi Monsoon 2026 Semester Calendar (Weeks 0 to 23).
  - Handles all **8 Timetable Adjustments (TTA)**:
    - *Sat 22 Aug* $\to$ Friday Time Table (`TT-Fri³`)
    - *Tue 8 Sep* $\to$ Friday Time Table (`TT-Fri⁴`)
    - *Sat 12 Sep* $\to$ Wednesday Time Table (`TT-Wed⁵`)
    - *Sat 19 Sep* $\to$ Tuesday Time Table (`TT-Tue⁵`)
    - *Sat 10 Oct* $\to$ Monday Time Table (`TT-Mon⁸`)
    - *Sat 21 Nov* $\to$ Monday Time Table (`TT-Mon¹²`)
    - *Wed 25 Nov* $\to$ Tuesday Time Table (`TT-Tue¹³`)
    - *Thu 26 Nov* $\to$ Friday Time Table (`TT-Fri¹³` — Last Day of Class)
  - Automatically handles **9 Gazetted Holidays (GH)** (*Aug 15, Aug 26, Sep 4, Oct 2, Oct 20, Oct 26, Nov 8, Nov 24, Dec 25*).
  - War-room countdowns for **Midsem Exams (20–28 Sept)** and **Endsem Exams (29 Nov – 8 Dec)**.
- **OKF (Ontological Knowledge Framework) Memory Core (`src/lib/okf-memory-engine.ts`)**:
  - Ingests all 5 courses (*Math III, OS, AP, DPP, RMSSD*) into structured topic mastery graphs.
  - KaTeX formula bank and deterministic method-of-work retrieval.
  - Real-time bidirectional Cloud Firestore sync under `students/gaurav25212_iiitd_ac_in/okfMemory`.
- **24x7 Academic Command Center (`/manager`)**:
  - Daily Morning Briefings (07:30 AM) and Night Reviews (10:00 PM) with built-in text-to-speech audio reader.
  - TTA Calendar Matrix & Milestone countdowns.
  - OKF Concept Search and Topic Mastery Boosters.
  - Deep Work Study Block Dispatcher.
