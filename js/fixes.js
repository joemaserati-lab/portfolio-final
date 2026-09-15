(() => {
  const patchLocalizedData = () => {
    if (window.PortfolioI18n?.lang !== 'it' || !window.PORTFOLIO_DATA) return;
    const education = window.PORTFOLIO_DATA.resume?.education;
    if (education?.[0]) education[0].school = 'ACCADEMIA DI BELLE ARTI - BRESCIA, IT';
  };

  patchLocalizedData();
  addEventListener('portfolio:langchange', patchLocalizedData);

  const windowLayer = document.getElementById('window-layer');
  const projectsView = document.getElementById('projects-view');
  const privacyPanel = document.getElementById('privacy-panel');
  const privacyToggle = document.getElementById('privacy-toggle');

  const syncPanelState = () => {
    const hasWindow = Boolean(windowLayer?.querySelector('.os-window'));
    const projectsOpen = Boolean(projectsView && !projectsView.hidden);
    const contentOpen = hasWindow || projectsOpen;

    document.body.classList.toggle('content-panel-open', contentOpen);

    if (contentOpen && privacyPanel && !privacyPanel.hidden) {
      privacyPanel.hidden = true;
      privacyToggle?.setAttribute('aria-expanded', 'false');
    }
  };

  if (windowLayer) {
    new MutationObserver(syncPanelState).observe(windowLayer, {
      childList: true,
      subtree: true
    });
  }

  if (projectsView) {
    new MutationObserver(syncPanelState).observe(projectsView, {
      attributes: true,
      attributeFilter: ['hidden'],
      childList: true,
      subtree: true
    });
  }

  syncPanelState();
})();
