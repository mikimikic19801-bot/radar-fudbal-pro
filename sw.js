const CACHE_NAME = 'radar-cache-v3';
const ASSETS_TO_CACHE = [
  'index.html',
  'manifest.json',
  'icon-192.png'
];

// Instaliranje i keširanje strukture
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Aktivacija i čišćenje starih keševa
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Presretanje zahteva (API zahtevi idu uživo, lokalni fajlovi iz keša)
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  if (url.hostname.includes('api-sports.io') || url.hostname.includes('the-odds-api.com')) {
    event.respondWith(fetch(event.request));
  } else {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request);
      })
    );
  }
});

// Upravljanje klikom na sistemsku notifikaciju
self.addEventListener('notificationclick', (event) => {
  event.notification.close(); // Zatvori notifikaciju

  // Otvori aplikaciju kada korisnik klikne na nju
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus();
      }
      return clients.openWindow('./index.html');
    })
  );
});
