(() => {
  const dictionaries = window.PORTFOLIO_DICTIONARIES;
  if (!dictionaries) throw new Error('Static portfolio dictionaries are missing.');
  function syncData() {
    const lang = window.PortfolioI18n?.lang === 'it' ? 'it' : 'en';
    window.PORTFOLIO_DATA = JSON.parse(JSON.stringify(dictionaries[lang]));
  }
  syncData();
  addEventListener('portfolio:langchange', syncData);
})();
