
window.__portfolioHeadState = window.__portfolioHeadState || { settled:false, ready:false };
window.PortfolioMotion = window.PortfolioMotion || { getStatus: () => 'unavailable', recenter: () => {} };
function settleHead(ready, error=null) {
  window.__portfolioHeadState = { settled:true, ready, error: error ? String(error?.message || error) : null };
  window.dispatchEvent(new CustomEvent('portfolio:head-settled', { detail: window.__portfolioHeadState }));
}

const effectUrl = new URL('./head-scan-effect.js', import.meta.url);
effectUrl.searchParams.set('v', window.PORTFOLIO_ASSET_VERSION);
const { mountHeadScanEffect } = await import(effectUrl.href);

const feature = document.getElementById('crt-head-feature');
const canvas = document.getElementById('crt-head-canvas');
const screenElement = document.getElementById('screen');
const windowLayer = document.getElementById('window-layer');
const projectsView = document.getElementById('projects-view');

if (feature && canvas && screenElement) {
  const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  let effect, observer, ready = false, disposed = false, pageVisible = !document.hidden;
  let booted = !document.body.classList.contains('booting');

  function sync() {
    if (disposed || !effect) return;
    // Case studies show the project alone; resume the same head on return.
    const projectCaseOpen = projectsView && !projectsView.hidden && projectsView.dataset.view === 'case';
    const shouldBeVisible = ready && booted && pageVisible && !projectCaseOpen;
    feature.classList.toggle('is-ready', shouldBeVisible);
    effect.setPaused(!shouldBeVisible);
  }
  function onScrollPose(event) {
    effect?.setScrollRotation(event.detail.yaw, event.detail.heroPresence);
    effect?.setPresentationScale(event.detail.renderScale);
  }
  addEventListener('portfolio:scroll-pose', onScrollPose);
  function onPointerMove(event) {
    if (touch || event.pointerType !== 'mouse') return;
    const rect = feature.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(rect.width, 1) * 2 - 1;
    const y = (event.clientY - rect.top) / Math.max(rect.height, 1) * 2 - 1;
    effect?.setPointer(x, y);
  }
  function getMotionStatus() {
    if (disposed) return 'unavailable';
    return touch ? 'scroll' : 'mouse';
  }
  function recenterMotion() { effect?.setPointer(0, 0); }
  function onVisibility() { pageVisible = !document.hidden; sync(); }
  function onBooted() {
    booted = true;
    sync();
  }
  function onPageHide(event) {
    if (event.persisted) { pageVisible = false; sync(); }
    else cleanup();
  }
  function onPageShow() { pageVisible = !document.hidden; sync(); }
  function cleanup() {
    if (disposed) return;
    disposed = true;
    removeEventListener('portfolio:scroll-pose', onScrollPose);
    observer?.disconnect();
    removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibility);
    removeEventListener('portfolio:booted', onBooted);
    removeEventListener('pagehide', onPageHide);
    removeEventListener('pageshow', onPageShow);
    effect?.destroy();
  }
  function fail(error) {
    console.warn('[CRT Head] Reference3 unavailable.', error);
    feature.classList.remove('is-ready');
    feature.classList.add('is-failed');
    settleHead(false, error);
    cleanup();
  }

  try {
    effect = mountHeadScanEffect({
      container: feature, canvas,
      modelUrl: new URL('../assets/models/human_head_reference3.glb', import.meta.url).href,
      reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches, onError: fail
    });
    addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    addEventListener('portfolio:booted', onBooted, { once: true });
    addEventListener('pagehide', onPageHide);
    addEventListener('pageshow', onPageShow);
    window.PortfolioMotion = {
      getStatus: getMotionStatus,
      getPose: () => ({ yaw: effect?.root.rotation.y, pitch: effect?.root.rotation.x }),
      recenter: recenterMotion
    };
    observer = new MutationObserver(sync);
    if (windowLayer) observer.observe(windowLayer, { childList: true, subtree: true });
    if (projectsView) {
      observer.observe(projectsView, {
        attributes: true,
        attributeFilter: ['hidden', 'class', 'data-view'],
        childList: true
      });
    }
    effect.ready.then(() => {
      if (disposed || effect.disposed) return;
      ready = true;
      // Compile/render the pipeline once behind the opaque loader so the first
      // visible frame does not pay the shader warm-up cost.
      if (!booted && pageVisible) {
        effect.setPaused(false);
        requestAnimationFrame(sync);
      }
      settleHead(true);
      sync();
    });
    sync();
  } catch (error) { fail(error); }
}

if (!(feature && canvas && screenElement)) settleHead(false, new Error('Head feature unavailable.'));
