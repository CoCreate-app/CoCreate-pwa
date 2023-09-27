import socket from "@cocreate/socket-client"

// const cacheName = "dynamic-v2"
const cacheBtn = document.getElementById('cacheBtn');

function putFile(cacheName, data) {
    if (!data.name || !data.pathname || !data.src || !data['content-type'])
        return;

    caches.open(cacheName).then((cache) => {
        cache.keys().then((keys) => {
            let urls = new Map()
            for (const key of keys) {
                const url = new URL(key.url);
                if (url.pathname === data.pathname) {
                    if (!data.host || data.host.includes('*') || data.host.some(host => url.origin.includes(host)))
                        urls.set(key.url, true)
                }
            }

            if (!urls.size) return
            // urls.set(new URL(window.location.origin + data.pathname).toString(), true)

            for (let fileUrl of urls.keys()) {
                // Create a Response object with the new file data
                const fileResponse = new Response(data.src, {
                    headers: {
                        'Content-Type': data['content-type'],
                    }
                });

                // Update the cache with the new version (or add it if not in the cache)
                cache.put(fileUrl, fileResponse).then(() => {
                    console.log(`Cache updated: ${fileUrl}`);
                }).catch(error => {
                    console.error(`Cache update error: ${error}`);
                });
            }

        });
    });
}

function deleteCache(cacheName) {
    if ('serviceWorker' in navigator) {
        return caches.delete(cacheName);
    }
}

function deleteFile(cacheName, fileName) {
    if ('serviceWorker' in navigator) {
        caches.open(cacheName).then(function (cache) {
            cache.delete(fileName).then(function (response) {
                return response
                // console.log(cacheName, fileName, response)
            });
        })
    }
}

if (cacheBtn) {
    cacheBtn.addEventListener('click', function () {
        deleteFile('dynamic-v2', '/CoCreate-components/CoCreate-pwa/src/index.js');
    });
}

function fileChange(data) {
    if (data.status === 'received' && data.clientId === socket.clientId)
        return
    if (!data.array === 'files' || !data.object)
        return

    for (let i = 0; i < data.object.length; i++)
        putFile('dynamic-v2', data.object[i])
}

if ('serviceWorker' in navigator) {
    socket.listen('create.object', (data) => fileChange(data));
    socket.listen('read.object', (data) => fileChange(data));
    socket.listen('update.object', (data) => fileChange(data));
    socket.listen('delete.object', (data) => fileChange(data));
}

navigator.serviceWorker.addEventListener("message", (event) => {
    if (event.data.action === 'checkCache') {
        for (let file of Object.keys(event.data.returnedFromCache)) {
            const url = new URL(file);
            const pathname = url.pathname;
            const origin = url.origin;

            let { organization, modifiedDate } = event.data.returnedFromCache[file];
            if (organization && modifiedDate) {
                socket.send({
                    method: 'read.object',
                    array: 'files',
                    $filter: {
                        query: [
                            { key: 'pathname', operator: '$eq', value: pathname },
                            { key: 'modified.on', operator: '$gt', value: modifiedDate }
                        ]
                    }
                }).then((data) => {
                    if (data.object && data.object[0]) {
                        fileChange(data)
                        console.log('Send to cache', pathname, modifiedDate)
                    }
                })
            } else {
                console.log('Send to fetch', { pathname, organization, modifiedDate })
                // fetch(file)
                //     .then((response) => {
                //         // Handle the response as needed
                //     })
                //     .catch((error) => {
                //         // Handle fetch errors
                //         console.error('Fetch error:', error);
                //     });

            }
        }
    }
});

window.addEventListener('load', function () {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then(function (registration) {
            if (registration.active) {
                // Send a message to the service worker to execute a function.
                registration.active.postMessage({ action: 'checkCache' });
            }
        });
    }
});

export { putFile, deleteFile, deleteCache }