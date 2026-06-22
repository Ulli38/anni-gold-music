const CACHE_NAME = "anni-gold-music-v6";

const APP_DATEIEN = [
  "./",
  "./index.html",
  "./community.html",
  "./login.html",
  "./register.html",
  "./reset.html",
  "./new-password.html",
  "./upload.html",
  "./admin.html",
  "./live.html",
  "./agb.html",
  "./datenschutz.html",
  "./impressum.html",
  "./style.css",
  "./auth.js",
  "./app.js",
  "./community.js",
  "./pwa.js",
  "./manifest.json",
  "./assets/assets/anni-logo.png",
  "./assets/assets/music-ornament.png"
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function (cache) {
        return cache.addAll(APP_DATEIEN);
      })
      .then(function () {
        return self.skipWaiting();
      })
  );
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (cacheNamen) {
        return Promise.all(
          cacheNamen
            .filter(function (cacheName) {
              return cacheName !== CACHE_NAME;
            })
            .map(function (cacheName) {
              return caches.delete(cacheName);
            })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});

self.addEventListener("fetch", function (event) {
  const request = event.request;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(request)
      .then(function (networkResponse) {
        if (
          networkResponse &&
          networkResponse.status === 200 &&
          networkResponse.type === "basic"
        ) {
          const kopie = networkResponse.clone();

          caches.open(CACHE_NAME)
            .then(function (cache) {
              cache.put(request, kopie);
            });
        }

        return networkResponse;
      })
      .catch(function () {
        return caches.match(request)
          .then(function (cachedResponse) {
            if (cachedResponse) {
              return cachedResponse;
            }

            if (request.mode === "navigate") {
              return caches.match("./index.html");
            }

            return Response.error();
          });
      })
  );
});