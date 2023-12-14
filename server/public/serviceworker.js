// Serviceworkers have a life cycle as dictated to the browser:
// install or "register" -> activate -> turn off

// This file is not imported into index.js, it is run by the register in a seperate thread

console.log('Hello from the service worker');

// an array of urls and assets, a list of things to go get
const assets = [
  '/media/favicon.ico',
  '/styles/style.css',
  '/scripts/client.js',
];

// Need to cache these things and the index.html, not just the file names
// To cache index.html we cache "/"
// You can start the assests array with "/", this push is for note taking
assets.push('/');

assets.push('https://cdn.jsdelivr.net/npm/jquery@3.6.4/dist/jquery.min.js');
assets.push(
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js'
);

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open('assets').then((cache) => {
      cache.addAll(assets);
    })
  );
});

// Now cached, so have to serve it all up if offline

// Types of events to be concerned about with PWAs: install, fetch, push and sync

// Example of intercepting requests and checking before passing it on
// self.addEventListener('fetch', (event) => {
//   if (event.request.url === 'http://localhost:5000/offline') {
//     const response = new Response(
//       `You're offline! You are at URL" ${event.request.url}`
//     );
//     event.respondWith(response);
//   } else {
//     return fetch(event.request);
//   }
// });

// "Chache first" axample
// Check cache, if it exists use it, otherwise go get it
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.requst) //search cache for user request
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log("It's cached, return the cached copy!");
          console.log('cachedResponse: ', cachedResponse);
          return cachedResponse;
        } else {
          //if request not in cache, so go to network (server)
          console.log("it's not cached, pass request to network");
          return fetch(event.request);
        }
      })
  );
});

// "Network first" example
// Maintains the most up to date version of the user's experience chached
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches
      .match(event.request)
      .then((cachedResponse) => {
        // Even if response is in the cache, we fetch and update cache for future use
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            cache.open('assets').then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch((error) => console.log('Error fetching assets: ', error));
        // We use the currently cached version if there is no network response
        return cachedResponse || fetchPromise; //cached or network version
      })
      .catch((error) =>
        console.log('Error looking for things in cache: ', error)
      )
  );
});
