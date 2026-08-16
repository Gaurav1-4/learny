# Learny — Project State & Milestone Tracker

**Current Status**: Full Gemini LLM Processing Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-9s40urgc3-semly.vercel.app`

---

## 🤖 Full Gemini LLM Homework Pipeline (Live)

1. **Intelligent Decomposition (`/api/homework/ai-format`)**:
   - Uses Gemini LLM with IIIT Delhi Monsoon 2026 timetable and evaluation schedules.
   - Converts shorthand/voice input into structured KaTeX LaTeX equations, exercise topics, difficulty ratings, and step-by-step methods.
2. **Direct Ingestion into Course Ledger**:
   - `SubjectWorkflowSuite` connects directly to `json.data.problems` and `json.data.smartSchedule`.
   - Schedules optimal study prep blocks before weekly graded tests and lab reviews.
3. **Pending vs. Done Interactive Lifecycle**:
   - Tactile `Done? [Yes / No]` toggles.
   - 1-click **Edit Modal**, **25m Focus Session**, and **SM-2 Flashcard Deck** generation.
