const staticCacheName = 'mws-final-v1';
const RUNTIME = 'runtime';

const urlsToCache = [
	'./',
	'index.html',
	'restaurant.html',
	'css/styles.css',
	'dist/main.js',
	'dist/restaurant_info.js',
	'favicon.ico',
	'images/img/icon-512.png',
	'images/img/icon-256.png',
	'images/img/icon.png',
	'images/1-small.webp',
	'images/2-small.webp',
	'images/3-small.webp',
	'images/4-small.webp',
	'images/5-small.webp',
	'images/6-small.webp',
	'images/7-small.webp',
	'images/8-small.webp',
	'images/9-small.webp',
	'images/10-small.webp',
	'images/1-medium.webp',
	'images/2-medium.webp',
	'images/3-medium.webp',
	'images/4-medium.webp',
	'images/5-medium.webp',
	'images/6-medium.webp',
	'images/7-medium.webp',
	'images/8-medium.webp',
	'images/9-medium.webp',
	'images/10-medium.webp'
];

self.addEventListener('install', event => {
	event.waitUntil(
		caches
			.open(staticCacheName)
			.then(cache => cache.addAll(urlsToCache))
			.then(self.skipWaiting())
	);
});

self.addEventListener('activate', event => {
	const currentCaches = [staticCacheName, RUNTIME];
	event.waitUntil(
		caches
			.keys()
			.then(cacheNames => {
				return cacheNames.filter(
					cacheName => !currentCaches.includes(cacheName)
				);
			})
			.then(cachesToDelete => {
				return Promise.all(
					cachesToDelete.map(cacheToDelete => {
						return caches.delete(cacheToDelete);
					})
				);
			})
			.then(() => self.clients.claim())
	);
});

self.addEventListener('fetch', event => {
	const storageUrl = event.request.url.split(/[?#]/)[0];

	if (storageUrl.startsWith(self.location.origin)) {
		event.respondWith(
			caches.match(storageUrl).then(cachedResponse => {
				if (cachedResponse) {
					return cachedResponse;
				}

				return caches.open(RUNTIME).then(cache => {
					return fetch(event.request).then(response => {
						return cache.put(storageUrl, response.clone()).then(() => {
							return response;
						});
					});
				});
			})
		);
	}
});
