'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';

/**
 * CloudSyncHydrator: Seamlessly synchronizes homework, calendar deadlines,
 * and course problem ledgers across all of your devices (Laptop, Phone, Tablet).
 */
export function CloudSyncHydrator() {
  const { data: session } = useSession();

  useEffect(() => {
    async function syncFromCloud() {
      if (typeof window === 'undefined') return;

      try {
        const res = await fetch('/api/homework/sync');
        if (!res.ok) return;

        const data = await res.json();
        const entries: Record<string, any> = data.entries || {};
        const lectureIds = Object.keys(entries);

        if (lectureIds.length === 0) return;

        // 1. Hydrate logged backlog IDs
        const rawLogged = localStorage.getItem('learny-backlog-logged-ids');
        const localLoggedIds: string[] = rawLogged ? JSON.parse(rawLogged) : [];
        const mergedLoggedIds = Array.from(new Set([...localLoggedIds, ...lectureIds]));
        localStorage.setItem('learny-backlog-logged-ids', JSON.stringify(mergedLoggedIds));

        // 2. Hydrate each lecture homework and calendar events
        const calendarKey = 'learny-calendar-custom-events';
        const existingEventsRaw = localStorage.getItem(calendarKey);
        const existingEvents = existingEventsRaw ? JSON.parse(existingEventsRaw) : [];

        lectureIds.forEach((id) => {
          const entry = entries[id];

          // Save lecture homework
          localStorage.setItem(`learny-backlog-hw-${id}`, JSON.stringify(entry));

          // Save problems to course ledger
          if (entry.problems && entry.problems.length > 0 && entry.courseCode) {
            const courseKey = `learny-problems-${entry.courseCode.toLowerCase()}`;
            const existingProbsRaw = localStorage.getItem(courseKey);
            const existingProbs = existingProbsRaw ? JSON.parse(existingProbsRaw) : [];
            const mergedProbs = [...existingProbs, ...entry.problems];
            localStorage.setItem(courseKey, JSON.stringify(mergedProbs));
          }

          // Inject calendar event
          if (entry.rawInput && entry.rawInput.trim()) {
            const newEvent = {
              id: `backlog-${entry.lectureId}`,
              title: `${entry.courseCode} Homework: ${entry.summary}`,
              courseName: entry.courseName,
              date: (entry.dueDate || new Date().toISOString()).split('T')[0],
              time: '11:59 PM',
              type: 'homework',
              category: 'submission',
              description: `Synced across devices: ${entry.rawInput}`,
            };

            const filtered = existingEvents.filter((e: any) => e.id !== newEvent.id);
            filtered.push(newEvent);
          }
        });

        localStorage.setItem(calendarKey, JSON.stringify(existingEvents));
      } catch (err) {
        console.warn('Background cross-device cloud sync non-blocking warning', err);
      }
    }

    syncFromCloud();
  }, [session]);

  return null;
}
