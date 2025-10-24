self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());

// A basic fetch handler to satisfy PWA criteria, but doesn't do offline caching.
self.addEventListener('fetch', (event) => {
  // Pass-through fetch
  event.respondWith(fetch(event.request));
});
