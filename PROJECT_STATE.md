# Learny — Project State & Milestone Tracker

**Current Status**: Google NotebookLM Document-Connected System Deployed
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URL**: [https://learny.zorx.tech](https://learny.zorx.tech)

---

## 🧠 Google NotebookLM Document-Connected System

1. **Automatic Document Ingestion into NotebookLM**:
   - Every single course document, lecture slide, PDF, and syllabus topic is directly linked to **Google's NotebookLM (`notebooklm.google.com`)**.
   - Clicking **"Go to NotebookLM"** automatically adds that document as active source material in the course notebook under `studyonly.co@gmail.com` and deep-links directly to Google NotebookLM.
2. **Native Embedded NotebookLM Study Assets**:
   - 🎙️ **Conversational Audio Overview**: Built-in player for the 2-host deep dive audio podcast with live transcript and playback controls (1x, 1.25x, 1.5x, 2x).
   - 🎬 **Video & Visual Concept Explainer**: Whiteboard concept breakdown with slide-by-slide visual highlights.
   - 🎴 **Document Flashcards (SM-2)**: Active-recall flashcards generated directly from that specific document with SuperMemo spaced repetition intervals (*Again 1d, Hard 3d, Good 6d, Easy 10d+*).
   - 📑 **Study Guide & Briefing Doc**: Summary, key technical definitions, LaTeX formulas, FAQs, and exam traps.
   - 🎯 **Practice Quiz**: Interactive self-test with instant feedback and answer rationales.
   - 💬 **Ask Document AI**: Instant grounded Q&A with Gemini AI citing the document.
3. **Google NotebookLM Document Vault (`/study`)**:
   - Replaced detached standalone flashcards with the centralized **NotebookLM Document Vault**.
   - Organized by course (*Operating Systems, Math III, Advanced Programming, DPP, RMSSD*).
   - Instant 1-click launch into the NotebookLM workspace or directly to `https://notebooklm.google.com`.
4. **Course Page Deep Integration (`/courses/[courseId]`)**:
   - Prominent **`✨ Go to NotebookLM`** action buttons next to every lecture material, slide attachment, and coursework PDF.

---

## 🚀 Automated Gemini AI Homework Flow
1. **Zero-Click Automatic AI Processing**: Every homework entry is processed by Gemini KaTeX Formatter (`/api/homework/ai-format`).
2. **Eliminated All Regex Fallbacks**: AI-only parsing with automatic detection and recovery from poorly-formatted entries.
3. **Cloud Firestore Sync**: Real-time cross-device sync for MacBook & iPhone (`students/{email}`).
