import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const browser = await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
  for (const [width,height] of [[320,568],[390,844],[667,375],[1440,900]]) {
    const context = await browser.newContext({viewport:{width,height},locale:'it-IT',hasTouch:width<768,isMobile:width<768});
    await context.addInitScript(() => localStorage.setItem('portfolioBootSeen','1'));
    const page = await context.newPage();
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    for (const kind of ['about','resume']) {
      await page.goto(new URL(`${kind}/`,base).href);
      await page.waitForFunction(()=>document.body.classList.contains('site-ready')&&window.Portfolio);
      await page.waitForFunction(kind=>Math.abs(document.querySelector('#scroll-viewport').scrollTop-document.querySelector(`#scroll-${kind}`).offsetTop)<2,kind);
      const geometry=await page.evaluate(kind=>{
        const viewport=document.querySelector('#scroll-viewport');
        const title=document.querySelector(`#scroll-${kind} h2`);
        const clip=parseFloat(getComputedStyle(viewport).clipPath.match(/inset\(([\d.]+)px/)?.[1]||0);
        return {top:title.getBoundingClientRect().top,edge:viewport.getBoundingClientRect().top+clip};
      },kind);
      assert(geometry.top>=geometry.edge+12,`${kind} title clipped at ${width}: ${JSON.stringify(geometry)}`);
      assert(await page.locator('#privacy-panel').isHidden(),'Unconfigured analytics opened automatically');
      assert(await page.locator(`#scroll-${kind} .window-body p`).evaluateAll(nodes=>nodes.every(node=>parseFloat(getComputedStyle(node).fontSize)>=16)),'Reading text shrank below 16px');
      if(process.env.QA_DIR&&width===390){await page.locator(`#scroll-${kind} .scroll-window.is-revealed`).waitFor();await page.locator('.scroll-index').evaluate(el=>Promise.all(el.getAnimations({subtree:true}).map(animation=>animation.finished)));await mkdir(process.env.QA_DIR,{recursive:true});await page.screenshot({path:`${process.env.QA_DIR}/${kind}-390.png`});}
    }
    await page.goto(new URL('work/',base).href);
    await page.waitForFunction(()=>document.querySelector('#scroll-work .scroll-window').classList.contains('is-revealed'));
    assert.equal(await page.locator('#scroll-work [data-project-slug=tovadu]').getAttribute('href'),'/portfolio-final/work/tovadu/');
    await page.locator('#scroll-work [data-project-slug=tovadu]').click();
    await page.waitForFunction(()=>document.activeElement?.matches('.case-title-v2 h2'));
    assert(await page.locator('#scroll-viewport').evaluate(e=>e.inert));
    await page.keyboard.press('Tab');
    assert(await page.evaluate(()=>!document.activeElement.closest('#scroll-viewport')),'Focus returned to hidden directory');
    await page.locator('.case-nav-v2 [data-project-slug=pholia]').click();
    const metadata=await page.evaluate(()=>({image:document.querySelector('meta[property="og:image"]').content,schema:JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)}));
    assert(metadata.image.endsWith('/assets/images/Pholia.webp'));
    assert.equal(metadata.schema['@type'],'CreativeWork');
    assert.equal(metadata.schema.image,metadata.image);
    await page.locator('.projects-close').click();
    await page.waitForFunction(()=>document.activeElement?.matches('#scroll-work [data-project-slug=tovadu]'));
    assert.equal(await page.locator('#scroll-viewport').evaluate(e=>e.inert),false);
    assert.equal(errors.length,0,errors.join('\n'));
    console.log('TECHNICAL PASS',width,height,'alignment, focus, metadata, analytics');
    await context.close();
  }
  const direct=await browser.newPage();
  const requested=[];direct.on('request',request=>requested.push(request.url()));
  await direct.goto(new URL('work/tovadu/',base).href);
  await direct.waitForFunction(()=>document.body.classList.contains('site-ready'));
  assert(!requested.some(url=>url.includes('head3d.js')||url.includes('.glb')||url.includes('/three@')), 'Direct case loaded unused 3D');
  await direct.locator('.projects-close').click();
  await direct.waitForFunction(()=>window.__portfolioHeadState?.ready);
  console.log('TECHNICAL PASS direct case defers 3D and restores it after closing');
  await direct.close();
  const slowHead=await browser.newPage();
  let releaseHead;
  const heldHead=new Promise(resolve=>releaseHead=resolve);
  await slowHead.route('**/*.glb',async route=>{await heldHead;await route.continue();});
  await slowHead.goto(base,{waitUntil:'domcontentloaded'});
  await slowHead.waitForFunction(()=>document.body.classList.contains('site-ready'));
  assert.equal(await slowHead.locator('.primary-action').isVisible(),true);
  assert.equal(await slowHead.evaluate(()=>Boolean(window.__portfolioHeadState?.ready)),false);
  releaseHead();
  await slowHead.waitForFunction(()=>window.__portfolioHeadState?.ready);
  await slowHead.close();
  console.log('TECHNICAL PASS homepage remains usable while the portrait is loading');
  const noJs=await browser.newContext({javaScriptEnabled:false});
  const reader=await noJs.newPage();
  for(const [path,text] of [['resume/','SWS PRINTING'],['contact/','edoardo.rappanello@gmail.com'],['work/platinum-technologies/','ten times']]){
    await reader.goto(new URL(path,base).href);
    assert(await reader.locator('.static-reader[data-reader-lang=en]').isVisible());
    assert((await reader.locator('.static-reader[data-reader-lang=en]').innerText()).includes(text));
  }
  await noJs.close();
  const broken=await browser.newPage();
  await broken.route('**/js/content.js*',route=>route.abort());
  await broken.goto(new URL('resume/',base).href);
  await broken.locator('.static-reader:visible').waitFor({state:'visible'});
  assert((await broken.locator('.static-reader:visible').innerText()).includes('SWS PRINTING'));
  console.log('TECHNICAL PASS no JavaScript / failed runtime reading view');
} finally {await browser.close();}
