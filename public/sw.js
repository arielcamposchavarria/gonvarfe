// Service worker mínimo: no cachea nada, solo existe para cumplir el
// criterio de instalabilidad de PWA (manifest + service worker con fetch
// handler). Esta app depende de datos en vivo (turnos, escaneos, bitácoras),
// así que cachear respuestas agresivamente podría mostrar datos obsoletos.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", () => {
  // Passthrough: deja que el navegador maneje la petición normalmente.
});
