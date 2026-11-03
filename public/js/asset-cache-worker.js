/* ASSET_REVISIONS, BUILD_REVISION and DEPLOYMENT_VERSION are injected by scripts/build-cache.mjs.
   No precache or HTML interception. A changed worker waits for existing tabs
   to close, preventing a forced renderer/application update mid-session. */
const prefix = `portfolio-assets:${new URL(self.registration.scope).pathname}:`;
const cacheName = prefix + BUILD_REVISION;
const assetRevisions = new Map(Object.entries(ASSET_REVISIONS).map(([path, revision]) =>
  [new URL(path, self.registration.scope).pathname, revision]));

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) {
      if (name.startsWith(prefix) && name !== cacheName) await caches.delete(name);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const request = event.request;
  const url = new URL(request.url);
  const revision = assetRevisions.get(url.pathname);
  if (request.method !== 'GET' || request.mode === 'navigate' ||
      request.headers.has('range') || url.origin !== self.location.origin || !revision ||
      url.searchParams.get('v') !== DEPLOYMENT_VERSION) return;
  // A new network HTML document may still be controlled by an older worker.
  // Only serve this deployment's versioned requests; newer/unversioned requests
  // bypass the worker entirely. Content revisions also validate cache writes.
  const key = new URL(url.pathname, self.location.origin);
  key.searchParams.set('revision', revision);
  event.respondWith((async () => {
    let cache;
    try {
      cache = await caches.open(cacheName);
      const hit = await cache.match(key.href);
      if (hit) return hit;
    } catch { /* Storage restrictions must never prevent a network response. */ }
    const response = await fetch(request);
    if (cache && response.status === 200 && response.type !== 'opaque' && !response.redirected) {
      // A deployment can change files while an older tab is still open.
      // Never persist new bytes under an old manifest revision.
      const save = (async () => {
        const cachedResponse = response.clone();
        const digest = await crypto.subtle.digest('SHA-256', await response.clone().arrayBuffer());
        const hash = [...new Uint8Array(digest)].map(x => x.toString(16).padStart(2, '0')).join('');
        if (hash === revision) await cache.put(key.href, cachedResponse);
      })().catch(() => {});
      event.waitUntil(save);
    }
    return response;
  })());
});
