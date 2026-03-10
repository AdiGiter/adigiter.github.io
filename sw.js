/**
 * SAHAYAK-DRISHTI — Service Worker (PWA)
 * sw.js (Static Deploy Version)
 *
 * CHANGE: Paths updated from /css/style.css → style.css etc.
 * to match flat file structure of GitHub Pages deployment.
 * API cache strategy removed (no backend in static deploy).
 */

const CACHE_NAME = 'sahayak-v2.0';

const SHELL_FILES = [
  'index.html',
  'style.css',
  'app.js',
  'locations.json',
  'manifest.json',
];

// ── INSTALL ──────────────────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('[SW] Caching app shell');
      return cache.addAll(SHELL_FILES);
    })
  );
  self.skipWaiting();
});

// ── ACTIVATE ─────────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k !== CACHE_NAME)
          .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH — cache first for all static assets ─────────────
self.addEventListener('fetch', event => {
  event.respondWith(cacheFirst(event.request));
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (err) {
    return new Response(
      '<!DOCTYPE html><html><body style="background:#0a0a0a;color:#fff;text-align:center;padding:60px;font-family:sans-serif"><h2 style="color:#FFD600">Offline</h2><p>Please connect to the internet and scan the QR code again.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}
