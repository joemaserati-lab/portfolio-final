(() => {
  const windowLayer = document.getElementById('window-layer');
  const projectsView = document.getElementById('projects-view');
  const privacyPanel = document.getElementById('privacy-panel');
  const privacyToggle = document.getElementById('privacy-toggle');

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
      scheduleSafeTextFit();
    }).observe(windowLayer, {
      childList: true,
      subtree: true
    });
  }

  if (projectsView) {
    new MutationObserver(() => {
      syncPanelState();
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
  scheduleSafeTextFit();
})();
