(() => {
  'use strict';
  const WAIT_MS = 60_000;
  const layer = document.getElementById('idle-screensaver');
  const sprite = document.getElementById('idle-screensaver-dvd');
  if (!layer || !sprite) return;

  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['#f5f5f5', '#b9b9b9', '#dedede', '#838383', '#80ffcc', '#cfcfcf'];
  const ambient = document.querySelector('.crt-background-video');
  let timer = 0, frameId = 0, lastFrame = 0, active = false, started = false;
  let x = 0, y = 0, vx = 132, vy = 97, maxX = 0, maxY = 0, colorIndex = 0;
  let previousFocus = null, resumeAmbient = false;

  function stopFrame() {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    lastFrame = 0;
  }
  function measure(reset = false) {
    const width = layer.clientWidth, height = layer.clientHeight;
    const reserve = Math.min(220, height * .31);
    maxX = Math.max(0, width - sprite.offsetWidth);
    maxY = Math.max(0, height - sprite.offsetHeight - reserve);
    if (reset) { x = maxX * .62; y = maxY * .26; }
    x = Math.min(maxX, Math.max(0, x));
    y = Math.min(maxY, Math.max(0, y));
    sprite.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
  }
  function frame(now) {
    if (!active || document.hidden || reduced.matches) { frameId = 0; return; }
    const dt = lastFrame ? Math.min((now - lastFrame) / 1000, .05) : 0;
    lastFrame = now;
    let nx = x + vx * dt, ny = y + vy * dt, collided = false;
    if (maxX > 0 && (nx >= maxX || nx <= 0)) {
      vx = -vx; nx = Math.max(0, Math.min(maxX, nx)); collided = true;
    }
    if (maxY > 0 && (ny >= maxY || ny <= 0)) {
      vy = -vy; ny = Math.max(0, Math.min(maxY, ny)); collided = true;
    }
    x = nx; y = ny;
    if (collided) {
      colorIndex = (colorIndex + 1) % colors.length;
      sprite.style.setProperty('--idle-dvd-color', colors[colorIndex]);
    }
    sprite.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`;
    frameId = requestAnimationFrame(frame);
  }
  function startFrame() {
    stopFrame();
    if (active && !document.hidden && !reduced.matches) frameId = requestAnimationFrame(frame);
  }
  function arm() {
    clearTimeout(timer);
    timer = 0;
    if (active || !started || document.hidden || !document.body.classList.contains('site-ready') ||
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
    measure(true);
    if (ambient && !ambient.paused) { resumeAmbient = true; ambient.pause(); }
    else resumeAmbient = false;
    dispatchEvent(new CustomEvent('portfolio:screensaver-change', {detail: {active: true}}));
    dispatchEvent(new CustomEvent('portfolio:preview-change'));
    try { layer.focus({preventScroll: true}); } catch {}
    startFrame();
  }
  function hide() {
    if (!active) return;
    active = false;
    stopFrame();
    layer.hidden = true;
    document.body.classList.remove('screensaver-on');
    if (resumeAmbient && ambient && !document.body.classList.contains('project-case-open')) {
      ambient.play()?.catch(() => {});
    }
    resumeAmbient = false;
    dispatchEvent(new CustomEvent('portfolio:screensaver-change', {detail: {active: false}}));
    dispatchEvent(new CustomEvent('portfolio:preview-change'));
    if (previousFocus && previousFocus.isConnected && previousFocus !== document.body) {
      try { previousFocus.focus({preventScroll: true}); } catch {}
    }
    previousFocus = null;
    arm();
  }
  function activity(event) {
    if (active) {
      // The first key/wheel wakes the screen but must not accidentally operate the page below.
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
    stopFrame();
    if (document.hidden) return;
    if (active) startFrame();
    else arm();
  }
  document.addEventListener('pointermove', activity, {passive:true, capture:true});
  document.addEventListener('pointerdown', activity, {passive:true, capture:true});
  document.addEventListener('touchstart', activity, {passive:true, capture:true});
  document.addEventListener('touchmove', activity, {passive:true, capture:true});
  document.addEventListener('keydown', activity, {capture:true});
  document.addEventListener('wheel', activity, {passive:false, capture:true});
  document.addEventListener('scroll', activity, {passive:true, capture:true});
  document.addEventListener('visibilitychange', visibility);
  window.addEventListener('resize', () => { if (active) measure(); }, {passive:true});
  reduced.addEventListener('change', () => { if (active) startFrame(); });
  addEventListener('pagehide', () => { clearTimeout(timer); stopFrame(); });
  addEventListener('pageshow', () => { if (started) visibility(); });
  const ready = () => { if (started) return; started = true; arm(); };
  addEventListener('portfolio:site-ready', ready, {once:true});
  if (document.body.classList.contains('site-ready')) ready();
})();
