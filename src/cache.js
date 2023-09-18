import socket from "@cocreate/socket-client"

// const cacheName = "dynamic-v2"

const cacheBtn = document.getElementById('cacheBtn');

function putFile(cacheName, data) {
    if (!data.name || !data.path || !data.src || !data['content-type'])
        return
    // Open the cache and update it with the new file data
    caches.open(cacheName).then((cache) => {
        // Create a Response object with the file data
        const fileResponse = new Response(data.src, {
            headers: {
                'Content-Type': data['content-type'],
            },
        });

        // Update the cache with the new version (or add it if not in the cache)
        const fileUrl = window.location.origin + data.pathname;
        cache.put(fileUrl, fileResponse).then(() => {
            console.log(`Updated cache for ${fileUrl}`);
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

socket.listen('create.object', (data) => fileChange(data));
socket.listen('read.object', (data) => fileChange(data));
socket.listen('update.object', (data) => fileChange(data));
socket.listen('delete.object', (data) => fileChange(data));

export { putFile, deleteFile, deleteCache }