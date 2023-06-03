import {deleteCache, deleteFile} from './cache.js'
import localStorage from '@cocreate/local-storage'

const button = document.querySelector('[actions*="install"]');

/**
 * Warn the page must be served over HTTPS
 * The `beforeinstallprompt` event won't fire if the page is served over HTTP.
 * Installability requires a service worker with a fetch event handler, and
 * if the page isn't served over HTTPS, the service worker won't load.
 */
// if (window.location.protocol === 'http:') {
//     const requireHTTPS = document.getElementById('requireHTTPS');
//     const link = requireHTTPS.querySelector('a');
//     link.href = window.location.href.replace('http://', 'https://');
//     requireHTTPS.classList.remove('hidden');
// }

window.addEventListener('beforeinstallprompt', (event) => {
    // console.log('👍', 'beforeinstallprompt', event);
    // Stash the event so it can be triggered later.
    window.deferredPrompt = event;
    // Remove the 'hidden' class from the install button container
    if (button)
        button.removeAttribute('hidden');
});

if (button) {
    button.addEventListener('click', async() => {
        // console.log('👍', 'installBtn-clicked');
        const promptEvent = window.deferredPrompt;
        if (!promptEvent) {
            // The deferred prompt isn't available.
            return;
        }
        // Show the install prompt.
        promptEvent.prompt();
        // Log the result
        const result = await promptEvent.userChoice;
        console.log('👍', 'userChoice', result);
        // Reset the deferred prompt variable, since
        // prompt() can only be called once.
        window.deferredPrompt = null;
        // Hide the install button.
        button.addAttribute('hidden', '');
    });
}

window.addEventListener('appinstalled', (event) => {
    // console.log('👍', 'appinstalled', event);
    // Clear the deferredPrompt so it can be garbage collected
    window.deferredPrompt = null;
});

async function persistData() {
    if (navigator.storage && navigator.storage.persist) {
      const result = await navigator.storage.persist();
    //   console.log(`Data persisted: ${result}`);
    }
}

if ('serviceWorker' in navigator) {
    let workerPath
    if (window.CoCreateConfig && window.CoCreateConfig.serviceWorker)
        workerPath = window.CoCreateConfig.serviceWorker
    else
        workerPath =  localStorage.getItem("serviceWorker") || '/sw.js'

    localStorage.setItem("serviceWorker", workerPath);

    let isPwa = true
    if (workerPath) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            if (registrations.length === 0 || isPwa == true)
            window.addEventListener("load", function(event) {
                    navigator.serviceWorker.getRegistration(workerPath).then(registration => {
                        if (registration && registration.active) { 
                            console.log('Service Worker Active')
                        } else {
                            navigator.serviceWorker.register(workerPath)
                            .then(reg => {
                                reg.onupdatefound = () => {
                                    const installingWorker = reg.installing;
                                    installingWorker.onstatechange = () => {
                                        // console.log('Service Worker', installingWorker.state);
                                    }
                                }
                            })
                            .catch(err => console.log('SW ERROR', err)); 
                        }
                    });
            });
        });

    }
}


export default {deleteCache, deleteFile, persistData}