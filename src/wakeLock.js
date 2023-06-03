// Request a screen wake lock
const wakeLock = await navigator.wakeLock.request();

// Listen for wake lock release
wakeLock.addEventListener('release', () => {
 console.log(`Screen Wake Lock released: ${wakeLock.released}`);
});
// Manually release the wake lock
wakeLock.release();