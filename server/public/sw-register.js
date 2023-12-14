// This is going to run in the main thread of browser
// Needs to register a service worker on its own thread, meaning it can talk to the DOM, but it can't see it
// Can fail if SW aren't supported, so should be tested

// camelCase is required
// navigator is browser
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('serviceworker.js');
}
