(() => {
  const STORAGE_KEY = 'portfolio-analytics-consent';
  const panel = document.getElementById('privacy-panel');
  const toggle = document.getElementById('privacy-toggle');
  const close = document.getElementById('privacy-close');
  const accept = document.getElementById('privacy-accept');
  const reject = document.getElementById('privacy-reject');
  const revoke = document.getElementById('privacy-revoke');
  const status = document.getElementById('privacy-status');

  if (!panel || !toggle || !close || !accept || !reject || !revoke || !status) return;

  const labels = {
    en: {
      unset: 'ANALYTICS: NOT SET',
      granted: 'ANALYTICS: ENABLED',
      denied: 'ANALYTICS: DISABLED'
    },
    it: {
      unset: 'ANALYTICS: NON IMPOSTATO',
      granted: 'ANALYTICS: ATTIVO',
      denied: 'ANALYTICS: DISATTIVATO'
    }
  };

  const currentLang = () => window.PortfolioI18n?.lang === 'it' ? 'it' : 'en';
  const label = key => labels[currentLang()][key] || labels.en[key];

  const readConsent = () => {
    try { return localStorage.getItem(STORAGE_KEY); }
    catch { return null; }
  };

  const saveConsent = value => {
    try { localStorage.setItem(STORAGE_KEY, value); }
    catch {}
  };

  const emitConsent = value => {
    window.dispatchEvent(new CustomEvent('portfolio:analytics-consent', { detail: { consent: value } }));
  };

  function sync() {
    const consent = readConsent();
    if (consent === 'granted') {
      status.textContent = label('granted');
      accept.hidden = true;
      reject.hidden = true;
      revoke.hidden = false;
      return;
    }
    if (consent === 'denied') {
      status.textContent = label('denied');
      accept.hidden = false;
      reject.hidden = true;
      revoke.hidden = false;
      return;
    }
    status.textContent = label('unset');
    accept.hidden = false;
    reject.hidden = false;
    revoke.hidden = true;
  }

  function openPanel() {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    close.focus({ preventScroll: true });
  }

  function closePanel() {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  }

  toggle.addEventListener('click', () => panel.hidden ? openPanel() : closePanel());
  close.addEventListener('click', () => {
    closePanel();
    toggle.focus({ preventScroll: true });
  });

  accept.addEventListener('click', () => {
    saveConsent('granted');
    emitConsent('granted');
    sync();
  });

  reject.addEventListener('click', () => {
    saveConsent('denied');
    emitConsent('denied');
    sync();
  });

  revoke.addEventListener('click', () => {
    saveConsent('denied');
    emitConsent('denied');
    sync();
  });

  document.addEventListener('keydown', event => {
    if (event.key !== 'Escape' || panel.hidden) return;
    closePanel();
    toggle.focus({ preventScroll: true });
  });

  window.addEventListener('portfolio:langchange', sync);
  sync();
})();