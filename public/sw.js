/**
 * نظام قيد (QAYD POS) - Service Worker الآمن للإنتاج والتطوير
 * Safe Cache-First / Network-Fallback without caching dynamic dev scripts or Vite chunks
 */

const CACHE_NAME = 'qayd-pos-v3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // Skip non-GET, API calls, and vite/hmr hot modules
  if (
    request.method !== 'GET' ||
    request.url.includes('/api/') ||
    request.url.includes('/@vite/') ||
    request.url.includes('/@fs/') ||
    request.url.includes('node_modules')
  ) {
    return;
  }

  // Network-first strategy for index.html & navigation so code updates load immediately
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => {
        return caches.match('/index.html') || caches.match('/');
      })
    );
    return;
  }

  // For static assets (images, fonts, css, js)
  event.respondWith(
    fetch(request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});
