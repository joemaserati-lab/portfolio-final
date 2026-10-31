import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium, firefox, webkit} from 'playwright';

const engine = process.env.BROWSER || 'chromium';
const base = process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const output = process.env.QA_DIR || '/tmp/portfolio-polish';
await mkdir(output, {recursive:true});
const browser = await ({chromium, firefox, webkit}[engine]).launch({headless:engine!=='firefox',
  ...(engine === 'firefox' ? {firefoxUserPrefs:{'webgl.force-enabled':true,'gfx.webrender.all':true}} : {}),
  ...(engine === 'chromium' ? {args:['--use-gl=swiftshader','--enable-webgl']} : {})});
try {
  for (const [width,height] of [[1440,900],[320,568],[360,800],[390,844],[667,375]]) {
    const page = await browser.newPage({viewport:{width,height}});
    const errors=[];
    page.on('pageerror',error=>errors.push(String(error)));
    page.on('console',msg=>{if(['error','warning'].includes(msg.type()))errors.push(msg.text())});
    await page.goto(base);
    await page.waitForFunction(()=>document.body.classList.contains('site-ready'));
    await page.evaluate(()=>document.fonts.ready);
    // The portrait must finish loading while Contacts is still offscreen.
    await page.waitForFunction(()=>{
      const photo=document.querySelector('#scroll-contact .contact-photo img');
      return photo?.complete && photo.naturalWidth>0;
    },null,{timeout:10000});
    await page.waitForFunction(()=>window.__portfolioHeadState?.settled);
    assert(await page.locator('#crt-head-feature').evaluate(e=>e.classList.contains('is-ready')),
      `${engine}: head failed to initialize: ${JSON.stringify(await page.evaluate(()=>window.__portfolioHeadState))} ${errors.join('\n')}`);
    // Observe the real canvas through scroll, project open/close and return home.
    await page.evaluate(()=>{
      window.polishHead = document.querySelector('#crt-head-canvas');
      window.polishParent = window.polishHead.parentElement.parentElement;
    });
    for (const kind of ['work','contact','home']) {
      await page.evaluate(kind=>dispatchEvent(new CustomEvent('portfolio:scroll-to',{detail:kind})),kind);
      await page.waitForFunction(kind=>document.querySelector('.scroll-index [aria-current]')?.dataset.scrollSection===kind,kind);
      await page.waitForTimeout(800);
      assert(await page.evaluate(()=>{
        const head = document.querySelector('#crt-head-feature');
        const style = getComputedStyle(head);
        return document.querySelector('#crt-head-canvas')===window.polishHead &&
          head.parentElement===window.polishParent && head.classList.contains('is-ready') &&
          style.visibility==='visible' && Number(style.opacity)>0;
      }), `${engine} ${width} ${kind}: portrait surface was replaced or hidden`);
      if (kind==='contact') {
        const portrait = await page.locator('.contact-photo img').evaluate(e=>{
          const image=e.getBoundingClientRect(), frame=e.parentElement;
          return {loaded:e.complete && e.naturalWidth>0,fit:getComputedStyle(e).objectFit,
            fills:Math.abs(image.width-frame.clientWidth)<1 && Math.abs(image.height-frame.clientHeight)<1};
        });
        assert(portrait.loaded && portrait.fit==='cover' && portrait.fills,
          `${engine} ${width}: contact portrait must load and fill its frame: ${JSON.stringify(portrait)}`);
        const email = await page.locator('.contact-link[href^="mailto:"] b').evaluate(e=>{
          const range = document.createRange(); range.selectNodeContents(e);
          const rect = e.closest('a').getBoundingClientRect();
          const fragments = [...range.getClientRects()];
          return {lines:fragments.length, size:parseFloat(getComputedStyle(e).fontSize), font:getComputedStyle(e).font, link:rect.toJSON(),fragments:fragments.map(r=>r.toJSON()), viewport:innerWidth,screen:document.querySelector('#screen').getBoundingClientRect().toJSON(),
            fits:fragments.every(r=>r.left>=rect.left-1 && r.right<=rect.right+1)};
        });
        if(!email.fits) await page.screenshot({path:`${output}/${engine}-${width}-email.png`});
        assert(email.lines===1 && email.size>=16 && email.fits,`${engine} ${width}: email must fit on one line at 16px minimum: ${JSON.stringify(email)}`);
      }
      if (width>1024) {
        const heroMarks = await page.locator('.desktop-icon > [data-i18n]').evaluateAll(els=>els.map(e=>getComputedStyle(e,'::before').content));
        assert(heroMarks.every(mark=>!mark.includes('•')),`${engine}: moving desktop launcher labels must not have a bullet`);
      }
      if (kind!=='home') {
        const labels = await page.locator(width>1024 ? '.scroll-section-name [data-scroll-label]' : '.scroll-index a[aria-current] [data-scroll-label]').evaluateAll(els=>els.map(e=>({text:getComputedStyle(e).color,mark:getComputedStyle(e,'::before').content,color:getComputedStyle(e,'::before').color})));
        assert(labels.every(x=>x.text==='rgb(245, 245, 245)' && x.mark.includes('•') && x.color==='rgb(255, 45, 58)'),`${engine}: navigation needs white labels and a red bullet`);
      }
    }
    await page.evaluate(()=>dispatchEvent(new CustomEvent('portfolio:scroll-to',{detail:'work'})));
    await page.waitForFunction(()=>document.querySelector('#scroll-work .scroll-window').classList.contains('is-revealed'));
    // Wait for smooth scrolling to finish before Playwright tries to scroll
    // the project card into view itself (Firefox otherwise cancels the handoff).
    await page.waitForFunction(()=>Math.abs(document.querySelector('#scroll-viewport').scrollTop-document.querySelector('#scroll-work').offsetTop)<2);
    // Capture the animation via its class mutations, without relying on a
    // screenshot happening to land in a 155ms transition window.
    await page.evaluate(()=>{
      window.polishDegauss = false;
      new MutationObserver(()=>{
        if(document.querySelector('#screen').classList.contains('crt-degauss')) window.polishDegauss=true;
      }).observe(document.querySelector('#screen'),{attributes:true,attributeFilter:['class']});
    });
    await page.locator('#scroll-work [data-project-slug]').first().click();
    await page.waitForFunction(()=>document.body.classList.contains('project-case-open'));
    assert(await page.evaluate(()=>window.polishDegauss),`${engine}: missing project entry degauss`);
    await page.waitForTimeout(450);
    await page.locator('[data-projects-back]').click();
    await page.waitForFunction(()=>!document.querySelector('#screen').classList.contains('crt-degauss'));
    await page.waitForTimeout(100);
    await page.waitForFunction(()=>!document.body.classList.contains('project-case-open') && document.querySelector('#crt-head-feature').classList.contains('is-ready'));
    assert(await page.evaluate(()=>document.querySelector('#crt-head-canvas')===window.polishHead),`${engine}: head not preserved after closing case`);
    const proportions = await page.evaluate(()=>{
      const head=document.querySelector('#crt-head-feature').getBoundingClientRect();
      const anchor=document.querySelector('.scroll-head-anchor').getBoundingClientRect();
      return Math.abs(head.width/head.height-anchor.width/anchor.height);
    });
    assert(proportions<.02,`${engine}: degauss corrupted the restored head proportions`);
    await page.screenshot({path:`${output}/${engine}-${width}.png`});
    console.log('FINAL POLISH PASS',engine,width,height);
    await page.close();
  }
  const page = await browser.newPage();
  await page.goto(new URL('404.html',base).href);
  assert.equal(await page.locator('#page-title').evaluate(e=>getComputedStyle(e,'::after').color),'rgb(255, 45, 58)');
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto(base);
  await page.waitForFunction(()=>document.body.classList.contains('site-ready'));
  await page.clock.install();
  await page.evaluate(()=>document.dispatchEvent(new Event('pointermove')));
  await page.clock.fastForward(60_000);
  const frame = page.frameLocator('#idle-screensaver-scene');
  await frame.locator('#page-title .doto-glyph').waitFor();
  assert.equal(await frame.locator('.topline__idle-status').count(),0);
  assert.equal(await frame.locator('#page-title .doto-glyph').evaluate(e=>getComputedStyle(e).color),'rgb(255, 45, 58)');
  console.log('404 / IDLE GLYPHS PASS',engine);
} finally { await browser.close(); }
