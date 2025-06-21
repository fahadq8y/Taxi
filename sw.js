const CACHE_NAME = 'taxi-management-v20250620';
const urlsToCache = [
  '/',
  '/index.html',
  '/admin-dashboard.html',
  '/accountant-dashboard.html',
  '/drivers.html',
  '/drivers-overview.html',
  '/cars.html',
  '/revenues.html',
  '/expenses.html',
  '/reports.html',
  '/notifications.html',
  '/driver-payments.html',
  '/balance-display.html',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png'
];

self.addEventListener('install', (event) => {
  console.log('Service Worker installing with cache version:', CACHE_NAME);
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching files:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
  );
  // Force the waiting service worker to become the active service worker
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  // Always fetch from network for HTML files to get latest updates
  if (event.request.destination === 'document') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response before caching
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseClone);
            });
          return response;
        })
        .catch(() => {
          // Fallback to cache if network fails
          return caches.match(event.request);
        })
    );
  } else {
    // For other resources, try cache first, then network
    event.respondWith(
      caches.match(event.request)
        .then((response) => {
          return response || fetch(event.request);
        })
    );
  }
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating with cache version:', CACHE_NAME);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Take control of all clients immediately
  return self.clients.claim();
});

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

