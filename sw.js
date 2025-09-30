const CACHE = 'plu-cache-v1';
const ASSETS = [
  '.', 'index.html', 'manifest.json',
  'icons/icon-180.png', 'icons/icon-192.png', 'icons/icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  );
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r =>
      r || fetch(e.request).then(resp => {
        const copy = resp.clone();
        caches.open(CACHE).then(c => c.put(e.request, copy));
        return resp;
      }).catch(() => caches.match('./'))
    )
  );
});
