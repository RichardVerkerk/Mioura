const CACHE = "mioura-v1.1.2";
const CORE = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/custom.css",
  "./js/storage.js",
  "./js/data-manager.js",
  "./js/onboarding.js",
  "./js/migraine.js",
  "./js/medication.js",
  "./js/calendar.js",
  "./js/analytics.js",
  "./js/import-export.js",
  "./js/app.js",
];
self.addEventListener("install", (e) =>
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE))),
);
self.addEventListener("activate", (e) =>
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)),
        ),
      ),
  ),
);
self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(
      (cached) =>
        cached ||
        fetch(e.request)
          .then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy));
            return res;
          })
          .catch(() => caches.match("./index.html")),
    ),
  );
});
