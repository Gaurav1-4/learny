# Learny — Project State & Milestone Tracker

**Status**: UI/UX Pro Max Glassmorphism & Framer Motion Upgrade Live on Vercel & GitHub
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-delta.vercel.app`
- `https://learny-bmm74vcz1-semly.vercel.app`

---

## 1. UI/UX Pro Max Overhaul Details

- **Framer Motion Micro-Interactions**:
  - `layoutId` animated spring pills for course tabs and sidebar navigation items.
  - Staggered card entrance animations and physics-based hover lifts (`whileHover={{ y: -4 }}`).
- **Glassmorphic Ambient Lighting**:
  - Multi-stop gradient hero banners (`from-indigo-950/70 via-zinc-900/90 to-purple-950/40`) with blurred glow spheres.
  - Polished dark cards with translucent borders (`border-white/5` to `border-white/15`).
- **Course Workspace Detail Page Overhaul**:
  - Dynamic subject status pill, room badge, teacher indicator, and metrics strip (Assignments count, Notices count, Graded Submissions).
  - Rich coursework items: Grade chips with scores, Turn-in status badges, relative time countdowns ("Due in 2 days", "Passed 2 hours ago").
  - Quick action bridges: "Open in Classroom", "Launch Focus Timer", "Study in NotebookLM".
  - Clean announcement cards with 1-click clipboard copy note feedback.
- **Dashboard & Catalog Revamp**:
  - Glassmorphic metric cards with glowing colored accent borders.
  - Quick shortcut actions bar (NotebookLM Compiler, Subject Evals, Deep Focus Timer, SM-2 Decks).
- **Landing Page Polish**:
  - Background animated mesh gradient, floating badges, and high-contrast CTA button.
- **Build Verification**:
  - 17 routes compiled cleanly with 0 TypeScript/Turbopack errors in production.
