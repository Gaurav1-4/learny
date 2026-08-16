# Learny — Project State & Milestone Tracker

**Current Status**: Complete Declutter & Real Semester-Wide Auto-Populating Month Grid Live on Production
**GitHub Repository**: [https://github.com/Gaurav1-4/learny](https://github.com/Gaurav1-4/learny)
**Live Production URLs**:
- `https://learny.zorx.tech`
- `https://learny-eihbtyhvz-semly.vercel.app`

---

## 📅 Schedule & Timetable Overhaul (Live)

1. **Zero Clutter Architecture**:
   - Stripped away the massive purple gradient hero banner and mock checklist cards.
   - Reduced tabs to 2 core views: **`Weekly Timetable`** and **`Month Calendar`**.
   - Clean, uncluttered action buttons: **`[Apple Calendar (iCloud)]`**, **`[Sync Google Calendar]`**, and **`[Backlog]`**.
2. **Real Data Across the Entire Month Grid**:
   - Every single day of the month automatically renders the student's authentic IIIT Delhi classes, room locations, labs, and weekly tests (e.g. Tuesday Math III Tutorial Tests in Tutorial Room, Wednesday OS Tutorials in C101, Thursday RMSSD Lab in C01, etc.).
   - Interactive modal on click showing room details, maximum marks, and course notes.
   - Filter switch: `All (Classes + Deadlines)`, `Classes Only`, `Deadlines Only`.
3. **Apple & Google Calendar Sync**:
   - `webcal://learny.zorx.tech/api/calendar/feed.ics` with live recurring semester classes, alarms, and homework deadlines.
   - `/api/calendar/google-sync` OAuth v3 direct integration.
