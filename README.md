# 🎓 Learny — Personal Study Platform

**Learny** is a personal, student-focused academic study platform that integrates directly with **Google Classroom**. It brings all your active courses, assignments, announcements, grades, and academic tracking into a clean, modern workspace.

---

## ✨ Features

- **🔗 Google Classroom Direct Sync**:
  - Secure Google OAuth 2.0 with classroom scopes.
  - Automatically loads enrolled courses, teacher details, and course sections.
  - Live coursework feed with due dates, point totals, and submission status.
  - Grade tracking on returned assignments.
  - Announcement feed with direct links back to Classroom.
- **📊 Command Dashboard**:
  - Personalized welcome view.
  - Live overview cards: Total Courses, Pending Assignments, Upcoming Deadlines, GPA.
  - Upcoming deadlines list sorted chronologically with relative time ("Due in 2 days", "Was due yesterday") and status badges.
  - Fast navigation to enrolled courses.
- **📚 Course Workspace**:
  - Filterable course catalog with live search.
  - Course detail view featuring tabbed Coursework and Announcements.
  - Deep links to open any course or assignment directly in Google Classroom.
- **🧮 SGPA & CGPA Calculator**:
  - 10-point Indian university grading scale (`O`, `A+`, `A`, `B+`, `B`, `C`, `P`, `F`).
  - Dynamic semester and course management.
  - Real-time SGPA calculation per semester & cumulative CGPA across all semesters.
  - State persisted automatically in `localStorage`.
- **🔍 Global Omni-Search**:
  - Fast, debounced real-time search across all active courses, assignments, and study materials.
  - Quick categorization by type with direct links.
- **🎨 Dark Design System**:
  - Zinc dark theme palette with responsive sidebar and header.
  - Built with Tailwind CSS and Next.js 15 App Router.

---

## 🚀 Quick Start

### 1. Clone & Install Dependencies
```bash
cd /Users/gaurav/Desktop/learny
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Fill in your Google OAuth credentials:
```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_SECRET=your-random-secret
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=your-random-secret
```

> **Google Cloud Console Setup:**
> 1. Enable **Google Classroom API** under APIs & Services.
> 2. Configure OAuth Consent Screen (add yourself as a Test User).
> 3. Create Web OAuth Client with redirect URI: `http://localhost:3000/api/auth/callback/google`.

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Production Build
```bash
npm run build
npm run start
```
