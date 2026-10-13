const CACHE_NAME = 'terapeek-v2';
const urlsToCache = [
  '/',
  '/index.html',
  '/script.js',
  '/style.css',
  '/favicon.svg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
    ))
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  // Let Range requests and video streams bypass Service Worker respondWith()
  // This allows the browser / WebView native sparse disk cache to handle partial byte-ranges
  if (event.request.headers.has('range') || event.request.url.includes('/api/stream') || event.request.url.includes('/api/download')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});
