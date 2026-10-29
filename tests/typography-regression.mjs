import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
const base=process.env.AUDIT_URL||'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
 for(const [width,height] of [[320,568],[390,844],[667,375],[1440,900]]) {
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<768,isMobile:width<768});
  await page.addInitScript(lang=>{localStorage.setItem('portfolioBootSeen','1');localStorage.setItem('portfolioLang',lang)},process.env.TYPO_LANG||'en');
  for(const route of ['', 'work/', 'about/', 'resume/', 'contact/', 'work/tovadu/', '404.html']) {
   await page.goto(new URL(route,base).href);
   if(route!=='404.html') await page.waitForFunction(()=>document.body.classList.contains('site-ready'));
   await page.evaluate(()=>document.fonts.ready);
   if(route==='') await page.waitForFunction(()=>window.__portfolioHeadState?.ready);
   const result=await page.evaluate(()=>{
    const check=(selector,min)=>[...document.querySelectorAll(selector)].filter(e=>e.getBoundingClientRect().width&&e.getBoundingClientRect().height).filter(e=>parseFloat(getComputedStyle(e).fontSize)<min).map(e=>({selector:e.className,size:getComputedStyle(e).fontSize}));
    const reading='.window-body p,.case-story-copy p,.case-output-list p,.case-facts-v2 dd,.case-role-v2>p,.privacy-panel p,.scene__copy p';
    return {
      mode:document.documentElement.dataset.typography,
      small:check(reading,16),
      ui:check('.scroll-index,.language-toggle,.privacy-toggle,.primary-action,.scene__home',12),
      labels:check('.case-facts-v2 dt,.case-media-v2 figcaption,.case-role-v2>span',11),
      overflow:[...document.querySelectorAll('#projects-view,#scroll-viewport,.scene')].filter(e=>e.getBoundingClientRect().width).map(e=>e.scrollWidth>e.clientWidth+1),
      families:[...document.querySelectorAll(reading)].map(e=>getComputedStyle(e).fontFamily),
      readingAxes:[...document.querySelectorAll(reading)].map(e=>getComputedStyle(e).fontVariationSettings),
      display:[...document.querySelectorAll('.hero-intro h1,.scene__copy h1,.static-reader h1')].map(e=>({family:getComputedStyle(e).fontFamily,axes:getComputedStyle(e).fontVariationSettings,weight:getComputedStyle(e).fontWeight})),
      caseTitles:[...document.querySelectorAll('.case-title-v2 h2')].map(e=>({family:getComputedStyle(e).fontFamily,axes:getComputedStyle(e).fontVariationSettings})),
      subheads:[...document.querySelectorAll('.resume-row h3,.case-output-list h3,.static-reader h2,.static-reader h3,.project-tile-main strong')].map(e=>({family:getComputedStyle(e).fontFamily,axes:getComputedStyle(e).fontVariationSettings})),
      informativeSubheads:[...document.querySelectorAll('.resume-row h3,.case-output-list h3,.static-reader h2,.static-reader h3')].map(e=>getComputedStyle(e).fontFamily),
      interface:[...document.querySelectorAll('.primary-action,.language-toggle,.privacy-toggle,.scene__home,.system-label')].map(e=>getComputedStyle(e).fontFamily),
      actualFonts:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family),
      hero:document.querySelector('.hero-intro')?{
        introWidth:document.querySelector('.hero-intro').getBoundingClientRect().width,
        titleSize:parseFloat(getComputedStyle(document.querySelector('.hero-intro h1')).fontSize),
        copySize:parseFloat(getComputedStyle(document.querySelector('.hero-copy')).fontSize)
      }:null
    };
   });
   assert.deepEqual(result.small,[],`${width} ${route}: reading text too small`);
   assert.deepEqual(result.ui,[],`${width} ${route}: interface text too small`);
   assert.deepEqual(result.labels,[],`${width} ${route}: metadata too small`);
   assert(['doto-mono','pixel-editorial','digital','balanced','original'].includes(result.mode),`${route}: unknown typography mode`);
   const editorial=result.mode==='pixel-editorial';
   const expectedReading=result.mode==='doto-mono'?'Geist Mono':editorial?'Geist':result.mode==='digital'?'Geist Pixel':result.mode==='balanced'?'Inter':'Doto';
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
     assert(result.readingAxes.every(x=>x==='normal'),`${route}: Geist Mono body retained pixel font axes`);
     assert(result.informativeSubheads.every(f=>f.includes('Geist Mono')),`${route}: informative subhead should use Geist Mono`);
     assert(result.actualFonts.some(f=>f==='Geist Mono'),`${route}: Geist Mono webfont not loaded`);
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
    const geometry=await page.evaluate(()=>({cta:document.querySelector('.primary-action').getBoundingClientRect().bottom,nav:document.querySelector('.scroll-index').getBoundingClientRect().top}));
    assert(geometry.cta<=geometry.nav-4,`${width}: hero CTA crosses navigation ${JSON.stringify(geometry)}`);
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
