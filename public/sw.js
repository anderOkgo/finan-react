// Define the version of the cache
const VERSION = '1.3.75';
// Create a unique cache name using the version
const CACHE_NAME = `finan-${VERSION}`;
// List of files to cache
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
  './icon/screen.png',
  './icon/screenWide.png',
];

// Event listener for when the service worker is installed
self.addEventListener('install', (e) => {
  // Wait until caching is complete
  e.waitUntil(
    // Open the cache and add all app files to it
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(appfiles).then(() => {
        // Log successful cache installation
        console.log('Cache installation successful');
        // Activate the service worker immediately
        return self.skipWaiting();
      });
    })
  );
});

// Event listener for fetch requests
self.addEventListener('fetch', (e) => {
  // Respond to fetch request
  e.respondWith(
    // Check if the requested resource is in the cache
    caches.match(e.request).then(async (res) => {
      // If resource is found in cache or if res is false
      if (res || false)
        if (res.type !== 'cors' || !res.url.includes(self.location.origin))
          // If the resource is not a CORS request or doesn't belong to the same origin, return the cached response
          return res;
      // If resource is not in cache or is not a CORS request or doesn't belong to the same origin, fetch it from the network
      return fetch(e.request)
        .then((response) => {
          // Clone the response
          const responseClone = response.clone();
          // Open the cache and store the response
          caches.open(CACHE_NAME).then((cache) => {
            // If the request is a GET request, starts with 'http' and belongs to the same origin, cache the response
            if (
              e.request.method === 'GET' &&
              e.request.url.startsWith('http') &&
              e.request.url !== 'https://info.animecream.com/'
            ) {
              cache.put(e.request, responseClone);
            }
          });
          // Return the original response
          return response;
        })
        .catch(() => {
          // If fetch fails, return a response from the cache
          return caches.match(e.request);
        });
    })
  );
});

// Event listener for when the service worker is activated
self.addEventListener('activate', (e) => {
  // List of caches to keep
  const cacheWhitelist = [CACHE_NAME];

  // Wait until cache cleanup is complete
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
