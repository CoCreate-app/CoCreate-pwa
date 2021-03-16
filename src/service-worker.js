console.log("service worker start");
var CacheName = "TestPWA_Cache";
var CacheContents = [
  "/",
  "/index.html",
  "/test1.html",
  "/test2.html",
  "/test3.html",
  "style.css",
  "/src/js/test1.js",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches
      .open(CacheName)
      .then(function (cache) {
        console.log("Service worker install sucess.");
        return cache.addAll(CacheContents).then(function () {
          self.skipWaiting();
          self.clients.claim();
        });
      })
      .catch(function (err) {
        console.log("Service worker install failed! " + err);
      })
  );
});

self.addEventListener("fetch", function (event) {
  event.respondWith(
    caches.match(event.request).then(function (response) {
      if (response) return response;
      return fetch(event.request);
    })
  );
});
