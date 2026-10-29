import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base=process.env.AUDIT_URL||'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
 for(const [width,height] of [[320,568],[390,844],[667,375],[1024,768],[1440,900],[1835,831],[1920,1080],[2560,1440]]) {
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<768,isMobile:width<768});
  await page.goto(base,{waitUntil:'domcontentloaded'});
  const boot=await page.evaluate(()=>{
   const screen=document.querySelector('#screen').getBoundingClientRect(),loader=document.querySelector('#boot-loader').getBoundingClientRect();
   const outline=getComputedStyle(document.body,'::before');
   return {screen:screen.toJSON(),loader:loader.toJSON(),outlineLeft:parseFloat(outline.left)};
  });
  for(const key of ['x','y','width','height']) assert(Math.abs(boot.screen[key]-boot.loader[key])<1,`${width}: loader misaligned (${key})`);
  assert(Math.abs(boot.screen.x-boot.outlineLeft)<1,`${width}: outline misaligned`);
  if(width>1024) {
   assert(Math.abs(boot.screen.width/boot.screen.height-3/2)<.002,`${width}: expected centered 3:2`);
   assert(Math.abs(boot.screen.left-(width-boot.screen.right))<1,`${width}: screen not centered`);
  }
  await page.waitForFunction(()=>document.body.classList.contains('site-ready')&&!document.getElementById('boot-loader'),null,{timeout:45000});
  await page.evaluate(()=>document.fonts.ready);
  if(width>1024) {
    const home=await page.evaluate(()=>{
      const screen=document.getElementById('screen').getBoundingClientRect();
      const title=document.querySelector('.hero-intro h1').getBoundingClientRect();
      const icons=document.querySelector('.desktop-icons').getBoundingClientRect();
      const iconItems=[...document.querySelectorAll('.desktop-icons .desktop-icon')].map(el=>el.getBoundingClientRect().toJSON());
      const portrait=document.getElementById('crt-head-feature').getBoundingClientRect();
      return {screen:screen.toJSON(),title:title.toJSON(),icons:icons.toJSON(),
        iconItems,portrait:portrait.toJSON()};
    });
    assert(home.title.left>=home.screen.left, `${width}: title starts outside CRT`);
    assert(home.title.right < home.icons.left-12, `${width}: title and icons collide`);
    assert(home.iconItems.every(box=>box.left>=home.screen.left&&box.right<=home.screen.right),
      `${width}: an icon escapes the CRT`);
    assert(home.portrait.width < home.screen.width*.65,
      `${width}: oversized 3D artwork crowds reading space`);
  }
  if(width<=1024) {
   const geometry=await page.evaluate(()=>{
    const selectors=['#screen','.hero-intro','.desktop-icons','.scroll-index'];
    const snapshot=()=>selectors.map(s=>document.querySelector(s).getBoundingClientRect().toJSON());
    const classic=snapshot();document.documentElement.dataset.crtFormat='wide';const wide=snapshot();document.documentElement.dataset.crtFormat='classic';return {classic,wide};
   });
   assert.deepEqual(geometry.classic,geometry.wide,`${width}: mobile layout changed`);
  }
  const state=await page.evaluate(()=>({filter:getComputedStyle(document.querySelector('.crt-stage')).filter,overflow:document.querySelector('#scroll-viewport').scrollWidth>document.querySelector('#scroll-viewport').clientWidth+1}));
  assert.equal(state.filter,'none',`${width}: expensive optical filter must be absent`);
  assert.equal(await page.locator('.crt-optics-defs').count(),0,`${width}: SVG optical definitions must not load`);
  assert.equal(await page.locator('html[data-crt-optics]').count(),0,`${width}: optical mode attribute must be absent`);
  assert(!state.overflow,`${width}: horizontal overflow`);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.crt-stage').evaluate(e=>getComputedStyle(e).filter),'none',`${width}: no stage optics under reduced motion`);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('.primary-action').click();
  await page.waitForFunction(()=>document.querySelector('.scroll-index [aria-current]')?.dataset.scrollSection==='work'&&document.querySelector('#scroll-work .scroll-window').classList.contains('is-revealed'));
  assert.equal(await page.locator('#scroll-work .project-tile-v2').count(),5);
  await page.goto(new URL('work/tovadu/',base).href);
  await page.waitForFunction(()=>document.body.classList.contains('site-ready')&&document.querySelector('#projects-view').dataset.view==='case');
  assert.equal(await page.locator('.crt-stage').evaluate(e=>getComputedStyle(e).filter),'none',`${width}: case study must not use SVG optics`);
  await page.locator('.projects-close').click();
  await page.waitForFunction(()=>document.querySelector('#projects-view').hidden&&document.querySelector('#crt-head-feature').classList.contains('is-ready'));
  console.log('CRT PASS',width,height,'geometry, mobile parity, no SVG filter, CTA, case close/head resume');
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:800,height:600}});
 await page.goto(new URL('404.html',base).href);
 assert.equal(await page.locator('.scene').evaluate(e=>getComputedStyle(e).filter),'none','404 must not use optics');
 assert.equal(await page.locator('.crt-optics-defs').count(),0,'404 must not load optical SVG');
 console.log('CRT PASS 404 without global SVG displacement');
}finally{await browser.close()}
