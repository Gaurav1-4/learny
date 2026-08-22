# Learny — Project State & Milestone Tracker

**Current Status**: DPP Evaluation Components Updated (Official 7-Item Breakdown), GAHA Chatbot Online, Single-User Auth Lock, 100% Firebase Cloud Storage, Premium Dashboard & 1-to-1 Automatic NotebookLM Mapping Deployed
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URL**: [https://learny.zorx.tech](https://learny.zorx.tech)

---

## 🎨 DPP (Design Processes & Perspectives / DES201) Evaluation Scheme
Updated with the exact official 7-category breakdown from your classroom projector slide:

| S.No | Category | Weight (%) | Quantity / Frequency | Total Marks |
| :---: | :--- | :---: | :---: | :---: |
| 1 | **Assignments (Individual)** | **10%** | 4 | $2.5 \times 4 = 10$ |
| 2 | **Assignments (Group)** | **10%** | 2 | $5 \times 2 = 10$ |
| 3 | **Mid-term Exam / Jury** | **20%** | 1 | 20 |
| 4 | **Class Participation & Attendance** | **10%** | Continuous | 10 |
| 5 | **Project** | **20%** | 1 | 20 |
| 6 | **Maintenance of a Journal** | **10%** | 1 | 10 |
| 7 | **End-Sem Exam / Jury** | **20%** | 1 | 20 |
| **Total** | | **100%** | | **100** |

- Synced directly to **Firebase Cloud Firestore** under `students/gaurav25212_iiitd_ac_in/subjectEvaluations`.

---

## 🧠 1. GAHA Academic Intelligence Layer (9-Key Gemini Pool)
- **Identity & Role**: **GAHA** (*Gaurav's Academic & Homework Assistant*), personal AI academic manager tailored to IIIT Delhi Monsoon 2026 courses (*Math III, OS, AP, DPP, RMSSD*).
- **9-Key Load-Balancing Infrastructure**:
  - Load-balances requests across all 9 Gemini API keys with round-robin execution and instant 0ms failover (capacity of 13,500 requests/day).
- **Multi-Domain Engine**: Homework & KaTeX math, NotebookLM synthesis, Target Grade calculus, and timetable schedule planning.

---

## 🔒 2. Strict Single-User Security Lock
- NextAuth Google OAuth is strictly locked exclusively to **`gaurav25212@iiitd.ac.in`**.
- Any unauthorized email trying to sign in is immediately rejected with an Access Denied block.

---

## ☁️ 3. 100% Cloud-First Architecture (Firebase Firestore)
- All user data is stored centrally in Cloud Firestore under `students/gaurav25212_iiitd_ac_in`.
- Real-time bidirectional synchronization across your **MacBook and iPhone**.
