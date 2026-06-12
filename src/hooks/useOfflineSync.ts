"use client";

import { useState, useEffect, useCallback } from 'react';
import { getPendingScans, markScanSynced, addToScanQueue } from '@/lib/offline/db';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const updateOnline = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  useEffect(() => {
    getPendingScans().then(p => setPendingCount(p.length));
  }, [isOnline]);

  const queueScan = useCallback(async (token: string, kioskId: string) => {
    if (!isOnline) {
      await addToScanQueue(token, kioskId);
      setPendingCount(c => c + 1);
      return { queued: true };
    }
    return { queued: false };
  }, [isOnline]);

  const syncPending = useCallback(async () => {
    if (!isOnline) return;
    setIsSyncing(true);
    const pending = await getPendingScans();

    for (const scan of pending) {
      try {
        const resp = await fetch(
          `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/qr-validate`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ token: scan.token, kiosk_id: scan.kiosk_id }),
          }
        );
        if (resp.ok) {
          await markScanSynced(scan.id as number);
        }
      } catch {
        // retry later
      }
    }

    setPendingCount(0);
    setIsSyncing(false);
  }, [isOnline]);

  return { isOnline, pendingCount, isSyncing, queueScan, syncPending };
}
