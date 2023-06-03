// Set the badge
const unreadCount = 24;
navigator.setAppBadge(unreadCount).catch((error) => {
  //Do something with the error.
});

// Clear the badge
navigator.clearAppBadge().catch((error) => {
  // Do something with the error.
});
