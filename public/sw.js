const VERSION = '1.1.17';
const CACHE_NAME = `finan-${VERSION}`;
/* const imagenes = []; */
let appfiles = [];

/* for (let i = 1; i <= 456; i++) {
  imagenes.push(`./img/tarjeta/${i}.jpg`);
} */

appfiles = [
  `./index.html`,
  `./manifest.json`,
  `./sw.js`,
  `./assets/index-a929effa.js`,
  `./assets/index-a929effa.js`,
  `./icon/icon-128x128.png`,
  `./icon/icon-144x144.png`,
  `./icon/icon-152x152.png`,
  `./icon/icon-192x192.png`,
  `./icon/icon-384x384.png`,
  `./icon/icon-48x48.png`,
  `./icon/icon-512x512.png`,
  `./icon/icon-72x72.png`,
  `./icon/icon-96x96.png`,
];

let contentToCache = appfiles; //.concat(imagenes);
console.log(contentToCache);

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache
        .addAll(contentToCache)
        .then(() => {
          console.log('Cache installation successful');
          return self.skipWaiting();
        })
        .catch((err) => {
          console.error('Cache installation failed:', err);
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
          return caches.match('/offline.html');
        });
    })
  );
});

//una vez que se instala el SW, se activa y busca los recursos para hacer que funcione sin conexión
self.addEventListener('activate', (e) => {
  const cacheWhitelist = [CACHE_NAME];

  e.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            //Eliminamos lo que ya no se necesita en cache
            if (cacheWhitelist.indexOf(cacheName) === -1) {
              return caches.delete(cacheName);
            }
          })
        );
      })
      // Le indica al SW activar el cache actual
      .then(() => self.clients.claim())
  );
});

//cuando el navegador recupera una url
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
          return caches.match('/offline.html');
        });
    })
  );
});
