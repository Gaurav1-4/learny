# Learny — Project State & Milestone Tracker

**Current Status**: Fluid Swipe & Touch Drag Tab Gestures Active App-Wide, Latency Bottlenecks Solved (High-Speed In-Memory Cache + 0ms Instant Hydration + Non-Blocking Sync), Complete IIITD Monsoon 2026 Evaluation Suite Active, GAHA Chatbot Online, Single-User Auth Lock, 100% Firebase Cloud Storage, Premium Dashboard & 1-to-1 Automatic NotebookLM Mapping Deployed
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URL**: [https://learny.zorx.tech](https://learny.zorx.tech)

---

## 📱 Fluid Swipe & Touch Gesture Tabs (Deployed)
- **Reusable Component (`src/components/ui/swipeable-tabs.tsx`)**:
  - Full horizontal touch swipe and trackpad/mouse drag support with physics-based spring transitions.
  - Swipe left (`offset.x < -60`) advances to the next tab.
  - Swipe right (`offset.x > 60`) returns to the previous tab.
  - Active layout pill indicator (`layoutId="active-tab-indicator"`) smoothly glides between tabs.
  - Direction-aware enter/exit slide animations.
  - Preserves vertical scrolling (`touch-pan-y`) so page scrolling on mobile/iPhone remains smooth without interference.
- **Integrated Across All App Views**:
  1. **GPA & CGPA Planning (`/gpa`)**: Swipe between *Subject Evaluations*, *Target Grade Planner*, and *Manual SGPA Table*.
  2. **Courses Hub (`/courses`)**: Swipe between *Active Semester*, *Past / Hidden*, and *Archived*.
  3. **Course Details (`/courses/[id]`)**: Swipe between *Study & Practice Lab*, *Classroom Stream*, *Notes & Slides*, and *Assignments*.
  4. **Study & Productivity Suite (`/study`)**: Swipe between *NotebookLM Document Vault*, *NotebookLM Account Sync*, *Focus Timer*, and *GPA & Evaluations*.

---

## ⚡ Performance & Latency Optimization (Resolved)
- In-memory API cache (`apiCache`, 90–180s TTL) with `Cache-Control: private, max-age=60, stale-while-revalidate=120`.
- 0ms instant client-side cache hydration from `sessionStorage`.
- Non-blocking background Firestore sync.
- Instant manual refresh with `?fresh=true`.

---

## 📚 IIIT Delhi Monsoon 2026 Complete Official Evaluation Suite
1. **Math III (MTH201)**: Weekly Tutorial Quizzes (30% n-2 policy), Midsem (30%), Endsem (40%).
2. **Operating Systems (OS / CSE231 - Sec A)**: Quizzes (10% N-1), Take-Home Assignments (35% No N-1), Midsem (20%), Endsem (35%).
3. **Advanced Programming (AP / CSE201)**: Assignments (30% total 4), Quizzes (10% best 5 of 6), Midsem (25%), Final Exam (35%).
4. **RMSSD (SSH201 - 2+2 Credits)**: Part 1 Pre-Midsem (Tutorial 40%, Assignment 1 20% due 7 Sept, Midsem 40%), Part 2 Post-Midsem (40% / 20% / 40%).
5. **DPP (DES201)**: 7 categories (10% Indiv, 10% Group, 20% Midsem Jury, 10% Attendance, 20% Project, 10% Journal, 20% Final Jury).
