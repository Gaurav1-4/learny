# Learny — Project State & Milestone Tracker

**Current Status**: Real-Time Automated Gemini AI Homework Pipeline Deployed (Single-Build Trigger)
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URL**: [https://learny.zorx.tech](https://learny.zorx.tech)

---

## 🚀 Fully Automated Gemini AI Homework Flow

1. **Zero-Click Automatic AI Processing**:
   - Every time homework is submitted via `+ Homework`, the 1-Week Backlog Resolver, or the Post-Class Banner, it automatically flows through the **Gemini AI KaTeX Formatter** (`/api/homework/ai-format`).
   - If raw text exists on mount, `SubjectWorkflowSuite` triggers the AI enhancement in the background automatically with zero manual steps.
2. **Multi-Course Alias Resolution**:
   - Math III inputs automatically register across `mth203`, `mth201`, and Google Classroom numeric IDs.
3. **Cloud Firestore Sync**:
   - Full KaTeX equations, methods, and smart calendar events sync in real time to Firebase Firestore (`students/{email}`).
4. **Single-Stream Deployments**:
   - Clean single Vercel builds triggered directly via GitHub webhooks (`main`).
