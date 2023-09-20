const VERSION = '1.1.18';
const CACHE_NAME = `finan-${VERSION}`;
const appfiles = [
  './icon/icon-48x48.png',
  './icon/icon-72x72.png',
  './icon/icon-96x96.png',
  './icon/icon-128x128.png',
  './icon/icon-144x144.png',
  './icon/icon-152x152.png',
  './icon/icon-192x192.png',
  './icon/icon-284x284.png',
  './icon/icon-512x512.png',
];
const offlinePage = './offline.html';

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
    caches.match(e.request).then((res) => {
      if (res) {
        // Return cached resource
        return res;
      }

      // Try to fetch the resource from the network
      return fetch(e.request)
        .then((response) => {
          // Clone the response to use it and store it in the cache
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(e.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If fetching from network fails, return a fallback response
          return caches.match(offlinePage);
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
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});
