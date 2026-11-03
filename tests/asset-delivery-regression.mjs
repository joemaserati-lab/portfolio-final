import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const browser = await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
  for (const [width,height] of [[320,568],[390,844],[667,375],[1440,900]]) {
    const context = await browser.newContext({viewport:{width,height},deviceScaleFactor:2,
      isMobile:width<1025,hasTouch:width<1025});
    const page = await context.newPage();
    const requests = [];
    page.on('request',r=>requests.push(r.url()));
    await page.goto(base);
    await page.waitForFunction(()=>document.body.classList.contains('site-ready'));
    await page.evaluate(()=>document.fonts.ready);
    assert(!requests.some(u=>/fonts\.(googleapis|gstatic)\.com/.test(u)),'Active typography must load locally');
    assert(await page.evaluate(()=>document.fonts.check('700 20px Doto','È À é') &&
      document.fonts.check('400 20px "JetBrains Mono"','È À é')),'Local fonts/accents unavailable');
    const poster=await page.locator('.crt-head-poster').evaluate(e=>e.currentSrc);
    if(width>1024) {
      assert(poster.startsWith('data:'),'Desktop must use an inline empty poster');
      assert(!requests.some(u=>u.includes('mobile-head-poster')),'Desktop downloaded a mobile poster');
    } else assert(poster.includes('mobile-head-poster-mobile-'),'Phone must choose a smaller poster');
    await page.locator('.contact-photo img').evaluate(e=>e.decode());
    const photo=await page.locator('.contact-photo img').evaluate(e=>e.currentSrc);
    assert.equal(photo.includes('-mobile-'),width<=1024,'Contact photo variant does not match viewport');
    if(width<=1024) {
      await page.locator('[data-scroll-section="work"]').click();
      await page.waitForFunction(()=>document.querySelector('.scroll-index [aria-current]')?.dataset.scrollSection==='work');
      for(const image of await page.locator('.project-cover-img').all()) {
        await image.evaluate(e=>e.decode());
        const source=await image.evaluate(e=>e.currentSrc);
        if(width<=600) assert(source.includes('-mobile-'),'Narrow phone cover must use a mobile derivative');
        assert(await image.evaluate(e=>e.closest('picture').querySelector('source').media==='(max-width:1024px)'),
          'Cover variants must remain mobile-only');
      }
    } else {
      await page.setViewportSize({width:390,height:844});
      await page.waitForFunction(()=>document.querySelector('.crt-head-poster').currentSrc.includes('mobile-head-poster-mobile-'));
      await page.setViewportSize({width:1440,height:900});
      await page.waitForFunction(()=>document.querySelector('.crt-head-poster').currentSrc.startsWith('data:'));
    }
    console.log('ASSET DELIVERY PASS',width,height);
    await context.close();
  }
  const dense=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  const densePage=await dense.newPage();
  await densePage.goto(base);
  await densePage.locator('.crt-head-poster').evaluate(e=>e.decode());
  assert(new URL(await densePage.locator('.crt-head-poster').evaluate(e=>e.currentSrc)).pathname.endsWith('/mobile-head-poster.webp'),
    'High-density phones must retain the original high-resolution option');
  await dense.close();
  const context=await browser.newContext();
  const page=await context.newPage();
  await page.goto(base);
  await page.waitForFunction(()=>document.body.classList.contains('site-ready'));
  await page.evaluate(()=>navigator.serviceWorker.ready);
  await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
  const asset=new URL('assets/font/Doto-latin-variable.woff2',base).href;
  assert(await page.evaluate(async url=>(await fetch(url)).ok,asset));
  await page.waitForFunction(async()=>{
    const keys=await caches.keys();
    for(const key of keys)if(key.startsWith('portfolio-assets:')) {
      const cache=await caches.open(key);
      if((await cache.keys()).some(r=>r.url.includes('Doto-latin-variable.woff2')))return true;
    }
    return false;
  });
  await context.setOffline(true);
  assert(await page.evaluate(async url=>(await fetch(url)).ok,asset),'Cached font must survive unavailable network');
  assert(await page.evaluate(async url=>{try{await fetch(url);return false}catch{return true}},base),
    'HTML must remain network-only');
  await context.setOffline(false);
  const cacheKeys=await page.evaluate(async()=>{
    const result=[];for(const name of await caches.keys())if(name.startsWith('portfolio-assets:')) {
      for(const key of await (await caches.open(name)).keys())result.push(key.url);
    }return result;
  });
  assert(cacheKeys.every(u=>u.includes('revision=')),'Cache entries must be content-versioned');
  assert(!cacheKeys.some(u=>/\.(html|mp4|webm)(?:\?|$)/.test(u)),'HTML and video must not enter the static cache');
  console.log('ASSET CACHE PASS content revisions, offline static hit, network-only HTML');
  await context.close();
} finally {await browser.close()}
