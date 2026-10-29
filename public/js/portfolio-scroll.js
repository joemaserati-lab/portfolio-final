(() => {
  const viewport = document.getElementById('scroll-viewport');
  const screen = document.getElementById('screen');
  const desktop = document.getElementById('desktop');
  const head = document.getElementById('crt-head-feature');
  const morph = document.querySelector('.scroll-folder-morph');
  const miniMenu = document.querySelector('.scroll-minimenu');
  const portraitSlot = document.querySelector('.scroll-portrait-slot');
  const heroIcons = desktop.querySelector('.desktop-icons');
  const launchers = [...heroIcons.querySelectorAll('.desktop-icon')];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 1024px)');
  const kinds = ['home', 'work', 'about', 'resume', 'contact'];
  const links = [...document.querySelectorAll('.scroll-index a')];
  const menuButtons = new Map();
  const windows = ['work', 'about', 'resume', 'contact'].map(kind => {
    const section = document.getElementById(`scroll-${kind}`);
    return {kind, section, window:section.querySelector('.scroll-window'), body:section.querySelector('.window-body')};
  });
  const HANDOFF_END = .22;
  const OPEN_END = .8;
  let navigationEpoch = 0;
  let ready = false, frame = 0, scramble = 0, current = 'home', headRect, launcherRects = new Map(), docked = false, smoothDock = 0, dockTime = 0;
  const clamp = value => Math.max(0, Math.min(1, value));
  const mix = (a,b,p) => a + (b-a)*p;

  launchers.forEach(launcher => {
    const kind = launcher.dataset.open === 'projects' ? 'work' : launcher.dataset.open;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'scroll-mini-icon';
    button.dataset.scrollLaunch = kind;
    button.appendChild(launcher.querySelector('.icon-glyph').cloneNode(true));
    button.addEventListener('click', () => go(kind));
    miniMenu.appendChild(button);
    menuButtons.set(kind, button);
  });
  const caption = document.createElement('p');
  caption.className = 'scroll-section-name';
  caption.dataset.section = 'home';
  caption.setAttribute('aria-live', 'polite');
  caption.setAttribute('aria-atomic', 'true');
  caption.innerHTML = '<span aria-hidden="true" data-scroll-label="Home">Home</span><span class="scroll-sr">Home</span>';
  miniMenu.appendChild(caption);
  const captionLabel = caption.querySelector('[data-scroll-label]');

  links.forEach(link => {
    const kind = link.dataset.scrollSection;
    const launcher = launchers.find(item => item.dataset.open === (kind === 'work' ? 'projects' : kind === 'home' ? 'resume' : kind));
    const glyph = launcher.querySelector('.icon-glyph').cloneNode(true);
    if (kind === 'home') glyph.innerHTML = '<svg viewBox="0 0 48 40"><path d="M4 4h40v26H4zM16 35h16M24 30v5M9 11h12M9 16h8"/></svg>';
    glyph.setAttribute('aria-hidden', 'true');
    link.prepend(glyph);
  });
  const footerControls = document.querySelector('.scroll-footer-controls');
  const languageControl = document.getElementById('language-toggle');
  const privacyWidget = document.querySelector('.privacy-widget');
  const privacyPanel = document.getElementById('privacy-panel');
  const controlsOrigin = document.createComment('preview controls origin');
  languageControl.before(controlsOrigin);
  const panelOrigin = document.createComment('preview privacy panel origin');
  privacyPanel.before(panelOrigin);
  const privacyPortal = document.createElement('div');
  privacyPortal.className = 'scroll-privacy-portal';
  screen.appendChild(privacyPortal);
  function positionControls() {
    if (compact.matches) {
      footerControls.append(languageControl, privacyWidget);
      privacyPortal.appendChild(privacyPanel);
    } else {
      controlsOrigin.after(languageControl, privacyWidget);
      panelOrigin.after(privacyPanel);
    }
  }
  compact.addEventListener('change', positionControls);
  positionControls();
  function measure() {
    const parent = screen.getBoundingClientRect();
    launchers.forEach(launcher => {
      launcher.style.removeProperty('transform');
      launcher.style.removeProperty('opacity');
      const r = launcher.getBoundingClientRect();
      launcherRects.set(launcher, {left:r.left-parent.left, top:r.top-parent.top+viewport.scrollTop, width:r.width, height:r.height});
    });
    if (!docked) {
      const r = head.getBoundingClientRect();
      headRect = {left:r.left-parent.left, top:r.top-parent.top+viewport.scrollTop, width:r.width, height:r.height};
    }
    windows.forEach(entry => {
      entry.window.style.setProperty('--scroll-raster-height', `${Math.min(entry.body.offsetHeight, viewport.clientHeight * .7)}px`);
    });

  }
  function renderContents() {
    const api = window.Portfolio;
    if (!api) return;
    api.refresh();
    delete morph.dataset.kind;
    launchers.forEach(launcher => {
      const kind = launcher.dataset.open === 'projects' ? 'work' : launcher.dataset.open;
      const name = launcher.querySelector('[data-i18n]').textContent.trim();
      menuButtons.get(kind).setAttribute('aria-label', name);
      menuButtons.get(kind).title = name;
    });
    ['work','about','resume','contact'].forEach(kind => {
      const target = document.querySelector(`[data-scroll-content="${kind}"]`);
      target.innerHTML = api.content(kind);
      document.querySelector(`[data-scroll-title="${kind}"]`).textContent = window.PortfolioI18n?.t(`window.${kind === 'work' ? 'projects' : kind}`) || kind.toUpperCase();
    });
    windows.forEach(entry => {
      entry.window.style.setProperty('--scroll-raster-height', `${Math.min(entry.body.offsetHeight, viewport.clientHeight * .7)}px`);
    });
    document.querySelectorAll('#scroll-work [data-project-slug]').forEach(button => {
      let pending = false;
      button.addEventListener('click', event => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        if (pending) return;
        const open = () => { pending = false; delete button.dataset.scrollTap; api.openProject(button.dataset.projectSlug); schedule(); };
        if (matchMedia('(hover: none), (pointer: coarse)').matches && event.detail > 0 && !reduced.matches) {
          pending = true;
          button.dataset.scrollTap = '1';
          button.classList.add('is-color-preview');
          setTimeout(open, 280);
        } else open();
      });
    });
    schedule();
  }
  function active(kind, displayName) {
    if (kind === current && captionLabel.dataset.scrollLabel === displayName) return;
    current = kind;
    cancelAnimationFrame(scramble);
    links.forEach(link => {
      const selected = link.dataset.scrollSection === kind;
      if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      const label = link.querySelector('[data-scroll-label]');
      label.textContent = label.dataset.scrollLabel;
      link.classList.remove('is-changing');
      if (selected && !reduced.matches) {
        void link.offsetWidth;
        link.classList.add('is-changing');
      }
    });
    const displayKind = kind;
    caption.dataset.section = displayKind;
    captionLabel.dataset.scrollLabel = displayName;
    captionLabel.textContent = displayName;
    caption.querySelector('.scroll-sr').textContent = displayName;
    menuButtons.forEach((button, name) => {
      if (name === displayKind) button.setAttribute('aria-current', 'location'); else button.removeAttribute('aria-current');
    });
    if (reduced.matches) return;
    const labels = [links[kinds.indexOf(kind)].querySelector('[data-scroll-label]'), captionLabel];
    const start = performance.now();
    function tick(now) {
      const p = clamp((now-start)/240);
      labels.forEach(label => {
        const text = label.dataset.scrollLabel;
        label.textContent = [...text].map((c,i) => c === ' ' || i < p*text.length ? c : '·/—'[Math.floor(now/45+i)%3]).join('');
      });
      if (p < 1) scramble = requestAnimationFrame(tick);
    }
    scramble = requestAnimationFrame(tick);
  }
  function updateCoverColor(overlay) {
    const cards = [...document.querySelectorAll('#scroll-work .project-tile-v2')];
    let selected = null, best = 0, currentScore = 0;
    const currentCard = cards.find(card => card.classList.contains('is-viewport-color'));
    if (!overlay && windows[0].window.classList.contains('is-revealed')) {
      // The same viewport-based preview selection now applies to desktop and
      // mobile. One clip plays at a time; hover never starts playback.
      const sr = viewport.getBoundingClientRect();
      const top = compact.matches
        ? head.getBoundingClientRect().bottom + 12
        : sr.top + Math.min(90, sr.height * .08);
      const bottom = compact.matches
        ? document.querySelector('.scroll-index').getBoundingClientRect().top
        : sr.bottom - Math.max(20, sr.height * .045);
      cards.forEach(card => {
        const rect = card.getBoundingClientRect();
        const visible = Math.max(0, Math.min(rect.bottom, bottom) - Math.max(rect.top, top));
        const score = visible / Math.max(1, rect.height);
        if (card === currentCard) currentScore = score;
        if (rect.right > sr.left && rect.left < sr.right && score > best) { best = score; selected = card; }
      });
    }
    if (best < .14) selected = null;
    else if (currentCard && currentScore >= .14 && currentScore >= best - .12) selected = currentCard;
    const changed = currentCard !== selected;
    cards.forEach(card => {
      const isSelected = card === selected;
      card.classList.toggle('is-viewport-color', isSelected);
      card.classList.remove('is-color-preview');
    });
    if (changed) dispatchEvent(new Event('portfolio:preview-change'));
  }
  function update(now = performance.now()) {
    frame = 0;
    if (!ready || !headRect) return;
    const y = viewport.scrollTop, h = viewport.clientHeight, w = viewport.clientWidth;
    const p = reduced.matches ? Number(y > 1) : clamp(y/(h*.8));
    const overlay = !document.getElementById('projects-view').hidden || Boolean(document.querySelector('#window-layer .os-window'));
    const targetPose = overlay ? 1 : p;
    const dt = Math.min(64, Math.max(0, now - (dockTime || now - 16)));
    dockTime = now;
    smoothDock = compact.matches && !reduced.matches ? mix(smoothDock, targetPose, 1 - Math.exp(-dt / 55)) : targetPose;
    if (Math.abs(smoothDock - targetPose) < .001) smoothDock = targetPose;
    const pose = smoothDock;
    document.body.classList.toggle('scroll-reading', pose > 0);
    viewport.style.setProperty('--scroll-dock', pose.toFixed(4));
    // Dock the existing WebGL canvas (never duplicate the renderer). Its
    // drawing buffer remains unchanged while scrolling; the same element is
    // moved only at the hero/docked boundary.
    document.body.classList.toggle('scroll-head-docked', !compact.matches && y > 1);
    if (pose > 0) {
      if (!docked) {
        screen.appendChild(head);
        head.classList.add('scroll-portrait-docked');
        docked = true;
      }
      const sr = screen.getBoundingClientRect();
      const slot = portraitSlot.getBoundingClientRect();
      // Small, centered and inside the CRT safe bottom area on desktop.
      const desktopHeight = Math.min(165, Math.max(125, h * .205));
      const desktopWidth = headRect.width * desktopHeight / headRect.height;
      const bottomClearance = Math.max(34, Math.min(58, h * .064));
      const target = compact.matches
        ? {left: slot.left - sr.left, top: slot.top - sr.top, width: slot.width, height: slot.height}
        : {left: (w - desktopWidth) / 2, top: h - bottomClearance - desktopHeight,
           width: desktopWidth, height: desktopHeight};
      const targetScale = target.height / headRect.height;
      const scale = mix(1, targetScale, pose);
      // Mobile's square dock slot must center the aspect-ratio-preserving
      // head. Desktop already supplies the exact scaled width/height.
      const finalLeft = target.left + (target.width-headRect.width*targetScale)/2;
      const finalTop = target.top + (target.height-headRect.height*targetScale)/2;
      const left = mix(headRect.left, finalLeft, pose);
      const top = mix(headRect.top, finalTop, pose);
      head.style.width = `${headRect.width}px`;
      head.style.height = `${headRect.height}px`;
      head.style.left = `${headRect.left}px`;
      head.style.top = `${headRect.top}px`;
      head.style.transformOrigin = '0 0';
      head.style.transform = `translate3d(${left-headRect.left}px, ${top-headRect.top}px, 0) scale(${scale})`;
    } else if (docked) {
      desktop.prepend(head);
      head.classList.remove('scroll-portrait-docked');
      head.removeAttribute('style');
      docked = false;
    }
    const progress = clamp(y / Math.max(1, viewport.scrollHeight - h));
    dispatchEvent(new CustomEvent('portfolio:scroll-pose', {detail:{heroPresence:compact.matches ? 1 - pose : 0, yaw:compact.matches ? (reduced.matches ? 0 : progress * Math.PI * 2) : null, renderScale:compact.matches && pose === 1 ? portraitSlot.clientHeight / headRect.height : 1}}));
    const handoff = reduced.matches ? Number(pose > 0) : clamp(y/(h*HANDOFF_END));
    const menuVisible = !compact.matches && (handoff > 0 || overlay);
    miniMenu.style.visibility = menuVisible ? 'visible' : 'hidden';
    miniMenu.style.opacity = String(overlay ? 1 : clamp((handoff-.7)/.3));
    miniMenu.inert = !menuVisible || (!overlay && handoff < .7);
    launchers.forEach(launcher => {
      if (compact.matches || handoff === 0) {
        launcher.style.removeProperty('transform');
        launcher.style.removeProperty('opacity');
        return;
      }
      const origin = launcherRects.get(launcher);
      const kind = launcher.dataset.open === 'projects' ? 'work' : launcher.dataset.open;
      const target = menuButtons.get(kind).getBoundingClientRect(), sr = screen.getBoundingClientRect();
      const scale = mix(1, target.width/origin.width, handoff);
      launcher.style.transform = `translate(${(target.left-sr.left-origin.left)*handoff}px, ${(target.top-sr.top-origin.top+y)*handoff}px) scale(${scale})`;
      launcher.style.opacity = String(1-clamp((handoff-.7)/.3));
    });
    if (Math.abs(smoothDock - targetPose) >= .001) schedule();
    heroIcons.inert = !compact.matches && handoff >= 1;
    let selected = 'home', candidate;
    windows.forEach(({kind, section, window:panel, body}) => {
      const start = section.offsetTop;
      if (y + h*.4 >= start) selected = kind;
      const progress = Math.abs(y - start) < 2 ? 1 : clamp((y - start + h)/h);
      const signal = reduced.matches ? 1 : clamp((progress-OPEN_END)/(1-OPEN_END));
      const reveal = reduced.matches ? 1 : clamp((signal-.2)/.8);
      const opened = reduced.matches || progress >= OPEN_END;
      panel.classList.toggle('is-open', opened);
      panel.classList.toggle('is-powering', opened && reveal === 0);
      panel.classList.toggle('is-signal-ready', reveal > 0);
      panel.classList.toggle('is-scanning', reveal > 0 && reveal < 1);
      panel.classList.toggle('is-revealed', reveal >= 1);
      panel.style.setProperty('--scroll-reveal', reveal.toFixed(4));
      panel.style.setProperty('--scroll-signal', clamp(signal/.2).toFixed(4));
      body.inert = reveal < 1;
      if (progress > 0 && progress < OPEN_END) candidate = {kind, progress,section};
    });
    if (y+h >= viewport.scrollHeight-4) selected = 'contact';
    const name = links[kinds.indexOf(selected)].querySelector('[data-scroll-label]').dataset.scrollLabel;
    active(selected, name);
    updateCoverColor(overlay);
    morph.style.display = 'none';
    if (candidate && !compact.matches && !reduced.matches && !overlay) {
      const {kind,progress,section} = candidate;
      const source = menuButtons.get(kind).querySelector('.icon-glyph').getBoundingClientRect();
      const sr = screen.getBoundingClientRect();
      const from = {left:source.left-sr.left,top:source.top-sr.top,width:source.width,height:source.height};
      const target = section.querySelector('.scroll-window').getBoundingClientRect();
      const to = {left:target.left-sr.left,top:target.top-sr.top,width:target.width,height:Math.min(target.height,h*.75)};
      const openingStart = kind !== 'work' ? 0 : HANDOFF_END;
      if (progress > openingStart) {
        morph.style.display = 'block';
        const t = clamp((progress-openingStart)/(OPEN_END-openingStart));
        Object.keys(to).forEach(key => morph.style[key] = `${mix(from[key],to[key],t)}px`);
        morph.style.opacity = '1';
        if (morph.dataset.kind !== kind) {
          morph.dataset.kind = kind;
          morph.innerHTML = `<div class="window-titlebar"><span>${document.querySelector(`[data-scroll-title="${kind}"]`).textContent}</span></div><span class="scroll-morph-glyph">${desktop.querySelector(`[data-open="${kind==='work'?'projects':kind}"] .icon-glyph`).innerHTML}</span>`;
        }
      }
    }
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  async function go(kind, {historyUpdate = true, closeOverlay = true, focusTarget = null} = {}) {
    const section = document.getElementById(`scroll-${kind}`);
    if (!section || !ready) return;
    if (closeOverlay) window.Portfolio?.close();
    if (historyUpdate) window.Portfolio.navigateSection(kind);
    const epoch = ++navigationEpoch;
    // Text fitting uses two animation frames after content mutations. Measure
    // only after that pass; previous section heights can otherwise shift.
    await document.fonts?.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    if (epoch !== navigationEpoch) return;
    measure();
    viewport.scrollTo({top:section.offsetTop, behavior:reduced.matches?'instant':'smooth'});
    section.tabIndex = -1;
    if (closeOverlay) (focusTarget?.isConnected ? focusTarget : section).focus({preventScroll:true});
    schedule();
  }
  document.querySelector('.scroll-footer a').addEventListener('click', event => { event.preventDefault(); go('home'); });
  links.forEach(link => link.addEventListener('click', event => { event.preventDefault(); go(link.dataset.scrollSection); }));
  addEventListener('portfolio:scroll-to', event => typeof event.detail === 'string' ? go(event.detail) : go(event.detail.kind, {historyUpdate:false}));
  addEventListener('portfolio:scroll-return', event => {
    const detail = event.detail;
    go(typeof detail === 'string' ? detail : detail?.kind || current, {historyUpdate:false, focusTarget:detail?.focusTarget});
  });
  viewport.addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', () => { if (docked) { desktop.prepend(head); head.removeAttribute('style'); head.classList.remove('scroll-portrait-docked'); docked = false; } measure(); schedule(); });
  addEventListener('portfolio:runtime-ready', renderContents);
  addEventListener('portfolio:head-settled', schedule);
  addEventListener('portfolio:langchange', () => {
    // content.js and portfolio.js are loaded after this listener by the loader.
    // Let both synchronous dictionary listeners finish before reading their data.
    queueMicrotask(renderContents);
  });
  reduced.addEventListener('change', schedule);
  new MutationObserver(schedule).observe(document.getElementById('projects-view'), {attributes:true,attributeFilter:['hidden']});
  new MutationObserver(schedule).observe(document.getElementById('window-layer'), {childList:true});
  function enter() {
    ready = true;
    renderContents(); measure(); schedule();
    const route = window.Portfolio.getRoute();
    if (route.type === 'project') go('work', {historyUpdate:false, closeOverlay:false});
    else if (route.type === 'work') go('work', {historyUpdate:false});
    else if (route.type === 'section') go(route.kind, {historyUpdate:false});
  }
  addEventListener('portfolio:site-ready', enter, {once:true});
  new MutationObserver(() => { if (!ready && document.body.classList.contains('site-ready')) enter(); }).observe(document.body, {attributes:true, attributeFilter:['class']});
  if (document.body.classList.contains('site-ready')) enter();
})();
