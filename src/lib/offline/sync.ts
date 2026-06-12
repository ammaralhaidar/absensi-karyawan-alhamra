import { getDB } from "./db";

const QUEUE_STORE = "offline-queue";

export async function addToQueue(data: { token: string; kiosk_id: string }) {
  const db = await getDB();
  await db.add(QUEUE_STORE, {
    ...data,
    synced: false,
    created_at: new Date().toISOString(),
  });
}

export async function getQueue() {
  const db = await getDB();
  const all = await db.getAll(QUEUE_STORE);
  return all.filter((item) => !item.synced);
}

export async function markSynced(id: number) {
  const db = await getDB();
  await db.delete(QUEUE_STORE, id);
}

export async function clearQueue() {
  const db = await getDB();
  const tx = db.transaction(QUEUE_STORE, "readwrite");
  const store = tx.objectStore(QUEUE_STORE);
  await store.clear();
  await tx.done;
}

export async function syncOfflineData() {
  const queue = await getQueue();
  if (queue.length === 0) return { synced: 0, remaining: 0 };

  let synced = 0;
  for (const item of queue) {
    try {
      const resp = await fetch("/api/qr-validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: item.token,
          kiosk_id: item.kiosk_id || "kiosk-1",
        }),
      });

      if (resp.ok && item.id !== undefined) {
        await markSynced(item.id);
        synced++;
      }
    } catch (err) {
      console.error("Sync failed for item:", item.id, err);
    }
  }

  return { synced, remaining: queue.length - synced };
}
