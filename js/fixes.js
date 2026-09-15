(() => {
  const COLORCOPY_SLUG = 'colorcopy-large-format';
  const colorcopyProof = {
    en: {
      label: 'IMPACT / RESULTS',
      eyebrow: '03 / PERFORMANCE',
      text: 'A structured web, content and paid media strategy supported Colorcopy’s digital growth across multiple channels. Meta campaigns generated 1.7M+ impressions and reached 830K+ people with approximately €2K in media spend, while Google Ads delivered 4.7K+ clicks and 130+ conversions on approximately €5.5K in spend. Across the wider ecosystem, the website recorded 90K+ views, Instagram reached 135K+ accounts and LinkedIn generated 13K+ organic impressions.'
    },
    it: {
      label: 'IMPATTO / RISULTATI',
      eyebrow: '03 / PERFORMANCE',
      text: 'Una strategia strutturata tra web, contenuti e paid media ha supportato la crescita digitale di Colorcopy su più canali. Le campagne Meta hanno generato 1,7M+ impression e raggiunto 830K+ persone con circa €2K di investimento media, mentre Google Ads ha prodotto 4,7K+ clic e 130+ conversioni con circa €5,5K di spesa. Nell’ecosistema complessivo, il sito ha registrato 90K+ visualizzazioni, Instagram ha raggiunto 135K+ account e LinkedIn ha generato 13K+ impression organiche.'
    }
  };

  const patchLocalizedData = () => {
    if (!window.PORTFOLIO_DATA) return;

    const lang = window.PortfolioI18n?.lang === 'it' ? 'it' : 'en';
    if (lang === 'it') {
      const education = window.PORTFOLIO_DATA.resume?.education;
      if (education?.[0]) education[0].school = 'ACCADEMIA DI BELLE ARTI - BRESCIA, IT';
    }

    const project = window.PORTFOLIO_DATA.projects?.find(item => item.slug === COLORCOPY_SLUG);
    if (project) project.proof = colorcopyProof[lang];
  };

  patchLocalizedData();
  addEventListener('portfolio:langchange', patchLocalizedData);

  const windowLayer = document.getElementById('window-layer');
  const projectsView = document.getElementById('projects-view');
  const privacyPanel = document.getElementById('privacy-panel');
  const privacyToggle = document.getElementById('privacy-toggle');

  const injectColorcopyProof = root => {
    const caseStudy = root?.querySelector?.('.case-study-v2');
    if (!caseStudy || caseStudy.querySelector('.case-proof-v2')) return;

    const gallery = caseStudy.querySelector('.case-gallery-v2');
    const project = window.PORTFOLIO_DATA?.projects?.find(item => item.slug === COLORCOPY_SLUG);
    const proof = project?.proof;
    if (!gallery || !proof) return;

    const section = document.createElement('section');
    section.className = 'case-story-v2 case-proof-v2';

    const label = document.createElement('div');
    label.className = 'case-story-label';
    label.textContent = proof.label;

    const copy = document.createElement('div');
    copy.className = 'case-story-copy';

    const article = document.createElement('article');
    const eyebrow = document.createElement('span');
    eyebrow.textContent = proof.eyebrow;
    const paragraph = document.createElement('p');
    paragraph.textContent = proof.text;

    article.append(eyebrow, paragraph);
    copy.appendChild(article);
    section.append(label, copy);
    gallery.before(section);
  };

  const syncColorcopyProof = () => {
    if (projectsView?.dataset.project === COLORCOPY_SLUG) injectColorcopyProof(projectsView);
    windowLayer?.querySelectorAll(`.os-window[data-project="${COLORCOPY_SLUG}"]`).forEach(injectColorcopyProof);
  };

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
    new MutationObserver(() => {
      syncPanelState();
      syncColorcopyProof();
    }).observe(windowLayer, {
      childList: true,
      subtree: true
    });
  }

  if (projectsView) {
    new MutationObserver(() => {
      syncPanelState();
      syncColorcopyProof();
    }).observe(projectsView, {
      attributes: true,
      attributeFilter: ['hidden'],
      childList: true,
      subtree: true
    });
  }

  syncPanelState();
  syncColorcopyProof();
})();
