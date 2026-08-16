# Learny — Project State & Milestone Tracker

**Current Status**: Real-Time Cloud Firestore Multi-Device Backend Sync Engine Live & Deployed to Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-hb0r4exm6-semly.vercel.app`

---

## ⚡ Firebase Cloud Firestore Backend Sync Pipeline (Live)

1. **True Cross-Device External Database Sync (MacBook <-> iPhone)**:
   - Installed `firebase` & `firebase-admin` and provisioned **Learny Web** app on Google Firebase project `indiasgotlatent-be0ed`.
   - Built `src/lib/firebase/firestore-sync.ts` & `src/lib/firebase/server-sync.ts`:
     - **Real-Time Client Listener (`listenToFirestoreSync`)**: Automatically detects changes made on any other device (iPhone, iPad, MacBook) without page refresh.
     - **Automatic Hydration (`CloudSyncHydrator`)**: Mounted at the root `Providers` tree to synchronize all academic state (backlog homework, solved questions, flashcards, GPA, calendar events).
     - **Instant Mutation Sync (`pushToFirestore`)**: Fired whenever you solve a problem, mark a question Done/Pending, save homework, or rewrite with Gemini AI.
2. **Server & Apple Calendar Integration**:
   - `src/app/api/calendar/feed.ics` and `src/app/api/sync/all` query Firestore directly so that Apple Calendar on your iPhone/Mac receives real-time homework deadlines and test alarms even before opening the web app.
3. **Multi-User Isolation**:
   - Cloud state keys off authenticated Google Classroom email (`students/{studentEmail}`).
