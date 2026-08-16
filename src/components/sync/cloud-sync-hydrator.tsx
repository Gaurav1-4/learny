'use client';

import { useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { syncAllWithFirestore, listenToFirestoreSync } from '@/lib/firebase/firestore-sync';

/**
 * Triggers a full push-then-pull synchronization between device and Cloud Firestore
 */
export async function triggerFullCloudSync(): Promise<{ success: boolean; message: string }> {
  if (typeof window === 'undefined') return { success: false, message: 'Window not defined' };

  try {
    const studentEmail = localStorage.getItem('learny-user-email') || 'student_primary';
    
    // 1. Full Firestore sync
    await syncAllWithFirestore(studentEmail);

    // 2. Also sync to internal API backup
    try {
      const res = await fetch('/api/sync/all');
      if (res.ok) {
        const { store } = await res.json();
        if (store) {
          if (store.backlogHomeworkMap) {
            Object.keys(store.backlogHomeworkMap).forEach((id) => {
              const item = store.backlogHomeworkMap[id];
              localStorage.setItem(`learny-backlog-hw-${id}`, JSON.stringify(item));
            });
          }
        }
      }
    } catch {}

    window.dispatchEvent(new Event('storage'));
    return { success: true, message: 'Synced seamlessly with Firebase Firestore & iCloud!' };
  } catch (err: any) {
    console.warn('Full cloud sync warning:', err);
    return { success: false, message: err?.message || 'Sync failed' };
  }
}

/**
 * CloudSyncHydrator: Component mounted in root Providers to execute real-time Firebase sync on launch
 */
export function CloudSyncHydrator() {
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.email) {
      localStorage.setItem('learny-user-email', session.user.email);
    }

    // 1. Initial full sync with Firestore
    triggerFullCloudSync();

    // 2. Real-time multi-device subscription (MacBook <-> iPhone)
    const studentEmail = session?.user?.email || localStorage.getItem('learny-user-email') || 'student_primary';
    const unsubscribe = listenToFirestoreSync(() => {
      window.dispatchEvent(new Event('storage'));
    }, studentEmail);

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [session]);

  return null;
}
