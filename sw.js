/* Spēļu kaste — service worker
 * Versiju maina TIKAI šeit (VERSION). Manifestā un HTML nekādu ?v= nav.
 * Stratēģija:
 *  - install: precache visus resursus; netiek aktivizēts pats (gaida lietotāja "Atjaunināt")
 *  - fetch (same-origin GET): stale-while-revalidate, atslēga = bez query string
 *  - navigācija bez tīkla: krīt atpakaļ uz kešoto lapu vai index.html
 */
const VERSION = '7.0.3';
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
      // cache: 'reload' — lai precache nekad nepaņem vecu versiju no HTTP keša
      Promise.all(ASSETS.map((u) => cache.add(new Request(u, { cache: 'reload' }))))
    )
  );
  // skipWaiting NAV: lapa pati pasaka, kad lietotājs nospiež "Atjaunināt"
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
  // ./koka-bloki.html?action=new  ->  ./koka-bloki.html
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

    const network = fetch(req)
      .then((resp) => {
        if (resp && resp.status === 200 && resp.type === 'basic') cache.put(key, resp.clone());
        return resp;
      })
      .catch(() => null);

    if (cached) {
      event.waitUntil(network); // atjaunina kešu fonā
      return cached;
    }
    const resp = await network;
    if (resp) return resp;
    if (req.mode === 'navigate') return (await cache.match('./index.html')) || Response.error();
    return Response.error();
  })());
});
