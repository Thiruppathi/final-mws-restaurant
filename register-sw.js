document.addEventListener("DOMContentLoaded", event => {
  /**
   *     Service Worker registration
   */
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker
    .register("sw.js")
    .then(registration =>
      console.log("️✅ Yay! Service Worker Registered!", registration)
    )
    .catch(e => console.log("❌ Registration failed :(", e));
});
