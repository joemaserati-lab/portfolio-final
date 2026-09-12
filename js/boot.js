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
  let finished = false;
  let sequenceStarted = false;
  let resourcesReady = false;
  let headOk = false;

  const rows = new Map();
  const rowOrder = [];
  const rowState = new Map();
  const rowDefs = [
    ['init', '01 INIT', 'opening visual workspace', 'done'],
    ['dom', '02 DOM', 'building interface', 'pending'],
    ['fonts', '03 TYPE', 'loading display / system fonts', 'pending'],
    ['page', '04 ASSETS', 'loading page resources', 'pending'],
    ['video', '05 SIGNAL', 'buffering CRT ambient layer', 'pending'],
    ['head', '06 MODEL', 'loading 3D head / shader stack', 'pending'],
    ['ready', '07 READY', 'waiting for user entry', 'pending']
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
    gateStatus.textContent = text;
    if (gateNote && note) gateNote.textContent = note;
  }

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
      setRow('fonts', '03 TYPE', 'fonts loaded', 'done');
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
    setRow('page', '04 ASSETS', 'page resources loaded', 'done');
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
      setRow('video', '05 SIGNAL', 'CRT signal buffered', 'done');
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
      setRow('video', '05 SIGNAL', ok ? 'CRT signal buffered' : 'CRT signal fallback', ok ? 'done' : 'warn');
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
    const state = window.__portfolioHeadState;
    if (state?.settled) {
      headOk = Boolean(state.ready);
      setRow('head', '06 MODEL', state.ready ? '3D model / shaders ready' : '3D fallback armed', state.ready ? 'done' : 'warn');
      resolve(state);
      return;
    }
    const onSettled = event => {
      const detail = event.detail || { settled: true, ready: false };
      headOk = Boolean(detail.ready);
      setRow('head', '06 MODEL', detail.ready ? '3D model / shaders ready' : '3D fallback armed', detail.ready ? 'done' : 'warn');
      resolve(detail);
    };
    addEventListener('portfolio:head-settled', onSettled, { once: true });
  });

  Promise.allSettled([domReady, fontsReady, pageReady, videoReady, headReady]).then(() => {
    resourcesReady = true;
    if (!headOk) {
      setGate('3D HEAD UNAVAILABLE', 'The site is waiting for the required visual system. Check console for details.');
      return;
    }
    loader.classList.add('is-ready');
    enter.disabled = false;
    setGate('SYSTEM READY', isSecureContext ? 'Click to enter. Mobile tilt permission may be requested.' : 'Click to enter. Tilt requires HTTPS on mobile.');
    enter.focus({ preventScroll: true });
  });

  async function requestTiltBeforeEntry() {
    const tilt = window.PortfolioTilt;
    if (!tilt || !tilt.canRequest?.()) return;
    setGate('REQUESTING TILT ACCESS', 'Use the browser prompt to allow motion sensor interaction.');
    const result = await tilt.request();
    if (result === 'granted' || result === 'active') setRow('ready', '07 READY', 'tilt enabled / launching sequence', 'done');
    else setRow('ready', '07 READY', 'tilt unavailable / launching sequence', 'warn');
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
    if (!resourcesReady || !headOk || sequenceStarted) return;
    enter.disabled = true;
    try { await requestTiltBeforeEntry(); }
    finally { startSequence(); }
  });
})();
