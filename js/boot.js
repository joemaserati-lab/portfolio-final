(() => {
  const loader = document.getElementById('boot-loader');
  const out = document.getElementById('boot-output');
  const enter = document.getElementById('boot-enter');
  const gateTitle = document.querySelector('#boot-gate h2');
  const gateStatus = document.getElementById('boot-gate-status');
  const gateNote = document.getElementById('boot-gate-note');
  if (!loader || !out || !enter || !gateTitle || !gateStatus) return;

  const bootStart = performance.now();
  const MIN_VISIBLE_MS = 1300;
  const MIN_LOADING_TITLE_MS = 2200;
  const TITLE_SCRAMBLE_MS = 700;
  const TITLE_SCRAMBLE_STEP_MS = 42;
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@';
  const READY_HOLD_MS = 220;
  const ROW_STEP_MS = 135;
  const HEAD_READY_TIMEOUT_MS = 6500;
  const SCRIPT_LOAD_TIMEOUT_MS = 8000;
  const i18n = window.PortfolioI18n;
  const t = key => i18n?.t?.(key) || key;
  const isTouchDevice = () => Boolean(i18n?.isTouchDevice?.()) || matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  let finished = false;
  let sequenceStarted = false;
  let resourcesReady = false;
  let headOk = false;
  let applicationPromise = null;
  let headPromise = null;
  let fatalLoadError = false;

  const rows = new Map();
  const rowOrder = [];
  const rowState = new Map();
  const rowDefs = [
    ['init', '01 INIT', 'environment initialized', 'done'],
    ['dom', '02 DOM', 'building interface', 'pending'],
    ['fonts', '03 TYPE', 'loading system fonts', 'pending'],
    ['page', '04 ASSETS', 'loading visual resources', 'pending'],
    ['video', '05 SIGNAL', 'initializing CRT layer', 'pending'],
    ['head', '06 MODEL', 'waiting for entry', 'pending'],
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

  function setTitle(key) {
    gateTitle.dataset.i18nHtml = key;
    gateTitle.textContent = t(key);
  }

  function scrambleTitle(key) {
    const target = t(key).toUpperCase();
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setTitle(key);
      return Promise.resolve();
    }

    gateTitle.removeAttribute('data-i18n-html');
    const revealAt = [...target].map(char => char === ' ' ? 0 : 0.2 + Math.random() * 0.72);

    return new Promise(resolve => {
      const start = performance.now();
      let lastPaint = 0;

      const paint = now => {
        const progress = Math.min(1, (now - start) / TITLE_SCRAMBLE_MS);

        if (progress === 1 || now - lastPaint >= TITLE_SCRAMBLE_STEP_MS) {
          lastPaint = now;
          gateTitle.textContent = [...target].map((char, index) => {
            if (char === ' ') return ' ';
            if (progress >= revealAt[index]) return char;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }).join('');
        }

        if (progress < 1) {
          requestAnimationFrame(paint);
          return;
        }

        gateTitle.dataset.i18nHtml = key;
        gateTitle.textContent = target;
        resolve();
      };

      requestAnimationFrame(paint);
    });
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
      const selector = `script[data-app-src="${src}"]`;
      const existing = document.querySelector(selector);
      if (existing?.dataset.loaded === 'true') {
        resolve();
        return;
      }

      // A previous failed or interrupted attempt must never poison a retry.
      if (existing) existing.remove();

      const absoluteSrc = new URL(src, document.baseURI).href;
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.dataset.appSrc = src;

      let settled = false;
      let timer = null;

      const cleanup = () => {
        if (timer) clearTimeout(timer);
        removeEventListener('error', onRuntimeError);
      };

      const finish = (ok, error) => {
        if (settled) return;
        settled = true;
        cleanup();
        if (ok) {
          script.dataset.loaded = 'true';
          resolve();
          return;
        }
        script.dataset.failed = 'true';
        script.remove();
        reject(error || new Error(`Failed to load ${src}`));
      };

      const onRuntimeError = event => {
        if (!event.filename) return;
        let filename;
        try { filename = new URL(event.filename, document.baseURI).href; }
        catch { return; }
        if (filename !== absoluteSrc) return;
        const message = event.message || 'unknown runtime error';
        finish(false, new Error(`Runtime error in ${src}: ${message}`));
      };

      addEventListener('error', onRuntimeError);
      script.addEventListener('load', () => finish(true), { once: true });
      script.addEventListener('error', () => finish(false, new Error(`Failed to load ${src}`)), { once: true });
      timer = setTimeout(
        () => finish(false, new Error(`Timed out loading ${src}`)),
        SCRIPT_LOAD_TIMEOUT_MS
      );
      document.body.appendChild(script);
    });
  }

  function loadApplication() {
    if (applicationPromise) return applicationPromise;
    applicationPromise = (async () => {
      await loadScript('js/content.js');
      if (!window.PORTFOLIO_DATA) throw new Error('Portfolio content failed to initialize.');
      await Promise.all([
        loadScript('js/fixes.js'),
        loadScript('js/portfolio.js')
      ]);
    })().catch(error => {
      applicationPromise = null;
      throw error;
    });
    return applicationPromise;
  }

  function primeTiltPermission() {
    if (!isTouchDevice() || !isSecureContext || !('DeviceOrientationEvent' in window)) {
      return Promise.resolve(null);
    }
    if (typeof DeviceOrientationEvent.requestPermission !== 'function') {
      return Promise.resolve(null);
    }
    if (window.__portfolioTiltPermissionPromise) return window.__portfolioTiltPermissionPromise;
    try {
      const requested = DeviceOrientationEvent.requestPermission();
      window.__portfolioTiltPermissionPromise = Promise.resolve(requested).then(
        permission => {
          window.__portfolioTiltPermission = permission;
          return permission;
        },
        error => {
          window.__portfolioTiltPermission = 'error';
          return 'error';
        }
      );
    } catch (error) {
      window.__portfolioTiltPermission = 'error';
      window.__portfolioTiltPermissionPromise = Promise.resolve('error');
    }
    return window.__portfolioTiltPermissionPromise;
  }

  function loadHead() {
    if (headPromise) return headPromise;
    setRow('head', '06 MODEL', 'loading 3D model / shaders', 'pending');
    headPromise = new Promise(resolve => {
      let settled = false;
      let timer = null;
      const done = detail => {
        if (settled) return;
        settled = true;
        removeEventListener('portfolio:head-settled', onSettled);
        if (timer) clearTimeout(timer);
        headOk = Boolean(detail?.ready);
        setRow('head', '06 MODEL', headOk ? 'model ready' : '3D fallback active', headOk ? 'done' : 'warn');
        resolve(detail || { settled: true, ready: false });
      };
      const onSettled = event => done(event.detail || { settled: true, ready: false });
      const state = window.__portfolioHeadState;
      if (state?.settled) {
        done(state);
        return;
      }
      addEventListener('portfolio:head-settled', onSettled, { once: true });
      timer = setTimeout(() => done({ settled: true, ready: false, error: 'Head initialization timed out.' }), HEAD_READY_TIMEOUT_MS);
      import(new URL('js/head3d.js', document.baseURI).href).catch(error => {
        console.error('3D head module failed to load.', error);
        done({ settled: true, ready: false, error: String(error?.message || error) });
      });
    });
    return headPromise;
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
        document.fonts.load('500 20px "Doto"'),
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

  Promise.allSettled([domReady, fontsReady, pageReady, videoReady]).then(async () => {
    const elapsed = performance.now() - bootStart;
    const remainingLoadingTime = Math.max(0, MIN_LOADING_TITLE_MS - elapsed);
    if (remainingLoadingTime) {
      await new Promise(resolve => setTimeout(resolve, remainingLoadingTime));
    }

    await scrambleTitle('boot.readyTitle');

    resourcesReady = true;
    const note = isTouchDevice()
      ? (isSecureContext ? t('boot.readyNote') : t('boot.readyNoteInsecure'))
      : t('boot.readyNoteDesktop');
    setGate(t('boot.readyStatus'), note);
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

  function beginSequence() {
    if (sequenceStarted || finished) return false;
    sequenceStarted = true;
    loader.classList.add('is-sequencing');
    rowDefs.forEach(([key]) => addRow(key));
    return true;
  }

  function recoverApplicationLoad(error) {
    console.error('Portfolio application failed to load.', error);
    setRow('ready', '07 READY', 'application load failed - retry available', 'warn');

    fatalLoadError = true;
    sequenceStarted = false;
    applicationPromise = null;
    loader.classList.remove('is-sequencing');
    loader.classList.add('is-ready');

    const italian = document.documentElement.lang === 'it';
    setGate(
      italian ? 'ERRORE CARICAMENTO APPLICAZIONE' : 'APPLICATION LOAD ERROR',
      italian
        ? 'Controlla la connessione e clicca RIPROVA per ricaricare il portfolio.'
        : 'Check your connection and click RETRY to reload the portfolio.'
    );
    enter.removeAttribute('data-i18n');
    enter.textContent = italian ? 'RIPROVA' : 'RETRY';
    enter.disabled = false;
    requestAnimationFrame(() => enter.focus({ preventScroll: true }));
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
    if (fatalLoadError) {
      location.reload();
      return;
    }
    if (!resourcesReady || sequenceStarted) return;
    enter.disabled = true;
    if (!beginSequence()) return;

    // On iOS the permission request must begin synchronously inside the user
    // gesture. The result is cached and consumed by head3d once its module loads.
    const permissionPromise = primeTiltPermission();
    const headWork = loadHead();
    const appWork = loadApplication();

    try {
      await appWork;
    } catch (error) {
      recoverApplicationLoad(error);
      return;
    }

    const [headResult, permissionResult] = await Promise.allSettled([
      headWork,
      permissionPromise
    ]);

    if (headResult.status === 'rejected') {
      console.error('3D head initialization failed.', headResult.reason);
      setRow('head', '06 MODEL', '3D fallback active', 'warn');
    }
    if (permissionResult.status === 'rejected') console.warn('Tilt permission initialization failed.', permissionResult.reason);

    if (!headOk) setGate(t('boot.fallbackStatus'), t('boot.fallbackNote'));

    try {
      await requestTiltBeforeEntry();
    } catch (error) {
      console.warn('Tilt initialization failed.', error);
    }

    if ((rowState.get('ready')?.state || 'pending') === 'pending') {
      setRow('ready', '07 READY', 'portfolio environment online', 'done');
    }
    launch();
  });
})();