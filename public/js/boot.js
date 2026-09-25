(() => {
  // Initial CLS sources are captured by the Playwright performance audit.
  // Touch entry timing is validated in CI with mobile/touch emulation.
  // Post-entry timing is verified by the Lighthouse workflow (click-scoped long-task measurement).
  const loader = document.getElementById('boot-loader');
  const out = document.getElementById('boot-output');
  const enter = document.getElementById('boot-enter');
  const gateTitle = document.querySelector('#boot-gate h2');
  const gateStatus = document.getElementById('boot-gate-status');
  const gateNote = document.getElementById('boot-gate-note');
  const progress = document.getElementById('boot-progress');
  const progressBar = document.getElementById('boot-progress-bar');
  if (!loader || !out || !enter || !gateTitle || !gateStatus || !progress || !progressBar) return;

  const bootStart = performance.now();
  const BOOT_SEEN_KEY = 'portfolioBootSeen';
  const returningVisit = document.documentElement.classList.contains('returning-visit');
  const MIN_VISIBLE_MS = 1300;
  const TITLE_SCRAMBLE_MS = 700;
  const TITLE_SCRAMBLE_STEP_MS = 42;
  const SCRAMBLE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&@';
  const READY_HOLD_MS = 40;
  const ROW_STEP_MS = 55;
  const HEAD_READY_TIMEOUT_MS = 12000;
  const SCRIPT_LOAD_TIMEOUT_MS = 12000;
  const i18n = window.PortfolioI18n;
  const t = key => i18n?.t?.(key) || key;
  const isTouchDevice = () => Boolean(i18n?.isTouchDevice?.()) || matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const touchDevice = isTouchDevice();
  let finished = false;
  let sequenceStarted = false;
  let resourcesReady = false;
  let headOk = false;
  let applicationPromise = null;
  let headPromise = null;
  let crtPromise = null;
  let fatalLoadError = false;

  const progressWeights = new Map([
    ['dom', 5],
    ['fonts', 10],
    ['page', 5],
    ['video', 5],
    ['app', 15],
    ['covers', 10],
    ['head', 50]
  ]);
  const completedProgressTasks = new Set();
  let progressTarget = 0;
  let progressValue = 0;
  let progressRaf = 0;
  let progressDoneResolve = null;

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

  function getStableTitleParts() {
    let anchor = gateTitle.querySelector('.boot-title-anchor');
    let scramble = gateTitle.querySelector('.boot-title-scramble');

    if (!anchor || !scramble) {
      anchor = document.createElement('span');
      anchor.className = 'boot-title-anchor';
      anchor.setAttribute('aria-hidden', 'true');

      scramble = document.createElement('span');
      scramble.className = 'boot-title-scramble';
      scramble.setAttribute('aria-hidden', 'true');

      gateTitle.replaceChildren(anchor, scramble);
    }

    return { anchor, scramble };
  }

  function setTitle(key) {
    const target = t(key).toUpperCase();
    const { anchor, scramble } = getStableTitleParts();
    gateTitle.setAttribute('aria-label', target);
    anchor.textContent = target;
    scramble.textContent = target;
  }

  function scrambleTitle(key) {
    const target = t(key).toUpperCase();
    const { anchor, scramble } = getStableTitleParts();

    gateTitle.setAttribute('aria-label', target);
    anchor.textContent = target;

    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      scramble.textContent = target;
      return Promise.resolve();
    }

    const revealAt = [...target].map(char => char === ' ' ? 0 : 0.2 + Math.random() * 0.72);

    return new Promise(resolve => {
      const startTime = performance.now();
      let lastPaint = 0;

      const paint = now => {
        const progress = Math.min(1, (now - startTime) / TITLE_SCRAMBLE_MS);

        if (progress === 1 || now - lastPaint >= TITLE_SCRAMBLE_STEP_MS) {
          lastPaint = now;
          scramble.textContent = [...target].map((char, index) => {
            if (char === ' ') return ' ';
            if (progress >= revealAt[index]) return char;
            return SCRAMBLE_CHARS[Math.floor(Math.random() * SCRAMBLE_CHARS.length)];
          }).join('');
        }

        if (progress < 1) {
          requestAnimationFrame(paint);
          return;
        }

        scramble.textContent = target;
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
      gateNote.hidden = !note;
    }
  }

  function renderProgress() {
    progressBar.style.transform = `scaleX(${Math.max(0, Math.min(1, progressValue / 100))})`;
  }

  function animateProgress() {
    const delta = progressTarget - progressValue;
    if (Math.abs(delta) <= 0.12) {
      progressValue = progressTarget;
      renderProgress();
      progressRaf = 0;
      if (progressValue >= 100 && progressDoneResolve) {
        const resolve = progressDoneResolve;
        progressDoneResolve = null;
        resolve();
      }
      return;
    }
    progressValue += delta * 0.24;
    renderProgress();
    progressRaf = requestAnimationFrame(animateProgress);
  }

  function setProgressTarget(value) {
    progressTarget = Math.max(progressTarget, Math.min(100, value));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      progressValue = progressTarget;
      renderProgress();
      if (progressValue >= 100 && progressDoneResolve) {
        const resolve = progressDoneResolve;
        progressDoneResolve = null;
        resolve();
      }
      return;
    }
    if (!progressRaf) progressRaf = requestAnimationFrame(animateProgress);
  }

  function completeProgressTask(key) {
    if (completedProgressTasks.has(key)) return;
    completedProgressTasks.add(key);
    let total = 0;
    completedProgressTasks.forEach(task => {
      total += progressWeights.get(task) || 0;
    });
    setProgressTarget(Math.min(96, total));
  }

  function trackProgress(key, promise) {
    return Promise.resolve(promise).then(
      value => {
        completeProgressTask(key);
        return value;
      },
      error => {
        completeProgressTask(key);
        throw error;
      }
    );
  }

  function finishProgress() {
    setProgressTarget(100);
    if (progressValue >= 99.88) return Promise.resolve();
    return new Promise(resolve => {
      progressDoneResolve = resolve;
    });
  }

  setTitle('boot.title');

  setProgressTarget(1.5);

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

  function loadCrtRuntime() {
    if (crtPromise) return crtPromise;
    crtPromise = loadScript('js/crt.js').catch(error => {
      crtPromise = null;
      console.warn('CRT runtime failed to load.', error);
      return { ok: false, error };
    });
    return crtPromise;
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

  function preloadImage(src) {
    return new Promise(resolve => {
      const image = new Image();
      image.decoding = 'async';
      const done = async ok => {
        image.onload = null;
        image.onerror = null;
        if (ok && typeof image.decode === 'function') {
          try { await image.decode(); } catch {}
        }
        resolve({ ok, src });
      };
      image.onload = () => done(true);
      image.onerror = () => done(false);
      image.src = src;
      if (image.complete) done(image.naturalWidth > 0);
    });
  }

  async function preloadPortfolioImages() {
    const covers = [...new Set(
      (window.PORTFOLIO_DATA?.projects || [])
        .map(project => project?.cover)
        .filter(Boolean)
    )];
    if (!covers.length) return { ok: true, count: 0 };
    const results = await Promise.all(covers.map(preloadImage));
    return {
      ok: results.every(result => result.ok),
      count: results.length
    };
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

  if (gateNote && !touchDevice) gateNote.setAttribute('aria-hidden', 'true');

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

  const ambientVideo = document.querySelector('.crt-background-video');
  const videoReady = Promise.resolve({ ok: true, deferred: true }).then(value => {
    setRow('video', '05 SIGNAL', 'deferred until entry', 'done');
    return value;
  });

  function startAmbientVideo() {
    if (!ambientVideo) return;
    try {
      ambientVideo.preload = 'auto';
      const playing = ambientVideo.play();
      if (playing?.catch) playing.catch(() => {});
    } catch {}
  }

  const trackedDomReady = trackProgress('dom', domReady);
  const trackedFontsReady = trackProgress('fonts', fontsReady);
  const trackedPageReady = trackProgress('page', pageReady);
  const trackedVideoReady = trackProgress('video', videoReady);

  // Start the real application work immediately, behind the opaque loader.
  // The enter button is enabled only after the interface, project covers and
  // 3D pipeline have settled, so the terminal boot remains purely scenic.
  const applicationReady = trackProgress('app', loadApplication());
  // Project covers are not required to enter the homepage. Mark the loader
  // task complete immediately and decode covers later during browser idle time.
  const coversReady = trackProgress('covers', Promise.resolve({ ok: true, deferred: true }));
  // The 3D head is an enhancement, not a prerequisite for first paint.
  // Load it only when the user signals intent to enter the portfolio.
  const eagerHead = false;
  const headReady = Promise.resolve({ ok: true, deferred: true });
  setRow('head', '06 MODEL', 'deferred until entry', 'done');

  function scheduleDeferredHead() {
    if (headPromise) return;
    const start = () => {
      loadHead()
        .then(() => window.PortfolioMotion?.enableTouchFallback?.())
        .catch(error => console.warn('Deferred 3D head load failed.', error));
    };
    if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 1800 });
    else setTimeout(start, 650);
  }

  function scheduleDeferredCovers() {
    const start = () => {
      preloadPortfolioImages().catch?.(() => {});
    };
    setTimeout(() => {
      if ('requestIdleCallback' in window) requestIdleCallback(start, { timeout: 6000 });
      else start();
    }, 900);
  }

  function scheduleDeferredTouchVisuals() {
    const startCrt = () => {
      startAmbientVideo();
      const run = async () => {
        await loadCrtRuntime();

        // Never chain the heavier 3D initialization directly after CRT.
        // Wait for another stable idle window so user interaction wins.
        setTimeout(() => {
          if ('requestIdleCallback' in window) {
            requestIdleCallback(() => scheduleDeferredHead(), { timeout: 6000 });
          } else {
            scheduleDeferredHead();
          }
        }, 900);
      };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(run, { timeout: 6000 });
      } else {
        run();
      }
    };

    // Keep the entry/reveal completely free of decorative WebGL startup.
    setTimeout(startCrt, 1400);
  }

  (async () => {
    try {
      await applicationReady;
    } catch (error) {
      recoverApplicationLoad(error);
      return;
    }

    await Promise.allSettled([
      trackedDomReady,
      trackedFontsReady,
      trackedPageReady,
      trackedVideoReady,
      coversReady,
      headReady
    ]);

    await finishProgress();
    loader.classList.add('is-loaded');
    resourcesReady = true;

    if (returningVisit) {
      startAmbientVideo();
      launch(true);
      if (touchDevice) scheduleDeferredTouchVisuals();
      else {
        loadCrtRuntime();
        scheduleDeferredHead();
      }
      return;
    }

    // Let the completed bar disappear before changing the loader copy.
    await new Promise(resolve => setTimeout(resolve, 180));
    await scrambleTitle('boot.readyTitle');

    const note = isTouchDevice()
      ? t('boot.readyNote')
      : t('boot.readyNoteDesktop');
    setGate(t('boot.readyStatus'), note);
    loader.classList.add('is-ready');
    enter.disabled = false;
    enter.focus({ preventScroll: true });

  })();

  async function enableTouchFallbackBeforeEntry() {
    if (!isTouchDevice()) {
      setRow('ready', '07 READY', 'desktop pointer mode / launching sequence', 'done');
      return;
    }
    const enabled = Boolean(window.PortfolioMotion?.enableTouchFallback?.());
    setRow(
      'ready',
      '07 READY',
      enabled ? 'touch + ambient motion enabled' : 'touch mode / launching sequence',
      enabled ? 'done' : 'warn'
    );
  }

  function beginSequence() {
    if (sequenceStarted || finished) return false;
    sequenceStarted = true;
    loader.classList.add('is-sequencing');
    if (touchDevice) document.body.classList.add('entry-prewarm');
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

  function launch(fast = false) {
    if (finished) return;
    finished = true;

    const elapsed = performance.now() - bootStart;
    const rowSequenceFloor = 120 + (rowDefs.length - 1) * ROW_STEP_MS + 180;
    const remainingToMinimum = Math.max(0, MIN_VISIBLE_MS - elapsed);
    const remainingToRows = Math.max(0, rowSequenceFloor);
    const holdBeforeRelease = fast ? 0 : Math.max(remainingToMinimum, remainingToRows) + READY_HOLD_MS;

    setTimeout(() => {
      if (!touchDevice) document.body.classList.remove('booting');

      if (fast) {
        if (touchDevice) document.body.classList.remove('booting','entry-prewarm');
        document.body.classList.add('site-ready');
        window.dispatchEvent(new CustomEvent('portfolio:booted'));
        loader.classList.add('done');
        setTimeout(() => loader.remove(), 500);
        return;
      }

      document.body.classList.add('site-entering');
      if (!touchDevice) window.dispatchEvent(new CustomEvent('portfolio:booted'));

      requestAnimationFrame(() => {
        requestAnimationFrame(() => loader.classList.add('done'));
      });

      setTimeout(() => {
        document.body.classList.remove('site-entering');
        if (touchDevice) document.body.classList.remove('booting','entry-prewarm');
        document.body.classList.add('site-ready');
        if (touchDevice) window.dispatchEvent(new CustomEvent('portfolio:booted'));
        window.dispatchEvent(new CustomEvent('portfolio:site-ready'));
        scheduleDeferredCovers();
        if (touchDevice) scheduleDeferredTouchVisuals();
      }, 760);

      setTimeout(() => loader.remove(), 640);
    }, holdBeforeRelease);
  }

  // Desktop users usually hover before clicking: use that moment to warm the
  // expensive visual layer without putting it back in the critical path.
  enter.addEventListener('pointerenter', () => {
    if (touchDevice) return;
    loadCrtRuntime();
    loadHead().catch(error => console.warn('3D prewarm failed.', error));
  }, { once: true, passive: true });

  enter.addEventListener('click', async () => {
    if (fatalLoadError) {
      location.reload();
      return;
    }
    if (!resourcesReady || sequenceStarted) return;
    enter.disabled = true;

    if (!beginSequence()) return;

    // Start decorative media only after the user has chosen to enter.
    // They warm while the terminal sequence is already covering the shell.
    if (!touchDevice) {
      startAmbientVideo();
      loadCrtRuntime();
    }

    if (!headPromise && !touchDevice) {
      loadHead()
        .catch(error => console.warn('3D head load failed.', error));
    }

    if (touchDevice) {
      setRow('ready', '07 READY', 'touch mode / launching sequence', 'done');
    } else {
      setRow('ready', '07 READY', 'desktop pointer mode / launching sequence', 'done');
    }

    if ((rowState.get('ready')?.state || 'pending') === 'pending') {
      setRow('ready', '07 READY', 'portfolio environment online', 'done');
    }
    try { sessionStorage.setItem(BOOT_SEEN_KEY, '1'); } catch {}
    launch();
  });
})();