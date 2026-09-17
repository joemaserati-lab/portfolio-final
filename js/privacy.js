(() => {
  const CONSENT_KEY = 'analyticsConsent';
  const panel = document.getElementById('privacy-panel');
  const toggle = document.getElementById('privacy-toggle');
  const status = document.getElementById('privacy-status');
  const accept = document.getElementById('privacy-accept');
  const reject = document.getElementById('privacy-reject');
  const revoke = document.getElementById('privacy-revoke');
  const close = document.getElementById('privacy-close');

  if (!panel || !toggle || !status || !accept || !reject || !revoke || !close) return;

  const i18n = window.PortfolioI18n;
  const lang = () => i18n?.lang === 'it' ? 'it' : 'en';

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

  const readConsent = () => {
    try { return localStorage.getItem(CONSENT_KEY); }
    catch { return null; }
  };

  const writeConsent = value => {
    try { localStorage.setItem(CONSENT_KEY, value); }
    catch {}
  };

  const getLabel = state => labels[lang()][state] || labels.en[state];

  function updateState() {
    const consent = readConsent();
    if (consent === 'granted') {
      status.textContent = getLabel('granted');
      accept.hidden = true;
      reject.hidden = true;
      revoke.hidden = false;
      return;
    }
    if (consent === 'denied') {
      status.textContent = getLabel('denied');
      accept.hidden = false;
      reject.hidden = true;
      revoke.hidden = false;
      return;
    }
    status.textContent = getLabel('unset');
    accept.hidden = false;
    reject.hidden = false;
    revoke.hidden = true;
  }

  function setOpen(open) {
    panel.hidden = !open;
    toggle.setAttribute('aria-expanded', String(open));
  }

  toggle.addEventListener('click', () => setOpen(panel.hidden));
  close.addEventListener('click', () => setOpen(false));

  accept.addEventListener('click', () => {
    writeConsent('granted');
    window.dispatchEvent(new CustomEvent('portfolio:analytics-consent', { detail: { consent: 'granted' } }));
    updateState();
  });

  reject.addEventListener('click', () => {
    writeConsent('denied');
    window.dispatchEvent(new CustomEvent('portfolio:analytics-consent', { detail: { consent: 'denied' } }));
    updateState();
  });

  revoke.addEventListener('click', () => {
    writeConsent('denied');
    window.dispatchEvent(new CustomEvent('portfolio:analytics-consent', { detail: { consent: 'denied' } }));
    updateState();
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !panel.hidden) {
      setOpen(false);
      toggle.focus({ preventScroll: true });
    }
  });

  window.addEventListener('portfolio:langchange', updateState);
  updateState();
})();