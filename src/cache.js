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
                    if (data.host && data.host.includes('*') || data.host.some(host => url.origin.includes(host)))
                        urls.set(key.url, true)
                }
            }

            if (!urls.size)
                cacheKeys.set(new URL(window.location.origin + data.pathname).toString(), true)

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

export { putFile, deleteFile, deleteCache }