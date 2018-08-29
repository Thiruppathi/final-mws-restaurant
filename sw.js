let staticCacheName = 'restaurants-static-v3';
let urlsToCache = [
	'./',
	'index.html',
	'restaurant.html',
	'css/styles.css',
	'dist/main.js',
	'dist/restaurant.js',
	'images/img/favicon.ico',
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
	event.waitUntil(
		caches.keys().then(cacheNames =>
			Promise.all(
				cacheNames
					.filter(
						cacheName =>
							cacheName.startsWith('restaurants-') &&
							cacheName !== staticCacheName
					)
					.map(cacheName => {
						console.log(
							`⚙️ ServiceWorker Deleting the cached files from ${cacheName} `
						);
						return caches.delete(cacheName);
					})
			)
		)
	);
});

self.addEventListener('fetch', event => {
	event.respondWith(
		caches.match(event.request).then(response => {
			return response || fetch(event.request);
		})
	);
});
