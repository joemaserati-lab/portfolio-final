import assert from 'node:assert/strict';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const url = process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const browser = await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
 for (const [width,height] of [[1440,900],[320,568],[390,844],[667,375]]) {
  for (const reducedMotion of ['no-preference','reduce']) {
   const context = await browser.newContext({viewport:{width,height},hasTouch:width<768,isMobile:width<768,reducedMotion});
   const page = await context.newPage();
   const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.addInitScript(()=>{
    window.__bootEvents=[];
    addEventListener('portfolio:booted',()=>{
     const record={name:'booted',booting:document.body.classList.contains('booting'),
      opacity:getComputedStyle(document.querySelector('.shell')).opacity,
      head:window.__portfolioHeadState?.ready};
     window.__bootEvents.push(record);
     queueMicrotask(()=>record.headVisible=document.querySelector('#crt-head-feature').classList.contains('is-ready'));
    });
    addEventListener('portfolio:site-ready',()=>window.__bootEvents.push({name:'ready'}));
   });
   let release;
   const held = new Promise(resolve=>release=resolve);
   await page.route('**/js/content.js*',async route=>{await held;await route.continue()});
   await page.goto(url,{waitUntil:'domcontentloaded'});
   await page.waitForFunction(()=>document.querySelector('#boot-loader').classList.contains('is-sequencing'));
   assert(await page.locator('#boot-loader').isVisible());
   assert.equal(await page.evaluate(()=>document.body.classList.contains('booting')),true);
   assert.equal(await page.locator('#boot-enter').isVisible(),false);
   release();
   await page.waitForFunction(()=>document.body.classList.contains('site-ready')&&!document.getElementById('boot-loader'),null,{timeout:45000});
   const events=await page.evaluate(()=>window.__bootEvents);
   assert.deepEqual(events.map(e=>e.name),['booted','ready']);
   assert.equal(events[0].booting,false);
   assert.equal(events[0].opacity,'1');
   await page.waitForFunction(()=>window.__portfolioHeadState?.ready && document.querySelector('#crt-head-feature').classList.contains('is-ready'));
   assert.equal(await page.locator('#crt-head-feature').isVisible(),true);
   await page.unroute('**/js/content.js*');
   // A fresh browser session still skips the scenic first-visit boot.
   assert.equal(await page.evaluate(()=>localStorage.getItem('portfolioBootSeen')),'1');
   await page.evaluate(()=>sessionStorage.removeItem('portfolioBootSeen'));
   await page.reload();
   await page.waitForFunction(()=>document.body.classList.contains('site-ready')&&!document.getElementById('boot-loader'),null,{timeout:45000});
   assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('returning-visit')),true);
   assert.equal(await page.evaluate(()=>document.body.classList.contains('site-entering')),false);
   assert.deepEqual(await page.evaluate(()=>window.__bootEvents.map(e=>e.name)),['booted','ready']);
   assert.equal(errors.length,0,errors.join('\n'));
   console.log('BOOT PASS',`${width}x${height}`,reducedMotion,'loading gate, synchronized reveal, repeat visit');
   await context.close();
  }
 }
 const page=await browser.newPage();
 await page.addInitScript(()=>sessionStorage.setItem('portfolioBootSeen','1'));
 await page.route('**/js/content.js*',route=>route.abort());
 await page.goto(url);
 await page.locator('.static-reader:visible').waitFor({state:'visible'});
 assert.equal(await page.locator('#boot-loader').isVisible(),false);
 assert((await page.locator('.static-reader:visible').innerText()).includes('EDOARDO') || (await page.locator('.static-reader:visible').innerText()).includes('Edoardo'));
 console.log('BOOT PASS application error / static reading fallback');
} finally {await browser.close()}
