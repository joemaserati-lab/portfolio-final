(() => {
  'use strict';
  const WAIT_MS = 60_000;
  const layer = document.getElementById('idle-screensaver');
  const scene = document.getElementById('idle-screensaver-scene');
  if (!layer || !scene) return;
  const ambient = document.querySelector('.crt-background-video');
  let timer = 0, active = false, started = false;
  let sceneRequested = false, sceneLoaded = false;
  let previousFocus = null, resumeAmbient = false;

  function send(type, detail = {}) {
    if (!sceneLoaded || !scene.contentWindow) return;
    scene.contentWindow.postMessage({ namespace:'portfolio-idle', type, ...detail }, location.origin);
  }
  function syncLanguage() {
    const t = key => window.PortfolioI18n?.t?.(key) || key;
    send('copy', { lang: window.PortfolioI18n?.lang || document.documentElement.lang,
      copy:{ title:t('idle.title'), description:t('idle.copy'), resume:t('idle.resume'),
        aria:t('idle.aria') } });
  }
  scene.addEventListener('load', () => {
    if (!sceneRequested) return;
    sceneLoaded = true;
    syncLanguage();
    send(active ? 'resume' : 'pause');
    scene.classList.add('is-ready');
  });
  addEventListener('portfolio:langchange', syncLanguage);

  function arm() {
    clearTimeout(timer);
    timer = 0;
    if (active || !started || document.hidden ||
        !document.body.classList.contains('site-ready') ||
        document.body.classList.contains('reader-mode')) return;
    timer = setTimeout(show, WAIT_MS);
  }
  function show() {
    timer = 0;
    if (active || document.hidden || !document.body.classList.contains('site-ready')) return;
    active = true;
    previousFocus = document.activeElement;
    layer.hidden = false;
    document.body.classList.add('screensaver-on');
    // Load the existing 404 page only at the first idle transition.
    if (!sceneRequested) {
      sceneRequested = true;
      scene.src = new URL(scene.dataset.src, document.baseURI).href;
    } else {
      syncLanguage();
      send('resume');
    }
    if (ambient && !ambient.paused) { resumeAmbient = true; ambient.pause(); }
    else resumeAmbient = false;
    dispatchEvent(new CustomEvent('portfolio:screensaver-change', {detail:{active:true}}));
    dispatchEvent(new CustomEvent('portfolio:preview-change'));
    try { layer.focus({preventScroll:true}); } catch {}
  }
  function hide() {
    if (!active) return;
    active = false;
    send('pause');
    layer.hidden = true;
    document.body.classList.remove('screensaver-on');
    if (resumeAmbient && ambient && !document.body.classList.contains('project-case-open')) {
      ambient.play()?.catch(() => {});
    }
    resumeAmbient = false;
    dispatchEvent(new CustomEvent('portfolio:screensaver-change', {detail:{active:false}}));
    dispatchEvent(new CustomEvent('portfolio:preview-change'));
    if (previousFocus && previousFocus.isConnected && previousFocus !== document.body) {
      try { previousFocus.focus({preventScroll:true}); } catch {}
    }
    previousFocus = null;
    arm();
  }
  function activity(event) {
    if (active) {
      // A wake-up key or wheel event must not also activate underlying UI.
      if (event.type === 'keydown' || event.type === 'wheel') {
        if (event.cancelable) event.preventDefault();
        event.stopImmediatePropagation();
      }
      hide();
      return;
    }
    arm();
  }
  function visibility() {
    clearTimeout(timer);
    timer = 0;
    if (document.hidden) { send('pause'); return; }
    if (active) send('resume');
    else arm();
  }
  document.addEventListener('pointermove', activity, {passive:true,capture:true});
  document.addEventListener('pointerdown', activity, {passive:true,capture:true});
  document.addEventListener('touchstart', activity, {passive:true,capture:true});
  document.addEventListener('touchmove', activity, {passive:true,capture:true});
  document.addEventListener('keydown', activity, {capture:true});
  document.addEventListener('wheel', activity, {passive:false,capture:true});
  // Pointer, wheel, touch and keyboard input define activity. Programmatic
  // scrolls from responsive layout/animated navigation must not reset idle.
  document.addEventListener('visibilitychange', visibility);
  addEventListener('pagehide', () => { clearTimeout(timer); send('pause'); });
  addEventListener('pageshow', () => { if (started) visibility(); });
  const ready = () => { if (started) return; started = true; arm(); };
  addEventListener('portfolio:site-ready', ready, {once:true});
  if (document.body.classList.contains('site-ready')) ready();
})();
