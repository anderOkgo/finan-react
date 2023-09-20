const VERSION = '1.1.17';
const CACHE_NAME = `finan-${VERSION}`;
/* const imagenes = []; */
let appfiles = [];

/* for (let i = 1; i <= 456; i++) {
  imagenes.push(`./img/tarjeta/${i}.jpg`);
} */

appfiles = [
  `./inde.html`,
  `./manifest.json`,
  `./sw.js`,
  `./assets/index-a929effa.js`,
  `./assets/index-a929effa.js`,
  `./icon/android-icon-128x128.png`,
  `./icon/android-icon-144x144.png`,
  `./icon/android-icon-152x152.png`,
  `./icon/android-icon-192x192.png`,
  `./icon/android-icon-256x256.png`,
  `./icon/android-icon-32x32.png`,
  `./icon/android-icon-36x36.png`,
  `./icon/android-icon-384x384.png`,
  `./icon/android-icon-48x48.png`,
  `./icon/android-icon-512x512.png`,
  `./icon/android-icon-72x72.png`,
  `./icon/android-icon-96x96.png`,
];

let contentToCache = appfiles; //.concat(imagenes);

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(contentToCache).then(() => self.skipWaiting());
      })
      .catch((err) => console.log('Falló registro de cache', err))
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
  //Responder ya sea con el objeto en caché o continuar y buscar la url real
  e.respondWith(
    caches.match(e.request).then((res) => {
      if (res) {
        //recuperar del cache
        return res;
      }
      //recuperar de la petición a la url
      return fetch(e.request);
    })
  );
});
