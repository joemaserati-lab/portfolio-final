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
   assert.equal(await page.locator('#boot-loader').evaluate(e=>getComputedStyle(e).backgroundColor),'rgb(5, 5, 5)','Loader needs an opaque background');
   assert.equal(await page.evaluate(()=>document.body.classList.contains('booting')),true);
   assert.equal(await page.locator('#boot-enter').isVisible(),false);
   release();
   await page.waitForFunction(()=>document.body.classList.contains('site-ready')&&!document.getElementById('boot-loader'),null,{timeout:45000});
   const events=await page.evaluate(()=>window.__bootEvents);
   assert.deepEqual(events.map(e=>e.name),['booted','ready']);
   assert.equal(events[0].booting,false);
   assert.equal(events[0].opacity,'1');
   assert.equal(events[0].head,true,'Boot released before the 3D model was ready');
   assert.equal(events[0].headVisible,true,'Head not visible at the boot event');
   await page.waitForFunction(()=>window.__portfolioHeadState?.ready && document.querySelector('#crt-head-feature').classList.contains('is-ready'));
   assert.equal(await page.locator('#crt-head-feature').isVisible(),true);
   // CSS classes alone do not prove that the shader produced visible pixels.
   if (width === 1440 && reducedMotion === 'no-preference') {
     const png = (await page.locator('#crt-head-canvas').screenshot()).toString('base64');
     const litPixels = await page.evaluate(async encoded => {
       const bytes = Uint8Array.from(atob(encoded), char => char.charCodeAt(0));
       const bitmap = await createImageBitmap(new Blob([bytes], { type:'image/png' }));
       const result = document.createElement('canvas');
       result.width = bitmap.width;
       result.height = bitmap.height;
       const context = result.getContext('2d', { willReadFrequently:true });
       context.drawImage(bitmap, 0, 0);
       const data = context.getImageData(0,0,result.width,result.height).data;
       let lit = 0;
       for (let i = 0; i < data.length; i += 32) {
         if (Math.max(data[i],data[i+1],data[i+2]) > 70) lit++;
       }
       return lit;
     }, png);
     console.log('HEAD VISIBLE PIXELS:', litPixels);
     assert(litPixels > 25, '3D canvas is blank despite reporting ready');
   }
   await page.unroute('**/js/content.js*');
   // A fresh browser session still skips the scenic first-visit boot.
   assert.equal(await page.evaluate(()=>localStorage.getItem('portfolioBootSeen')),'1');
   await page.evaluate(()=>sessionStorage.removeItem('portfolioBootSeen'));
   await page.reload();
   await page.waitForFunction(()=>document.body.classList.contains('site-ready')&&!document.getElementById('boot-loader'),null,{timeout:45000});
   assert.equal(await page.evaluate(()=>document.documentElement.classList.contains('returning-visit')),true);
   assert.equal(await page.evaluate(()=>document.body.classList.contains('site-entering')),false);
   assert.deepEqual(await page.evaluate(()=>window.__bootEvents.map(e=>e.name)),['booted','ready']);
   assert.equal(await page.evaluate(()=>window.__bootEvents[0].head),true,'Returning visitor saw homepage before head initialized');
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
