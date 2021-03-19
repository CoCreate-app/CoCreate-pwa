const CACHE_STATIC_NAME = "static-v1";
const CACHE_DYNAMIC_NAME = "dynamic-v2";
const CACHE_INMUTABLE_NAME = "inmutable-v1";
const CACHE_DYNAMIC_LIMIT = 50;
// const divInstall = document.getElementById("installContainer");
// const butInstall = document.getElementById("butInstall");

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
    // const cacheProm = caches.open(CACHE_STATIC_NAME).then((cache) => {
    //     return cache.addAll([
    //         "./",
    //         "./index.html",
    //         "https://cocreate-pwa.onlinebuzzers.com/css/style.css",
    //         "https://cocreate-pwa.onlinebuzzers.com/css/test1.css",
    //         "https://cocreate-pwa.onlinebuzzers.com/css/test2.css",
    //         "https://cocreate-pwa.onlinebuzzers.com/css/test3.css",
    //         "https://cocreate-pwa.onlinebuzzers.com/js/app.js",
    //         "https://cocreate-pwa.onlinebuzzers.com/js/test1.js",
    //         "https://cocreate-pwa.onlinebuzzers.com/js/test2.js",
    //         "https://cocreate-pwa.onlinebuzzers.com/js/test3.js",
    //         "https://cocreate-pwa.onlinebuzzers.com/test1.html",
    //         "https://cocreate-pwa.onlinebuzzers.com/test2.html",
    //         "https://cocreate-pwa.onlinebuzzers.com/test3.html",
    //         "https://cocreate-pwa.onlinebuzzers.com/offline.html",

    //     ]);
    // });

    const cacheInmutable = caches
        .open(CACHE_INMUTABLE_NAME)
        .then((cache) => {
            return cache.addAll([
                "https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css",
                "./offline.html"
            ])
        });
    e.waitUntil(Promise.all([ /*cacheProm,*/ cacheInmutable]));
});

self.addEventListener("activate", (e) => {
    e.waitUntil(limpiarCacheViejo());
});

self.addEventListener("fetch", (e) => {
    if (!(e.request.url.indexOf('http') === 0)) return;
    e.respondWith(
        caches
        .match(e.request)
        .then((cachesObj) => {
            if (!!cachesObj) {
                return cachesObj;
            }
            return fetch(e.request)
                .then((newResp) => {
                    caches
                        .open(CACHE_DYNAMIC_NAME)
                        .then((cache) => {
                            cache.put(e.request, newResp);
                            limpiarCache(CACHE_DYNAMIC_NAME, CACHE_DYNAMIC_LIMIT);
                        })
                        .catch(() => {});
                    return newResp.clone();
                })
                .catch(() => {
                    return caches.match('./offline.html');
                })
        })
        .catch(function() {
            console.log('Fetch failed; returning offline page instead.')
            return caches.match('./offline.html');
        })
    );
});