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
      display:[...document.querySelectorAll('.hero-intro h1,.scene__copy h1,.static-reader h1')].map(e=>getComputedStyle(e).fontFamily),
      caseTitles:[...document.querySelectorAll('.case-title-v2 h2')].map(e=>getComputedStyle(e).fontFamily),
      interface:[...document.querySelectorAll('.primary-action,.language-toggle,.privacy-toggle,.scene__home')].map(e=>getComputedStyle(e).fontFamily)
    };
   });
   assert.deepEqual(result.small,[],`${width} ${route}: reading text too small`);
   assert.deepEqual(result.ui,[],`${width} ${route}: interface text too small`);
   assert.deepEqual(result.labels,[],`${width} ${route}: metadata too small`);
   assert(['digital','balanced','original'].includes(result.mode),`${route}: unknown typography mode`);
   const expectedReading=result.mode==='digital'?'Geist Pixel':result.mode==='balanced'?'Inter':'Doto';
   const expectedDisplay=result.mode==='digital'?'Doto':'Redaction 50';
   const expectedCase=result.mode==='balanced'?'Redaction 50':'Doto';
   assert(result.families.every(f=>f.includes(expectedReading)),`${route}: reading voice should be ${expectedReading}`);
   if(result.mode==='digital') {
     assert(result.readingAxes.every(a=>a.includes('ELSH')&&a.includes('1')),`${route}: Geist Pixel Square ELSH=1 missing`);
   }
   assert(result.display.every(f=>f.includes(expectedDisplay)),`${route}: display voice should be ${expectedDisplay}`);
   assert(result.caseTitles.every(f=>f.includes(expectedCase)),`${route}: case-title voice should be ${expectedCase}`);
   assert(result.interface.every(f=>f.includes('Doto')),`${route}: interface voice changed`);
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
