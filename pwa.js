if ("serviceWorker" in navigator) {
  window.addEventListener("load", async function () {
    try {
      const registrations =
        await navigator.serviceWorker.getRegistrations();

      for (const registration of registrations) {
        await registration.unregister();
      }

      const cacheNamen = await caches.keys();

      for (const cacheName of cacheNamen) {
        await caches.delete(cacheName);
      }

      console.log("Alter App-Cache wurde entfernt.");
    } catch (error) {
      console.error("Cache konnte nicht entfernt werden:", error);
    }
  });
}