const CACHE_NAME = 'fudbal-radar-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png'
];

// Instalacija Service Worker-a i keširanje osnovnih fajlova
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
});

// Aktivacija i čišćenje starog keša
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
});

// Presretanje zahteva (mrežni zahtevi idu uživo, lokalni fajlovi iz keša)
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);

  // Ako zahtev ide ka API-ju (v3.football ili api.the-odds-api), uvek guraj direktno na mrežu bez keširanja
  if (url.hostname.includes('api-sports.io') || url.hostname.includes('the-odds-api.com')) {
    e.respondWith(fetch(e.request));
  } else {
    // Za standardne fajlove (HTML, CSS, slike) koristi keš, uz prebacivanje na mrežu ako zatreba
    e.respondWith(
      caches.match(e.request).then((cachedResponse) => {
        return cachedResponse || fetch(e.request);
      })
    );
  }
});
