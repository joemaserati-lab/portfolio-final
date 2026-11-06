import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
import {chromium} from 'playwright';

const base = process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const qa = process.env.QA_DIR || '/tmp/portfolio-cursor-qa';
await mkdir(qa, {recursive:true});
const browser = await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
  for(const [width,height] of [[1440,900],[2560,1440],[820,900]]){
    const page = await browser.newPage({viewport:{width,height}});
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(new URL('work/',base).href);
    await page.waitForFunction(() => document.body.classList.contains('site-ready'));
    const cover = page.locator('#scroll-work .project-cover-v2').first();
    for(const lang of ['en','it']){
      await page.evaluate(lang => window.PortfolioI18n.setLang(lang),lang);
      await page.waitForTimeout(500);
      await cover.hover();
      await page.waitForFunction(()=>document.querySelector('#pixelart-cursor').classList.contains('is-project'));
      await page.waitForTimeout(180);
      const state = await page.evaluate(() => {
        const c = document.querySelector('#pixelart-cursor');
        const label = c.firstElementChild;
        const style = getComputedStyle(label);
        const rect = label.getBoundingClientRect();
        const screen = document.querySelector('#screen').getBoundingClientRect();
        return {count:document.querySelectorAll('#pixelart-cursor').length,
          project:c.classList.contains('is-project'), text:label.textContent,
          radius:style.borderRadius, background:style.backgroundColor,color:style.color,
          font:style.fontFamily,weight:style.fontWeight, duration:style.transitionDuration,
          glyph:getComputedStyle(label.firstElementChild).color,
          cta:getComputedStyle(document.querySelector('.has-project-cursor .project-cover-open')).opacity,
          inside:rect.left>screen.left && rect.right<screen.right && rect.top>screen.top && rect.bottom<screen.bottom,
          aria:c.getAttribute('aria-hidden'), transformTransition:getComputedStyle(c).transitionProperty};
      });
      assert.equal(state.count,1);
      assert(state.project && state.inside);
      assert.equal(state.text,lang==='it' ? '•VEDI PROGETTO' : '•VIEW PROJECT');
      assert.equal(state.radius,'0px');
      assert.equal(state.background,'rgb(245, 245, 245)');
      assert.equal(state.color,'rgb(5, 5, 5)');
      assert.equal(state.glyph,'rgb(255, 45, 58)');
      assert(state.font.includes('Doto'));
      assert.equal(state.weight,'600');
      assert.equal(state.cta,'0');
      assert.equal(state.aria,'true');
      assert(!state.transformTransition.includes('transform'));
      await page.screenshot({path:`${qa}/label-${width}-${lang}.png`});
    }
    // Measure layout reads: pointer movement must reuse cached label/screen geometry.
    const perf = await cover.evaluate(async el => {
      const label = document.querySelector('.cursor-project-label');
      let reads = 0;
      Object.defineProperty(label,'offsetWidth',{configurable:true,get(){reads++;return 160;}});
      for(let i=0;i<20;i++){
        el.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',clientX:400+i,clientY:400,bubbles:true}));
        await new Promise(requestAnimationFrame);
      }
      delete label.offsetWidth;
      return reads;
    });
    assert.equal(perf,0,'Movement repeatedly measured label geometry');
    // Edge placement is exercised directly so every CRT corner is covered.
    for(const [x,y] of [[1,1],[width-1,1],[width-1,height-1],[1,height-1]]){
      await cover.dispatchEvent('pointermove',{pointerType:'mouse',clientX:x,clientY:y});
      await page.waitForTimeout(25);
      assert(await page.locator('.cursor-project-label').evaluate(el=>{
        const r=el.getBoundingClientRect(),s=document.querySelector('#screen').getBoundingClientRect();
        return r.left>=s.left+27 && r.right<=s.right-27 && r.top>=s.top+27 && r.bottom<=s.bottom-27;
      }),'CRT edge clipped label');
    }
    await page.mouse.move(10,10);
    assert.equal(await page.locator('#pixelart-cursor.is-project').count(),0);
    await page.keyboard.press('Tab');
    await cover.locator('..').focus();
    await page.waitForFunction(()=>getComputedStyle(document.querySelector('#scroll-work .project-cover-open')).opacity==='1');
    assert.equal(await cover.locator('.project-cover-open').evaluate(el=>getComputedStyle(el).opacity),'1');
    await page.emulateMedia({reducedMotion:'reduce'});
    await cover.hover();
    assert.equal(await page.locator('.cursor-project-label').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
    await page.evaluate(()=>document.querySelector('#scroll-contact').scrollIntoView());
    await page.waitForTimeout(600);
    assert.equal(await page.locator('.has-project-cursor').count(),0,'Scroll left stale cover state');
    assert.deepEqual(errors,[]);
    console.log('PROJECT CURSOR PASS',width,'EN/IT, CRT corners, focus, reduced motion, cached geometry');
    await page.close();
  }
  for(const [width,height] of [[390,844],[667,375]]){
    const page=await browser.newPage({viewport:{width,height},hasTouch:true,isMobile:true});
    await page.goto(new URL('work/',base).href);
    await page.waitForFunction(()=>document.body.classList.contains('site-ready'));
    assert.equal(await page.locator('#pixelart-cursor').count(),0);
    const cover=page.locator('#scroll-work .project-cover-v2').first();
    await cover.scrollIntoViewIfNeeded();
    await page.screenshot({path:`${qa}/touch-${width}.png`});
    await cover.tap();
    await page.waitForFunction(()=>Boolean(document.querySelector('#projects-view').dataset.project));
    assert.equal(await page.locator('.has-project-cursor').count(),0);
    console.log('PROJECT CURSOR TOUCH PASS',width,'single-tap opening preserved');
    await page.close();
  }
} finally { await browser.close(); }
