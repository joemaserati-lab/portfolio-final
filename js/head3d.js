
window.__portfolioHeadState = window.__portfolioHeadState || { settled:false, ready:false };
window.PortfolioTilt = window.PortfolioTilt || { canRequest: () => false, getStatus: () => 'unavailable', request: async () => 'unavailable' };
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
  let deviceZero = null, tiltAttempted = false, orientationListening = false, lastTiltEventAt = 0;
  let tiltX = 0, tiltY = 0;

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
    lastTiltEventAt = performance.now();
    const angle = window.screen.orientation?.angle ?? window.orientation ?? 0;
    let rawX = event.gamma, rawY = event.beta;
    if (angle === 90) { rawX = event.beta; rawY = -event.gamma; }
    else if (angle === -90 || angle === 270) { rawX = -event.beta; rawY = event.gamma; }

    // In portrait, neutral is the natural upright phone position: face front.
    if (!deviceZero) deviceZero = { x: rawX, y: rawY };
    const targetX = Math.max(-0.55, Math.min(0.55, (rawX - deviceZero.x) / 42));
    const targetY = Math.max(-0.42, Math.min(0.42, -(rawY - deviceZero.y) / 58));
    tiltX += (targetX - tiltX) * 0.12;
    tiltY += (targetY - tiltY) * 0.10;
    effect?.setPointer(tiltX, tiltY);
  }
  function getTiltStatus() {
    if (disposed) return 'unavailable';
    if (motion.matches) return 'reduced-motion';
    if (!touch) return 'not-touch';
    if (!isSecureContext) return 'insecure-context';
    if (!('DeviceOrientationEvent' in window)) return 'unsupported';
    if (orientationListening) return lastTiltEventAt ? 'active' : 'listening';
    return 'ready';
  }
  function waitForTiltSignal(ms = 1200) {
    return new Promise(resolve => {
      if (lastTiltEventAt) { resolve(true); return; }
      const start = performance.now();
      const check = () => {
        if (lastTiltEventAt >= start) { resolve(true); return; }
        if (performance.now() - start >= ms) { resolve(false); return; }
        setTimeout(check, 80);
      };
      check();
    });
  }
  function startOrientation() {
    if (disposed || motion.matches || orientationListening || !isSecureContext || !('DeviceOrientationEvent' in window)) return false;
    recenterTilt();
    lastTiltEventAt = 0;
    addEventListener('deviceorientation', onOrientation, true);
    orientationListening = true;
    return true;
  }
  function recenterTilt() {
    deviceZero = null;
    tiltX = 0;
    tiltY = 0;
    effect?.setPointer(0, 0);
  }
  async function requestTilt() {
    const status = getTiltStatus();
    if (status === 'active' || status === 'listening') return status;
    if (status !== 'ready') return status;
    tiltAttempted = true;
    try {
      if (typeof DeviceOrientationEvent.requestPermission === 'function') {
        const permission = await DeviceOrientationEvent.requestPermission();
        if (permission === 'granted') {
          if (!startOrientation()) return 'unavailable';
          return await waitForTiltSignal() ? 'granted' : 'blocked-or-private-browser';
        }
        return 'denied';
      }
      if (!startOrientation()) return 'unavailable';
      return await waitForTiltSignal() ? 'active' : 'blocked-or-private-browser';
    } catch (error) {
      console.warn('[CRT Head] Device orientation unavailable.', error);
      return 'error';
    }
  }
  function onMotionChange() {
    recenterTilt();
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
      canRequest: () => getTiltStatus() === 'ready',
      getStatus: getTiltStatus,
      request: requestTilt,
      recenter: recenterTilt
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
