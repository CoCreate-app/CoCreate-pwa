import indexeddb from '@cocreate/indexeddb'

const cacheName = "dynamic-v2";
let organization_id = ""
let storage = false

const queryString = self.location.search;
const queryParams = new URLSearchParams(queryString);
let cacheType = queryParams.get('cache');

function deleteCache(key) {
    return caches.delete(key);
}

self.addEventListener("install", (e) => {
    console.log('Service Worker Installing')
    self.skipWaiting();
});

self.addEventListener("activate", async (e) => {
    e.waitUntil(clients.claim());
});

self.addEventListener("fetch", (e) => {
    if (!(e.request.url.indexOf('http') === 0) || e.request.method === 'POST') return;

    if (!storage) {
        let file = 'query file content from indexeddb and set as File-Content'
        const modifiedRequest = new Request(e.request, {
            headers: new Headers({
                'File-Content': file.src,
                'Content-Type': file['content-type']
            })
        });
        e.request = modifiedRequest
    }

    e.respondWith(
        caches
            .match(e.request)
            .then((cacheResponse) => {
                if (!navigator.onLine && !!cacheResponse && cacheType !== 'false')
                    return cacheResponse;
                else {
                    fetch(e.request).then((networkResponse) => {
                        if (!organization_id)
                            organization_id = networkResponse.headers.get('organization')

                        if (cacheType && cacheType !== 'false') {
                            caches.open(cacheName).then((cache) => {
                                if (networkResponse.status !== 206 && networkResponse.status !== 502) {
                                    cache.put(e.request, networkResponse);
                                    if (cacheType === 'reload' || cacheType === 'prompt') {
                                        const networkModified = networkResponse.headers.get('last-modified');
                                        const cacheModified = cacheResponse.headers.get('last-modified');
                                        if (networkModified !== cacheModified) {
                                            self.clients.matchAll().then((clients) => {
                                                clients.forEach((client) => {
                                                    client.postMessage({ action: 'cacheType' }); // Send a custom message
                                                    console.log(`file ${cacheType} has been triggered`)
                                                });
                                            });
                                        }
                                    }
                                }
                            }).catch(() => {

                            });
                            if (!cacheResponse || cacheType === 'false' || cacheType === 'offline')
                                return networkResponse.clone();
                        }
                    }).catch(() => {
                        return caches.match('./offline.html');
                    })
                    if (!!cacheResponse && cacheType !== 'false' && cacheType !== 'offline')
                        return cacheResponse;
                }
            })
            .catch(function () {
                console.log('Fetch failed retuned offline page! ')
                return caches.match('./offline.html');
            })
    );
});

self.addEventListener('message', function (event) {
    if (event.data === 'getOrganization')
        event.source.postMessage(organization_id);
});

// self.addEventListener('backgroundfetchsuccess', (event) => {
//     const bgFetch = event.registration;

//     event.waitUntil(async function() {
//       // Create/open a cache.
//       const cache = await caches.open(cacheName);
//       // Get all the records.
//       const records = await bgFetch.matchAll();
//       // Copy each request/response across.
//       const promises = records.map(async (record) => {
//         const response = await record.responseReady;
//         console.log('putting ')
//         await cache.put(record.request, response);
//       });

//       // Wait for the copying to complete
//       await Promise.all(promises);

//       // Update the progress notification.
//     //   event.updateUI({ title: 'Episode 5 ready to listen!' });
//     }());
//   });