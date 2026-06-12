const CACHE_NAME = 'alhamra-attendance-v1';
const STATIC_ASSETS = [
  '/',
  '/login',
  '/dashboard',
  '/leaves',
  '/profile',
  '/admin',
  '/admin/employees',
  '/admin/departments',
  '/admin/shifts',
  '/admin/approvals',
  '/admin/reports',
  '/admin/roster',
  '/admin/activity-log',
  '/kiosk',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});

self.addEventListener('sync', async (event) => {
  if (event.tag === 'sync-offline-data') {
    event.waitUntil(syncOfflineQueue());
  }
});

self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'SYNC_OFFLINE_DATA') {
    await syncOfflineQueue();
  }
});

async function syncOfflineQueue() {
  console.log('SW: Starting offline sync...');

  const db = await openIndexedDB();
  const tx = db.transaction('offline-queue', 'readwrite');
  const store = tx.objectStore('offline-queue');
  const queue = await getAllFromStore(store);

  const SUPABASE_URL = 'https://wyewqgyldltujjunmfmp.supabase.co';
  const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5ZXdxZ3lsZGx0dWpqdW5tZm1wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODExNDE2NjYsImV4cCI6MjA5NjcxNzY2Nn0.UG6UgYS4w6UMWErqBq1JSlwp6AXTjKqzUqY3hHFPyfY';

  let synced = 0;

  for (const item of queue) {
    try {
      const resp = await fetch(`${SUPABASE_URL}/functions/v1/qr-validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
        body: JSON.stringify({
          token: item.token,
          kiosk_id: item.kiosk_id || 'kiosk-1',
        }),
      });

      if (resp.ok) {
        await store.delete(item.id);
        synced++;
      }
    } catch (err) {
      console.error('SW sync error:', err);
    }
  }

  await tx.done;
  console.log(`SW: Synced ${synced} items, ${queue.length - synced} remaining`);

  const clients = await self.clients.matchAll();
  clients.forEach(function (client) {
    client.postMessage({ type: 'SYNC_COMPLETE', synced });
  });
}

function getAllFromStore(store) {
  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = function () { resolve(request.result); };
    request.onerror = function () { reject(request.error); };
  });
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('alhamra-offline', 1);
    request.onsuccess = function () { resolve(request.result); };
    request.onerror = function () { reject(request.error); };
    request.onupgradeneeded = function (event) {
      var db = event.target.result;
      if (!db.objectStoreNames.contains('offline-queue')) {
        db.createObjectStore('offline-queue', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}
