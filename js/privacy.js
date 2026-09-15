(() => {
  const ACK_KEY = 'portfolioPrivacyAck';
  const i18n = () => window.PortfolioI18n;
  const analytics = () => window.PortfolioAnalytics;
  const panel = document.getElementById('privacy-panel');
  const toggle = document.getElementById('privacy-toggle');
  const close = document.getElementById('privacy-close');
  const accept = document.getElementById('privacy-accept');
  const reject = document.getElementById('privacy-reject');
  const revoke = document.getElementById('privacy-revoke');
  const status = document.getElementById('privacy-status');
  const langToggle = document.getElementById('language-toggle');
  if (!panel || !toggle || !close || !accept || !reject || !revoke || !status || !langToggle) return;

  const TEXT = {
    en: {
      reject: 'REJECT ANALYTICS',
      revoke: 'REVOKE CONSENT',
      unset: 'ANALYTICS: NOT SET',
      granted: 'ANALYTICS: ACCEPTED',
      denied: 'ANALYTICS: REJECTED'
    },
    it: {
      reject: 'RIFIUTA ANALYTICS',
      revoke: 'REVOCA CONSENSO',
      unset: 'ANALYTICS: NON IMPOSTATI',
      granted: 'ANALYTICS: ACCETTATI',
      denied: 'ANALYTICS: RIFIUTATI'
    }
  };

  const hasAck = () => {
    try { return localStorage.getItem(ACK_KEY) === '1'; }
    catch { return false; }
  };

  const setAck = () => {
    try { localStorage.setItem(ACK_KEY, '1'); }
    catch {}
  };

  function currentText() {
    return TEXT[i18n()?.lang === 'it' ? 'it' : 'en'];
  }

  function renderState() {
    const text = currentText();
    const state = analytics()?.consentState || 'unset';

    reject.textContent = text.reject;
    revoke.textContent = text.revoke;
    status.textContent = text[state] || text.unset;

    accept.hidden = state === 'granted';
    reject.hidden = state === 'denied' || state === 'granted';
    revoke.hidden = state !== 'granted';
  }

  const open = () => {
    renderState();
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    panel.querySelector('.privacy-actions button:not([hidden])')?.focus({ preventScroll: true });
  };

  const hide = () => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => panel.hidden ? open() : hide());
  close.addEventListener('click', hide);

  accept.addEventListener('click', () => {
    setAck();
    analytics()?.grant?.();
    renderState();
    hide();
  });

  reject.addEventListener('click', () => {
    setAck();
    analytics()?.deny?.();
    renderState();
    hide();
  });

  revoke.addEventListener('click', () => {
    setAck();
    analytics()?.revoke?.();
    renderState();
  });

  langToggle.addEventListener('click', () => i18n()?.toggle());
  addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) hide(); });
  addEventListener('portfolio:langchange', () => {
    i18n()?.applyStatic(panel);
    renderState();
  });

  const prompt = () => {
    renderState();
    if (!hasAck()) setTimeout(open, 900);
  };

  if (document.body.classList.contains('booting')) addEventListener('portfolio:booted', prompt, { once: true });
  else prompt();
})();
