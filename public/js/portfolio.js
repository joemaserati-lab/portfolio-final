(() => {
  let DATA = window.PORTFOLIO_DATA;
  if (!DATA) { console.error('PORTFOLIO_DATA is missing.'); return; }
  let {profile, resume, projects} = DATA;
  const t = key => window.PortfolioI18n?.t?.(key) || key;
  const layer = document.getElementById('window-layer');
  const projectsView = document.getElementById('projects-view');
  const BASE_URL = new URL(document.baseURI);
  const BASE_PATH = BASE_URL.pathname;
  let returnSection = 'work';
  let projectTrigger = null;
  const scrollViewport = document.getElementById('scroll-viewport');
  let transitionSwap = null, transitionEnd = null;
  function cancelTransition() {
    clearTimeout(transitionSwap); clearTimeout(transitionEnd);
    transitionSwap = null; transitionEnd = null;
    document.getElementById('screen').classList.remove('crt-degauss');
  }
  function crtTransition(action) {
    cancelTransition();
    if (matchMedia('(prefers-reduced-motion:reduce)').matches) { action(); return; }
    document.getElementById('screen').classList.add('crt-degauss');
    transitionSwap = setTimeout(()=>{ transitionSwap = null; action(); },155);
    transitionEnd = setTimeout(cancelTransition,370);
  }

  function parseRoute() {
    const path = location.pathname.slice(BASE_PATH.length).replace(/^\/+|\/+$/g, '');
    const hash = location.hash.slice(1);
    if (path.startsWith('work/')) return {type:'project', slug:decodeURIComponent(path.slice(5))};
    if (hash.startsWith('project=')) return {type:'project', slug:decodeURIComponent(hash.slice(8))};
    if (hash === '/projects') return {type:'work'};
    const legacy = hash.match(/^\/work\/([^/?#]+)/);
    if (legacy) return {type:'project',slug:decodeURIComponent(legacy[1])};
    const section = path || hash;
    if (section === 'work') return {type:'work'};
    if (['about','contact','resume'].includes(section)) return {type:'section', kind:section};
    return {type:'home'};
  }
  function routePath(route) {
    if (route.type === 'project') return `${BASE_PATH}work/${encodeURIComponent(route.slug)}/`;
    if (route.type === 'work') return `${BASE_PATH}work/`;
    if (route.type === 'section') return `${BASE_PATH}${route.kind}/`;
    return BASE_PATH;
  }
  function navigateSection(kind, {replace=false}={}) {
    const route = kind === 'home' ? {type:'home'} : kind === 'work' ? {type:'work'} : {type:'section',kind};
    history[replace ? 'replaceState' : 'pushState']({scrollSection:kind}, '', routePath(route));
    updateRouteMeta(route);
  }
  const esc = s => String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const paragraphs = value => [].concat(value || []).map(text => `<p>${esc(text)}</p>`).join('');
  const projectYear = project => project.year === 'ONGOING' ? t('portfolio.ongoing') : project.year;
  const projectById = id => projects.find(p => p.id === String(id).padStart(2,'0'));
  const projectBySlug = slug => projects.find(p => p.slug === slug);
  const backGlyph = '<span class="doto-glyph" aria-hidden="true" style="display:inline-block;line-height:1;transform:translate(1px,-1px)">&lt;</span>';
  const projectImage = p => p.cover ? `<img class="project-cover-img" src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy" decoding="async">${p.video ? `<video class="project-cover-video" data-src="${esc(p.video)}" muted loop playsinline preload="none" poster="${esc(p.cover)}" aria-hidden="true"></video>` : ''}` : '<span class="project-cover-art" aria-hidden="true"></span>';
  // One shared lifecycle for the directory, including language rerenders.
  const previewRoot = document.getElementById('scroll-work');
  const previewVideos = new Map();
  // Both desktop and mobile use the same scroll-viewport preview lifecycle.
  const previewReduced = matchMedia('(prefers-reduced-motion: reduce)');
  const loadPreview = video => {
    if (video.getAttribute('src')) return;
    video.src = new URL(video.dataset.src, BASE_URL).href;
    video.preload = 'auto';
    video.load();
  };
  function previewActive(card) {
    return card.isConnected && !document.hidden && !document.body.classList.contains('screensaver-on') &&
      !document.body.classList.contains('project-case-open') &&
      document.body.classList.contains('site-ready') && !previewReduced.matches &&
      card.classList.contains('is-viewport-color');
  }
  function syncPreviewVideos() {
    // Stop the previous preview before starting the newly selected one.
    for (const [card, video] of previewVideos) {
      if (!previewActive(card)) {
        video.pause();
        card.classList.remove('is-video-playing');
      }
    }
    for (const [card, video] of previewVideos) {
      if (!previewActive(card)) continue;
      loadPreview(video);
      if (video.paused) video.play()?.catch(() => {});
    }
  }
  const nearbyPreviews = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting || previewReduced.matches) continue;
      const video = previewVideos.get(entry.target);
      if (video) loadPreview(video);
      nearbyPreviews.unobserve(entry.target);
    }
  }, {root: scrollViewport, rootMargin: '300px 0px'}) : null;
  function attachPreviewVideos() {
    if (!document.body.classList.contains('site-ready')) return;
    for (const [card, video] of previewVideos) {
      if (card.isConnected) continue;
      nearbyPreviews?.unobserve(card);
      video.pause();
      video.removeAttribute('src');
      video.load();
      previewVideos.delete(card);
    }
    previewRoot.querySelectorAll('.project-tile-v2').forEach(card => {
      const video = card.querySelector('.project-cover-video');
      if (!video || previewVideos.has(card)) return;
      previewVideos.set(card, video);
      const showFrame = () => {
        if (previewActive(card) && !video.paused && video.readyState >= 2) card.classList.add('is-video-playing');
      };
      video.addEventListener('playing', () => {
        if (video.requestVideoFrameCallback) video.requestVideoFrameCallback(showFrame);
        else showFrame();
      });
      video.addEventListener('pause', () => card.classList.remove('is-video-playing'));
      video.addEventListener('error', () => card.classList.remove('is-video-playing'));
      nearbyPreviews?.observe(card);
    });
    syncPreviewVideos();
  }
  if (previewRoot) {
    new MutationObserver(attachPreviewVideos).observe(previewRoot, {childList:true, subtree:true});
    // Hover/focus styles remain, but only viewport visibility drives playback.
    document.addEventListener('visibilitychange', syncPreviewVideos);
    for (const name of ['portfolio:preview-change', 'portfolio:project-opened', 'portfolio:project-closed']) {
      addEventListener(name, syncPreviewVideos);
    }
    // No input-device split: the same viewport selection operates at all widths.
    previewReduced.addEventListener('change', syncPreviewVideos);
    addEventListener('portfolio:site-ready', attachPreviewVideos, {once:true});
    attachPreviewVideos();
  }

  function updateRouteMeta(route){
    let title=t('title');
    let description=t('description');
    if(route.type==='section'){
      if(route.kind==='about'){
        title=`${t('window.about').replace(/\.TXT$/,'')} — Edoardo Rappanello`;
        description=profile.intro?.[0] || description;
      } else if(route.kind==='resume'){
        title=`${t('window.resume').replace(/\.TXT$/,'')} — Edoardo Rappanello`;
        description=resume.intro || description;
      } else if(route.kind==='contact'){
        title=`${t('window.contact').replace(/\.EXE$/,'')} — Edoardo Rappanello`;
        description=t('portfolio.contactCopy');
      }
    } else if(route.type==='work'){
      title=`${t('portfolio.selectedWorkText')} — Edoardo Rappanello`;
      description=t('portfolio.selectedCopy');
    } else if(route.type==='project'){
      const project=projectBySlug(route.slug) || projectById(route.slug);
      if(project){
        title=`${project.title} — Edoardo Rappanello`;
        description=project.intro || description;
      }
    }
    document.title=title;
    const canonical=new URL(routePath(route),location.origin).href;
    const setMeta=(selector,value,attribute='content')=>{
      const node=document.querySelector(selector);
      if(node && value) node.setAttribute(attribute,value);
    };
    setMeta('meta[name="description"]',description);
    setMeta('meta[property="og:title"]',title);
    setMeta('meta[property="og:description"]',description);
    setMeta('meta[property="og:url"]',canonical);
    setMeta('meta[name="twitter:title"]',title);
    setMeta('meta[name="twitter:description"]',description);
    setMeta('link[rel="canonical"]',canonical,'href');
    const project = route.type === 'project' ? projectBySlug(route.slug) : null;
    const image = new URL(project?.cover || 'assets/images/profilephoto.webp', BASE_URL).href;
    setMeta('meta[property="og:image"]', image);
    setMeta('meta[name="twitter:image"]', image);
    setMeta('meta[property="og:type"]', project ? 'article' : 'website');
    const schema = document.querySelector('script[type="application/ld+json"]');
    if (schema) schema.textContent = JSON.stringify(project ? {
      '@context':'https://schema.org', '@type':'CreativeWork', name:project.title,
      description:project.intro, image, url:canonical,
      author:{'@type':'Person',name:'Edoardo Rappanello'}
    } : {'@context':'https://schema.org','@type':'Person',name:'Edoardo Rappanello',
      url:BASE_URL.href,sameAs:[profile.linkedin]});
  }

  const tagList = (items, className = '') => `<div class="tags${className ? ` ${className}` : ''}">${items.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`;

  const contents = {
    about:() => `
      <h2>${esc(profile.name)}</h2>
      ${paragraphs(profile.intro)}`,

    contact:() => `
      <div class="contact-panel">
        <div class="contact-copy">
          <h2>${esc(t('portfolio.contactTitle'))}</h2>
          <p>${esc(t('portfolio.contactCopy'))}</p>
          <div class="contact-links">
            <a class="contact-link" href="mailto:${esc(profile.email)}"><span>EMAIL</span><b>${esc(profile.email)}</b></a>
            <a class="contact-link" href="${esc(profile.linkedin)}" target="_blank" rel="noopener noreferrer"><span>LINKEDIN</span><b>@edoardorappanello</b></a>
          </div>
        </div>
        <figure class="contact-photo">
          <img src="assets/images/profilephoto.webp" alt="${esc(t('portfolio.portraitAlt'))}" loading="lazy" decoding="async">
        </figure>
      </div>`,

    resume:() => `
      <section class="resume-view">
        <header class="resume-header">
          <div><h2>${esc(resume.title)}</h2></div>
          <p>${esc(resume.intro)}</p>
        </header>
        <section class="resume-section">
          <h3 class="resume-section-title">${esc(t('resume.experience'))}</h3>
          <div class="resume-list">${resume.experience.map(item=>`
            <article class="resume-row">
              <div class="resume-period"><span class="doto-glyph" aria-hidden="true">•</span> ${esc(item.period)}</div>
              <div><h4 class="resume-role">${esc(item.role)}</h4><strong>${esc(item.company)}</strong><small><span class="doto-glyph" aria-hidden="true">[</span> ${esc(item.location)} <span class="doto-glyph" aria-hidden="true">]</span></small>${paragraphs(item.description)}</div>
            </article>`).join('')}</div>
        </section>
        <section class="resume-section">
          <h3 class="resume-section-title">${esc(t('resume.education'))}</h3>
          <div class="resume-list">${resume.education.map(item=>`
            <article class="resume-row compact"><div class="resume-period"><span class="doto-glyph" aria-hidden="true">•</span> ${esc(item.period)}</div><div><h4 class="resume-role">${esc(item.course)}</h4><strong>${esc(item.school)}</strong>${paragraphs(item.description)}</div></article>`).join('')}</div>
        </section>
        <div class="resume-columns">
          <section><h3 class="resume-section-title">${esc(t('resume.capabilities'))}</h3>${tagList(resume.capabilities, 'skill-list')}</section>
          <section><h3 class="resume-section-title">${esc(t('resume.tools'))}</h3>${tagList(resume.tools, 'skill-list')}</section>
        </div>
      </section>`,

    projects:() => `
      <section class="projects-index-v2">
        <header class="projects-index-head">
          <div>
            <h2>${t('portfolio.selectedWork')}</h2>
          </div>
          <div class="projects-index-side">
            <p>${esc(t('portfolio.selectedCopy'))}</p>
          </div>
        </header>
        <div class="projects-grid-v2">
          ${projects.map((p,i)=>`
            <a href="${BASE_PATH}work/${esc(p.slug)}/" class="project-tile-v2 project-visual-${(i%4)+1}" data-project-slug="${esc(p.slug)}" aria-label="${esc(t('portfolio.openProject'))} ${esc(p.title)}">
              <span class="project-cover-v2">
                <span class="project-cover-id">${esc(p.id)}</span>
                <span class="project-cover-type">${esc(p.type.toUpperCase())}</span>
                ${projectImage(p)}
                <span class="project-cover-open">${esc(t('portfolio.viewProject'))} ↗</span>
              </span>
              <span class="project-tile-copy">
                <span class="project-tile-main"><small><span class="doto-glyph" aria-hidden="true">•</span> ${esc(projectYear(p))}</small><strong>${esc(p.displayTitle || p.title).replace(/\n/g,'<br>')}</strong></span>
                <span class="project-tile-details"><small>${esc(p.client)}</small><small>${esc(p.type.toUpperCase())}</small></span>
              </span>
            </a>`).join('')}
        </div>
      </section>`
  };

  function projectShell(inner){
    return `<div class="projects-chrome" aria-label="${esc(t('window.projects'))}">
      <button class="projects-back" data-projects-back aria-label="${esc(t('window.backLabel'))}" title="${esc(t('window.back'))}">${backGlyph}</button>
      <button class="projects-close" data-projects-close aria-label="${esc(t('window.closeLabel'))}" title="${esc(t('window.close'))}">×</button>
    </div>${inner}`;
  }


  function renderProjectMedia(media,index,project){
    const src=media.src || (media.type==='hero' ? project.cover : null);
    // Show only supplied artwork; decorative placeholders are not project media.
    if(!src) return '';
    const cls={hero:'case-media-hero-v2',landscape:'case-media-landscape-v2',portrait:'case-media-portrait-v2',wide:'case-media-wide-v2'}[media.type]||'';
    const isVideoHero = media.type === 'hero' && Boolean(project.video);
    return `<figure class="case-media-v2 ${cls} has-original-media">
      ${isVideoHero ? `<video class="case-media-img case-media-video" src="${esc(new URL(project.video, BASE_URL).href)}" autoplay muted loop playsinline preload="auto" aria-label="${esc(media.alt || project.title)}"></video>` : `<img class="case-media-img" src="${esc(src)}" alt="${esc(media.alt || project.title)}" loading="lazy" decoding="async">`}
      <figcaption><span>${String(index).padStart(2,'0')}</span><span>${esc(media.label)}</span></figcaption>
    </figure>`;
  }

  function liveSiteLink(p){
    if(!p.liveUrl) return '';
    return `<a class="case-live-link" href="${esc(p.liveUrl)}" target="_blank" rel="noopener noreferrer" aria-label="${esc(t('case.visitLive'))} ${esc(p.title)}">${esc(t('case.visitLive'))}</a>`;
  }

  function renderProjectCase(p){
    if(!openProjectsView()) return false;
    const index=projects.indexOf(p);
    const prev=projects[(index-1+projects.length)%projects.length];
    const next=projects[(index+1)%projects.length];
    document.body.classList.add('project-case-open');
    projectsView.classList.add('case-mode');
    projectsView.dataset.view='case';
    projectsView.dataset.project=p.slug;
    dispatchEvent(new CustomEvent('portfolio:project-opened'));
    const media=p.media||[];
    const hero=media[0] ? renderProjectMedia(media[0],1,p) : '';
    const galleryMedia=media.slice(1).filter(item=>item.src);
    const gallery=galleryMedia.map((m,i)=>renderProjectMedia(m,i+2,p)).join('');
    const outputs=(p.outputs||[]).length ? `
        <section class="case-outputs-v2">
          <div class="case-story-label">${esc(t('case.outputs'))}</div>
          <div class="case-output-list">
            ${p.outputs.map(item=>`<article><h3>${esc(item.title)}</h3><p>${esc(item.description)}</p></article>`).join('')}
          </div>
        </section>` : '';
    projectsView.innerHTML=projectShell(`
      <article class="case-study-v2">
        <div class="case-topline">
          <button class="case-back-v2" data-back-projects>${backGlyph} ${esc(t('portfolio.selectedWorkText'))}</button>
          <span><span class="doto-glyph" aria-hidden="true">•</span> ${esc(projectYear(p))}</span>
        </div>
        <header class="case-lead-v2">
          <div class="case-title-v2"><h2 tabindex="-1">${esc(p.displayTitle || p.title).replace(/\n/g,'<br>')}</h2></div>
          <p>${esc(p.intro)}</p>
          <div class="case-role-v2"><span>${esc(t('case.role'))}</span><p>${esc(p.role)}</p></div>
        </header>
        ${hero}
        <dl class="case-facts-v2">
          <div><dt>${esc(t('case.client'))}</dt><dd>${esc(p.client)}</dd></div>
          <div><dt>${esc(t('case.deliverables'))}</dt><dd>${esc(p.deliverables)}</dd></div>
          <div><dt>${esc(t('case.year'))}</dt><dd><span class="doto-glyph" aria-hidden="true">•</span> ${esc(projectYear(p))}</dd></div>
        </dl>
        ${liveSiteLink(p)}
        <section class="case-story-v2">
          <div class="case-story-label">${esc(t('case.notes'))}</div>
          <div class="case-story-copy">
            <article><span><span class="doto-glyph" aria-hidden="true">[</span> 01 <span class="doto-glyph" aria-hidden="true">]</span> <span class="doto-glyph" aria-hidden="true">•</span> ${esc(t('case.context'))}</span><p>${esc(p.context)}</p></article>
            <article><span><span class="doto-glyph" aria-hidden="true">[</span> 02 <span class="doto-glyph" aria-hidden="true">]</span> <span class="doto-glyph" aria-hidden="true">•</span> ${esc(t('case.direction'))}</span><p>${esc(p.direction)}</p></article>
          </div>
        </section>
        ${gallery ? `<section class="case-gallery-v2" aria-label="${esc(t('case.gallery'))}">${gallery}</section>` : ''}
        ${p.proof ? `<section class="case-story-v2 case-proof-v2"><div class="case-story-label">${esc(p.proof.label)}</div><div class="case-story-copy"><article><span>${esc(p.proof.eyebrow)}</span><p>${esc(p.proof.text)}</p></article></div></section>` : ''}
        <section class="case-tags-v2"><span>${esc(t('case.disciplines'))}</span>${tagList(p.tags)}</section>
        ${outputs}
        <nav class="case-nav-v2" aria-label="${esc(t('case.nav'))}">
          <button data-project-slug="${esc(prev.slug)}"><small>${esc(t('case.previous'))}</small><b>← ${esc(prev.title)}</b></button>
          <button data-project-slug="${esc(next.slug)}"><small>${esc(t('case.next'))}</small><b>${esc(next.title)} →</b></button>
        </nav>
      </article>`);
    projectsView.scrollTop=0;
    bindProjectChrome(projectsView);
    projectsView.querySelector('[data-back-projects]').addEventListener('click',()=>navigateProjects({back:true}));
    bindProjectLinks(projectsView);
    projectsView.querySelector('.case-title-v2 h2').focus({preventScroll:true});
    return true;
  }


  function close() {
    if (transitionSwap !== null) cancelTransition();
    const wasOpen = !projectsView.hidden;
    const focusTarget = projectTrigger;
    projectTrigger = null;
    scrollViewport.inert = false;
    projectsView.hidden = true;
    projectsView.classList.remove('is-open','case-mode');
    projectsView.innerHTML = '';
    delete projectsView.dataset.view;
    delete projectsView.dataset.project;
    layer.replaceChildren();
    document.body.classList.remove('projects-open','content-panel-open','project-case-open');
    if (wasOpen) dispatchEvent(new CustomEvent('portfolio:project-closed'));
    return focusTarget;
  }
  function openProjectsView() {
    if (projectsView.hidden) {
      const active = document.activeElement;
      projectTrigger = active?.closest('[data-project-slug]') || null;
    }
    scrollViewport.inert = true;
    layer.replaceChildren();
    projectsView.hidden = false;
    projectsView.classList.add('is-open');
    document.body.classList.add('projects-open','content-panel-open');
    return true;
  }
  function navigateToProject(slug) {
    const project = projectBySlug(slug) || projectById(slug);
    if (!project) return;
    returnSection = 'work';
    const route = {type:'project',slug:project.slug};
    history.pushState({portfolioProject:project.slug}, '', routePath(route));
    updateRouteMeta(route);
    renderProjectCase(project);
  }
  function returnToScroll(kind=returnSection) {
    const focusTarget = close();
    navigateSection(kind,{replace:true});
    dispatchEvent(new CustomEvent('portfolio:scroll-return',{detail:{kind,focusTarget}}));
  }
  function navigateProjects() { crtTransition(()=>returnToScroll('work')); }
  function bindProjectChrome(root) {
    root.querySelector('[data-projects-back]')?.addEventListener('click',navigateProjects);
    root.querySelector('[data-projects-close]')?.addEventListener('click',()=>returnToScroll());
  }
  function bindProjectLinks(root) {
    root.querySelectorAll('[data-project-slug]').forEach(button => button.addEventListener('click',()=>navigateToProject(button.dataset.projectSlug)));
  }
  function applyRoute() {
    cancelTransition();
    const route = parseRoute();
    updateRouteMeta(route);
    if (route.type === 'project') {
      const project = projectBySlug(route.slug);
      if (project) { renderProjectCase(project); return; }
      returnToScroll('work'); return;
    }
    close();
    if (document.body.classList.contains('site-ready')) dispatchEvent(new CustomEvent('portfolio:scroll-to',{detail:{kind:route.type === 'work' ? 'work' : route.kind || 'home'}}));
  }
  function syncLocalizedData() {
    DATA = window.PORTFOLIO_DATA || DATA;
    ({profile,resume,projects}=DATA);
  }
  document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{
    const kind=button.dataset.open === 'projects' ? 'work' : button.dataset.open;
    dispatchEvent(new CustomEvent('portfolio:scroll-to',{detail:kind}));
  }));
  addEventListener('popstate',applyRoute);
  addEventListener('keydown',event=>{if(event.key==='Escape' && (!projectsView.hidden || layer.children.length)) returnToScroll();});
  addEventListener('resize',()=>layer.querySelector('.os-window')?.classList.toggle('is-responsive-fullscreen',matchMedia('(max-width:1024px)').matches));
  addEventListener('portfolio:langchange',()=>{
    syncLocalizedData();
    const route=parseRoute();
    if(route.type==='project') { const project=projectBySlug(route.slug); if(project) renderProjectCase(project); }
    updateRouteMeta(route);
  });
  window.Portfolio = { content:kind=>contents[kind==='work'?'projects':kind](), openProject:navigateToProject, close, refresh:syncLocalizedData, getRoute:parseRoute, navigateSection };
  applyRoute();
  dispatchEvent(new CustomEvent('portfolio:runtime-ready'));
})();
