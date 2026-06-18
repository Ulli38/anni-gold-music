const CACHE_NAME = "anni-gold-music-v1";

const urlsToCache = [
  "./",
  "./index.html",
  "./login.html",
  "./register.html",
  "./reset.html",
  "./upload.html",
  "./admin.html",
  "./live.html",
  "./style.css",
  "./auth.js",
  "./app.js",
  "./manifest.json"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});