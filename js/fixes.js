(() => {
  const PROJECT_PROOFS = {
    'colorcopy-large-format': {
      en: {
        label: 'IMPACT / RESULTS',
        eyebrow: '03 / PERFORMANCE',
        text: 'During my time at Colorcopy, I worked across website content, SEO, social media and digital campaigns. Instagram became a much stronger source of traffic, with link clicks growing more than tenfold and profile visits more than quadrupling. Facebook also gained traction, with page visits rising almost sixfold. At the same time, ongoing SEO work and Google Ads helped bring more users to product pages and dedicated landing pages.'
      },
      it: {
        label: 'IMPATTO / RISULTATI',
        eyebrow: '03 / PERFORMANCE',
        text: 'Durante il mio percorso in Colorcopy ho lavorato su contenuti web, SEO, social media e campagne digitali. Instagram è diventato una fonte di traffico molto più rilevante, con i clic sui link cresciuti di oltre dieci volte e le visite al profilo più che quadruplicate. Anche Facebook ha registrato una crescita netta, con quasi sei volte più visite alla pagina. Parallelamente, il lavoro SEO e le campagne Google Ads hanno contribuito a portare più utenti verso pagine prodotto e landing page dedicate.'
      }
    },
    'platinum-technologies': {
      en: {
        label: 'IMPACT / RESULTS',
        eyebrow: '03 / PERFORMANCE',
        text: 'My work for Platinum Technologies has covered the website, SEO, social channels and digital campaigns. Since I started working on them, website traffic has grown to roughly ten times its previous level, supported by ongoing SEO work and Google Ads. Instagram also became a stronger source of traffic, with link clicks increasing more than tenfold, while profile and Facebook page visits grew several times over. The work has been continuous, combining website updates, content production, search visibility and campaign management.'
      },
      it: {
        label: 'IMPATTO / RISULTATI',
        eyebrow: '03 / PERFORMANCE',
        text: 'Il mio lavoro per Platinum Technologies ha coinvolto sito, SEO, canali social e campagne digitali. Da quando ho iniziato a seguirli, il traffico del sito è arrivato a circa dieci volte il livello precedente, sostenuto dal lavoro SEO e dalle campagne Google Ads. Anche Instagram è diventato una fonte di traffico molto più rilevante, con i clic sui link cresciuti di oltre dieci volte, mentre le visite al profilo e alla pagina Facebook sono aumentate di diverse volte. È stato un lavoro continuativo tra aggiornamenti al sito, contenuti, visibilità sui motori di ricerca e gestione delle campagne.'
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

  const SAFE_TEXT_SELECTOR = [
    '.case-title-v2 h2',
    '.case-heading h2',
    '.projects-index-head h2',
    '.window-body h2',
    '.resume-header h2',
    '.resume-row h3',
    '.meta-card b',
    '.project-tile-main strong',
    '.project-tile-details small',
    '.contact-link b',
    '.archive-row b'
  ].join(',');

  const textProbe = document.createElement('span');
  textProbe.setAttribute('aria-hidden', 'true');
  Object.assign(textProbe.style, {
    position: 'fixed',
    left: '-10000px',
    top: '-10000px',
    visibility: 'hidden',
    whiteSpace: 'nowrap',
    pointerEvents: 'none'
  });
  document.body.appendChild(textProbe);

  const minFitSize = el => {
    if (el.matches('.project-tile-details small')) return 10;
    if (el.matches('.resume-row h3, .meta-card b, .contact-link b, .archive-row b')) return 13;
    if (el.matches('.project-tile-main strong')) return 15;
    return 20;
  };

  const fitLongWords = () => {
    const mobile = matchMedia('(max-width: 720px)').matches;
    document.querySelectorAll(SAFE_TEXT_SELECTOR).forEach(el => {
      el.style.removeProperty('font-size');
      if (!mobile || !el.isConnected || !el.clientWidth) return;

      const style = getComputedStyle(el);
      const baseSize = parseFloat(style.fontSize);
      const padding = parseFloat(style.paddingLeft || 0) + parseFloat(style.paddingRight || 0);
      const available = Math.max(1, el.clientWidth - padding - 10);
      const words = (el.innerText || el.textContent || '').trim().split(/\s+/).filter(Boolean);
      if (!words.length || !Number.isFinite(baseSize)) return;

      textProbe.style.fontFamily = style.fontFamily;
      textProbe.style.fontWeight = style.fontWeight;
      textProbe.style.fontStyle = style.fontStyle;
      textProbe.style.fontStretch = style.fontStretch;
      textProbe.style.letterSpacing = style.letterSpacing;
      textProbe.style.textTransform = style.textTransform;
      textProbe.style.fontSize = `${baseSize}px`;

      let widest = 0;
      words.forEach(word => {
        textProbe.textContent = word;
        widest = Math.max(widest, textProbe.getBoundingClientRect().width);
      });

      if (widest <= available) return;
      const fitted = Math.max(minFitSize(el), Math.floor(baseSize * (available / widest) * .94 * 10) / 10);
      el.style.fontSize = `${Math.min(baseSize, fitted)}px`;
    });
  };

  const fitHeroTitle = () => {
    const title = document.querySelector('.hero-intro h1');
    if (!title) return;

    title.style.removeProperty('font-size');
    if (!matchMedia('(max-width: 720px)').matches || !title.clientWidth) return;

    const available = title.clientWidth;
    const referenceSize = 100;

    /* Measure the real two-line title at a known size, including the blinking
       underscore. This lets the surname become the limiting line and scales the
       whole title up to the CRT safe width instead of only shrinking on overflow. */
    title.style.fontSize = `${referenceSize}px`;
    const measured = title.scrollWidth;
    if (!measured || !Number.isFinite(measured)) {
      title.style.removeProperty('font-size');
      return;
    }

    const minSize = 24;
    const maxSize = 96;
    let size = Math.max(minSize, Math.min(maxSize, referenceSize * (available / measured)));
    size = Math.floor(size * 10) / 10;
    title.style.fontSize = `${size}px`;

    /* Protect against sub-pixel rounding and font rasterization differences on
       mobile browsers without introducing a visible extra right margin. */
    while (title.scrollWidth > title.clientWidth && size > minSize) {
      size = Math.max(minSize, size - .1);
      title.style.fontSize = `${Math.floor(size * 10) / 10}px`;
    }
  };

  let fitFrame = 0;
  const scheduleSafeTextFit = () => {
    cancelAnimationFrame(fitFrame);
    fitFrame = requestAnimationFrame(() => {
      fitFrame = requestAnimationFrame(() => {
        fitLongWords();
        fitHeroTitle();
      });
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
      scheduleSafeTextFit();
    }).observe(windowLayer, {
      childList: true,
      subtree: true
    });
  }

  if (projectsView) {
    new MutationObserver(() => {
      syncPanelState();
      syncProjectProofs();
      scheduleSafeTextFit();
    }).observe(projectsView, {
      attributes: true,
      attributeFilter: ['hidden'],
      childList: true,
      subtree: true
    });
  }

  addEventListener('resize', scheduleSafeTextFit, { passive: true });
  addEventListener('portfolio:langchange', scheduleSafeTextFit);
  document.fonts?.ready?.then(scheduleSafeTextFit);

  syncPanelState();
  syncProjectProofs();
  scheduleSafeTextFit();
})();
