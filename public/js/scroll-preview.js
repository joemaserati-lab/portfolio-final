(() => {
  const viewport = document.getElementById('scroll-viewport');
  const screen = document.getElementById('screen');
  const desktop = document.getElementById('desktop');
  const head = document.getElementById('crt-head-feature');
  const morph = document.querySelector('.scroll-folder-morph');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const compact = matchMedia('(max-width: 1024px)');
  const kinds = ['home', 'work', 'about', 'contact'];
  const links = [...document.querySelectorAll('.scroll-index a')];
  let ready = false, frame = 0, scramble = 0, current = 'home', headRect, folders = {}, docked = false;
  const clamp = value => Math.max(0, Math.min(1, value));
  const mix = (a,b,p) => a + (b-a)*p;

  function measure() {
    const parent = screen.getBoundingClientRect();
    if (!docked) {
      const r = head.getBoundingClientRect();
      headRect = {left:r.left-parent.left, top:r.top-parent.top+viewport.scrollTop, width:r.width, height:r.height};
    }
    ['work','about','contact'].forEach(kind => {
      const r = desktop.querySelector(`[data-open="${kind === 'work' ? 'projects' : kind}"] .icon-glyph`).getBoundingClientRect();
      folders[kind] = {left:r.left-parent.left, top:r.top-parent.top+viewport.scrollTop, width:r.width, height:r.height};
    });
  }
  function renderContents() {
    const api = window.ScrollPortfolio;
    if (!api) return;
    api.refresh();
    ['work','about','contact'].forEach(kind => {
      const target = document.querySelector(`[data-scroll-content="${kind}"]`);
      target.innerHTML = api.content(kind);
      document.querySelector(`[data-scroll-title="${kind}"]`).textContent = window.PortfolioI18n?.t(`window.${kind === 'work' ? 'projects' : kind}`) || kind.toUpperCase();
    });
    document.querySelectorAll('#scroll-work [data-project-slug]').forEach(button => {
      let pending = false;
      button.addEventListener('click', event => {
        if (pending) return;
        const open = () => { pending = false; api.openProject(button.dataset.projectSlug); schedule(); };
        if (matchMedia('(hover: none), (pointer: coarse)').matches && event.detail > 0 && !reduced.matches) {
          pending = true;
          button.classList.add('is-color-preview');
          setTimeout(open, 280);
        } else open();
      });
    });
    schedule();
  }
  function active(kind) {
    if (kind === current) return;
    current = kind;
    cancelAnimationFrame(scramble);
    links.forEach(link => {
      const selected = link.dataset.scrollSection === kind;
      if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
      const label = link.querySelector('[data-scroll-label]');
      label.textContent = label.dataset.scrollLabel;
    });
    if (reduced.matches) return;
    const label = links[kinds.indexOf(kind)].querySelector('[data-scroll-label]');
    const text = label.dataset.scrollLabel, start = performance.now();
    function tick(now) {
      const p = clamp((now-start)/240);
      label.textContent = [...text].map((c,i) => c === ' ' || i < p*text.length ? c : '·/—'[Math.floor(now/45+i)%3]).join('');
      if (p < 1) scramble = requestAnimationFrame(tick);
    }
    scramble = requestAnimationFrame(tick);
  }
  function update() {
    frame = 0;
    if (!ready || !headRect) return;
    const y = viewport.scrollTop, h = viewport.clientHeight, w = viewport.clientWidth;
    const p = reduced.matches ? Number(y > 1) : clamp(y/(h*.8));
    const overlay = !document.getElementById('projects-view').hidden || Boolean(document.querySelector('#window-layer .os-window'));
    const pose = overlay ? 1 : p;
    document.body.classList.toggle('scroll-reading', pose > 0);
    if (pose > 0) {
      if (!docked) { screen.appendChild(head); head.classList.add('scroll-portrait-docked'); docked = true; }
      const target = compact.matches ? {left:w-145,top:40,width:110,height:110} : {left:w*.75,top:h*.22,width:w*.22,height:h*.55};
      Object.entries(target).forEach(([key,value]) => { head.style[key] = `${mix(headRect[key],value,pose)}px`; });
      head.style.transform = 'none';
    } else if (docked) {
      desktop.prepend(head); head.classList.remove('scroll-portrait-docked'); head.removeAttribute('style'); docked = false;
    }
    const amount = reduced.matches ? 0 : y/h;
    dispatchEvent(new CustomEvent('portfolio:scroll-pose', {detail:{x: Math.sin(amount*.9)*.8, y: Math.sin(amount*.4)*.35}}));
    let selected = 'home', candidate;
    ['work','about','contact'].forEach(kind => {
      const section = document.getElementById(`scroll-${kind}`);
      const start = section.offsetTop;
      if (y + h*.4 >= start) selected = kind;
      const progress = clamp((y - start + h)/h);
      if (progress > 0 && progress < 1) candidate = {kind, progress,section};
    });
    if (y+h >= viewport.scrollHeight-4) selected = 'contact';
    active(selected);
    morph.style.display = 'none';
    if (candidate && !reduced.matches && !overlay) {
      const {kind,progress,section} = candidate;
      const from = folders[kind];
      const target = section.querySelector('.scroll-window').getBoundingClientRect(), sr = screen.getBoundingClientRect();
      const to = {left:target.left-sr.left,top:target.top-sr.top,width:target.width,height:Math.min(target.height,h*.75)};
      if (progress < .82) {
        morph.style.display = 'block';
        const t = clamp(progress/.82);
        Object.keys(to).forEach(key => morph.style[key] = `${mix(from[key],to[key],t)}px`);
        morph.style.opacity = String(1-clamp((progress-.65)/.17));
        morph.innerHTML = `<span>${desktop.querySelector(`[data-open="${kind==='work'?'projects':kind}"] .icon-glyph`).innerHTML}</span>`;
      }
      section.querySelector('.scroll-window').style.opacity = String(clamp((progress-.5)/.35));
    }
    ['work','about','contact'].forEach(kind => {
      const section = document.getElementById(`scroll-${kind}`);
      if (reduced.matches || y >= section.offsetTop || !candidate || candidate.kind !== kind) section.querySelector('.scroll-window').style.opacity = '1';
    });
  }
  function schedule() { if (!frame) frame = requestAnimationFrame(update); }
  function go(kind, {historyUpdate = true} = {}) {
    const section = document.getElementById(`scroll-${kind}`);
    if (!section || !ready) return;
    window.ScrollPortfolio?.close();
    if (historyUpdate) history.pushState({scrollSection:kind}, '', new URL(`scroll-preview/#${kind}`, document.baseURI));
    viewport.scrollTo({top:section.offsetTop, behavior:reduced.matches?'instant':'smooth'});
    section.tabIndex = -1;
    section.focus({preventScroll:true});
    schedule();
  }
  links.forEach(link => link.addEventListener('click', event => { event.preventDefault(); go(link.dataset.scrollSection); }));
  addEventListener('portfolio:scroll-to', event => go(event.detail));
  addEventListener('portfolio:scroll-return', () => {
    history.replaceState({scrollSection:current}, '', new URL(`scroll-preview/#${current}`, document.baseURI));
    go(current, {historyUpdate:false});
  });
  viewport.addEventListener('scroll', schedule, {passive:true});
  addEventListener('resize', () => { if (docked) { desktop.prepend(head); head.removeAttribute('style'); head.classList.remove('scroll-portrait-docked'); docked = false; } measure(); schedule(); });
  addEventListener('portfolio:scroll-runtime', renderContents);
  addEventListener('portfolio:head-settled', schedule);
  addEventListener('portfolio:langchange', renderContents);
  addEventListener('popstate', () => { const hash = location.hash.slice(1); if (kinds.includes(hash)) go(hash, {historyUpdate:false}); });
  reduced.addEventListener('change', schedule);
  new MutationObserver(schedule).observe(document.getElementById('projects-view'), {attributes:true,attributeFilter:['hidden']});
  new MutationObserver(schedule).observe(document.getElementById('window-layer'), {childList:true});
  function enter() {
    ready = true;
    renderContents(); measure(); schedule();
    const hash = location.hash.slice(1);
    if (kinds.includes(hash) && hash !== 'home') go(hash, {historyUpdate:false});
  }
  addEventListener('portfolio:site-ready', enter, {once:true});
  new MutationObserver(() => { if (!ready && document.body.classList.contains('site-ready')) enter(); }).observe(document.body, {attributes:true, attributeFilter:['class']});
  if (document.body.classList.contains('site-ready')) enter();
})();
