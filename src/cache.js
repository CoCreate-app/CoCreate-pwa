const cacheBtn = document.getElementById('cacheBtn');

function deleteCache(cache) {
    if ('serviceWorker' in navigator) {
        return caches.delete(key);
        
        // caches.keys().then(function(cacheNames) {
        //     cacheNames.forEach(function(cacheName) {
        //         if (cacheName == cache)
        //             caches.delete(cacheName);
        //     });
        // });
    }
}

// function cleanCache(cacheName, numeroItems) {
//     caches.open(cacheName).then((cache) => {
//         return cache.keys().then((keys) => {
//             if (keys.length > numeroItems) {
//                 cache.delete(keys[0]).then(cleanCache(cacheName, numeroItems));
//             }
//         });
//     });
// }

function deleteFile(cacheName, fileName) {
    if ('serviceWorker' in navigator) {
        caches.open(cacheName).then(function(cache) {
            cache.delete(fileName).then(function(response) {
                return response
                // console.log(cacheName, fileName, response)
            });
        })
    }
}


if (cacheBtn) {
    cacheBtn.addEventListener('click', function() {
        deleteFile('dynamic-v2', '/CoCreate-components/CoCreate-pwa/src/index.js');
    });
}

export {deleteCache, deleteFile}