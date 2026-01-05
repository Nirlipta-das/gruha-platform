/// <reference lib="webworker" />

// GRUHA Service Worker - Offline-First PWA Support
// Per PRD §12: Platform must work in low/no internet scenarios

const CACHE_VERSION = 'gruha-v1';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const DYNAMIC_CACHE = `${CACHE_VERSION}-dynamic`;
const OFFLINE_QUEUE = `${CACHE_VERSION}-queue`;

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/msme',
  '/vendor',
  '/authority',
  '/public',
  '/msme/warehouse',
  '/msme/transport',
  '/msme/wallet',
  '/manifest.json',
  '/offline.html',
];

// API endpoints to cache with network-first strategy
const API_CACHE_ROUTES = [
  '/api/wallet/',
  '/api/bookings/',
  '/api/user/',
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[GRUHA SW] Installing service worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[GRUHA SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[GRUHA SW] Activating service worker...');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('gruha-') && name !== STATIC_CACHE && name !== DYNAMIC_CACHE)
          .map((name) => caches.delete(name))
      );
    })
  );
  
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch event - handle requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests for caching (but we'll queue POST requests if offline)
  if (request.method !== 'GET') {
    // Handle offline POST/PUT requests by queuing them
    if (!navigator.onLine) {
      event.respondWith(handleOfflineMutation(request));
      return;
    }
    return;
  }
  
  // API requests - Network first, fallback to cache
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request, DYNAMIC_CACHE));
    return;
  }
  
  // Static assets - Cache first, fallback to network
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request, STATIC_CACHE));
    return;
  }
  
  // Navigation requests - Cache first with network fallback
  if (request.mode === 'navigate') {
    event.respondWith(
      cacheFirst(request, STATIC_CACHE).catch(() => {
        return caches.match('/offline.html');
      })
    );
    return;
  }
  
  // Default - Network first
  event.respondWith(networkFirst(request, DYNAMIC_CACHE));
});

// Cache-first strategy
async function cacheFirst(request, cacheName) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('[GRUHA SW] Network request failed:', error);
    throw error;
  }
}

// Network-first strategy
async function networkFirst(request, cacheName) {
  try {
    const networkResponse = await fetch(request);
    const cache = await caches.open(cacheName);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch (error) {
    console.log('[GRUHA SW] Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    throw error;
  }
}

// Handle offline mutations (POST, PUT, DELETE)
async function handleOfflineMutation(request) {
  console.log('[GRUHA SW] Queuing offline mutation:', request.url);
  
  // Store the request in IndexedDB for later sync
  const requestData = {
    url: request.url,
    method: request.method,
    headers: Object.fromEntries(request.headers.entries()),
    body: await request.text(),
    timestamp: Date.now(),
    id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  
  // Store in IndexedDB
  await storeOfflineRequest(requestData);
  
  // Return a mock success response for the user
  return new Response(JSON.stringify({
    success: true,
    offline: true,
    message: 'Request queued for sync when online',
    offlineId: requestData.id,
  }), {
    status: 202,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Store offline request in IndexedDB
async function storeOfflineRequest(requestData) {
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('gruha-offline', 1);
    
    dbRequest.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('requests')) {
        db.createObjectStore('requests', { keyPath: 'id' });
      }
    };
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('requests', 'readwrite');
      const store = tx.objectStore('requests');
      store.put(requestData);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    };
    
    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

// Sync event - process queued requests
self.addEventListener('sync', (event) => {
  if (event.tag === 'gruha-sync') {
    event.waitUntil(processOfflineQueue());
  }
});

// Process offline queue when back online
async function processOfflineQueue() {
  console.log('[GRUHA SW] Processing offline queue...');
  
  return new Promise((resolve, reject) => {
    const dbRequest = indexedDB.open('gruha-offline', 1);
    
    dbRequest.onsuccess = async (event) => {
      const db = event.target.result;
      const tx = db.transaction('requests', 'readwrite');
      const store = tx.objectStore('requests');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = async () => {
        const requests = getAllRequest.result;
        console.log(`[GRUHA SW] Found ${requests.length} queued requests`);
        
        for (const reqData of requests) {
          try {
            const response = await fetch(reqData.url, {
              method: reqData.method,
              headers: reqData.headers,
              body: reqData.body,
            });
            
            if (response.ok) {
              // Remove from queue
              store.delete(reqData.id);
              console.log(`[GRUHA SW] Synced request: ${reqData.id}`);
              
              // Notify the client
              const clients = await self.clients.matchAll();
              clients.forEach(client => {
                client.postMessage({
                  type: 'OFFLINE_SYNC_COMPLETE',
                  requestId: reqData.id,
                });
              });
            }
          } catch (error) {
            console.log(`[GRUHA SW] Failed to sync: ${reqData.id}`, error);
          }
        }
        
        resolve();
      };
    };
    
    dbRequest.onerror = () => reject(dbRequest.error);
  });
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[GRUHA SW] Push notification received');
  
  const data = event.data?.json() || {
    title: 'GRUHA Alert',
    body: 'You have a new notification',
    icon: '/icons/icon-192x192.png',
  };
  
  const options = {
    body: data.body,
    icon: data.icon || '/icons/icon-192x192.png',
    badge: '/icons/badge.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'gruha-notification',
    requireInteraction: data.urgent || false,
    data: {
      url: data.url || '/',
    },
    actions: data.actions || [],
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const url = event.notification.data?.url || '/';
  
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clients) => {
      // Check if there's already a window open
      for (const client of clients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      // Open new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(url);
      }
    })
  );
});

// Helper function to check if URL is a static asset
function isStaticAsset(pathname) {
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.woff', '.woff2'];
  return staticExtensions.some(ext => pathname.endsWith(ext));
}

// Message handler for client communication
self.addEventListener('message', (event) => {
  if (event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data.type === 'GET_OFFLINE_QUEUE') {
    // Return the current offline queue
    getOfflineQueue().then(queue => {
      event.ports[0].postMessage(queue);
    });
  }
});

// Get offline queue from IndexedDB
async function getOfflineQueue() {
  return new Promise((resolve) => {
    const dbRequest = indexedDB.open('gruha-offline', 1);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const tx = db.transaction('requests', 'readonly');
      const store = tx.objectStore('requests');
      const getAllRequest = store.getAll();
      
      getAllRequest.onsuccess = () => {
        resolve(getAllRequest.result);
      };
      
      getAllRequest.onerror = () => resolve([]);
    };
    
    dbRequest.onerror = () => resolve([]);
  });
}

console.log('[GRUHA SW] Service worker loaded');
