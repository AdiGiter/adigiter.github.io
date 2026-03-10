/**
 * SAHAYAK-DRISHTI — Service Worker (PWA)
 * sw.js
 *
 * Caches the core app shell so it works offline after the
 * first visit. Audio scripts are fetched live from the API;
 * if offline, a fallback message is shown.
 */

const CACHE_NAME   = 'sahayak-v1.0';
const API_CACHE    = 'sahayak-api-v1.0';

// Files to cache immediately on install (app shell)
const SHELL_FILES = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/app.js',
  '/manifest.json',
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
          .filter(k => k !== CACHE_NAME && k !== API_CACHE)
          .map(k => { console.log('[SW] Deleting old cache:', k); return caches.delete(k); })
      )
    )
  );
  self.clients.claim();
});

// ── FETCH ────────────────────────────────────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls — network first, fall back to cache
  if (url.pathname.startsWith('/api/location/') && !url.pathname.includes('/qr')) {
    event.respondWith(networkFirstWithCache(request));
    return;
  }

  // Static assets — cache first
  event.respondWith(cacheFirst(request));
});

// ── STRATEGIES ───────────────────────────────────────────

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
    // Return a minimal offline page
    return new Response(
      '<!DOCTYPE html><html><body style="background:#0a0a0a;color:#fff;text-align:center;padding:60px;font-family:sans-serif"><h2 style="color:#FFD600">Offline</h2><p>Please connect to the internet and scan the QR code again.</p></body></html>',
      { headers: { 'Content-Type': 'text/html' } }
    );
  }
}

async function networkFirstWithCache(request) {
  const cache = await caches.open(API_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      cache.put(request, fresh.clone());
    }
    return fresh;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;

    return new Response(
      JSON.stringify({ error: 'OFFLINE', message: 'No internet connection. Please reconnect and try again.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
