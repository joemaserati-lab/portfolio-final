(() => {
  const PROJECT_PROOFS = {
    'colorcopy-large-format': {
      en: {
        label: 'IMPACT / RESULTS',
        eyebrow: '03 / PERFORMANCE',
        text: 'An integrated strategy across web, content and paid media strengthened Colorcopy’s digital presence across multiple channels. During the period analysed, Meta activity generated more than 1M impressions and reached hundreds of thousands of people, while Google Ads produced thousands of clicks and measurable conversions. At the same time, the website surpassed 90K views, Instagram reached more than 100K accounts and LinkedIn generated over 10K organic impressions.'
      },
      it: {
        label: 'IMPATTO / RISULTATI',
        eyebrow: '03 / PERFORMANCE',
        text: 'Una strategia integrata tra web, contenuti e paid media ha rafforzato la presenza digitale di Colorcopy su più canali. Nel periodo analizzato, le attività Meta hanno superato 1 milione di impression e raggiunto centinaia di migliaia di persone, mentre Google Ads ha generato migliaia di clic e conversioni tracciate. Parallelamente, il sito ha superato 90K visualizzazioni, Instagram oltre 100K account raggiunti e LinkedIn oltre 10K impression organiche.'
      }
    },
    'platinum-technologies': {
      en: {
        label: 'IMPACT / RESULTS',
        eyebrow: '03 / PERFORMANCE',
        text: 'Platinum Technologies’ digital presence was developed as a coordinated system across website, social content and paid media. During the period analysed, the website surpassed 150K views, Facebook generated tens of thousands of link clicks, Instagram reached more than 100K accounts and LinkedIn delivered over 60K organic impressions. Paid campaigns extended that distribution further, reaching more than 1M people on Meta and generating thousands of clicks through Google Ads.'
      },
      it: {
        label: 'IMPATTO / RISULTATI',
        eyebrow: '03 / PERFORMANCE',
        text: 'La presenza digitale di Platinum Technologies è stata sviluppata come un sistema coordinato tra sito web, contenuti social e paid media. Nel periodo analizzato, il sito ha superato 150K visualizzazioni, Facebook ha generato decine di migliaia di clic sui link, Instagram oltre 100K account raggiunti e LinkedIn oltre 60K impression organiche. Le campagne paid hanno ampliato ulteriormente la distribuzione, raggiungendo oltre 1 milione di persone su Meta e generando migliaia di clic tramite Google Ads.'
      }
    }
  };

  const patchLocalizedData = () => {
    if (!window.PORTFOLIO_DATA) return;

    const lang = window.PortfolioI18n?.lang === 'it' ? 'it' : 'en';
    if (lang === 'it') {
      const education = window.PORTFOLIO_DATA.resume?.education;
      if (education?.[0]) education[0].school = 'ACCADEMIA DI BELLE ARTI - BRESCIA, IT';
    }

    Object.entries(PROJECT_PROOFS).forEach(([slug, copy]) => {
      const project = window.PORTFOLIO_DATA.projects?.find(item => item.slug === slug);
      if (project) project.proof = copy[lang];
    });
  };

  patchLocalizedData();
  addEventListener('portfolio:langchange', patchLocalizedData);

  const windowLayer = document.getElementById('window-layer');
  const projectsView = document.getElementById('projects-view');
  const privacyPanel = document.getElementById('privacy-panel');
  const privacyToggle = document.getElementById('privacy-toggle');

  const injectProjectProof = (root, slug) => {
    const caseStudy = root?.querySelector?.('.case-study-v2');
    if (!caseStudy || caseStudy.querySelector('.case-proof-v2')) return;

    const gallery = caseStudy.querySelector('.case-gallery-v2');
    const project = window.PORTFOLIO_DATA?.projects?.find(item => item.slug === slug);
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

  const syncProjectProofs = () => {
    const currentSlug = projectsView?.dataset.project;
    if (currentSlug && PROJECT_PROOFS[currentSlug]) injectProjectProof(projectsView, currentSlug);

    windowLayer?.querySelectorAll('.os-window[data-project]').forEach(win => {
      const slug = win.dataset.project;
      if (PROJECT_PROOFS[slug]) injectProjectProof(win, slug);
    });
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
      syncProjectProofs();
    }).observe(windowLayer, {
      childList: true,
      subtree: true
    });
  }

  if (projectsView) {
    new MutationObserver(() => {
      syncPanelState();
      syncProjectProofs();
    }).observe(projectsView, {
      attributes: true,
      attributeFilter: ['hidden'],
      childList: true,
      subtree: true
    });
  }

  syncPanelState();
  syncProjectProofs();
})();
