import { mkdir } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
import assert from 'node:assert/strict';
const url = process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true, ...(process.env.PLAYWRIGHT_EXECUTABLE_PATH ? {executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH} : {}), args:['--use-gl=swiftshader','--enable-webgl']});
async function screenshot(page,name) { if(process.env.QA_DIR) { await mkdir(process.env.QA_DIR,{recursive:true}); await page.screenshot({path:`${process.env.QA_DIR}/${name}`}); } }
for(const [width,height] of [[1440,900],[320,568],[390,844],[667,375]]){
 const page=await browser.newPage({viewport:{width,height},deviceScaleFactor:width<768?2:1,hasTouch:width<768,isMobile:width<768});
 const select = async kind => {
   if(width>1024) {
     if(kind==='home') await page.locator('#scroll-viewport').evaluate(e=>e.scrollTo({top:0,behavior:'smooth'}));
     else await page.locator(`[data-scroll-launch="${kind}"]`).click();
   } else await page.locator(`[data-scroll-section="${kind}"]`).click();
 };
 const settle = kind => page.waitForFunction(kind => {
   const viewport = document.getElementById('scroll-viewport');
   const section = document.getElementById(`scroll-${kind}`);
   const target = Math.min(section.offsetTop, viewport.scrollHeight - viewport.clientHeight);
   return Math.abs(viewport.scrollTop - target) < 2
     && document.querySelector('.scroll-index [aria-current]')?.dataset.scrollSection === kind
     && (kind !== 'home' || !document.getElementById('crt-head-feature').classList.contains('scroll-portrait-docked'))
     && (kind === 'home' || section.querySelector('.scroll-window').classList.contains('is-revealed'))
     && (kind === 'home' || matchMedia('(min-width:1025px)').matches || Math.abs(document.getElementById('crt-head-feature').getBoundingClientRect().height-document.querySelector('.scroll-portrait-slot').getBoundingClientRect().height)<1);
 }, kind, {timeout:15000});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')console.log('CONSOLE',m.text())});
 await page.goto(url);
 await page.waitForFunction(()=>document.body.classList.contains('site-ready'),null,{timeout:45000});
 await page.waitForFunction(()=>window.__portfolioHeadState?.ready, null, {timeout:30000});
 await page.locator('#boot-loader').waitFor({state:'detached'});
 assert.equal(await page.locator('#boot-loader').count(),0);
 assert.equal(await page.locator('.shell').evaluate(e=>getComputedStyle(e).opacity),'1');
 await page.waitForTimeout(800);
 assert.equal(await page.locator('#privacy-panel').isVisible(),false,'Unconfigured analytics should not request consent');
 assert.equal(await page.locator('.desktop-icons .desktop-icon').count(),4);
 assert.equal(await page.locator('#scroll-work .project-tile-v2').count(),5);
 await page.waitForFunction(()=>document.querySelector('#crt-head-feature').classList.contains('is-ready'),null,{timeout:30000});
 const initialCanvasWidth=await page.evaluate(()=>window.PortfolioMotion.getRenderStats().width);
 await screenshot(page,`original-hero-${width}.png`);
 if(width>1024) {
   assert.equal(await page.locator('.scroll-minimenu button').count(),4);
   assert.equal(await page.locator('.scroll-index').isVisible(),false,'Desktop side index remains visible');
   await page.evaluate(()=>{const v=document.getElementById('scroll-viewport');v.scrollTop=v.clientHeight*.221});
   await page.waitForFunction(()=>getComputedStyle(document.querySelector('.scroll-folder-morph')).display==='block');
   const origin=await page.evaluate(()=>{
     const glyph=document.querySelector('[data-scroll-launch=work] .icon-glyph').getBoundingClientRect();
     const outline=document.querySelector('.scroll-folder-morph').getBoundingClientRect();
     return Math.abs(glyph.left-outline.left);
   });
   assert(origin<6,'Window does not originate at the minimenu icon');
 }
 await page.evaluate(()=>{const v=document.querySelector('#scroll-viewport');v.scrollTop=v.clientHeight*.5});await page.waitForTimeout(200);
 if(width<=1024) assert.equal(await page.evaluate(()=>window.PortfolioMotion.getRenderStats().width),
    initialCanvasWidth,"Head drawing buffer resized during mobile handoff");
 await screenshot(page,`original-transition-${width}.png`);
 assert.equal(await page.locator('#scroll-work .window-body').evaluate(e=>getComputedStyle(e).visibility),'hidden','Content appeared before the outline finished');
 assert(await page.locator('#scroll-work .window-body').evaluate(e=>e.inert));
 if(width<=1024) assert(await page.locator('#crt-head-feature').evaluate(e=>e.classList.contains('scroll-portrait-docked')));
 else {
   assert.equal(await page.locator('#crt-head-feature').evaluate(e=>e.parentElement.id),'screen','Desktop portrait must dock to CRT');
   assert(await page.locator('#crt-head-feature').isVisible(),'Desktop docked portrait must remain visible');
 }
 await page.evaluate(()=>{const v=document.getElementById('scroll-viewport');v.scrollTop=v.clientHeight*.91});
 await page.waitForFunction(()=>document.querySelector('#scroll-work .scroll-window').classList.contains('is-scanning'));
 assert.notEqual(await page.locator('#scroll-work .window-body').evaluate(e=>getComputedStyle(e).clipPath),'none','Missing CRT raster reveal');
 await screenshot(page,`crt-reveal-${width}.png`);
 await page.evaluate(()=>{const v=document.getElementById('scroll-viewport');v.scrollTop=v.clientHeight*.5});
 await page.waitForFunction(()=>getComputedStyle(document.querySelector('#scroll-work .window-body')).visibility==='hidden');
 if(width>1024) await page.locator('[data-scroll-launch=work]').click();
 else await page.locator('.scroll-index [data-scroll-section="work"]').click();
 await settle('work');
 assert.equal(await page.locator('.scroll-index [aria-current]').getAttribute('data-scroll-section'),'work');
 await screenshot(page,`original-work-${width}.png`);
 if(width>1024) {
   assert.equal(await page.locator('.scroll-section-name .scroll-sr').textContent(),'Selected Works');
   const labelPosition=await page.evaluate(()=>{
     const icon=document.querySelector('.scroll-mini-icon').getBoundingClientRect();
     const label=document.querySelector('.scroll-section-name').getBoundingClientRect();
     return label.top>=icon.bottom;
   });
   assert(labelPosition,'Section name is not below the four desktop icons');
 }
 if(width<=1024) {
   await page.waitForFunction(()=>getComputedStyle(document.querySelector('.scroll-index [aria-current]')).opacity==='1');
   const navigation=await page.evaluate(()=>{
     const nav=document.querySelector('.scroll-index'), r=nav.getBoundingClientRect();
     const screen=document.getElementById('screen').getBoundingClientRect();
     const active=nav.querySelector('[aria-current]'), idle=nav.querySelector('a:not([aria-current])');
     const a=getComputedStyle(active), i=getComputedStyle(idle);
     const hit=active.getBoundingClientRect();
     return {inside:nav.parentElement.id==='screen'&&r.left>=screen.left+10&&r.right<=screen.right-10&&r.bottom<=screen.bottom-10,
       contrast:Number(a.opacity)>Number(i.opacity)&&getComputedStyle(active.querySelector(".icon-glyph")).opacity==="0"&&getComputedStyle(idle.querySelector("[data-scroll-label]")).opacity==="0",
       touch:document.elementFromPoint(hit.left+hit.width/2,hit.top+hit.height/2)?.closest('a')===active};
   });
   assert(navigation.inside,'Mobile section menu is outside the CRT safe area');
   assert(navigation.contrast,'Mobile current section is not visually distinct');
   assert(navigation.touch,'Mobile section menu is covered by another control');
   assert(await page.locator('#language-toggle').evaluate(e=>e.parentElement.classList.contains('scroll-footer-controls')));
   assert(await page.locator('#privacy-toggle').evaluate(e=>e.closest('.scroll-footer-controls')!==null));
   const stable=await page.evaluate(()=>{
     const nav=document.querySelector('.scroll-index'),label=nav.querySelector('[aria-current] [data-scroll-label]'),before=nav.getBoundingClientRect(),text=label.textContent;
     label.textContent='W'.repeat(100);const after=nav.getBoundingClientRect();label.textContent=text;
     return Math.abs(before.height-after.height)<.1&&Math.abs(before.width-after.width)<.1;
   });
   assert(stable,'Long scramble text changed mobile navigation dimensions');
   const placement=await page.evaluate(()=>{
     const head=document.getElementById('crt-head-feature').getBoundingClientRect();
     const panel=document.querySelector('#scroll-work .scroll-window').getBoundingClientRect();
     return {gap:panel.top-head.bottom,alignment:Math.abs((panel.left+panel.right-head.left-head.right)/2)};
   });
   assert(placement.gap>=12,'Portrait overlaps the content header');
   assert(placement.alignment<2,'Portrait is not aligned to the content window');
   assert.equal(await page.locator('#scroll-work .window-body').evaluate(e=>getComputedStyle(e).textAlign),'left');
   assert.equal(await page.locator('#scroll-work .window-titlebar').isVisible(),false);
   assert.equal(await page.locator('.desktop-icons').isVisible(),false);
   assert(await page.locator('#scroll-work .scroll-window').evaluate(e=>getComputedStyle(e).borderTopWidth==='0px'));
   // The small mobile dock is intentionally rendered at its visible size,
   // rather than at full-screen device DPR. Keep enough pixels for legibility.
   const visual=await page.evaluate(()=>{
     const canvas=document.querySelector('#crt-head-feature canvas');
     const bounds=canvas.getBoundingClientRect();
     const stats=window.PortfolioMotion.getRenderStats();
     return {density:stats.width/Math.max(bounds.width,1),stats};
   });
   assert(visual.density>=.65,'Docked portrait sampling density too low');
   assert(visual.stats.pixels>0 && visual.stats.scale<.65,
     'Mobile dock must use the smaller GPU drawing buffer');
 }
 if(width<=1024) {
   await select('home'); await settle('home');
   const samples=[];
   for(let i=0;i<5;i++) {
     samples.push(await page.evaluate(()=>window.PortfolioMotion.getPose()));
     await page.waitForTimeout(400);
   }
   assert(samples.every(p=>Math.abs(p.yaw)<=.091&&Math.abs(p.pitch+.015)<=.026),'Hero motion is too strong');
   // Software WebGL and the orbit turning point can make a short sample look still.
   // Keep the same motion threshold, but wait for real rendered movement.
   const range={min:Math.min(...samples.map(p=>p.yaw)),max:Math.max(...samples.map(p=>p.yaw))};
   await page.waitForFunction(({min,max})=>{const yaw=window.PortfolioMotion.getPose().yaw;return Math.max(max,yaw)-Math.min(min,yaw)>.001},range,{timeout:15000});
   for(const fraction of [.25,.5,.75,1]) {
     await page.locator('#scroll-viewport').evaluate((e,p)=>e.scrollTop=(e.scrollHeight-e.clientHeight)*p,fraction);
     await page.waitForFunction(p=>Math.abs(window.PortfolioMotion.getPose().yaw-p*Math.PI*2)<.01,fraction);
   }
   await select('work'); await settle('work');
   const card=page.locator('#scroll-work .project-tile-v2').first();
   await card.evaluate(e=>{const v=document.getElementById('scroll-viewport');v.scrollTop=Math.max(document.getElementById('scroll-work').offsetTop,v.scrollTop+e.getBoundingClientRect().top-document.querySelector('.scroll-index').getBoundingClientRect().top+e.getBoundingClientRect().height+20)});
   await page.waitForFunction(()=>document.querySelectorAll('.is-viewport-color').length===1);
   const codecSupported=await page.evaluate(()=>Boolean(document.createElement('video').canPlayType('video/mp4; codecs="avc1.640028"')));
   if (codecSupported) {
     await page.waitForFunction(()=>{
       const card=document.querySelector('.is-viewport-color');
       const video=card?.querySelector('video.project-cover-video');
       return video && !video.paused && video.readyState>=2 && card.classList.contains('is-video-playing');
     },null,{timeout:20000});
   } else {
     assert.equal(await page.locator('.is-viewport-color video.project-cover-video').count(),1,'Video preview must exist even when browser codec is unavailable');
   }
   assert.notEqual(await page.locator('.is-viewport-color .project-cover-v2').evaluate(e=>getComputedStyle(e,'::after').animationName),'scroll-color-scan');
   assert.equal(await page.locator('#scroll-work .is-video-playing').count(),codecSupported ? 1 : 0,'Only the selected preview may play');
   await select('work'); await settle('work');
 } else {
   assert(await page.locator('#crt-head-feature').isVisible(),'Desktop head must remain visible while reading');
   const canvasSize=await page.evaluate(()=>{const r=window.PortfolioMotion.getRenderStats();return [r.width,r.height]});
   await page.locator('#scroll-viewport').evaluate(e=>e.scrollTop+=100);await page.waitForTimeout(400);
   assert.deepEqual(await page.evaluate(()=>{const r=window.PortfolioMotion.getRenderStats();return [r.width,r.height]}),
     canvasSize,'Scrolling must not reallocate the desktop canvas');
   assert.equal(await page.locator('#crt-head-feature').evaluate(e=>e.parentElement.id),'screen');
   assert(await page.locator('#scroll-work .is-viewport-color').count()<=1,'Desktop must select at most one viewport video');
   await select('work'); await settle('work');
 }
 // Scroll forward within the revealed section, keeping the first cover above
 // fixed navigation and below the docked portrait. Never scroll back into reveal.
 await page.locator('#scroll-work .project-cover-v2').first().evaluate(e=>{
   const v=document.getElementById('scroll-viewport'),r=e.getBoundingClientRect();
   const head=document.getElementById('crt-head-feature').getBoundingClientRect();
   const safeTop=matchMedia('(min-width: 1025px)').matches
     ? v.getBoundingClientRect().top+Math.min(110,v.clientHeight*.14)
     : Math.max(v.getBoundingClientRect().top+12,head.bottom+12);
   v.scrollTo({top:v.scrollTop+Math.max(0,r.top-safeTop),behavior:'instant'});
 });
 const coverPoint=await page.waitForFunction(()=>{
   const e=document.querySelector('#scroll-work .project-cover-v2'),r=e.getBoundingClientRect();
   const v=document.getElementById('scroll-viewport').getBoundingClientRect();
   const nav=document.querySelector('.scroll-index').getBoundingClientRect();
   const bottom=nav.height?Math.min(v.bottom,nav.top-8):v.bottom;
   const top=Math.max(r.top,v.top+8),end=Math.min(r.bottom,bottom);
   if(end<=top) return false;
   const x=r.left+r.width/2,y=(top+end)/2;
   return e.contains(document.elementFromPoint(x,y))?{x,y}:false;
 },null,{timeout:15000});
 const point=await coverPoint.jsonValue();
 // A real viewport tap/click avoids locator auto-scroll crossing the CRT boundary.
 if(width<768) await page.touchscreen.tap(point.x,point.y);
 else await page.mouse.click(point.x,point.y);
 await page.waitForTimeout(700);
 assert.equal(await page.locator('#projects-view').getAttribute('data-view'),'case');
 assert(page.url().endsWith('/work/tovadu/'));
 assert.equal(await page.locator('#crt-head-feature').isVisible(),false,'Head remains visible inside project');
 await page.locator('.projects-close').click();await page.waitForTimeout(700);
 assert(await page.locator('#projects-view').evaluate(e=>e.hidden));
 if(width<=1024) {
   await page.waitForFunction(()=>document.querySelector('#crt-head-feature').classList.contains('is-ready'));
   assert(await page.locator('#crt-head-feature').isVisible(),'Mobile head did not resume after closing project');
 } else {
   await page.waitForFunction(()=>document.querySelector('#crt-head-feature').classList.contains('is-ready'));
   assert(await page.locator('#crt-head-feature').isVisible(),'Desktop head should reappear docked after closing project');
 }
 if(width<=1024) assert(await page.locator('#scroll-work .is-color-preview').count()<=1,'More than one mobile card is colored');
 await select('about');await settle('about');
 assert.equal(await page.locator('.scroll-index [aria-current]').getAttribute('data-scroll-section'),'about');
 await select('resume');await settle('resume');
 assert.equal(await page.locator('.scroll-index [aria-current]').getAttribute('data-scroll-section'),'resume');
 assert.equal(await page.locator('#scroll-resume .resume-row').count(),8);
 assert.equal(await page.locator('#window-layer .os-window[data-kind=resume]').count(),0);
 assert(page.url().endsWith('/resume/'));
 await select('contact');await settle('contact');
 assert.equal(await page.locator('.scroll-index [aria-current]').getAttribute('data-scroll-section'),'contact');
 assert((await page.locator('#scroll-contact .contact-photo img').evaluate(e=>getComputedStyle(e).filter)).includes('grayscale(1)')); 
 assert.equal(await page.locator('.scroll-footer').count(),1);
 await page.locator('#scroll-viewport').evaluate(e=>e.scrollTop=e.scrollHeight);
 if(width<=1024){await page.locator('#privacy-toggle').click();await page.locator('#privacy-panel').waitFor({state:'visible'});await page.locator('#privacy-close').click();}
 await page.locator('.scroll-footer a').click();
 await settle('home');
 await select('home');await settle('home');
 assert.equal(await page.locator('#scroll-viewport').evaluate(e=>e.scrollTop),0);
 assert.equal(await page.locator('#crt-head-feature').evaluate(e=>e.parentElement.id),'screen');
 await page.waitForFunction(()=>document.querySelector('#crt-head-feature').classList.contains('is-ready'));
 assert(await page.locator('#crt-head-feature').isVisible(),'Head failed to resume on home');
 assert.equal(errors.length,0,errors.join('\n'));
 assert(await page.locator('#scroll-viewport').evaluate(e=>e.scrollWidth<=e.clientWidth), 'Horizontal overflow');
 console.log('PASS',width,height);await page.close();
}
const reduced=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true,reducedMotion:'reduce'});
await reduced.addInitScript(()=>{sessionStorage.setItem('portfolioBootSeen','1');localStorage.setItem('portfolioPrivacyAck','1')});
await reduced.goto(url);
await reduced.waitForFunction(()=>document.body.classList.contains('site-ready'),null,{timeout:50000});
await reduced.waitForFunction(()=>window.__portfolioHeadState?.ready);
const stillPose=await reduced.evaluate(()=>window.PortfolioMotion.getPose());
await reduced.waitForTimeout(500);
assert.deepEqual(await reduced.evaluate(()=>window.PortfolioMotion.getPose()),stillPose,'Reduced motion hero should remain still');
assert.equal(await reduced.locator('#scroll-work .project-tile-v2').count(),5, 'Returning visit content missing');
await reduced.locator('[data-scroll-section=about]').click();await reduced.waitForTimeout(150);
assert.equal(await reduced.locator('.scroll-index [aria-current]').getAttribute('data-scroll-section'),'about');
assert.equal(await reduced.locator('.scroll-folder-morph').evaluate(e=>getComputedStyle(e).visibility),'hidden');
const before=await reduced.locator('#scroll-about .window-body').innerText();
await reduced.locator('#scroll-viewport').evaluate(e=>e.scrollTop=e.scrollHeight);
await reduced.locator('#language-toggle').click();
await reduced.waitForFunction(before=>document.querySelector('#scroll-about .window-body').innerText!==before,before);
assert.notEqual(await reduced.locator('#scroll-about .window-body').innerText(),before);
console.log('PASS returning visit, reduced motion, language');
// Hybrid desktop: touch support must not disable real mouse input.
const returningDesktop=await browser.newPage({viewport:{width:1440,height:900},hasTouch:true});
await returningDesktop.addInitScript(()=>{sessionStorage.setItem('portfolioBootSeen','1');localStorage.setItem('portfolioPrivacyAck','1')});
await returningDesktop.goto(url);
await returningDesktop.waitForFunction(()=>document.body.classList.contains('site-ready'),null,{timeout:50000});
await returningDesktop.waitForFunction(()=>window.__portfolioHeadState?.ready,null,{timeout:30000});
await returningDesktop.mouse.move(1250,450);
await returningDesktop.waitForFunction(()=>Math.abs(window.PortfolioMotion.getPose().yaw)>.1,null,{timeout:20000});
const canvasSize=await returningDesktop.evaluate(()=>{const r=window.PortfolioMotion.getRenderStats();return [r.width,r.height]});
await returningDesktop.locator('#scroll-viewport').evaluate(e=>e.scrollTop=900);
await returningDesktop.waitForTimeout(500);
assert(await returningDesktop.locator('#crt-head-feature').isVisible(),'Hybrid desktop head must remain visible when docked');
assert.equal(await returningDesktop.locator('#crt-head-feature').evaluate(e=>e.parentElement.id),'screen');
const dockSize=await returningDesktop.evaluate(()=>{const r=window.PortfolioMotion.getRenderStats();return [r.width,r.height]});
 assert(dockSize[0]>0 && dockSize[1]>0 && dockSize[0]<canvasSize[0] && dockSize[1]<canvasSize[1],
   'Desktop dock should use a smaller GPU drawing buffer');
await returningDesktop.evaluate(()=>dispatchEvent(new CustomEvent('portfolio:scroll-to',{detail:'home'})));
await returningDesktop.waitForFunction(()=>document.querySelector('#crt-head-feature').classList.contains('is-ready'));
assert(await returningDesktop.locator('#crt-head-feature').isVisible(),'Hybrid desktop head must resume on home');
console.log('PASS hybrid desktop dock reacts and returns to hero with stable canvas');
await browser.close();
