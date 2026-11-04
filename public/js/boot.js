(() => {
  // Reveal both desktop and mobile as soon as their required resources are ready.
  // Desktop still waits for the actual first 3D head frame; mobile paints a
  // responsive poster while 3D finishes in parallel.
  const loader = document.getElementById('boot-loader');
  const bar = document.getElementById('boot-progress-bar');
  const progress = document.getElementById('boot-progress');
  const title = document.querySelector('#boot-gate h2');
  if (!loader || !bar || !progress || !title) return;

  const mobileLayout = matchMedia('(max-width: 1024px)');
  const HEAD_READY_TIMEOUT_MS = 8000;
  const FONT_READY_TIMEOUT_MS = 9000;
  const SCRIPT_LOAD_TIMEOUT_MS = 12000;
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
  const fontsReady = track('fonts', (async () => {
    const root = document.documentElement;
    const wanted = [
      ['400 20px "Doto"','PORTFOLIO LOADING'],
      ['500 20px "Doto"','PORTFOLIO LOADING'],
      ['600 48px "Doto"','EDOARDO RAPPANELLO'],
      ['700 48px "Doto"','EDOARDO RAPPANELLO'],
      ['400 17px "JetBrains Mono"','Graphic design and digital marketing'],
      ['500 17px "JetBrains Mono"','GRAPHIC DESIGNER'],
      ['600 17px "JetBrains Mono"','PROJECTS'],
      ['700 17px "JetBrains Mono"','Selected works']
    ];
    let timer;
    try {
      if (!document.fonts) throw new Error('FontFaceSet unavailable');
      const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Typography loading exceeded 9 seconds')), FONT_READY_TIMEOUT_MS);
      });
      await Promise.race([
        Promise.all(wanted.map(async ([descriptor,sample]) => {
          const faces = await document.fonts.load(descriptor,sample);
          if (!faces.length || !faces.every(face => face.status === 'loaded'))
            throw new Error('Font face not available: '+descriptor);
        })),
        timeout
      ]);
      // The required Doto/Geist faces are already verified above. Do not
      // allow unrelated, slow stylesheet font requests to keep the loader
      // hidden forever on weak connections; use the same 9-second deadline.
      if (!mobileLayout.matches) await Promise.race([document.fonts.ready, timeout]);
      root.classList.remove('fonts-pending');
      root.classList.add('fonts-ready');
      return {source:'Doto + JetBrains Mono'};
    } catch (error) {
      console.warn('Web fonts unavailable; using bundled Doto without system fallback.',error);
      // The locally hosted Doto font has a compatible visual identity, and is
      // available even when fonts.googleapis.com or fonts.gstatic.com is down.
      if (document.fonts) {
        const faces = await document.fonts.load('500 18px "Doto Fallback"','PORTFOLIO LOADING');
        if (!faces.length || !faces.every(face => face.status==='loaded'))
          throw new Error('The local Doto font also failed to load; do not reveal substitute fonts.');
      } else {
        throw new Error('No font loader available; avoid exposing system fonts.');
      }
      root.classList.add('fonts-local-fallback');
      root.classList.remove('fonts-pending');
      root.classList.add('fonts-ready');
      return {source:'bundled Doto',reason:String(error)};
    } finally {
      clearTimeout(timer);
    }
  })());
  const pageReady = track('page', new Promise(resolve => {
    if (document.readyState === 'complete') resolve();
    else addEventListener('load', resolve, { once: true });
  }));
  const ambientVideo = document.querySelector('.crt-background-video');
  function startAmbientVideo() {
    if (!ambientVideo || mobileLayout.matches || document.body.classList.contains('project-case-open')) return;
    try {
      const source = ambientVideo.querySelector('source[data-src]');
      if (source && !source.hasAttribute('src')) {
        source.src = source.dataset.src;
        ambientVideo.load();
      }
      ambientVideo.preload = 'auto';
      ambientVideo.play()?.catch(() => {});
    } catch {}
  }
  mobileLayout.addEventListener('change', () => {
    if (!ambientVideo) return;
    if (mobileLayout.matches) {
      ambientVideo.pause();
      ambientVideo.preload = 'none';
      ambientVideo.querySelector('source')?.removeAttribute('src');
      ambientVideo.load();
    } else startAmbientVideo();
  });
  const applicationReady = track('app', loadApplication());
  const workPath = new URL('work/', document.baseURI).pathname;
  const initialCase = location.pathname.startsWith(workPath) && location.pathname !== workPath;
  // Decode the 14 KB ambient video behind the existing opaque loader rather
  // than starting its request ~900 ms after reveal. This retains the same video
  // and all desktop CRT effects. Mobile never attaches the ambient source.
  // Direct project pages keep the original deferred-video behavior.
  if (!initialCase) startAmbientVideo();
  const headReady = track('head', initialCase ? Promise.resolve({ready:true,deferred:true}) : domReady.then(loadHead));
  if (initialCase) addEventListener('portfolio:project-closed', () => {
    loadHead();
    if (touchDevice) scheduleDeferredTouchVisuals();
    else { startAmbientVideo(); loadCrtRuntime(); }
  }, { once: true });

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

    // Mobile paints the poster and DOM first; the 3D head may initialize afterward.
    // Ambient CRT effects remain deferred on touch to avoid competing with the hero.
    setTimeout(startCrt, 900);
  }

  function completeReveal() {
    // Do not activate homepage listeners, previews or CRT runtime until the
    // ignition has ended. Commit the state and remove the opaque curtain in
    // the same task: the first visible frame is the complete portfolio.
    document.body.classList.remove('booting');
    document.body.classList.add('site-ready');
    window.dispatchEvent(new CustomEvent('portfolio:booted'));
    window.dispatchEvent(new CustomEvent('portfolio:site-ready'));
    scheduleDeferredTouchVisuals();
    loader.remove();
  }
  function dismissLoader() {
    // The loader is the opaque CRT signal curtain. Keep it on top while the
    // original degauss line plays; the prepared homepage must NEVER appear
    // between the loading screen and the end of the ignition animation.
    if (initialCase || matchMedia('(prefers-reduced-motion: reduce)').matches) {
      completeReveal();
      return;
    }
    let completed = false;
    let fallbackTimer;
    const finish = () => {
      if (completed) return;
      completed = true;
      clearTimeout(fallbackTimer);
      completeReveal();
    };
    const beam = loader.querySelector('.boot-signal-line');
    beam?.addEventListener('animationend', event => {
      if (event.target === beam && event.animationName === 'crtDegaussLine') finish();
    });
    // The loader stays fully opaque until the 340 ms signal has completed.
    // Guard against disabled animations or throttled browser events.
    loader.classList.add('crt-boot-degauss');
    fallbackTimer = setTimeout(finish, 430);
  }
  function reveal() {
    if (finished) return;
    finished = true;
    dismissLoader();
  }
  async function fallback(error) {
    // Fallback reader content is text too: never expose browser fonts.
    await fontsReady;
    console.error('Portfolio application failed to load.', error);
    document.body.classList.remove('booting');
    document.body.classList.add('reader-mode');
    document.documentElement.classList.remove('returning-visit');
    loader.remove();
  }
  (async () => {
    try {
      // No artificial visible minimum on any device. Desktop still gates
      // on the first 3D frame; mobile reveals its poster immediately after
      // app/DOM/fonts readiness without waiting for WebGL.
      if (mobileLayout.matches && !initialCase) {
        await Promise.all([applicationReady, domReady, fontsReady]);
      } else {
        await Promise.all([applicationReady, domReady, fontsReady, ...(mobileLayout.matches && !initialCase ? [] : [headReady])]);
      }
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
  // Page resources can remain passive; correct typography is an explicit
  // precondition of revealing the loader title or the application.
  void pageReady;
})();
