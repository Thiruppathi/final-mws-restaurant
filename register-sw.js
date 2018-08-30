document.addEventListener('DOMContentLoaded', event => {
	if (!navigator.serviceWorker) return;
	navigator.serviceWorker
		.register('./sw.js')
		.then(registration => console.log('️✅ Yay! Service Worker Registered!'))
		.catch(e => console.log('❌ Registration failed :(', e));
});
