// CareerAI Service Worker - Network Only in Local / Standalone Mode
// Ensures Vite HMR and file edits are NEVER blocked or cached stale
self.addEventListener('install', (event) => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (event) => {
  // Always pass through directly to network, NEVER cache during live dev
  event.respondWith(fetch(event.request))
})
