/* MAX TRACER Golf — © 2026 Jameson Stephenson. All rights reserved. */
const CACHE = 'maxtracer-b18';
const SHELL = [
  './', './index.html', './privacy.html', './manifest.webmanifest',
  './max-trace-logo.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png',
  './tile-shot.jpg', './tile-hand.jpg', './tile-club.jpg', './tile-score.jpg', './tile-target.jpg', './tile-uhd.jpg'
];

// Install: cache the app shell. A missing file never blocks the install.
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => Promise.allSettled(SHELL.map(u => c.add(new Request(u, { cache: 'reload' })))))
      .then(() => self.skipWaiting())
  );
});

// Activate: delete every older cache and take over open pages right away.
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  if (u.origin !== location.origin) return; // fonts etc. go straight to the network

  // The app page itself: network first, so new builds show up on the next open.
  const isPage = r.mode === 'navigate' || u.pathname.endsWith('/') || u.pathname.endsWith('/index.html');
  if (isPage) {
    e.respondWith(
      fetch(r, { cache: 'no-store' })
        .then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put('./index.html', copy)); } return res; })
        .catch(() => caches.match('./index.html').then(hit => hit || caches.match('./')))
    );
    return;
  }

  // Icons, images, manifest, privacy page: instant from cache, refreshed in the background.
  e.respondWith(
    caches.match(r).then(hit => {
      const net = fetch(r).then(res => { if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); } return res; }).catch(() => hit);
      return hit || net;
    })
  );
});
