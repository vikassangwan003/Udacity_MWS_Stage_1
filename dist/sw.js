(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
"use strict";

var appName = "restaurant-reviews";
var staticCacheName = appName + "-v1.0";
var contentImgsCache = appName + "-images";
var allCaches = [staticCacheName, contentImgsCache];
/** At Service Worker Install time, cache all static assets */

self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(staticCacheName).then(function (cache) {
    return cache.addAll(['/', // this caches index.html
    '/restaurant.html', '/css/styles.css', '/js/main.js', '/js/restaurant_info.js', 'manifest.json', 'data/restaurants.json', '/images/icon/restaurant-icon-192.png', '/images/icon/restaurant-icon-512.png']);
  }));
});
/** At Service Worker Activation, Delete previous caches, if any */

self.addEventListener('activate', function (event) {
  event.waitUntil(caches.keys().then(function (cacheNames) {
    return Promise.all(cacheNames.filter(function (cacheName) {
      return cacheName.startsWith(appName) && !allCaches.includes(cacheName);
    }).map(function (cacheName) {
      return caches.delete(cacheName);
    }));
  }));
});
/** Hijack fetch requests and respond accordingly */

self.addEventListener('fetch', function (event) {
  var requestUrl = new URL(event.request.url); // only highjack request made to our app (not mapbox maps or leaflet, for example)

  if (requestUrl.origin === location.origin) {
    // Since requests made to restaurant.html have search params (like ?id=1), the url can't be used as the
    // key to access the cache, so just respondWith restaurant.html if pathname startsWith '/restaurant.html'
    if (requestUrl.pathname.startsWith('/restaurant.html')) {
      event.respondWith(caches.match('/restaurant.html'));
      return; // Done handling request, so exit early.
    } // If the request pathname starts with /img, then we need to handle images.


    if (requestUrl.pathname.startsWith('/img')) {
      event.respondWith(serveImage(event.request));
      return; // Done handling request, so exit early.
    }
  } // Default behavior: respond with cached elements, if any, falling back to network.


  event.respondWith(caches.match(event.request).then(function (response) {
    return response || fetch(event.request);
  }));
});

function serveImage(request) {
  var imageStorageUrl = request.url; // Make a new URL with a stripped suffix and extension from the request url
  // i.e. /img/1-medium.jpg  will become  /img/1
  // we'll use this as the KEY for storing image into cache

  imageStorageUrl = imageStorageUrl.replace(/-small\.\w{3}|-medium\.\w{3}|-large\.\w{3}/i, '');
  return caches.open(contentImgsCache).then(function (cache) {
    return cache.match(imageStorageUrl).then(function (response) {
      // if image is in cache, return it, else fetch from network, cache a clone, then return network response
      return response || fetch(request).then(function (networkResponse) {
        cache.put(imageStorageUrl, networkResponse.clone());
        return networkResponse;
      });
    });
  });
}

},{}]},{},[1])

//# sourceMappingURL=sw.js.map
