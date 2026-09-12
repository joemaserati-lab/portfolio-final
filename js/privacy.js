(() => {
  const ACK_KEY = 'portfolioPrivacyAck';
  const i18n = () => window.PortfolioI18n;
  const panel = document.getElementById('privacy-panel');
  const toggle = document.getElementById('privacy-toggle');
  const close = document.getElementById('privacy-close');
  const accept = document.getElementById('privacy-accept');
  const langToggle = document.getElementById('language-toggle');
  if (!panel || !toggle || !close || !accept || !langToggle) return;

  const hasAck = () => {
    try { return localStorage.getItem(ACK_KEY) === '1'; }
    catch { return false; }
  };
  const setAck = () => {
    try { localStorage.setItem(ACK_KEY, '1'); }
    catch {}
  };
  const open = () => {
    panel.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    panel.querySelector('button')?.focus({ preventScroll: true });
  };
  const hide = () => {
    panel.hidden = true;
    toggle.setAttribute('aria-expanded', 'false');
  };

  toggle.addEventListener('click', () => panel.hidden ? open() : hide());
  close.addEventListener('click', hide);
  accept.addEventListener('click', () => { setAck(); window.PortfolioAnalytics?.grant?.(); hide(); });
  langToggle.addEventListener('click', () => i18n()?.toggle());
  addEventListener('keydown', event => { if (event.key === 'Escape' && !panel.hidden) hide(); });
  addEventListener('portfolio:langchange', () => i18n()?.applyStatic(panel));

  const prompt = () => { if (!hasAck()) setTimeout(open, 900); };
  if (document.body.classList.contains('booting')) addEventListener('portfolio:booted', prompt, { once: true });
  else prompt();
})();
