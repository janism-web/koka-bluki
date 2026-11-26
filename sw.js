/* Spēļu kaste — service worker (v8.0.1)
 * Stratēģija:
 *  - install: precache visus resursus; netiek aktivizēts pats (gaida lietotāja "Atjaunināt")
 *  - fetch (same-origin GET): stingrs Cache-First, lai nesajauktu dažādu versiju failus
 *  - navigācija bez tīkla: krīt atpakaļ uz kešoto lapu vai index.html
 */
const VERSION = '8.0.1';
const CACHE_NAME = 'spelu-kaste-' + VERSION;

const ASSETS = [
  './',
  './index.html',
  './spele15.html',
  './koka-bloki.html',
  './manifest.json',
  './shared.css',
  './shared.js',
  './hub.css',
  './spele15.css',
  './spele15.js',
  './koka-bloki.css',
  './koka-bloki.js',
  './fonts/nunito-latin-wght-normal.woff2',
  './fonts/nunito-latin-ext-wght-normal.woff2',
  './icon.svg',
  './icon-maskable.svg',
  './icon-monochrome.svg',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './icon-mono-192.png',
  './icon-mono-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(ASSETS.map((u) => cache.add(new Request(u, { cache: 'reload' }))))
    )
  );
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('spelu-kaste-') && k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function cacheKey(url) {
  return new Request(url.origin + url.pathname);
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const key = cacheKey(url);
    const cached = await cache.match(key);
    if (cached) return cached;

    try {
      const resp = await fetch(req);
      if (resp && resp.status === 200 && resp.type === 'basic') {
        cache.put(key, resp.clone());
      }
      return resp;
    } catch {
      if (req.mode === 'navigate') {
        return (await cache.match(new URL('./index.html', self.location).href)) || Response.error();
      }
      return Response.error();
    }
  })());
});
