(() => {
  const GA_MEASUREMENT_ID = 'G-XXXXXXXXXX';
  const CONSENT_KEY = 'portfolioAnalyticsConsent';
  const isConfigured = /^G-[A-Z0-9]+$/.test(GA_MEASUREMENT_ID) && GA_MEASUREMENT_ID !== 'G-XXXXXXXXXX';
  let loaded = false;

  function readConsentState() {
    try {
      const value = localStorage.getItem(CONSENT_KEY);
      return value === 'granted' || value === 'denied' ? value : 'unset';
    } catch {
      return 'unset';
    }
  }

  function writeConsentState(state) {
    try {
      if (state === 'granted' || state === 'denied') localStorage.setItem(CONSENT_KEY, state);
      else localStorage.removeItem(CONSENT_KEY);
    } catch {}
  }

  function updateConsentMode(state) {
    if (typeof window.gtag !== 'function') return;
    window.gtag('consent', 'update', {
      analytics_storage: state === 'granted' ? 'granted' : 'denied'
    });
  }

  function clearAnalyticsCookies() {
    try {
      const names = document.cookie
        .split(';')
        .map(part => part.split('=')[0]?.trim())
        .filter(name => name === '_ga' || name?.startsWith('_ga_'));
      for (const name of names) {
        document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
        if (location.hostname) {
          document.cookie = `${name}=; Max-Age=0; path=/; domain=${location.hostname}; SameSite=Lax`;
          document.cookie = `${name}=; Max-Age=0; path=/; domain=.${location.hostname}; SameSite=Lax`;
        }
      }
    } catch {}
  }

  function load() {
    if (!isConfigured || loaded || readConsentState() !== 'granted') return false;

    loaded = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function gtag(){ window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted' });
    window.gtag('js', new Date());
    window.gtag('config', GA_MEASUREMENT_ID, { anonymize_ip: true });

    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_MEASUREMENT_ID)}`;
    script.onerror = () => { loaded = false; };
    document.head.appendChild(script);
    return true;
  }

  function grant() {
    writeConsentState('granted');
    if (loaded) {
      updateConsentMode('granted');
      return true;
    }
    return load();
  }

  function deny() {
    writeConsentState('denied');
    updateConsentMode('denied');
    clearAnalyticsCookies();
    return true;
  }

  window.PortfolioAnalytics = {
    measurementId: GA_MEASUREMENT_ID,
    get configured() { return isConfigured; },
    get loaded() { return loaded; },
    get consent() { return readConsentState() === 'granted'; },
    get consentState() { return readConsentState(); },
    grant,
    deny,
    revoke: deny
  };

  load();
})();
