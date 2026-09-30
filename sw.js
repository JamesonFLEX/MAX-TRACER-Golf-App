const CACHE = 'maxtracer-brand-v15';
const SHELL = ['./', './index.html', './manifest.webmanifest', './max-trace-logo.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png'];
// Cache each file on its own so one missing file can't block install.
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE)
    .then(c => Promise.allSettled(SHELL.map(u => fetch(u, {cache: 'reload'}).then(res => { if (res.ok) return c.put(u, res); }))))
    .then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request; if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (r.mode === 'navigate') { e.respondWith(fetch(r.url, { cache: 'no-cache', credentials: 'same-origin' }).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); } return res; }).catch(() => caches.match('./index.html'))); return; }
  if (u.origin === location.origin) e.respondWith(caches.match(r).then(hit => hit || fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; })));
});
