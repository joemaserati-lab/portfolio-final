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
  const projectById = id => projects.find(p => p.id === String(id).padStart(2,'0'));
  const projectBySlug = slug => projects.find(p => p.slug === slug);
  const backGlyph = '<span aria-hidden="true" style="display:inline-block;line-height:1;transform:translate(1px,-1px)">&lt;</span>';
  const projectImage = p => p.cover ? `<img class="project-cover-img" src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy" decoding="async">` : '<span class="project-cover-art" aria-hidden="true"></span>';

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
  }

  const tagList = items => `<div class="tags">${items.map(t=>`<span>${esc(t)}</span>`).join('')}</div>`;

  const contents = {
    about:() => `
      <h2>${esc(profile.name)}</h2>
      ${paragraphs(profile.intro)}
      <div class="meta-grid">
        <div class="meta-card"><small>${esc(t('about.role'))}</small><b>${esc(profile.role)}</b></div>
        <div class="meta-card"><small>${esc(t('about.experience'))}</small><b>${esc(profile.experience)}</b></div>
        <div class="meta-card"><small>${esc(t('about.focus'))}</small><b>${profile.focus.map(esc).join(' / ')}</b></div>
      </div>`,

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
          <div class="resume-section-title">${esc(t('resume.experience'))}</div>
          <div class="resume-list">${resume.experience.map(item=>`
            <article class="resume-row">
              <div class="resume-period">${esc(item.period)}</div>
              <div><h3>${esc(item.role)}</h3><strong>${esc(item.company)}</strong><small>${esc(item.location)}</small>${paragraphs(item.description)}</div>
            </article>`).join('')}</div>
        </section>
        <section class="resume-section">
          <div class="resume-section-title">${esc(t('resume.education'))}</div>
          <div class="resume-list">${resume.education.map(item=>`
            <article class="resume-row compact"><div class="resume-period">${esc(item.period)}</div><div><h3>${esc(item.course)}</h3><strong>${esc(item.school)}</strong>${paragraphs(item.description)}</div></article>`).join('')}</div>
        </section>
        <div class="resume-columns">
          <section><div class="resume-section-title">${esc(t('resume.capabilities'))}</div>${tagList(resume.capabilities)}</section>
          <section><div class="resume-section-title">${esc(t('resume.tools'))}</div>${tagList(resume.tools)}</section>
        </div>
      </section>`,

    projects:() => `
      <section class="projects-index-v2">
        <header class="projects-index-head">
          <div>
            <h2>${t('portfolio.selectedWork')}</h2>
          </div>
          <div class="projects-index-side">
            <span>${esc(t('portfolio.period'))}</span>
            <span>DESIGN / WEB / DIGITAL MARKETING</span>
            <p>${esc(t('portfolio.selectedCopy'))}</p>
          </div>
        </header>
        <div class="projects-grid-v2">
          ${projects.map((p,i)=>`
            <button class="project-tile-v2 project-visual-${(i%4)+1}" data-project-slug="${esc(p.slug)}" aria-label="${esc(t('portfolio.openProject'))} ${esc(p.title)}">
              <span class="project-cover-v2">
                <span class="project-cover-id">${esc(p.id)}</span>
                <span class="project-cover-type">${esc(p.type.toUpperCase())}</span>
                ${projectImage(p)}
                <span class="project-cover-open">${esc(t('portfolio.viewProject'))} ↗</span>
              </span>
              <span class="project-tile-copy">
                <span class="project-tile-main"><small>${esc(p.id)} / ${esc(p.year)}</small><strong>${esc(p.displayTitle || p.title).replace(/\n/g,'<br>')}</strong></span>
                <span class="project-tile-details"><small>${esc(p.client)}</small><small>${esc(p.type.toUpperCase())}</small></span>
              </span>
            </button>`).join('')}
        </div>
      </section>`
  };

  function projectShell(inner){
    return `<div class="projects-chrome" aria-label="${esc(t('window.projects'))}">
      <button class="projects-back" data-projects-back aria-label="${esc(t('window.backLabel'))}" title="${esc(t('window.back'))}">${backGlyph}</button>
      <button class="projects-close" data-projects-close aria-label="${esc(t('window.closeLabel'))}" title="${esc(t('window.close'))}">×</button>
    </div>${inner}`;
  }


  function mediaPlaceholder(media,index,project,{galleryIndex=null,galleryCount=0}={}){
    const cls={hero:'case-media-hero-v2',landscape:'case-media-landscape-v2',portrait:'case-media-portrait-v2',wide:'case-media-wide-v2'}[media.type]||'';
    const variant=((projects.indexOf(project)+index-1)%4)+1;
    const bentoClass=galleryIndex===null ? '' : ` bento-slot-${galleryIndex%4}${galleryCount%2===1 && galleryIndex===galleryCount-1 ? ' bento-full' : ''}`;
    const image=media.type==='hero' && project.cover ? `<img class="case-media-img" src="${esc(project.cover)}" alt="${esc(project.title)}" loading="lazy" decoding="async">` : '<div class="case-media-surface" aria-hidden="true"></div>';
    return `<figure class="case-media-v2 ${cls} media-visual-${variant}${bentoClass}">
      ${image}
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
    projectsView.classList.add('case-mode');
    projectsView.dataset.view='case';
    projectsView.dataset.project=p.slug;
    const media=p.media||[];
    const hero=media[0] ? mediaPlaceholder(media[0],1,p) : '';
    const galleryMedia=media.slice(1);
    const gallery=galleryMedia.map((m,i)=>mediaPlaceholder(m,i+2,p,{galleryIndex:i,galleryCount:galleryMedia.length})).join('');
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
          <span>${String(index+1).padStart(2,'0')} / ${String(projects.length).padStart(2,'0')}</span>
        </div>
        <header class="case-lead-v2">
          <div class="case-title-v2"><h2>${esc(p.displayTitle || p.title).replace(/\n/g,'<br>')}</h2></div>
          <p>${esc(p.intro)}</p>
        </header>
        ${hero}
        <dl class="case-facts-v2">
          <div><dt>${esc(t('case.client'))}</dt><dd>${esc(p.client)}</dd></div>
          <div><dt>${esc(t('case.role'))}</dt><dd>${esc(p.role)}</dd></div>
          <div><dt>${esc(t('case.deliverables'))}</dt><dd>${esc(p.deliverables)}</dd></div>
          <div><dt>${esc(t('case.year'))}</dt><dd>${esc(p.year)}</dd></div>
        </dl>
        ${liveSiteLink(p)}
        <section class="case-story-v2">
          <div class="case-story-label">${esc(t('case.notes'))}</div>
          <div class="case-story-copy">
            <article><span>01 / ${esc(t('case.context'))}</span><p>${esc(p.context)}</p></article>
            <article><span>02 / ${esc(t('case.direction'))}</span><p>${esc(p.direction)}</p></article>
          </div>
        </section>
        <section class="case-gallery-v2" aria-label="${esc(t('case.gallery'))}">${gallery}</section>
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
    return true;
  }


  function close() {
    projectsView.hidden = true;
    projectsView.classList.remove('is-open','case-mode');
    projectsView.innerHTML = '';
    delete projectsView.dataset.view;
    delete projectsView.dataset.project;
    layer.replaceChildren();
    document.body.classList.remove('projects-open','content-panel-open');
  }
  function openProjectsView() {
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
    close();
    navigateSection(kind,{replace:true});
    dispatchEvent(new CustomEvent('portfolio:scroll-return',{detail:kind}));
  }
  function navigateProjects() { returnToScroll('work'); }
  function navigateHome() { returnToScroll(); }
  function bindProjectChrome(root) {
    root.querySelector('[data-projects-back]')?.addEventListener('click',navigateProjects);
    root.querySelector('[data-projects-close]')?.addEventListener('click',()=>returnToScroll());
  }
  function bindProjectLinks(root) {
    root.querySelectorAll('[data-project-slug]').forEach(button => button.addEventListener('click',()=>navigateToProject(button.dataset.projectSlug)));
  }
  function openResume() {
    close();
    const dialog = document.createElement('section');
    dialog.className = 'os-window is-maximized';
    if (matchMedia('(max-width:1024px)').matches) dialog.classList.add('is-responsive-fullscreen');
    dialog.dataset.kind = 'resume';
    dialog.setAttribute('role','dialog');
    dialog.setAttribute('aria-labelledby','resume-title');
    dialog.innerHTML = `<div class="window-titlebar"><button class="window-back" data-close aria-label="${esc(t('window.backLabel'))}">${backGlyph}</button><span id="resume-title">${esc(t('window.resume'))}</span><div class="window-controls"><button data-close aria-label="${esc(t('window.closeLabel'))}">×</button></div></div><div class="window-body">${contents.resume()}</div>`;
    dialog.querySelectorAll('[data-close]').forEach(button=>button.addEventListener('click',()=>returnToScroll()));
    layer.appendChild(dialog);
    document.body.classList.add('content-panel-open');
  }
  function applyRoute() {
    const route = parseRoute();
    updateRouteMeta(route);
    if (route.type === 'project') {
      const project = projectBySlug(route.slug);
      if (project) { renderProjectCase(project); return; }
      returnToScroll('work'); return;
    }
    if (route.type === 'section' && route.kind === 'resume') { returnSection = 'home'; openResume(); return; }
    close();
    if (document.body.classList.contains('site-ready')) dispatchEvent(new CustomEvent('portfolio:scroll-to',{detail:{kind:route.type === 'work' ? 'work' : route.kind || 'home'}}));
  }
  function syncLocalizedData() {
    DATA = window.PORTFOLIO_DATA || DATA;
    ({profile,resume,projects}=DATA);
  }
  document.querySelectorAll('[data-open]').forEach(button=>button.addEventListener('click',()=>{
    const kind=button.dataset.open === 'projects' ? 'work' : button.dataset.open;
    if (kind === 'resume') {
      returnSection=document.querySelector('.scroll-index [aria-current]')?.dataset.scrollSection || 'home';
      navigateSection('resume'); openResume();
    } else dispatchEvent(new CustomEvent('portfolio:scroll-to',{detail:kind}));
  }));
  addEventListener('popstate',applyRoute);
  addEventListener('keydown',event=>{if(event.key==='Escape' && (!projectsView.hidden || layer.children.length)) returnToScroll();});
  addEventListener('resize',()=>layer.querySelector('.os-window')?.classList.toggle('is-responsive-fullscreen',matchMedia('(max-width:1024px)').matches));
  addEventListener('portfolio:langchange',()=>{
    syncLocalizedData();
    const route=parseRoute();
    if(route.type==='project') { const project=projectBySlug(route.slug); if(project) renderProjectCase(project); }
    else if(route.kind==='resume') openResume();
    updateRouteMeta(route);
  });
  window.Portfolio = { content:kind=>contents[kind==='work'?'projects':kind](), openProject:navigateToProject, close, refresh:syncLocalizedData, getRoute:parseRoute, navigateSection };
  applyRoute();
  dispatchEvent(new CustomEvent('portfolio:runtime-ready'));
})();
