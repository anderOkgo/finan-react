const VERSION = '1.4.01';
const CACHE_NAME = `finan-${VERSION}`;
const appfiles = [
  './icon/ico-72x72.png',
  './icon/ico-96x96.png',
  './icon/ico-128x128.png',
  './icon/ico-144x144.png',
  './icon/ico-152x152.png',
  './icon/ico-192x192.png',
  './icon/ico-384x384.png',
  './icon/ico-512x512.png',
  './icon/screen.png',
  './icon/screenWide.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(appfiles).then(() => {
        console.log('Cache installation successful');
        return self.skipWaiting();
      });
    })
  );
});

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(async (res) => {
      if (res || false)
        if (res.type !== 'cors' || !res.url.includes(self.location.origin))
          // If the resource is not a CORS request or doesn't belong to the same origin, return the cached response
          return res;
      // If resource is not in cache or is not a CORS request or doesn't belong to the same origin, fetch it from the network
      return fetch(e.request)
        .then((response) => {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            if (e.request.method === 'GET' && e.request.url.startsWith('http') && e.request.mode !== 'cors') {
              cache.put(e.request, responseClone);
            }
          });
          return response;
        })
        .catch(() => {
          return caches.match(e.request);
        });
    })
  );
});

self.addEventListener('activate', (e) => {
  const cacheWhitelist = [CACHE_NAME];

  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete caches not in the whitelist
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      // Claim all clients to allow service worker to control them
      .then(() => self.clients.claim())
  );
});
