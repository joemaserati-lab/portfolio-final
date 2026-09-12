
window.__portfolioHeadState = window.__portfolioHeadState || { settled:false, ready:false };
window.PortfolioTilt = window.PortfolioTilt || { canRequest: () => false, request: async () => 'unavailable' };
function settleHead(ready, error=null) {
  window.__portfolioHeadState = { settled:true, ready, error: error ? String(error?.message || error) : null };
  window.dispatchEvent(new CustomEvent('portfolio:head-settled', { detail: window.__portfolioHeadState }));
}

import { mountHeadScanEffect } from './head-scan-effect.js';

const feature = document.getElementById('crt-head-feature');
const canvas = document.getElementById('crt-head-canvas');
const screenElement = document.getElementById('screen');
const windowLayer = document.getElementById('window-layer');

if (feature && canvas && screenElement) {
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  let effect, observer, ready = false, disposed = false, pageVisible = !document.hidden;
  let booted = !document.body.classList.contains('booting');
  let deviceZero = null, tiltAttempted = false, orientationListening = false;

  function sync() {
    if (disposed || !effect) return;
    const windowOpen = Boolean(windowLayer?.querySelector('.os-window'));
    feature.classList.toggle('is-window-open', windowOpen);
    effect.setPaused(!ready || !booted || !pageVisible || windowOpen);
    if (ready && booted && pageVisible && !windowOpen) feature.classList.add('is-ready');
  }
  function onPointerMove(event) {
    if (touch || motion.matches || event.pointerType !== 'mouse') return;
    const rect = feature.getBoundingClientRect();
    const x = (event.clientX - rect.left) / Math.max(rect.width, 1) * 2 - 1;
    const y = (event.clientY - rect.top) / Math.max(rect.height, 1) * 2 - 1;
    effect?.setPointer(x, y);
  }
  function onOrientation(event) {
    if (motion.matches || !Number.isFinite(event.beta) || !Number.isFinite(event.gamma)) return;
    const angle = window.screen.orientation?.angle ?? window.orientation ?? 0;
    let x = event.gamma, y = event.beta;
    if (angle === 90) { x = event.beta; y = -event.gamma; }
    else if (angle === -90 || angle === 270) { x = -event.beta; y = event.gamma; }
    if (!deviceZero) deviceZero = { x, y };
    effect?.setPointer((x - deviceZero.x) / 24, -(y - deviceZero.y) / 24);
  }
  function startOrientation() {
    if (disposed || motion.matches || orientationListening || !isSecureContext || !('DeviceOrientationEvent' in window)) return false;
    deviceZero = null;
    addEventListener('deviceorientation', onOrientation, true);
    orientationListening = true;
    return true;
  }
  async function requestTilt() {
    if (disposed) return 'unavailable';
    if (motion.matches) return 'reduced-motion';
    if (!touch) return 'not-touch';
    if (!isSecureContext) return 'insecure-context';
    if (!('DeviceOrientationEvent' in window)) return 'unsupported';
    if (orientationListening) return 'active';
    tiltAttempted = true;
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const requests = [DeviceOrientationEvent.requestPermission()];
        if (typeof window.DeviceMotionEvent?.requestPermission === 'function') {
          requests.push(DeviceMotionEvent.requestPermission());
        }
        const permissions = await Promise.all(requests);
        if (permissions.every(value => value === 'granted')) return startOrientation() ? 'granted' : 'unavailable';
        return 'denied';
      }
      return startOrientation() ? 'active' : 'unavailable';
    } catch (error) {
      console.warn('[CRT Head] Device orientation unavailable.', error);
      return 'error';
    }
  }
  function onMotionChange() {
    deviceZero = null;
    effect?.setReducedMotion(motion.matches);
    if (touch && !motion.matches && typeof window.DeviceOrientationEvent?.requestPermission !== 'function') startOrientation();
  }
  function onVisibility() { pageVisible = !document.hidden; sync(); }
  function onBooted() { booted = true; sync(); }
  function onPageHide(event) {
    if (event.persisted) { pageVisible = false; sync(); }
    else cleanup();
  }
  function onPageShow() { pageVisible = !document.hidden; sync(); }
  function cleanup() {
    if (disposed) return;
    disposed = true;
    observer?.disconnect();
    removeEventListener('pointermove', onPointerMove);
    removeEventListener('deviceorientation', onOrientation, true);
    document.removeEventListener('visibilitychange', onVisibility);
    removeEventListener('portfolio:booted', onBooted);
    removeEventListener('pagehide', onPageHide);
    removeEventListener('pageshow', onPageShow);
    motion.removeEventListener('change', onMotionChange);
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
      reducedMotion: motion.matches, onError: fail
    });
    addEventListener('pointermove', onPointerMove, { passive: true });
    document.addEventListener('visibilitychange', onVisibility);
    addEventListener('portfolio:booted', onBooted, { once: true });
    addEventListener('pagehide', onPageHide);
    addEventListener('pageshow', onPageShow);
    motion.addEventListener('change', onMotionChange);
    window.PortfolioTilt = {
      canRequest: () => touch && !motion.matches && isSecureContext && 'DeviceOrientationEvent' in window,
      request: requestTilt,
      recenter: () => { deviceZero = null; }
    };
    if (windowLayer) {
      observer = new MutationObserver(sync);
      observer.observe(windowLayer, { childList: true, subtree: true });
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
