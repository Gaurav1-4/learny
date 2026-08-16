'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { MONSOON_2026_BACKLOG_LECTURES } from '@/lib/backlog-engine';

/**
 * Collects all relevant academic state from the current device's localStorage
 */
export function getLocalDeviceState() {
  if (typeof window === 'undefined') return null;

  // 1. Backlog IDs
  const rawLogged = localStorage.getItem('learny-backlog-logged-ids');
  const backlogLoggedIds: string[] = rawLogged ? JSON.parse(rawLogged) : [];

  // 2. Backlog Homework Map
  const backlogHomeworkMap: Record<string, any> = {};
  MONSOON_2026_BACKLOG_LECTURES.forEach((lec) => {
    const raw = localStorage.getItem(`learny-backlog-hw-${lec.id}`);
    if (raw) {
      try {
        backlogHomeworkMap[lec.id] = JSON.parse(raw);
      } catch {}
    }
  });

  // 3. Calendar Events
  const calendarKey = 'learny-calendar-custom-events';
  const rawEvents = localStorage.getItem(calendarKey);
  const calendarEvents = rawEvents ? JSON.parse(rawEvents) : [];

  return {
    backlogLoggedIds,
    backlogHomeworkMap,
    calendarEvents,
  };
}

/**
 * Triggers a full push-then-pull synchronization between device and cloud server
 */
export async function triggerFullCloudSync(): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined') return { success: false, message: 'Window not defined' };

  try {
    const local = getLocalDeviceState();

    // 1. Push local state to cloud if we have any data
    if (local && (local.backlogLoggedIds.length > 0 || local.calendarEvents.length > 0)) {
      await fetch('/api/sync/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(local),
      });
    }

    // 2. Pull latest merged state from cloud
    const res = await fetch('/api/sync/all');
    if (!res.ok) return { success: false, message: 'Cloud sync response error' };

    const { store } = await res.json();
    if (!store) return { success: true, message: 'Synced' };

    // 3. Hydrate into device localStorage
    // 3a. Backlog Logged IDs
    if (Array.isArray(store.backlogLoggedIds) && store.backlogLoggedIds.length > 0) {
      const currentRaw = localStorage.getItem('learny-backlog-logged-ids');
      const currentIds: string[] = currentRaw ? JSON.parse(currentRaw) : [];
      const merged = Array.from(new Set([...currentIds, ...store.backlogLoggedIds]));
      localStorage.setItem('learny-backlog-logged-ids', JSON.stringify(merged));
    }

    // 3b. Backlog Homework items
    if (store.backlogHomeworkMap && typeof store.backlogHomeworkMap === 'object') {
      Object.keys(store.backlogHomeworkMap).forEach((id) => {
        const item = store.backlogHomeworkMap[id];
        localStorage.setItem(`learny-backlog-hw-${id}`, JSON.stringify(item));
      });
    }

    // 3c. Calendar Events
    if (Array.isArray(store.calendarEvents) && store.calendarEvents.length > 0) {
      const currentEventsRaw = localStorage.getItem('learny-calendar-custom-events');
      const currentEvents: any[] = currentEventsRaw ? JSON.parse(currentEventsRaw) : [];
      const eventMap = new Map<string, any>();
      currentEvents.forEach((e) => eventMap.set(e.id, e));
      store.calendarEvents.forEach((e: any) => eventMap.set(e.id, e));
      localStorage.setItem('learny-calendar-custom-events', JSON.stringify(Array.from(eventMap.values())));
    }

    // Dispatch storage event so all components react immediately
    window.dispatchEvent(new Event('storage'));

    return { success: true, message: 'Synced seamlessly across devices!' };
  } catch (err: any) {
    console.warn('Full cloud sync warning:', err);
    return { success: false, message: err?.message || 'Sync failed' };
  }
}

/**
 * CloudSyncHydrator: Component mounted in root Providers to execute bi-directional cloud sync on launch
 */
export function CloudSyncHydrator() {
  const { data: session } = useSession();

  useEffect(() => {
    // Run full push & pull sync on launch
    triggerFullCloudSync();
  }, [session]);

  return null;
}
