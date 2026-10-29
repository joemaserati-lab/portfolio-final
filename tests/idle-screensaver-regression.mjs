import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base=process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
 for(const [width,height] of [[390,844],[1440,900]]){
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<700,isMobile:width<700});
  await page.goto(base);
  await page.waitForFunction(()=>document.body.classList.contains('site-ready'));
  const layer=page.locator('#idle-screensaver');
  const iframe=page.locator('#idle-screensaver-scene');
  const embedded=page.frameLocator('#idle-screensaver-scene');
  assert.equal(await iframe.getAttribute('src'),null, `${width}: 404 asset must not load before idle`);
  await page.clock.install();
  await page.evaluate(()=>document.dispatchEvent(new Event('pointermove')));
  await page.clock.fastForward(60_000);
  assert(await layer.isVisible(),`${width}: screensaver must activate at 60 seconds`);
  assert.match(await iframe.getAttribute('src'),/404\.html\?mode=screensaver$/, 'Must reuse the actual 404 page');
  await embedded.locator('.dvd.has-image').waitFor({timeout:25000});
  await page.waitForFunction(()=>document.querySelector('#idle-screensaver-scene').classList.contains('is-ready'));
  await page.waitForFunction(()=>{
   const f=document.querySelector('#idle-screensaver-scene');
   return f.contentDocument?.querySelector('#page-title')?.textContent==='IDLE MODE.';
  });
  const asset=await embedded.locator('.dvd').evaluate(el=>{
   const mask=getComputedStyle(el.querySelector('.dvd__disc')).maskImage;
   const videoMask=getComputedStyle(el.querySelector('.dvd__video')).maskImage;
   const title=getComputedStyle(document.querySelector('#page-title'));
   const body=getComputedStyle(document.querySelector('[data-copy]'));
   return {canvas:el.querySelector('canvas')!==null,mask,videoMask,
    displayFont:title.fontFamily,readingFont:body.fontFamily,
    typeMode:document.documentElement.dataset.typography};
  });
  assert(asset.canvas,'Original 404 portrait canvas missing');
  assert(asset.mask.includes('data:image/png;base64,'),'Original DVD disc PNG mask missing');
  assert(asset.videoMask.includes('data:image/png;base64,'),'Original VIDEO PNG mask missing');
  assert.equal(asset.typeMode,'doto-mono');
  assert(asset.displayFont.includes('Doto'),'404 display typography is not inherited');
  assert(asset.readingFont.includes('Geist Mono'),'404 body typography is not inherited');
  await page.evaluate(()=>document.dispatchEvent(new Event('keydown',{bubbles:true,cancelable:true})));
  assert(await layer.isHidden(),'Keyboard failed to dismiss screensaver');
  // The clock is virtual but the iframe and focus restoration can enqueue
  // tasks on the boundary; allow a 5 ms test-only scheduling tolerance.
  await page.clock.fastForward(60_005);
  assert(await layer.isVisible(),'Screensaver did not re-arm');
  await page.evaluate(()=>window.PortfolioI18n.setLang('it'));
  await page.waitForFunction(()=>document.querySelector('#idle-screensaver-scene').contentDocument?.querySelector('#page-title')?.textContent==='IN PAUSA.');
  assert.equal(await embedded.locator('#page-title').innerText(),'IN PAUSA.');
  await page.evaluate(()=>document.dispatchEvent(new Event('pointermove',{bubbles:true})));
  assert(await layer.isHidden(),'Pointer failed to dismiss screensaver');
  await page.emulateMedia({reducedMotion:'reduce'});
  // Media-query responsive changes can dispatch scroll events. Define the
  // new 60-second idle window from an explicit interaction.
  await page.evaluate(()=>document.dispatchEvent(new Event('pointermove',{bubbles:true})));
  await page.clock.fastForward(60_005);
  assert(await layer.isVisible(),'Reduced-motion users still need screensaver');
  const before=await embedded.locator('.dvd').evaluate(el=>getComputedStyle(el).transform);
  await page.clock.fastForward(1000);
  const after=await embedded.locator('.dvd').evaluate(el=>getComputedStyle(el).transform);
  assert.equal(before,after,'Reduced motion must stop 404 bounce');
  await page.evaluate(()=>document.dispatchEvent(new Event('pointerdown',{bubbles:true})));
  assert(await layer.isHidden());
  assert.equal(await page.locator('#scroll-home').count(),1);
  console.log('SCREENSAVER/404 REUSE PASS',width,height);
  await page.close();
 }
 const page=await browser.newPage();
 await page.goto(new URL('404.html',base).href);
 assert.equal(await page.locator('#page-title').innerText(),'404','Standalone 404 must not change');
 assert.equal(await page.locator('[data-home]').getAttribute('href'),'https://joemaserati-lab.github.io/portfolio-final/');
 assert(await page.locator('.dvd').count()===1);
 console.log('ORIGINAL 404 STANDALONE PASS');
 await page.close();
}finally{await browser.close()}
