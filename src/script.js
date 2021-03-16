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

// "use strict";

// const fs = require("fs");
// const minimist = require("minimist");
// const glob = require("glob");

// const readArgv = () => {
//   const argv = minimist(process.argv.slice(2));
//   return {
//     source: argv.source || "./dist/",
//     dist: argv.dist || "./dist/service-worker.js",
//     templatePath: argv.template || "./sw-template.js",
//     cacheStore: argv.cache || "offline-files",
//     navigationFallback: argv.navigationFallback || "index.html",
//   };
// };

// const removeFile = (path) => {
//   if (fs.existsSync(path)) {
//     fs.unlinkSync(path);
//   }
// };

// const isDirectory = (path) => {
//   return fs.lstatSync(path).isDirectory();
// };

// const getFiles = (source) => {
//   return glob
//     .sync("**/*", { cwd: source })
//     .filter((path) => !isDirectory(source + path));
// };

// const arrayToString = (array) => {
//   const strings = array.map((item) => `'${item}'`).join(", ");
//   return `[${strings}]`;
// };

// const generateSWFile = () => {
//   const argv = readArgv();
//   removeFile(argv.dist);

//   const template = fs.readFileSync(argv.templatePath, "utf-8");
//   const internalFiles = getFiles(argv.source);
//   const externalFiles = [
//     // here you can add some external files that you want to have cached
//   ];
//   const files = arrayToString([...internalFiles, ...externalFiles]);
//   const content = [
//     `const $CACHE_STORE = '${argv.cacheStore}';`,
//     `const $NAVIGATION_FALLBACK = '${argv.navigationFallback}';\n`,
//     `const $FILES = ${files};\n`,
//     template,
//   ].join("\n");
//   fs.writeFileSync(argv.dist, content, "utf-8");
// };

// generateSWFile();
