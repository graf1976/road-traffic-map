/**
 * 最小構成のサービスワーカー。
 *
 * 目的は 2 つ。
 * 1. ホーム画面へ追加（インストール）できる条件を満たすこと。
 * 2. 電波が切れたときに、真っ白な画面ではなく直前の画面を出すこと。
 *
 * 道路状況は鮮度が命なので、通信できるときは必ずネットワークを優先し、
 * 規制情報 API のレスポンスはキャッシュしない。
 */
const CACHE_NAME = "road-traffic-map-v1";

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;

  if (request.method !== "GET") return;

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request);

        // 画面そのもの（HTML）だけ、オフライン時の予備としてしまっておく。
        if (request.mode === "navigate" && response.ok) {
          const cache = await caches.open(CACHE_NAME);
          cache.put(request, response.clone());
        }

        return response;
      } catch (error) {
        const cached = await caches.match(request);
        if (cached) return cached;

        if (request.mode === "navigate") {
          const shell = await caches.match("/");
          if (shell) return shell;
        }

        throw error;
      }
    })(),
  );
});
