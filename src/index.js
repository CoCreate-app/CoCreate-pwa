/********************************************************************************
 * Copyright (C) 2023 CoCreate and Contributors.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 ********************************************************************************/

// Commercial Licensing Information:
// For commercial use of this software without the copyleft provisions of the AGPLv3,
// you must obtain a commercial license from CoCreate LLC.
// For details, visit <https://cocreate.app/licenses/> or contact us at sales@cocreate.app.

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
    button.addEventListener('click', async () => {
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
        workerPath = localStorage.getItem("serviceWorker") || '/service-worker.js'

    localStorage.setItem("serviceWorker", workerPath);

    let cache
    if (window.CoCreateConfig && window.CoCreateConfig.cache)
        cache = window.CoCreateConfig.cache
    else
        cache = localStorage.getItem("cache") || 'false'

    localStorage.setItem("cache", cache);
    workerPath += `?cache=${cache}`

    let isPwa = true
    if (workerPath) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            if (registrations.length === 0 || isPwa == true)
                window.addEventListener("load", function () {
                    navigator.serviceWorker.getRegistration(workerPath).then(registration => {
                        if (registration && registration.active && registration.active.scriptURL.includes(workerPath)) {
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

export default { persistData }