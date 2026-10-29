import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base = process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const browser = await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
  for (const [width,height] of [[390,844],[1440,900]]) {
    const page = await browser.newPage({viewport:{width,height},hasTouch:width<700,isMobile:width<700});
    await page.goto(base);
    await page.waitForFunction(() => document.body.classList.contains('site-ready'));
    await page.clock.install();
    const layer = page.locator('#idle-screensaver');
    await page.evaluate(() => document.dispatchEvent(new Event('pointermove')));
    await page.clock.fastForward(59_999);
    assert(await layer.isHidden(), `${width}: saver appeared too early`);
    await page.clock.fastForward(1);
    assert(await layer.isVisible(), `${width}: saver not shown at 60 seconds`);
    assert.equal(await page.locator('#idle-screensaver h2').innerText(), 'IDLE MODE.');
    assert.equal(await page.evaluate(() => document.body.classList.contains('screensaver-on')), true);
    assert.equal(await page.evaluate(() => document.querySelector('#crt-stage').style.filter), '');
    await page.evaluate(() => document.dispatchEvent(new Event('keydown', {bubbles:true,cancelable:true})));
    assert(await layer.isHidden(), `${width}: key did not dismiss`);
    await page.clock.fastForward(60_000);
    assert(await layer.isVisible(), `${width}: saver did not re-arm`);
    await page.evaluate(() => window.PortfolioI18n.setLang('it'));
    assert.equal(await page.locator('#idle-screensaver h2').innerText(), 'IN PAUSA.');
    await page.evaluate(() => document.dispatchEvent(new Event('pointermove',{bubbles:true})));
    assert(await layer.isHidden(), `${width}: pointer did not dismiss`);
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.clock.fastForward(60_000);
    assert(await layer.isVisible(), `${width}: reduced motion must still show saver`);
    const before = await page.locator('#idle-screensaver-dvd').evaluate(el => getComputedStyle(el).transform);
    await page.clock.fastForward(1000);
    const after = await page.locator('#idle-screensaver-dvd').evaluate(el => getComputedStyle(el).transform);
    assert.equal(before,after, `${width}: reduced motion must disable bouncing`);
    await page.locator('#idle-screensaver-resume').click();
    assert(await layer.isHidden());
    assert.equal(await page.locator('#scroll-home').count(),1);
    console.log('IDLE PASS',width,height,'timing, rearm, keyboard/pointer, IT/EN, reduced motion');
    await page.close();
  }
} finally { await browser.close(); }
