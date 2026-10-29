(() => {
  // Minimal loading state: keep the loading title and progress bar visible for
  // at least two seconds on every visit. No terminal sequence or entry click.
  const loader = document.getElementById('boot-loader');
  const bar = document.getElementById('boot-progress-bar');
  const progress = document.getElementById('boot-progress');
  const title = document.querySelector('#boot-gate h2');
  if (!loader || !bar || !progress || !title) return;

  const MINIMUM_VISIBLE_MS = 2000;
  const HEAD_READY_TIMEOUT_MS = 8000;
  const SCRIPT_LOAD_TIMEOUT_MS = 12000;
  const startedAt = performance.now();
  const touchDevice = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  const t = key => window.PortfolioI18n?.t?.(key) || key;
  let applicationPromise = null;
  let headPromise = null;
  let crtPromise = null;
  let finished = false;
  let progressTarget = 0;
  let progressValue = 0;
  let progressRaf = 0;

  title.textContent = t('boot.title').toUpperCase();
  title.setAttribute('aria-label', title.textContent);
  function drawProgress() {
    const percent = Math.max(0, Math.min(100, progressValue));
    bar.style.transform = `scaleX(${percent / 100})`;
    progress.setAttribute('aria-valuenow', String(Math.round(percent)));
  }
  function animateProgress() {
    const difference = progressTarget - progressValue;
    if (Math.abs(difference) < 0.2) {
      progressValue = progressTarget;
      drawProgress();
      progressRaf = 0;
      return;
    }
    progressValue += difference * 0.24;
    drawProgress();
    progressRaf = requestAnimationFrame(animateProgress);
  }
  function setProgressTarget(next) {
    progressTarget = Math.max(progressTarget, Math.min(next, 100));
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      progressValue = progressTarget;
      drawProgress();
    } else if (!progressRaf) {
      progressRaf = requestAnimationFrame(animateProgress);
    }
  }
  const completedTasks = new Set();
  const progressWeights = { dom: 5, fonts: 10, page: 5, app: 25, head: 55 };
  function completeTask(name) {
    completedTasks.add(name);
    const total = [...completedTasks].reduce((sum, key) => sum + progressWeights[key], 0);
    setProgressTarget(Math.min(96, total));
  }
  function track(name, promise) {
    return Promise.resolve(promise).then(
      result => { completeTask(name); return result; },
      error => { completeTask(name); throw error; }
    );
  }
  setProgressTarget(2);
  const minimumVisible = new Promise(resolve => {
    setTimeout(resolve, Math.max(0, MINIMUM_VISIBLE_MS - (performance.now() - startedAt)));
  });

  function assetUrl(path) {
    const url = new URL(path, document.baseURI);
    url.searchParams.set('v', window.PORTFOLIO_ASSET_VERSION);
    return url.href;
  }
  function loadScript(src) {
    src = assetUrl(src);
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
    headPromise = new Promise(resolve => {
      let settled = false;
      let timer = null;
      const done = detail => {
        if (settled) return;
        settled = true;
        removeEventListener('portfolio:head-settled', onSettled);
        if (timer) clearTimeout(timer);
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
      import(assetUrl('js/head3d.js')).catch(error => {
        console.error('3D head module failed to load.', error);
        done({ settled: true, ready: false, error: String(error?.message || error) });
      });
    });
    return headPromise;
  }

  const domReady = track('dom', new Promise(resolve => {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', resolve, { once: true });
    } else resolve();
  }));
  const fontsReady = track('fonts', document.fonts
    ? Promise.all([
        document.fonts.load('500 20px "Doto"'),
        document.fonts.load('400 16px "Geist Mono"')
      ]).catch(() => {})
    : Promise.resolve());
  const pageReady = track('page', new Promise(resolve => {
    if (document.readyState === 'complete') resolve();
    else addEventListener('load', resolve, { once: true });
  }));
  const ambientVideo = document.querySelector('.crt-background-video');
  function startAmbientVideo() {
    if (!ambientVideo || document.body.classList.contains('project-case-open')) return;
    try {
      ambientVideo.preload = 'auto';
      ambientVideo.play()?.catch(() => {});
    } catch {}
  }
  const applicationReady = track('app', loadApplication());
  const workPath = new URL('work/', document.baseURI).pathname;
  const initialCase = location.pathname.startsWith(workPath) && location.pathname !== workPath;
  const headReady = track('head', initialCase ? Promise.resolve({ready:true,deferred:true}) : domReady.then(loadHead));
  if (initialCase) addEventListener('portfolio:project-closed', () => {
    loadHead();
    if (touchDevice) scheduleDeferredTouchVisuals();
    else { startAmbientVideo(); loadCrtRuntime(); }
  }, { once: true });

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
      const run = () => { if (!document.body.classList.contains('project-case-open')) loadCrtRuntime(); };

      if ('requestIdleCallback' in window) {
        requestIdleCallback(run, { timeout: 6000 });
      } else {
        run();
      }
    };

    // CRT noise/video may remain deferred on touch; the hero head itself is
    // already ready before the page is revealed.
    setTimeout(startCrt, 900);
  }

  function dismissLoader() {
    loader.classList.add('done');
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
      loader.remove();
      return;
    }
    loader.addEventListener('transitionend', event => {
      if (event.target === loader && event.propertyName === 'opacity') loader.remove();
    }, { once: true });
    // A non-animated browser must not leave a hidden overlay in the DOM.
    setTimeout(() => loader.remove(), 500);
  }
  function reveal() {
    if (finished) return;
    finished = true;
    document.body.classList.remove('booting', 'entry-prewarm', 'site-entering');
    document.body.classList.add('site-ready');
    window.dispatchEvent(new CustomEvent('portfolio:booted'));
    window.dispatchEvent(new CustomEvent('portfolio:site-ready'));
    scheduleDeferredCovers();
    scheduleDeferredTouchVisuals();
    dismissLoader();
  }
  async function fallback(error) {
    await minimumVisible;
    console.error('Portfolio application failed to load.', error);
    document.body.classList.remove('booting', 'entry-prewarm', 'site-entering');
    document.body.classList.add('reader-mode');
    document.documentElement.classList.remove('returning-visit');
    loader.remove();
  }
  (async () => {
    try {
      await Promise.all([applicationReady, domReady, headReady]);
      await minimumVisible;
      setProgressTarget(100);
      progressValue = 100;
      drawProgress();
      try { sessionStorage.setItem('portfolioBootSeen', '1'); } catch {}
      try { localStorage.setItem('portfolioBootSeen', '1'); } catch {}
      reveal();
    } catch (error) {
      await fallback(error);
    }
  })();
  // Fonts and passive page resources continue loading, but do not hold up the
  // application once its runtime and first 3D frame are available.
  void fontsReady;
  void pageReady;
})();
