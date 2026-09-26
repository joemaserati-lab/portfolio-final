
window.__portfolioHeadState = window.__portfolioHeadState || { settled:false, ready:false };
window.PortfolioMotion = window.PortfolioMotion || { getStatus: () => 'unavailable', recenter: () => {}, enableTouchFallback: () => false };
function settleHead(ready, error=null) {
  window.__portfolioHeadState = { settled:true, ready, error: error ? String(error?.message || error) : null };
  window.dispatchEvent(new CustomEvent('portfolio:head-settled', { detail: window.__portfolioHeadState }));
}

import { mountHeadScanEffect } from './head-scan-effect.js';

const feature = document.getElementById('crt-head-feature');
const canvas = document.getElementById('crt-head-canvas');
const screenElement = document.getElementById('screen');
const windowLayer = document.getElementById('window-layer');
const projectsView = document.getElementById('projects-view');

if (feature && canvas && screenElement) {
  const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  let effect, observer, ready = false, disposed = false, pageVisible = !document.hidden;
  let booted = !document.body.classList.contains('booting');
  let fallbackActive = false, fallbackRaf = 0, fallbackPointerId = null, fallbackTouchedAt = 0;
  let fallbackX = 0, fallbackY = 0, fallbackTargetX = 0, fallbackTargetY = 0;

  function sync() {
    if (disposed || !effect) return;
    const windowOpen = Boolean(windowLayer?.querySelector('.os-window')) || Boolean(projectsView && !projectsView.hidden);
    feature.classList.toggle('is-window-open', windowOpen);
    effect.setPaused(!ready || !booted || !pageVisible || windowOpen);
    if (ready && booted && pageVisible && !windowOpen) feature.classList.add('is-ready');
  }
  function onPointerMove(event) {
    if (touch || event.pointerType !== 'mouse') return;
    const rect = feature.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(rect.width, 1) * 2 - 1;
    const y = (event.clientY - rect.top) / Math.max(rect.height, 1) * 2 - 1;
    effect?.setPointer(x, y);
  }
  function getMotionStatus() {
    if (disposed) return 'unavailable';
    return touch ? 'touch-fallback' : 'not-touch';
  }
  function recenterMotion() {
    fallbackX = 0;
    fallbackY = 0;
    fallbackTargetX = 0;
    fallbackTargetY = 0;
    effect?.setPointer(0, 0);
  }
  function updateFallbackTargetFromPoint(clientX, clientY) {
    const rect = screenElement.getBoundingClientRect();
    const x = (clientX - rect.left) / Math.max(rect.width, 1) * 2 - 1;
    const y = (clientY - rect.top) / Math.max(rect.height, 1) * 2 - 1;
    fallbackTargetX = Math.max(-0.45, Math.min(0.45, x * 0.45));
    fallbackTargetY = Math.max(-0.30, Math.min(0.30, y * 0.30));
  }
  function onFallbackPointerDown(event) {
    if (!fallbackActive || fallbackPointerId !== null) return;
    fallbackPointerId = event.pointerId;
    fallbackTouchedAt = performance.now();
    updateFallbackTargetFromPoint(event.clientX, event.clientY);
  }
  function onFallbackPointerMove(event) {
    if (!fallbackActive || fallbackPointerId !== event.pointerId) return;
    fallbackTouchedAt = performance.now();
    updateFallbackTargetFromPoint(event.clientX, event.clientY);
  }
  function onFallbackPointerEnd(event) {
    if (fallbackPointerId === event.pointerId) fallbackPointerId = null;
  }
  function animateFallback(now) {
    fallbackRaf = 0;
    if (disposed || !fallbackActive) return;
    if (fallbackPointerId === null && now - fallbackTouchedAt > 220) {
      const t = now / 1000;
      fallbackTargetX = Math.sin(t * 0.42) * 0.18 + Math.sin(t * 0.17 + 1.2) * 0.08;
      fallbackTargetY = Math.cos(t * 0.31 + 0.6) * 0.10 + Math.sin(t * 0.21) * 0.035;
    }
    const rateX = fallbackPointerId === null ? 0.035 : 0.10;
    const rateY = fallbackPointerId === null ? 0.030 : 0.085;
    fallbackX += (fallbackTargetX - fallbackX) * rateX;
    fallbackY += (fallbackTargetY - fallbackY) * rateY;
    effect?.setPointer(fallbackX, fallbackY);
    fallbackRaf = requestAnimationFrame(animateFallback);
  }
  function enableTouchFallback() {
    if (disposed || fallbackActive || !touch) return false;
    fallbackActive = true;
    fallbackPointerId = null;
    fallbackTouchedAt = 0;
    fallbackX = 0;
    fallbackY = 0;
    fallbackTargetX = 0;
    fallbackTargetY = 0;
    screenElement.addEventListener('pointerdown', onFallbackPointerDown, { passive: true });
    screenElement.addEventListener('pointermove', onFallbackPointerMove, { passive: true });
    screenElement.addEventListener('pointerup', onFallbackPointerEnd, { passive: true });
    screenElement.addEventListener('pointercancel', onFallbackPointerEnd, { passive: true });
    fallbackRaf = requestAnimationFrame(animateFallback);
    return true;
  }
  function onVisibility() { pageVisible = !document.hidden; sync(); }
  function onBooted() {
    booted = true;
    if (touch) enableTouchFallback();
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
    observer?.disconnect();
    cancelAnimationFrame(fallbackRaf);
    removeEventListener('pointermove', onPointerMove);
    screenElement.removeEventListener('pointerdown', onFallbackPointerDown);
    screenElement.removeEventListener('pointermove', onFallbackPointerMove);
    screenElement.removeEventListener('pointerup', onFallbackPointerEnd);
    screenElement.removeEventListener('pointercancel', onFallbackPointerEnd);
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
      recenter: recenterMotion,
      enableTouchFallback
    };
    if (windowLayer || projectsView) {
      observer = new MutationObserver(sync);
      if (windowLayer) {
        observer.observe(windowLayer, { childList: true, subtree: true });
      }
      if (projectsView) {
        observer.observe(projectsView, {
          attributes: true,
          attributeFilter: ['hidden', 'class'],
          childList: true
        });
      }
    }
    effect.ready.then(() => {
      if (disposed || effect.disposed) return;
      ready = true;
      // Compile/render the pipeline once behind the opaque loader so the first
      // visible frame does not pay the shader warm-up cost.
      if (!booted && pageVisible) {
        effect.setPaused(false);
        requestAnimationFrame(() => effect?.setPaused(true));
      }
      settleHead(true);
      sync();
    });
    sync();
  } catch (error) { fail(error); }
}

if (!(feature && canvas && screenElement)) settleHead(false, new Error('Head feature unavailable.'));
