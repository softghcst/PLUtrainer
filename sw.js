// sw.js (safe)
const CACHE = 'plu-cache-v5';
const ASSETS = [
  './', './index.html', 'manifest.json',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const req = e.request;

  // 1) HTML navigations → always return index.html (SPA fallback)
  if (req.mode === 'navigate') {
    e.respondWith(
      caches.match('./index.html').then(r => r || fetch('./index.html'))
    );
    return;
  }

  // 2) Everything else → cache-first, then network (but DO NOT fall back to HTML)
  e.respondWith(
    caches.match(req).then(r =>
      r || fetch(req).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return resp;
      })
    )
  );
});