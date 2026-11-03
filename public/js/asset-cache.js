(() => {
  if (!('serviceWorker' in navigator) || !isSecureContext) return;
  const register = () => setTimeout(() => {
    navigator.serviceWorker.register(new URL('asset-cache-worker.js', document.baseURI), {
      scope: new URL('.', document.baseURI).pathname,
      updateViaCache: 'none'
    }).catch(() => {});
  }, 1500);
  if (document.body.classList.contains('site-ready')) register();
  else addEventListener('portfolio:site-ready', register, { once: true });
})();
