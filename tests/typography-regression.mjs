import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
const base=process.env.AUDIT_URL||'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
 for(const [width,height] of [[320,568],[390,844],[667,375],[1024,768],[1200,800],[1280,800],[1440,900],[1920,1080]]) {
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<768,isMobile:width<768});
  await page.addInitScript(lang=>{localStorage.setItem('portfolioBootSeen','1');localStorage.setItem('portfolioLang',lang)},process.env.TYPO_LANG||'en');
  for(const route of ([1024,1200,1280,1920].includes(width)?['','work/']:['', 'work/', 'about/', 'resume/', 'contact/', 'work/tovadu/', '404.html'])) {
   await page.goto(new URL(route,base).href);
   if(route!=='404.html') await page.waitForFunction(()=>document.body.classList.contains('site-ready'));
   if(route==='work/' && width<=720) await page.waitForFunction(()=>document.querySelector('.scroll-index [aria-current]')?.dataset.scrollSection==='work');
   if(route==='work/' && width<=720) await page.waitForFunction(()=>{
     const label=document.querySelector('.scroll-index a[aria-current] [data-scroll-label]');
     return label && label.textContent===(label.dataset.activeLabel||label.dataset.scrollLabel);
   });
   await page.evaluate(()=>document.fonts.ready);
   if(route==='') await page.waitForFunction(()=>window.__portfolioHeadState?.ready);
   const result=await page.evaluate(()=>{
    const check=(selector,min)=>[...document.querySelectorAll(selector)].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).filter(e=>parseFloat(getComputedStyle(e).fontSize)<min).map(e=>({selector:e.className,size:getComputedStyle(e).fontSize}));
    const reading='.window-body p,.case-story-copy p,.case-output-list p,.case-facts-v2 dd,.case-role-v2>p,.privacy-panel p,.scene__copy p';
    const mode=document.documentElement.dataset.typography;
    const readingElements=[...document.querySelectorAll(reading)].filter(e=>
      mode!=='doto-mono' || !e.matches('.case-role-v2>p,.case-facts-v2>div:first-child dd,.resume-skill-group p')
    );
    const probe=document.createElement('section');
    probe.innerHTML='<h1>Title</h1><h2>Section</h2><h3>Topic</h3><h4>Detail</h4><h5>Minor</h5><p class="type-body">Body <span>inline</span></p><span class="type-caption">Caption</span><span class="type-label">Label</span><button class="type-button">Action</button>';
    document.body.append(probe);
    const scale=[...probe.querySelectorAll('h1,h2,h3,h4,h5')].map(e=>({size:parseFloat(getComputedStyle(e).fontSize),family:getComputedStyle(e).fontFamily}));
    const inherited=getComputedStyle(probe.querySelector('p')).font===getComputedStyle(probe.querySelector('p span')).font;
    probe.remove();
    // Loader is intentionally removed after boot: probe its CSS signature without reopening it.
    const bootProbe=document.createElement('div');
    bootProbe.id='boot-gate';
    bootProbe.className='boot-gate';
    bootProbe.innerHTML='<h2>LOADING</h2>';
    document.body.append(bootProbe);
    const bootTitle=bootProbe.querySelector('h2');
    const bootBrackets=[getComputedStyle(bootTitle,'::before').content,getComputedStyle(bootTitle,'::after').content];
    bootProbe.remove();
    return {
      scale, inherited,
      emptyHeadings:[...document.querySelectorAll('h1,h2,h3,h4,h5')].filter(e=>!e.textContent.trim()).length,
      cvHierarchy:[...document.querySelectorAll('.resume-section-title')].every(e=>e.tagName==='H3') && [...document.querySelectorAll('.resume-row .resume-role')].every(e=>e.tagName==='H4'),
      redToken:getComputedStyle(document.documentElement).getPropertyValue('--red').trim().toLowerCase(),
      glyphCount:document.querySelectorAll('.doto-glyph').length,
      glyphColors:[...document.querySelectorAll('.doto-glyph')].map(e=>getComputedStyle(e).color),
      heroHasSignature:Boolean(document.querySelector('.hero-intro h1 .doto-glyph')),
      heroActionGlyph:document.querySelector('.primary-action') ? getComputedStyle(document.querySelector('.primary-action'),'::after').content : null,
      heroActionPrefix:document.querySelector('.primary-action') ? getComputedStyle(document.querySelector('.primary-action'),'::before').content : null,
      bootBrackets,
      projectMeta:[...document.querySelectorAll('.project-tile-main small')].map(e=>({
        text:e.textContent.trim(),
        glyphs:[...e.querySelectorAll('.doto-glyph')].map(g=>g.textContent),
        after:getComputedStyle(e,'::after').content,
        glyphTop:e.querySelector('.doto-glyph')?.getBoundingClientRect().top,
        lineTop:e.getBoundingClientRect().top,
        color:getComputedStyle(e).color
      })),
      resumePeriods:[...document.querySelectorAll('.resume-period')].map(e=>[...e.querySelectorAll('.doto-glyph')].map(g=>g.textContent)),
      resumeLocations:[...document.querySelectorAll('.resume-row small')].map(e=>[...e.querySelectorAll('.doto-glyph')].map(g=>g.textContent)),
      resumeHeadings:[...document.querySelectorAll('#scroll-resume .resume-section-title')].map(e=>({
        text:e.textContent.trim(),
        framed:e.classList.contains('resume-section-title--framed'),
        prefix:getComputedStyle(e,'::before').content,
        suffix:getComputedStyle(e,'::after').content,
        beforeColor:getComputedStyle(e,'::before').color,
        afterColor:getComputedStyle(e,'::after').color
      })),
      cvSkillHierarchy:[...document.querySelectorAll('#scroll-resume .resume-columns > section')].map(section=>{
        const major=section.querySelector('.resume-section-title');
        const majorStyle=getComputedStyle(major);
        const groups=[...section.querySelectorAll('.resume-skill-group')].map(group=>{
          const heading=getComputedStyle(group.querySelector('h4'));
          const copy=getComputedStyle(group.querySelector('p'));
          return {headingSize:parseFloat(heading.fontSize),copySize:parseFloat(copy.fontSize),
            headingFamily:heading.fontFamily,copyFamily:copy.fontFamily,
            headingWeight:Number(heading.fontWeight),copyWeight:Number(copy.fontWeight)};
        });
        const glyphStyle=getComputedStyle(major,'::before');
        return {majorSize:parseFloat(majorStyle.fontSize),majorFamily:majorStyle.fontFamily,
          majorWeight:Number(majorStyle.fontWeight),glyph:glyphStyle.content,glyphColor:glyphStyle.color,groups};
      }),
      readerSkillHierarchy:{
        headings:[...document.querySelectorAll('.static-reader .reader-skill-heading')].map(el=>({
          family:getComputedStyle(el).fontFamily,
          glyph:getComputedStyle(el,'::before').content,
          glyphColor:getComputedStyle(el,'::before').color
        })),
        groupBodies:[...document.querySelectorAll('.static-reader .reader-skill-group p')].map(el=>({
          family:getComputedStyle(el).fontFamily,size:parseFloat(getComputedStyle(el).fontSize)
        }))
      },
      desktopCvCopy:[...document.querySelectorAll('#scroll-resume .resume-header > p, #scroll-resume .resume-row p')].map(e=>({
        measure:e.getBoundingClientRect().width,
        available:e.parentElement.getBoundingClientRect().width
      })),
      contactHeading:document.querySelector('#scroll-contact .contact-copy h2')?.textContent,
      contactDotColor:document.querySelector('#scroll-contact .contact-copy h2') ? getComputedStyle(document.querySelector('#scroll-contact .contact-copy h2'),'::after').color : null,
      navigationLabel:document.querySelector('.scroll-index a[aria-current] [data-scroll-label]')?.textContent,
      navigationColor:document.querySelector('.scroll-index a[aria-current] [data-scroll-label]') ? getComputedStyle(document.querySelector('.scroll-index a[aria-current] [data-scroll-label]')).color : null,
      navigationMarks:[...document.querySelectorAll('.scroll-section-name [data-scroll-label], .scroll-index a[aria-current] [data-scroll-label]')].map(e=>({text:getComputedStyle(e).color,bullet:getComputedStyle(e,'::before').content,color:getComputedStyle(e,'::before').color})),
      dockLabelColor:document.querySelector('.scroll-section-name [data-scroll-label]') ? getComputedStyle(document.querySelector('.scroll-section-name [data-scroll-label]')).color : null,
      desktopBodySize:parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--type-body')),
      heroSecondary:document.querySelectorAll('.desktop-icons .desktop-icon small').length,
      heroPrimary:document.querySelectorAll('.desktop-icons .desktop-icon > [data-i18n]').length,
      workHeadingOverlap:[...document.querySelectorAll('.projects-index-head')].some(header=>{
        const title=header.querySelector('h2'),copy=header.querySelector('.projects-index-side p');
        if(!title||!copy||!header.getBoundingClientRect().width) return false;
        const rects=e=>{const r=document.createRange();r.selectNodeContents(e);return [...r.getClientRects()];};
        return rects(title).some(a=>rects(copy).some(b=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top));
      }),
      mode:document.documentElement.dataset.typography,
      small:check(reading,16),
      ui:check('.scroll-index,.language-toggle,.privacy-toggle,.primary-action,.scene__home',12),
      labels:check('.case-facts-v2 dt,.case-media-v2 figcaption,.case-role-v2>span',11),
      overflow:[...document.querySelectorAll('#projects-view,#scroll-viewport,.scene')].filter(e=>e.getBoundingClientRect().width).map(e=>e.scrollWidth>e.clientWidth+1),
      families:readingElements.map(e=>getComputedStyle(e).fontFamily),
      readingAxes:readingElements.map(e=>getComputedStyle(e).fontVariationSettings),
      display:[...document.querySelectorAll('.hero-intro h1,.scene__copy h1,.static-reader h1')].map(e=>({family:getComputedStyle(e).fontFamily,axes:getComputedStyle(e).fontVariationSettings,weight:getComputedStyle(e).fontWeight})),
      caseTitles:[...document.querySelectorAll('.case-title-v2 h2')].map(e=>({family:getComputedStyle(e).fontFamily,axes:getComputedStyle(e).fontVariationSettings})),
      subheads:[...document.querySelectorAll('.resume-row :is(h3, h4),.case-output-list h3,.static-reader h2,.static-reader h3,.project-tile-main strong')].map(e=>({family:getComputedStyle(e).fontFamily,axes:getComputedStyle(e).fontVariationSettings})),
      informativeSubheads:[...document.querySelectorAll('.case-output-list h3,.static-reader h2,.static-reader h3:not(.reader-role)')].map(e=>getComputedStyle(e).fontFamily),
      identityRoles:[...document.querySelectorAll('.resume-row :is(h3, h4),.resume-row strong,.meta-card b,.case-role-v2>p,.case-facts-v2>div:first-child dd,.static-reader .reader-role,.static-reader .reader-company')].map(e=>getComputedStyle(e).fontFamily),
      interface:[...document.querySelectorAll('.primary-action,.language-toggle,.privacy-toggle,.scene__home,.system-label')].map(e=>getComputedStyle(e).fontFamily),
      actualFonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),
      hero:document.querySelector('.hero-intro')?{
        introWidth:document.querySelector('.hero-intro').getBoundingClientRect().width,
        titleSize:parseFloat(getComputedStyle(document.querySelector('.hero-intro h1')).fontSize),
        copySize:parseFloat(getComputedStyle(document.querySelector('.hero-copy')).fontSize)
      }:null
    };
   });
   assert.equal(result.heroSecondary,0,`${width} ${route}: secondary hero labels must be removed`);
   if(route!=='404.html') assert.equal(result.heroPrimary,4,`${width} ${route}: four primary hero labels must remain`);
   assert(!result.workHeadingOverlap,`${width} ${route}: Selected Work heading overlaps its description`);
   assert(result.scale.every((x,i,a)=>!i||a[i-1].size>x.size),`${width} ${route}: H1–H5 must descend strictly`);
   assert.equal(result.emptyHeadings,0,`${route}: empty heading`);
   assert(result.cvHierarchy,`${route}: CV hierarchy must be H2/H3/H4`);
   if(route!=='404.html' && result.mode==='doto-mono') {
     assert.equal(result.cvSkillHierarchy.length,2,`${width} ${route}: CV must have two skill/tool columns`);
     assert(result.cvSkillHierarchy.every(section=>
       section.majorSize>=25 && section.majorWeight>=600 && section.majorFamily.includes('Doto') &&
       section.glyph.includes('•') && section.glyphColor==='rgb(255, 45, 58)' &&
       section.groups.length>=3 && section.groups.every(group=>
         section.majorSize>group.headingSize && group.headingSize>=22 &&
         group.headingSize>group.copySize+3 && group.copySize>=17 &&
         group.headingWeight>=600 && group.copyWeight===500 &&
         group.headingFamily.includes('Doto') && group.copyFamily.includes('Doto')
       )
     ),`${width} ${route}: Doto-only CV taxonomy hierarchy or red section bullets incorrect: ${JSON.stringify(result.cvSkillHierarchy)}`);
     assert(result.readerSkillHierarchy.headings.length===4 &&
       result.readerSkillHierarchy.headings.every(x=>
         x.family.includes('Doto') && x.glyph.includes('•') && x.glyphColor==='rgb(255, 45, 58)') &&
       result.readerSkillHierarchy.groupBodies.length===14 &&
       result.readerSkillHierarchy.groupBodies.every(x=>x.family.includes('Doto') && x.size>=17),
       `${width} ${route}: no-JS fallback skill taxonomy must use Doto and matching red bullets`);
   }
   if(route!=='404.html' && result.mode==='doto-mono') {
     assert.equal(result.redToken,'#ff2d3a',`${route}: red signature token changed`);
     assert(result.glyphCount>0,`${route}: red Doto glyphs missing`);
     assert(result.glyphColors.every(color=>color==='rgb(255, 45, 58)'),`${route}: Doto glyph must always be red`);
     assert(result.heroHasSignature,`${route}: hero signature dot missing`);
     assert(result.heroActionPrefix?.includes('[') && result.heroActionGlyph?.includes(']'),`${route}: square-bracket CTA missing`);
     assert(!result.heroActionGlyph?.includes('<>'),`${route}: obsolete angle CTA still present`);
     assert(result.bootBrackets[0]?.includes('[') && result.bootBrackets[1]?.includes(']'),`${route}: loading label not framed`);
     assert(result.projectMeta.length===5 && result.projectMeta.every(x=>
       x.glyphs.join('')==='•' && !x.text.includes('[') &&
       (x.after==='none' || x.after==='normal') &&
       Math.abs(x.glyphTop-x.lineTop)<8 && x.color!=='rgba(0, 0, 0, 0)'
     ),`${route}: project metadata must be a single visible bullet/date line`);
     assert(result.resumePeriods.length===8 && result.resumePeriods.every(x=>x.join('')==='•'),`${route}: CV years are missing red bullet`);
     assert(result.resumeLocations.length===6 && result.resumeLocations.every(x=>x.length===0),`${route}: CV locations must be unmarked`);
     assert(result.resumeHeadings.length===4 &&
       result.resumeHeadings.every((x,i)=>i<2
         ? x.framed && x.prefix.includes('[') && x.suffix.includes(']') &&
           x.beforeColor==='rgb(255, 45, 58)' && x.afterColor==='rgb(255, 45, 58)'
         : !x.framed && (x.prefix==='none' || x.prefix==='normal')),
       `${route}: only experience and education need red square brackets`);
     if(width>=1025) assert(result.desktopCvCopy.length>0 && result.desktopCvCopy.every(x=>
       x.available>0 && x.measure>=x.available-2),`${width} ${route}: desktop CV paragraphs are still width-limited ${JSON.stringify(result.desktopCvCopy)}`);
     assert(!result.contactHeading?.endsWith('.'),`${route}: contact title contains redundant punctuation`);
     assert.equal(result.contactDotColor,'rgb(255, 45, 58)',`${route}: contact signature point is not red`);
     assert.equal(result.dockLabelColor,'rgb(245, 245, 245)',`${route}: docked navigation label must stay white`);
     assert(result.navigationMarks.every(x=>x.text==='rgb(245, 245, 245)' && x.bullet.includes('•') && x.color==='rgb(255, 45, 58)'),`${route}: navigation needs white text and a separate red bullet`);
     if(width<=720 && route==='work/') {
       assert.equal(result.navigationLabel,process.env.TYPO_LANG==='it'?'Progetti':'Works',`${route}: mobile active work label must match the selected language`);
       assert.equal(result.navigationColor,'rgb(245, 245, 245)',`${route}: active mobile label must stay white`);
     }
     if(width>=1025) assert.equal(result.desktopBodySize,16,`${route}: desktop reading size should be 16px`);
   }
   assert(result.inherited,`${route}: unclassified span must inherit its role`);
   if(result.mode==='doto-mono') assert(result.scale.every(x=>x.family.includes('Doto')),`${route}: semantic headings must use Doto`);
   assert.deepEqual(result.small,[],`${width} ${route}: reading text too small`);
   assert.deepEqual(result.ui,[],`${width} ${route}: interface text too small`);
   assert.deepEqual(result.labels,[],`${width} ${route}: metadata too small`);
   assert(['doto-mono','pixel-editorial','digital','balanced','original'].includes(result.mode),`${route}: unknown typography mode`);
   const editorial=result.mode==='pixel-editorial';
   const expectedReading=result.mode==='doto-mono'?'JetBrains Mono':editorial?'Geist':result.mode==='digital'?'Geist Pixel':result.mode==='balanced'?'Inter':'Doto';
   const expectedDisplay=editorial?'Geist Pixel':(['digital','doto-mono'].includes(result.mode))?'Doto':'Redaction 50';
   const expectedCase=editorial?'Geist Pixel':result.mode==='balanced'?'Redaction 50':'Doto';
   assert(result.families.every(f=>f.includes(expectedReading)),`${route}: reading voice should be ${expectedReading}`);
   assert(result.display.every(x=>x.family.includes(expectedDisplay)),`${route}: display voice should be ${expectedDisplay}`);
   assert(result.caseTitles.every(x=>x.family.includes(expectedCase)),`${route}: case-title voice should be ${expectedCase}`);
   if(editorial) {
     const square=x=>x.axes.includes('ELSH') && /(?:^|\s)1(?:$|\s)/.test(x.axes.replace(/[",]/g,' '));
     assert(result.display.every(square),`${route}: display Square axis absent`);
     assert(result.caseTitles.every(square),`${route}: case-title Square axis absent`);
     assert(result.subheads.every(x=>x.family.includes('Geist Pixel')&&square(x)),`${route}: Pixel Square subhead missing`);
     assert(result.readingAxes.every(x=>x==='normal'),`${route}: body text retained pixel font axes`);
     assert(result.actualFonts.some(f=>f==='Geist'),`${route}: Geist Sans webfont not loaded`);
     assert(result.actualFonts.some(f=>f==='Geist Pixel'),`${route}: Geist Pixel webfont not loaded`);
   } else if(result.mode==='digital') {
     assert(result.readingAxes.every(a=>a.includes('ELSH')&&a.includes('1')),`${route}: Geist Pixel Square ELSH=1 missing`);
   } else if(result.mode==='doto-mono') {
     assert(result.display.every(x=>x.weight==='700'),`${route}: Doto display must be bold for visual impact`);
     assert(result.readingAxes.every(x=>x==='normal'),`${route}: JetBrains Mono body retained pixel font axes`);
     assert(result.informativeSubheads.every(f=>f.includes('Doto')),`${route}: headings should use Doto`);
     assert(result.identityRoles.every(f=>f.includes('Doto')),`${route}: role/company/client identity must use Doto`);
     assert(result.actualFonts.some(f=>f==='JetBrains Mono'),`${route}: JetBrains Mono webfont not loaded`);
   }
   assert(result.interface.every(f=>f.includes('Doto')),`${route}: interface voice changed`);
   if(route==='' && result.mode==='doto-mono') {
     assert(result.hero?.copySize>=16 && result.hero.copySize<=17,`${width}: hero copy hierarchy lost`);
     if(width===1440) {
       assert(result.hero.introWidth<=425,`${width}: hero column too wide for negative space`);
       assert(result.hero.titleSize<=68,`${width}: heading overpowers composition`);
     }
   }
   assert(result.overflow.every(o=>!o),`${width} ${route}: horizontal overflow`);
   if(route===''&&width<=1024){
    // Short portrait heroes grow naturally: the CTA may start below the fold.
    // Verify it can be scrolled into view ABOVE fixed navigation instead of
    // treating offscreen content as a collision on the first viewport.
    const geometry=await page.evaluate(async()=>{
      const viewport=document.getElementById('scroll-viewport');
      const action=document.querySelector('.primary-action');
      const nav=document.querySelector('.scroll-index');
      const initial=action.getBoundingClientRect();
      const navTop=nav.getBoundingClientRect().top;
      if(initial.bottom>navTop-4){
        viewport.scrollTop+=initial.bottom-navTop+20;
        await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
      }
      const cta=action.getBoundingClientRect();
      const fits=cta.bottom<=nav.getBoundingClientRect().top-4;
      const target=document.elementFromPoint(cta.left+cta.width/2,cta.top+cta.height/2);
      const hit=action===target||action.contains(target);
      const output={fits,hit,ctaBottom:cta.bottom,navTop:nav.getBoundingClientRect().top,scrollTop:viewport.scrollTop};
      viewport.scrollTop=0;
      return output;
    });
    assert(geometry.fits&&geometry.hit,`${width}: mobile CTA must remain scroll-reachable above navigation ${JSON.stringify(geometry)}`);
   }
   if(process.env.QA_DIR&&['','resume/','404.html'].includes(route)){
    await mkdir(process.env.QA_DIR,{recursive:true});
    if(route!=='404.html') await page.waitForFunction(()=>!document.body.classList.contains('site-entering'));
    await page.screenshot({path:`${process.env.QA_DIR}/${route===''?'home':route==='404.html'?'404':'resume'}-${width}.png`});
   }
  }
  await page.close();console.log('TYPOGRAPHY PASS',width,height,'reading, interface, captions, 404, overflow');
 }
}finally{await browser.close()}
