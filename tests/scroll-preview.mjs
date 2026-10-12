import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const url = process.env.PREVIEW_URL || 'http://127.0.0.1:4321/portfolio-final/scroll-preview/';
const browser=await chromium.launch({headless:true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH} : {}), args:['--use-gl=swiftshader','--enable-webgl']});
async function screenshot(page,name) { if(process.env.QA_DIR) { await mkdir(process.env.QA_DIR,{recursive:true}); await page.screenshot({path:`${process.env.QA_DIR}/${name}`}); } }
for(const [width,height] of [[1440,900],[320,568],[390,844],[667,375]]){
 const page=await browser.newPage({viewport:{width,height},hasTouch:width<768,isMobile:width<768});
 const settle = kind => page.waitForFunction(kind => {
   const viewport = document.getElementById('scroll-viewport');
   const section = document.getElementById(`scroll-${kind}`);
   const target = Math.min(section.offsetTop, viewport.scrollHeight - viewport.clientHeight);
   return Math.abs(viewport.scrollTop - target) < 2
     && document.querySelector('.scroll-index [aria-current]')?.dataset.scrollSection === kind
     && (kind !== 'home' || document.getElementById('crt-head-feature').parentElement.id === 'desktop');
 }, kind, {timeout:15000});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
 await page.goto(url);
 await page.locator('#boot-enter').waitFor({state:'visible',timeout:30000});
 await page.waitForFunction(()=>!document.querySelector('#boot-enter').disabled,{},{timeout:45000});
 await screenshot(page,`original-loader-${width}.png`);
 await page.locator('#boot-enter').click();await page.waitForFunction(()=>document.body.classList.contains('site-ready'),{},{timeout:20000});
 await page.waitForTimeout(800);
 await page.locator('#privacy-panel').waitFor({state:'visible',timeout:3000});
 await page.locator('#privacy-reject').click();
 assert.equal(await page.locator('.desktop-icons .desktop-icon').count(),4);
 assert.equal(await page.locator('#scroll-work .project-tile-v2').count(),5);
 await page.waitForFunction(()=>document.querySelector('#crt-head-feature').classList.contains('is-ready'),null,{timeout:30000});
 await screenshot(page,`original-hero-${width}.png`);
 await page.evaluate(()=>{const v=document.querySelector('#scroll-viewport');v.scrollTop=v.clientHeight*.5});await page.waitForTimeout(200);
 await screenshot(page,`original-transition-${width}.png`);
 assert(await page.locator('#crt-head-feature').evaluate(e=>e.classList.contains('scroll-portrait-docked')));
 await page.locator('.scroll-index [data-scroll-section="work"]').click();await settle('work');
 assert.equal(await page.locator('.scroll-index [aria-current]').getAttribute('data-scroll-section'),'work');
 await screenshot(page,`original-work-${width}.png`);
 await page.locator('#scroll-work .project-tile-v2').first().click();await page.waitForTimeout(700);
 assert.equal(await page.locator('#projects-view').getAttribute('data-view'),'case');
 assert(page.url().includes('/scroll-preview/#project=tovadu'));
 assert(await page.locator('#crt-head-feature').evaluate(e=>e.classList.contains('is-ready')));
 await page.locator('.projects-close').click();await page.waitForTimeout(700);
 assert(await page.locator('#projects-view').evaluate(e=>e.hidden));
 await page.locator('.scroll-index [data-scroll-section="about"]').click();await settle('about');
 assert.equal(await page.locator('.scroll-index [aria-current]').getAttribute('data-scroll-section'),'about');
 await page.locator('.scroll-index [data-scroll-section="contact"]').click();await settle('contact');
 assert.equal(await page.locator('.scroll-index [aria-current]').getAttribute('data-scroll-section'),'contact');
 await page.locator('.scroll-index [data-scroll-section="home"]').click();await settle('home');
 assert.equal(await page.locator('#scroll-viewport').evaluate(e=>e.scrollTop),0);
 assert.equal(await page.locator('#crt-head-feature').evaluate(e=>e.parentElement.id),'desktop');
 assert.equal(errors.length,0,errors.join('\n'));
 assert(await page.locator('#scroll-viewport').evaluate(e=>e.scrollWidth<=e.clientWidth), 'Horizontal overflow');
 console.log('PASS',width,height);await page.close();
}
const reduced=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
await reduced.addInitScript(()=>{sessionStorage.setItem('portfolioBootSeen','1');localStorage.setItem('portfolioPrivacyAck','1')});
await reduced.goto(url);
await reduced.waitForFunction(()=>document.body.classList.contains('site-ready'),null,{timeout:50000});
assert.equal(await reduced.locator('#scroll-work .project-tile-v2').count(),5, 'Returning visit content missing');
await reduced.locator('[data-scroll-section=about]').click();await reduced.waitForTimeout(150);
assert.equal(await reduced.locator('.scroll-index [aria-current]').getAttribute('data-scroll-section'),'about');
assert.equal(await reduced.locator('.scroll-folder-morph').evaluate(e=>getComputedStyle(e).visibility),'hidden');
const before=await reduced.locator('#scroll-about .window-body').innerText();
await reduced.locator('#language-toggle').click();await reduced.waitForTimeout(100);
assert.notEqual(await reduced.locator('#scroll-about .window-body').innerText(),before);
console.log('PASS returning visit, reduced motion, language');
await browser.close();
