const CACHE_STATIC_NAME = "static-v1";
const CACHE_DYNAMIC_NAME = "dynamic-v2";
const CACHE_INMUTABLE_NAME = "inmutable-v1";
const CACHE_DYNAMIC_LIMIT = 50;

function limpiarCache(cacheName, numeroItems) {
    caches.open(cacheName).then((cache) => {
        return cache.keys().then((keys) => {
            if (keys.length > numeroItems) {
                cache.delete(keys[0]).then(limpiarCache(cacheName, numeroItems));
            }
        });
    });
}

function limpiarCacheViejo() {
    return caches.keys().then((keys) => {
        keys
            .filter((key) => key.includes("dynamic-v"))
            .forEach((key) => {
                if (key !== CACHE_DYNAMIC_NAME) {
                    caches.delete(key);
                }
            });
    });
}

self.addEventListener("install", (e) => {
    console.log('[ServiceWorker] Install');
    const cacheProm = caches.open(CACHE_STATIC_NAME).then((cache) => {
        return cache.addAll([
            "./",
            "./index.html",
            "./css/style.css",
            "./css/test1.css",
            "./css/test2.css",
            "./css/test3.css",
            "./js/app.js",
            "./js/test1.js",
            "./js/test2.js",
            "./js/test3.js",
            "./test1.html",
            "./test2.html",
            "./test3.html",
            "./offline.html",

        ]);
    });

    const cacheInmutable = caches
        .open(CACHE_INMUTABLE_NAME)
        .then((cache) =>
            cache.add(
                "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
            )
        );
    e.waitUntil(Promise.all([cacheProm, cacheInmutable]));

    self.skipWaiting();
});

self.addEventListener("activate", (e) => {
    e.waitUntil(limpiarCacheViejo());
});

self.addEventListener("fetch", (e) => {
    e.respondWith(
        caches.match(e.request).then((cachesObj) => {
            if (!!cachesObj) {
                return cachesObj;
            }
            return fetch(e.request).then((newResp) => {
                caches
                    .open(CACHE_DYNAMIC_NAME)
                    .then((cache) => {
                        cache.put(e.request, newResp);
                        limpiarCache(CACHE_DYNAMIC_NAME, 50);
                    })
                    .catch((err) => {
                        if (e.request.headers.get("accept").includes("text/html")) {
                            return fetch("./offline.html");
                        }
                    });
                return newResp.clone();
            });
        })
    );
});