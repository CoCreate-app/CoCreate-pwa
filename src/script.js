const divInstall = document.getElementById("installContainer");
const butInstall = document.getElementById("butInstall");

/* Put code here */

/* Only register a service worker if it's supported */
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./service-worker.js")
    .then(function (registration) {
      registration.addEventListener("updatefound", function () {
        // If updatefound is fired, it means that there's
        // a new service worker being installed.
        var installingWorker = registration.installing;
        console.log(
          "A new service worker is being installed:",
          installingWorker
        );

        // You can listen for changes to the installing service worker's
        // state via installingWorker.onstatechange
      });
    })
    .catch(function (error) {
      console.log("Service worker registration failed:", error);
    });
} else {
  console.log("Service workers are not supported.");
}

/**
 * Warn the page must be served over HTTPS
 * The `beforeinstallprompt` event won't fire if the page is served over HTTP.
 * Installability requires a service worker with a fetch event handler, and
 * if the page isn't served over HTTPS, the service worker won't load.
 */
if (window.location.protocol === "http:") {
  const requireHTTPS = document.getElementById("requireHTTPS");
  const link = requireHTTPS.querySelector("a");
  link.href = window.location.href.replace("http://", "https://");
  requireHTTPS.classList.remove("hidden");
}
