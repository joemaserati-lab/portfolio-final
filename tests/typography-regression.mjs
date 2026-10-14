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
    return {small:check(reading,16),ui:check('.scroll-index,.language-toggle,.privacy-toggle,.primary-action,.scene__home',12),labels:check('.case-facts-v2 dt,.case-media-v2 figcaption,.case-role-v2>span',11),overflow:[...document.querySelectorAll('#projects-view,#scroll-viewport,.scene')].filter(e=>e.getBoundingClientRect().width).map(e=>e.scrollWidth>e.clientWidth+1),families:[...document.querySelectorAll(reading)].map(e=>getComputedStyle(e).fontFamily)};
   });
   assert.deepEqual(result.small,[],`${width} ${route}: reading text too small`);
   assert.deepEqual(result.ui,[],`${width} ${route}: interface text too small`);
   assert.deepEqual(result.labels,[],`${width} ${route}: metadata too small`);
   assert(result.families.every(f=>f.includes('Doto')),`${route}: reading voice changed`);
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
