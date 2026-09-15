(() => {
  const loader = document.getElementById('boot-loader');
  const out = document.getElementById('boot-output');
  const enter = document.getElementById('boot-enter');
  const gateStatus = document.getElementById('boot-gate-status');
  const gateNote = document.getElementById('boot-gate-note');
  if (!loader || !out || !enter || !gateStatus) return;

  const bootStart = performance.now();
  const MIN_VISIBLE_MS = 1300;
  const READY_HOLD_MS = 220;
  const ROW_STEP_MS = 135;
  const HEAD_READY_TIMEOUT_MS = 6500;
  const i18n = window.PortfolioI18n;
  const t = key => i18n?.t?.(key) || key;
  const isTouchDevice = () => Boolean(i18n?.isTouchDevice?.()) || matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  let finished = false;
  let sequenceStarted = false;
  let resourcesReady = false;
  let headOk = false;
  let applicationPromise = null;

  const rows = new Map();
  const rowOrder = [];
  const rowState = new Map();
  const rowDefs = [
    ['init', '01 INIT', 'environment initialized', 'done'],
    ['dom', '02 DOM', 'building interface', 'pending'],
    ['fonts', '03 TYPE', 'loading system fonts', 'pending'],
    ['page', '04 ASSETS', 'loading visual resources', 'pending'],
    ['video', '05 SIGNAL', 'initializing CRT layer', 'pending'],
    ['head', '06 MODEL', 'loading 3D model / shaders', 'pending'],
    ['ready', '07 READY', 'checking resources', 'pending']
  ];

  rowDefs.forEach(([key, label, text, state]) => rowState.set(key, { label, text, state }));

  function addRow(key) {
    const current = rowState.get(key);
    if (!current) return null;
    let row = rows.get(key);
    if (!row) {
      row = document.createElement('div');
      row.className = 'boot-line';
      row.innerHTML = `<span class="tag"></span> <span class="muted"></span>`;
      out.appendChild(row);
      rows.set(key, row);
      rowOrder.push(row);
      const index = rowOrder.length - 1;
      setTimeout(() => row.classList.add('is-shown'), 120 + index * ROW_STEP_MS);
    }
    row.dataset.state = current.state;
    row.querySelector('.tag').textContent = current.label.padEnd(10, ' ');
    row.querySelector('.muted').textContent = current.text;
    return row;
  }

  function setRow(key, label, text, state = 'pending') {
    rowState.set(key, { label, text, state });
    if (sequenceStarted) addRow(key);
  }

  function setGate(text, note) {
    gateStatus.removeAttribute('data-i18n');
    gateStatus.textContent = text;
    if (gateNote && note) {
      gateNote.removeAttribute('data-i18n');
      gateNote.textContent = note;
      gateNote.hidden = !isTouchDevice() && /tilt|sensor/i.test(note);
    }
  }

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const existing = document.querySelector(`script[data-app-src="${src}"]`);
      if (existing?.dataset.loaded === 'true') {
        resolve();
        return;
      }
      if (existing) {
        existing.addEventListener('load', resolve, { once: true });
        existing.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.appSrc = src;
      script.addEventListener('load', () => {
        script.dataset.loaded = 'true';
        resolve();
      }, { once: true });
      script.addEventListener('error', () => reject(new Error(`Failed to load ${src}`)), { once: true });
      document.body.appendChild(script);
    });
  }

  function loadApplication() {
    if (applicationPromise) return applicationPromise;
    applicationPromise = (async () => {
      await loadScript('js/content.js');
      await Promise.all([
        loadScript('js/fixes.js'),
        loadScript('js/portfolio.js')
      ]);
    })();
    return applicationPromise;
  }

  if (gateNote) gateNote.hidden = !isTouchDevice();

  const domReady = new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => resolve({ ok: true }), { once: true });
    } else resolve({ ok: true });
  }).then(value => {
    setRow('dom', '02 DOM', 'interface ready', 'done');
    return value;
  });

  const fontsReady = (async () => {
    if (!document.fonts) {
      setRow('fonts', '03 TYPE', 'font API unavailable - fallback armed', 'warn');
      return { ok: false };
    }
    try {
      await Promise.all([
        document.fonts.load('400 20px "VT323"'),
        document.fonts.load('400 48px "Redaction 50"')
      ]);
      setRow('fonts', '03 TYPE', 'fonts ready', 'done');
      return { ok: true };
    } catch (error) {
      setRow('fonts', '03 TYPE', 'font fallback armed', 'warn');
      return { ok: false, error };
    }
  })();

  const pageReady = new Promise(resolve => {
    if (document.readyState === 'complete') resolve({ ok: true });
    else addEventListener('load', () => resolve({ ok: true }), { once: true });
  }).then(value => {
    setRow('page', '04 ASSETS', 'assets ready', 'done');
    return value;
  });

  const videoReady = new Promise(resolve => {
    const video = document.querySelector('.crt-background-video');
    if (!video) {
      setRow('video', '05 SIGNAL', 'ambient layer unavailable', 'warn');
      resolve({ ok: false });
      return;
    }
    if (video.readyState >= 2) {
      setRow('video', '05 SIGNAL', 'signal ready', 'done');
      resolve({ ok: true });
      return;
    }
    let settled = false;
    const done = ok => {
      if (settled) return;
      settled = true;
      video.removeEventListener('loadeddata', onReady);
      video.removeEventListener('canplay', onReady);
      video.removeEventListener('error', onError);
      setRow('video', '05 SIGNAL', ok ? 'signal ready' : 'CRT layer unavailable', ok ? 'done' : 'warn');
      resolve({ ok });
    };
    const onReady = () => done(true);
    const onError = () => done(false);
    video.addEventListener('loadeddata', onReady, { once: true });
    video.addEventListener('canplay', onReady, { once: true });
    video.addEventListener('error', onError, { once: true });
    try { video.load(); } catch { done(false); }
  });

  const headReady = new Promise(resolve => {
    let settled = false;
    let onSettled;
    const done = detail => {
      if (settled) return;
      settled = true;
      if (onSettled) removeEventListener('portfolio:head-settled', onSettled);
      headOk = Boolean(detail.ready);
      setRow('head', '06 MODEL', detail.ready ? 'model ready' : '3D fallback active', detail.ready ? 'done' : 'warn');
      resolve(detail);
    };
    const state = window.__portfolioHeadState;
    if (state?.settled) {
      done(state);
      return;
    }
    onSettled = event => {
      done(event.detail || { settled: true, ready: false });
    };
    addEventListener('portfolio:head-settled', onSettled, { once: true });
    setTimeout(() => done({ settled: true, ready: false, error: 'Head initialization timed out.' }), HEAD_READY_TIMEOUT_MS);
  });

  Promise.allSettled([domReady, fontsReady, pageReady, videoReady, headReady]).then(() => {
    resourcesReady = true;
    if (!headOk) {
      setGate(t('boot.fallbackStatus'), t('boot.fallbackNote'));
    } else {
      const note = isTouchDevice()
        ? (isSecureContext ? t('boot.readyNote') : t('boot.readyNoteInsecure'))
        : t('boot.readyNoteDesktop');
      setGate(t('boot.readyStatus'), note);
    }
    loader.classList.add('is-ready');
    enter.disabled = false;
    enter.focus({ preventScroll: true });
  });

  async function requestTiltBeforeEntry() {
    const tilt = window.PortfolioTilt;
    if (!tilt) return;
    const enableFallback = () => Boolean(tilt.enableFallback?.());
    const status = tilt.getStatus?.() || (tilt.canRequest?.() ? 'ready' : 'unavailable');
    if (status !== 'ready') {
      const fallback = enableFallback();
      const messages = {
        active: ['tilt already active / launching sequence', 'done'],
        listening: ['tilt listening / launching sequence', 'done'],
        'not-touch': ['desktop pointer mode / launching sequence', 'done'],
        'insecure-context': ['tilt needs HTTPS / launching sequence', 'warn'],
        unsupported: ['tilt unsupported / launching sequence', 'warn'],
        unavailable: ['tilt unavailable / launching sequence', 'warn']
      };
      if (fallback) {
        setRow('ready', '07 READY', 'touch + ambient motion enabled', 'done');
        return;
      }
      const [text, state] = messages[status] || messages.unavailable;
      setRow('ready', '07 READY', text, state);
      return;
    }
    setGate(t('boot.requestTilt'), t('boot.requestTiltNote'));
    const result = await tilt.request();
    const messages = {
      granted: ['tilt enabled / launching sequence', 'done'],
      active: ['tilt enabled / launching sequence', 'done'],
      listening: ['tilt listening / launching sequence', 'done'],
      denied: ['touch + ambient motion enabled', 'done'],
      'touch-fallback': ['touch + ambient motion enabled', 'done'],
      'blocked-or-private-browser': ['touch + ambient motion enabled', 'done'],
      'insecure-context': ['tilt needs HTTPS / launching sequence', 'warn'],
      unsupported: ['tilt unsupported / launching sequence', 'warn'],
      error: ['touch + ambient motion enabled', 'done'],
      unavailable: ['tilt unavailable / launching sequence', 'warn']
    };
    const [text, state] = messages[result] || messages.unavailable;
    setRow('ready', '07 READY', text, state);
  }

  function startSequence() {
    if (sequenceStarted || finished) return;
    sequenceStarted = true;
    loader.classList.add('is-sequencing');
    rowDefs.forEach(([key]) => addRow(key));
    if ((rowState.get('ready')?.state || 'pending') === 'pending') {
      setRow('ready', '07 READY', 'portfolio environment online', 'done');
    }
    launch();
  }

  function launch() {
    if (finished) return;
    finished = true;

    const elapsed = performance.now() - bootStart;
    const rowSequenceFloor = 120 + (rowDefs.length - 1) * ROW_STEP_MS + 180;
    const remainingToMinimum = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const remainingToRows = Math.max(0, rowSequenceFloor);
    const holdBeforeRelease = Math.max(remainingToMinimum, remainingToRows) + READY_HOLD_MS;

    setTimeout(() => {
      document.body.classList.add('site-entering');
      document.body.classList.remove('booting');
      window.dispatchEvent(new CustomEvent('portfolio:booted'));

      requestAnimationFrame(() => {
        requestAnimationFrame(() => loader.classList.add('done'));
      });

      setTimeout(() => {
        document.body.classList.remove('site-entering');
        document.body.classList.add('site-ready');
      }, 1450);

      setTimeout(() => loader.remove(), 1100);
    }, holdBeforeRelease);
  }

  enter.addEventListener('click', async () => {
    if (!resourcesReady || sequenceStarted) return;
    enter.disabled = true;
    const [tiltResult, appResult] = await Promise.allSettled([
      requestTiltBeforeEntry(),
      loadApplication()
    ]);
    if (tiltResult.status === 'rejected') console.warn('Tilt initialization failed.', tiltResult.reason);
    if (appResult.status === 'rejected') console.error('Portfolio application failed to load.', appResult.reason);
    startSequence();
  });
})();
