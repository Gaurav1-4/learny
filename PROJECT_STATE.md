# Learny — Project State & Milestone Tracker

**Current Status**: Real Homework Dynamic Loader Live on Production (Zero Hardcoded Demo Questions)
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-qw2p61bf7-semly.vercel.app`

---

## 📚 Real Homework Course Ledger Pipeline (Live)

1. **Elimination of Fallback Demo Questions**:
   - Stripped all hardcoded demo questions (`Ex 14.2 Q3`, `Ex 14.2 Q5`, `Ex 14.3 Q2`, etc.).
   - Initial state starts empty `[]` and dynamically queries the student's unified state:
     - `learny-problems-${courseId}`
     - `learny-backlog-homework-map`
     - `learny-homework-logs`
     - Google Classroom CourseWork API (`coursework`)
2. **Authentic Dynamic Rendering**:
   - Formats problem cards from the student's exact uploaded text and problem numbers.
   - If no homework is logged for a course, displays a clean, helpful empty state with a direct `+ Log Homework` action button.
3. **Voice & Text Shorthand via LLM**:
   - `+ Homework` modal sends homework input to `/api/homework/ai-format` (LLM processing engine).
   - Generates authentic KaTeX equations, method notes, and deadlines.
