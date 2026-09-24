(() => {
  let DATA = window.PORTFOLIO_DATA;
  if (!DATA) {
    console.error('PORTFOLIO_DATA is missing.');
    return;
  }

  let { profile, resume, projects } = DATA;
  const i18n = window.PortfolioI18n;
  const t = key => i18n?.t?.(key) || key;
  const layer = document.getElementById('window-layer');
  const screen = document.getElementById('screen');
  const projectsView = document.getElementById('projects-view');
  const coarsePointer = matchMedia('(hover: none), (pointer: coarse)');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const responsiveWindows = matchMedia('(max-width: 1024px)');
  let z = 20;
  let routeReady = !document.body.classList.contains('booting');
  let lastLauncher = null;
  let closingHistoryWindow = false;

  const esc = s => String(s).replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const paragraphs = value => [].concat(value || []).map(text => `<p>${esc(text)}</p>`).join('');
  const projectById = id => projects.find(p => p.id === String(id).padStart(2,'0'));
  const projectBySlug = slug => projects.find(p => p.slug === slug);
  const isTouchDevice = () => coarsePointer.matches || navigator.maxTouchPoints > 0;
  const backGlyph = '<span aria-hidden="true" style="display:inline-block;line-height:1;transform:translate(1px,-1px)">&lt;</span>';
  const projectImage = p => p.cover ? `<img class="project-cover-img" src="${esc(p.cover)}" alt="${esc(p.title)}" loading="lazy" decoding="async">` : '<span class="project-cover-art" aria-hidden="true"></span>';

  let degaussSwap=null, degaussEnd=null;
  let mobileProjectObserver=null;
  function microGlitch(){
    if(!screen || reduceMotion.matches || screen.classList.contains('crt-degauss')) return;
    screen.classList.remove('micro-glitch');
    screen.style.setProperty('--micro-glitch-y',`${28+Math.random()*44}%`);
    void screen.offsetWidth;
    screen.classList.add('micro-glitch');
    setTimeout(()=>screen.classList.remove('micro-glitch'),160);
  }
  function cancelDegauss(){
    clearTimeout(degaussSwap); clearTimeout(degaussEnd);
    degaussSwap=null; degaussEnd=null;
    screen?.classList.remove('crt-degauss');
  }
  function degauss(action){
    cancelDegauss();
    if(!screen || reduceMotion.matches){ action?.(); return; }
    screen.classList.remove('micro-glitch');
    void screen.offsetWidth;
    screen.classList.add('crt-degauss');
    // Swap the content while the raster has collapsed to the central line.
    degaussSwap=setTimeout(()=>{degaussSwap=null;action?.();},155);
    degaussEnd=setTimeout(cancelDegauss,370);
  }
  function bindMobileProjectMotion(root){
    mobileProjectObserver?.disconnect();
    mobileProjectObserver=null;
    const cards=[...root.querySelectorAll('.project-tile-v2')];
    if(!cards.length || !coarsePointer.matches || reduceMotion.matches) return;
    const timers=new WeakMap();
    mobileProjectObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        const card=entry.target;
        if(!entry.isIntersecting || entry.intersectionRatio<.58) return;
        if(timers.has(card)) clearTimeout(timers.get(card));
        const delay=90+(cards.indexOf(card)%3)*120;
        const t=setTimeout(()=>{
          cards.forEach(c=>c!==card&&c.classList.remove('mobile-signal'));
          card.classList.add('mobile-signal');
          setTimeout(()=>card.classList.remove('mobile-signal'),1050);
        },delay);
        timers.set(card,t);
      });
    },{threshold:[.58,.72]});
    cards.forEach(card=>{
      mobileProjectObserver.observe(card);
      card.addEventListener('pointerdown',()=>card.classList.add('is-pressed'),{passive:true});
      const clear=()=>setTimeout(()=>card.classList.remove('is-pressed'),140);
      card.addEventListener('pointerup',clear,{passive:true});
      card.addEventListener('pointercancel',clear,{passive:true});
    });
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

  function windowRectInLayer(win){
    const wr=win.getBoundingClientRect(), lr=layer.getBoundingClientRect();
    return {left:wr.left-lr.left, top:wr.top-lr.top, width:wr.width, height:wr.height, right:wr.right-lr.left, bottom:wr.bottom-lr.top};
  }

  function overlapArea(a,b){
    const x=Math.max(0,Math.min(a.right,b.right)-Math.max(a.left,b.left));
    const y=Math.max(0,Math.min(a.bottom,b.bottom)-Math.max(a.top,b.top));
    return x*y;
  }

  function placeWindowRandomly(win){
    if(responsiveWindows.matches) return;
    const layerW=layer.clientWidth, layerH=layer.clientHeight;
    const winW=win.offsetWidth, winH=win.offsetHeight;
    const maxX=Math.max(0,layerW-winW), maxY=Math.max(0,layerH-winH);
    const others=[...layer.querySelectorAll('.os-window')]
      .filter(w=>w!==win && !w.classList.contains('is-maximized') && !w.classList.contains('is-responsive-fullscreen'))
      .map(windowRectInLayer);
    const candidates=[];
    const margin=Math.min(18,Math.max(6,Math.min(layerW,layerH)*.025));
    const usableX=Math.max(0,maxX-margin*2), usableY=Math.max(0,maxY-margin*2);
    const anchors=[[.08,.10],[.58,.12],[.14,.54],[.62,.58],[.34,.30],[.46,.48]];
    anchors.forEach(([ax,ay])=>candidates.push({
      left:Math.min(maxX,Math.max(0,margin+usableX*ax+(Math.random()-.5)*42)),
      top:Math.min(maxY,Math.max(0,margin+usableY*ay+(Math.random()-.5)*34))
    }));
    for(let i=0;i<42;i++) candidates.push({left:margin+Math.random()*usableX,top:margin+Math.random()*usableY});

    let best=null, bestScore=Infinity;
    for(const c of candidates){
      const rect={left:c.left,top:c.top,width:winW,height:winH,right:c.left+winW,bottom:c.top+winH};
      let score=0;
      for(const o of others){
        const overlap=overlapArea(rect,o);
        score += overlap/Math.max(1,Math.min(winW*winH,o.width*o.height))*1000;
        const dx=Math.abs(rect.left-o.left), dy=Math.abs(rect.top-o.top);
        if(dx<54 && dy<46) score+=5000;
        const dist=Math.hypot((rect.left+rect.width/2)-(o.left+o.width/2),(rect.top+rect.height/2)-(o.top+o.height/2));
        if(dist<120) score+=(120-dist)*2;
      }
      score+=Math.random()*8;
      if(score<bestScore){bestScore=score;best=c;}
    }
    win.style.transform='none';
    win.style.left=`${Math.round(best?.left ?? maxX*.5)}px`;
    win.style.top=`${Math.round(best?.top ?? maxY*.5)}px`;
  }

  function setResizeControl(win){
    const btn=win.querySelector('[data-resize]');
    if(btn) btn.remove();
  }

  function projectShell(inner,{caseView=false}={}){
    return `<div class="projects-chrome" aria-label="${esc(t('window.projects'))}">
      <button class="projects-back" data-projects-back aria-label="${esc(t('window.backLabel'))}" title="${esc(t('window.back'))}">${backGlyph}</button>
      <button class="projects-close" data-projects-close aria-label="${esc(t('window.closeLabel'))}" title="${esc(t('window.close'))}">×</button>
    </div>${inner}`;
  }

  function bindProjectChrome(root){
    root.querySelector('[data-projects-back]')?.addEventListener('click',()=>{
      if(projectsView?.dataset.view==='case') navigateProjects();
      else closeProjectsView({updateRoute:true});
    });
    root.querySelector('[data-projects-close]')?.addEventListener('click',()=>closeProjectsView({updateRoute:true}));
  }

  function updateWindowControls(win){
    const back=win.querySelector('[data-window-back]');
    const close=win.querySelector('[data-close]');
    if(back){ back.setAttribute('aria-label',t('window.backLabel')); back.title=t('window.back'); }
    if(close){ close.setAttribute('aria-label',t('window.closeLabel')); close.title=t('window.close'); }
  }

  function applyResponsiveState(win){
    if(win.classList.contains('is-maximized')){
      win.classList.remove('is-responsive-fullscreen');
      setResizeControl(win);
      return;
    }
    if(responsiveWindows.matches){
      if(!win.classList.contains('is-responsive-fullscreen')){
        if(!win.classList.contains('is-maximized')){
          const r=windowRectInLayer(win);
          win.dataset.responsiveLeft=String(r.left);
          win.dataset.responsiveTop=String(r.top);
          win.dataset.responsiveWidth=String(r.width);
          win.dataset.responsiveHeight=String(r.height);
        }
        win.classList.add('is-responsive-fullscreen');
      }
    } else if(win.classList.contains('is-responsive-fullscreen')){
      win.classList.remove('is-responsive-fullscreen');
      if(!win.classList.contains('is-maximized')){
        const w=Math.min(layer.clientWidth,parseFloat(win.dataset.responsiveWidth)||win.offsetWidth);
        const h=Math.min(layer.clientHeight,parseFloat(win.dataset.responsiveHeight)||win.offsetHeight);
        if(win.dataset.responsiveLeft!=null){
          win.style.width=`${w}px`; win.style.height=`${h}px`;
          win.style.left=`${Math.max(0,Math.min(layer.clientWidth-w,parseFloat(win.dataset.responsiveLeft)||0))}px`;
          win.style.top=`${Math.max(0,Math.min(layer.clientHeight-h,parseFloat(win.dataset.responsiveTop)||0))}px`;
        } else requestAnimationFrame(()=>placeWindowRandomly(win));
      }
    }
    setResizeControl(win);
  }

  function createWindow(kind, title){
    const existing = document.querySelector(`.os-window[data-kind="${kind}"]`);
    if(existing){ existing.__returnFocus=lastLauncher || existing.__returnFocus; bringFront(existing); focusWindow(existing); return existing; }
    const win=document.createElement('section');
    win.className='os-window'; win.dataset.kind=kind; win.style.zIndex=++z;
    win.tabIndex=-1;
    win.setAttribute('role','dialog');
    win.setAttribute('aria-modal','false');
    const titleId=`window-title-${kind}`;
    win.setAttribute('aria-labelledby',titleId);
    win.__returnFocus=lastLauncher;
    win.innerHTML=`<div class="window-titlebar"><button class="window-back" data-window-back aria-label="${esc(t('window.backLabel'))}" title="${esc(t('window.back'))}">${backGlyph}</button><span id="${titleId}">${title}</span><div class="window-controls"><button data-close aria-label="${esc(t('window.closeLabel'))}" title="${esc(t('window.close'))}">×</button></div></div><div class="window-body"></div>`;
    layer.appendChild(win);
    if(!responsiveWindows.matches){
      placeWindowRandomly(win);
      const initial=windowRectInLayer(win);
      win.dataset.restoreLeft=String(initial.left);
      win.dataset.restoreTop=String(initial.top);
      win.dataset.restoreWidth=String(initial.width);
      win.dataset.restoreHeight=String(initial.height);
    }
    win.classList.add('is-maximized');
    wireWindow(win);
    setResizeControl(win);
    return win;
  }

  function focusWindow(win){
    requestAnimationFrame(()=>{
      const target=win.querySelector('[data-close]') || win;
      target.focus({preventScroll:true});
    });
  }

  function bindProjectLinks(root){
    root.querySelectorAll('[data-project-slug]').forEach(el=>el.addEventListener('click',()=>navigateToProject(el.dataset.projectSlug)));
    bindMobileProjectMotion(root);
  }

  function openProjectsView(){
    if(!projectsView) return false;
    projectsView.hidden=false;
    projectsView.classList.add('is-open');
    document.body.classList.add('projects-open');
    return true;
  }

  function closeProjectsView({updateRoute=false}={}){
    if(!projectsView || projectsView.hidden) return;
    projectsView.hidden=true;
    projectsView.classList.remove('is-open','case-mode');
    projectsView.innerHTML='';
    delete projectsView.dataset.view;
    delete projectsView.dataset.project;
    document.body.classList.remove('projects-open');
    if(updateRoute && /^#\/(projects|work\/)/.test(location.hash)) history.pushState(null,'',location.pathname+location.search);
  }

  function pushMobileWindowState(win){
    if(!isTouchDevice() || win.__historyManaged) return;
    win.__historyManaged=true;
    history.pushState({ portfolioWindow: win.dataset.kind }, '', location.href);
  }

  function topWindow(){
    return [...document.querySelectorAll('.os-window')].sort((a,b)=>(+b.style.zIndex||0)-(+a.style.zIndex||0))[0];
  }

  function renderProjectsDirectory(){
    if(!openProjectsView()) return false;
    projectsView.classList.remove('case-mode');
    projectsView.dataset.view='directory';
    delete projectsView.dataset.project;
    projectsView.innerHTML=projectShell(contents.projects());
    projectsView.scrollTop=0;
    bindProjectChrome(projectsView);
    bindProjectLinks(projectsView);
    microGlitch();
    return true;
  }

  function openWindow(kind,{updateRoute=false}={}){
    if(kind==='projects') return renderProjectsDirectory();
    const labels={projects:t('window.projects'),about:t('window.about'),contact:t('window.contact'),resume:t('window.resume')};
    const win=createWindow(kind,labels[kind]||kind.toUpperCase());
    win.classList.remove('case-mode');
    win.querySelector('.window-body').innerHTML=contents[kind]();
    applyResponsiveState(win);
    bringFront(win);
    focusWindow(win);
    pushMobileWindowState(win);
    if(kind!=='projects') microGlitch();
    if(updateRoute && kind==='projects' && location.hash !== '#/projects') location.hash='/projects';
    return win;
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
      </article>`,{caseView:true});
    projectsView.scrollTop=0;
    bindProjectChrome(projectsView);
    projectsView.querySelector('[data-back-projects]').addEventListener('click',()=>navigateProjects());
    bindProjectLinks(projectsView);
    return true;
  }

  function openProject(slug,{updateRoute=false}={}){
    const p=projectBySlug(slug) || projectById(slug); if(!p) return false;
    renderProjectCase(p);
    if(updateRoute && location.hash !== `#/work/${p.slug}`) location.hash=`/work/${p.slug}`;
    return true;
  }

  function navigateToProject(slug){
    const p=projectBySlug(slug) || projectById(slug); if(!p) return;
    // Case studies switch instantly; the CRT degauss is reserved for desktop launchers.
    openProject(p.slug,{updateRoute:true});
  }
  function navigateProjects(){
    degauss(()=>{
      renderProjectsDirectory();
      if(location.hash !== '#/projects') location.hash='/projects';
    });
  }

  function openLauncher(kind){
    if(kind==='projects'){
      navigateProjects();
      return;
    }
    degauss(()=>openWindow(kind));
  }
  function route(){
    if(!routeReady) return;
    if(degaussSwap!==null) cancelDegauss();
    const hash=location.hash || '';
    const work=hash.match(/^#\/work\/([^/?#]+)/);
    if(work){ openProject(decodeURIComponent(work[1])); return; }
    if(hash==='#/projects'){ renderProjectsDirectory(); return; }
    closeProjectsView();
  }

  function leavePhosphorGhost(win){
    const wr=win.getBoundingClientRect(), hr=layer.getBoundingClientRect();
    const ghost=document.createElement('div'); ghost.className='phosphor-ghost';
    ghost.style.left=(wr.left-hr.left)+'px'; ghost.style.top=(wr.top-hr.top)+'px'; ghost.style.width=wr.width+'px'; ghost.style.height=wr.height+'px';
    layer.appendChild(ghost); setTimeout(()=>ghost.remove(),2500);
  }
  function bringFront(win){ win.style.zIndex=++z; }
  function closeWindow(win){
    if(!win) return;
    if(isTouchDevice() && win.__historyManaged && !closingHistoryWindow){
      history.back();
      return;
    }
    const returnFocus=win.__returnFocus;
    leavePhosphorGhost(win); win.remove();
    if(returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  }

  function maximizeWindow(win){
    if(win.classList.contains('is-maximized') || win.classList.contains('is-responsive-fullscreen')) return;
    const r=windowRectInLayer(win);
    win.dataset.restoreLeft=String(r.left); win.dataset.restoreTop=String(r.top); win.dataset.restoreWidth=String(r.width); win.dataset.restoreHeight=String(r.height);
    win.classList.add('is-maximized'); win.style.transform='none'; setResizeControl(win); microGlitch();
  }
  function restoreWindow(win){
    if(!win.classList.contains('is-maximized') || win.classList.contains('is-responsive-fullscreen')) return;
    win.classList.remove('is-maximized'); win.style.transform='none';
    const width=Math.min(layer.clientWidth,parseFloat(win.dataset.restoreWidth)||layer.clientWidth*(responsiveWindows.matches?.92:.72));
    const height=Math.min(layer.clientHeight,parseFloat(win.dataset.restoreHeight)||layer.clientHeight*(responsiveWindows.matches?.78:.72));
    const maxX=Math.max(0,layer.clientWidth-width), maxY=Math.max(0,layer.clientHeight-height);
    win.style.width=`${width}px`; win.style.height=`${height}px`;
    win.style.left=`${Math.max(0,Math.min(maxX,parseFloat(win.dataset.restoreLeft)||maxX*.5))}px`;
    win.style.top=`${Math.max(0,Math.min(maxY,parseFloat(win.dataset.restoreTop)||maxY*.5))}px`;
    setResizeControl(win); microGlitch();
  }
  function toggleWindowSize(win){ if(win.classList.contains('is-maximized')) restoreWindow(win); else maximizeWindow(win); bringFront(win); }

  function clampWindowToLayer(win){
    if(win.classList.contains('is-maximized') || win.classList.contains('is-responsive-fullscreen')) return;
    const r=windowRectInLayer(win);
    const maxX=Math.max(0,layer.clientWidth-r.width), maxY=Math.max(0,layer.clientHeight-r.height);
    win.style.left=`${Math.max(0,Math.min(maxX,r.left))}px`; win.style.top=`${Math.max(0,Math.min(maxY,r.top))}px`;
  }

  function wireWindow(win){
    win.addEventListener('pointerdown',()=>bringFront(win));
    win.querySelector('[data-window-back]')?.addEventListener('click',()=>closeWindow(win));
    win.querySelector('[data-close]').addEventListener('click',()=>closeWindow(win));
    const bar=win.querySelector('.window-titlebar'); let drag=false,sx=0,sy=0,sl=0,st=0;
    bar.addEventListener('dblclick',e=>{
      if(!e.target.closest('button') && !win.classList.contains('is-responsive-fullscreen')) bringFront(win);
    });
    bar.addEventListener('pointerdown',e=>{
      if(e.target.closest('button') || win.classList.contains('is-maximized') || win.classList.contains('is-responsive-fullscreen')) return;
      drag=true; bringFront(win);
      const r=windowRectInLayer(win);
      win.style.transform='none'; win.style.left=`${r.left}px`; win.style.top=`${r.top}px`;
      sx=e.clientX; sy=e.clientY; sl=r.left; st=r.top; bar.setPointerCapture(e.pointerId);
    });
    bar.addEventListener('pointermove',e=>{
      if(!drag)return;
      const maxX=Math.max(0,layer.clientWidth-win.offsetWidth),maxY=Math.max(0,layer.clientHeight-win.offsetHeight);
      win.style.left=Math.max(0,Math.min(maxX,sl+e.clientX-sx))+'px'; win.style.top=Math.max(0,Math.min(maxY,st+e.clientY-sy))+'px';
    });
    bar.addEventListener('pointerup',()=>drag=false); bar.addEventListener('pointercancel',()=>drag=false);
  }

  function syncResponsiveWindows(){ document.querySelectorAll('.os-window').forEach(applyResponsiveState); }
  if(responsiveWindows.addEventListener) responsiveWindows.addEventListener('change',syncResponsiveWindows);
  else responsiveWindows.addListener(syncResponsiveWindows);
  addEventListener('resize',()=>{
    syncResponsiveWindows();
    document.querySelectorAll('.os-window:not(.is-maximized):not(.is-responsive-fullscreen)').forEach(clampWindowToLayer);
  },{passive:true});

  document.querySelectorAll('[data-open]').forEach(el=>el.addEventListener('click',()=>{
    lastLauncher=el;
    openLauncher(el.dataset.open);
  }));

  addEventListener('hashchange',route);
  addEventListener('popstate',()=>{
    if(!isTouchDevice()) return;
    const top=topWindow();
    if(!top) return;
    closingHistoryWindow=true;
    closeWindow(top);
    closingHistoryWindow=false;
  });
  addEventListener('keydown',e=>{
    if(e.key==='Escape'){
      const top=topWindow();
      if(top) { cancelDegauss(); closeWindow(top); return; }
      if(!projectsView?.hidden){
        if(location.hash==='#/projects') history.pushState(null,'',location.pathname+location.search);
        else location.hash='/projects';
        route();
      }
    }
  });

  function syncLocalizedData(){
    DATA = window.PORTFOLIO_DATA || DATA;
    ({ profile, resume, projects } = DATA);
  }

  addEventListener('portfolio:langchange',()=>{
    syncLocalizedData();
    if(projectsView && !projectsView.hidden){
      const slug=projectsView.dataset.view==='case' ? projectsView.dataset.project : null;
      if(slug){
        const project=projectBySlug(slug) || projectById(slug);
        if(project) renderProjectCase(project);
        else renderProjectsDirectory();
      } else renderProjectsDirectory();
    }
    document.querySelectorAll('.os-window').forEach(win=>{
      const kind=win.dataset.kind;
      if(contents[kind]){
        win.querySelector('.window-titlebar > span').textContent=({about:t('window.about'),contact:t('window.contact'),resume:t('window.resume')}[kind]||kind.toUpperCase());
        win.querySelector('.window-body').innerHTML=contents[kind]();
      }
      updateWindowControls(win);
      setResizeControl(win);
    });
  });

  const onReady=()=>{routeReady=true;route();};
  if(document.body.classList.contains('booting')) window.addEventListener('portfolio:booted',onReady,{once:true}); else onReady();
})();
