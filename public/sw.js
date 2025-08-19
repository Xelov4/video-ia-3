// Service Worker for Video-IA.net
// Provides offline capabilities and caching for the application

const CACHE_NAME = 'video-ia-net-v1';
const OFFLINE_URL = '/offline.html';

// Assets to cache immediately on installation
const PRECACHE_ASSETS = [
  '/',
  '/offline.html',
  '/favicon.ico',
  '/manifest.json',
  '/apple-touch-icon.png',
  '/images/placeholders/ai-placeholder.jpg',
];

// Install event - precache critical resources
self.addEventListener('install', event => {
  console.log('[ServiceWorker] Install');

  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      console.log('[ServiceWorker] Caching app shell');
      await cache.addAll(PRECACHE_ASSETS);
      self.skipWaiting();
    })()
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[ServiceWorker] Activate');

  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      const oldCaches = cacheKeys.filter(key => key !== CACHE_NAME);
      await Promise.all(oldCaches.map(key => caches.delete(key)));
      self.clients.claim();
    })()
  );
});

// Fetch event - serve from cache if available, otherwise fetch from network
self.addEventListener('fetch', event => {
  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) {
    return;
  }

  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE_NAME);

      try {
        // Try the network first
        const networkResponse = await fetch(event.request);

        // Cache successful responses
        if (networkResponse && networkResponse.ok) {
          cache.put(event.request, networkResponse.clone());
        }

        return networkResponse;
      } catch (error) {
        console.log(
          '[ServiceWorker] Fetch failed; returning offline page instead.',
          error
        );

        // If network fails, try to serve from cache
        const cachedResponse = await cache.match(event.request);
        if (cachedResponse) return cachedResponse;

        // If cache fails, show offline page
        return await cache.match(OFFLINE_URL);
      }
    })()
  );
});
