if ("serviceWorker" in navigator) {
  window.addEventListener("load", function () {
    navigator.serviceWorker
      .register("service-worker.js?v=4")
      .then(function (registration) {
        console.log("Service Worker registriert:", registration);
      })
      .catch(function (error) {
        console.error("Service Worker Fehler:", error);
      });
  });
}