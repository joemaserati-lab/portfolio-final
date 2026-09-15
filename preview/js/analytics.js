(() => {
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  const CONSENT_KEY = 'portfolioAnalyticsConsent';
  const isConfigured = /^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
  let loaded = false;

  function hasConsent() {
    try { return localStorage.getItem(CONSENT_KEY) === 'granted'; }
    catch { return false; }
  }

  function setConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value ? 'granted' : 'denied'); }
    catch {}
  }

  function load() {
    if (!isConfigured || loaded || !hasConsent()) return false;
    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    document.head.appendChild(script);
    return true;
  }

  window.PortfolioAnalytics = {
    measurementId: GA_MEASUREMENT_ID,
    get configured() { return isConfigured; },
    get loaded() { return loaded; },
    get consent() { return hasConsent(); },
    grant() { setConsent(true); return load(); },
    deny() { setConsent(false); }
  };

  load();
})();
