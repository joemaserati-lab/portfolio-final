import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.AUDIT_URL||'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
const eps=2;
try{
 for(const [width,height] of [[1440,900],[1835,831],[1920,1080]]){
  const page=await browser.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await page.addInitScript(()=>{localStorage.setItem('portfolioBootSeen','1');localStorage.setItem('portfolioLang','it')});
  await page.goto(base);
  await page.waitForFunction(()=>document.body.classList.contains('site-ready'),null,{timeout:45000});
  await page.evaluate(()=>document.fonts.ready);
  const shape=await page.evaluate(()=>{
   const q=s=>document.querySelector(s),box=s=>q(s)?.getBoundingClientRect().toJSON();
   return {screen:box('#screen'),title:box('.hero-intro h1'),icons:box('.desktop-icons'),
     iconItems:[...document.querySelectorAll('.desktop-icons .desktop-icon')].map(x=>({box:x.getBoundingClientRect().toJSON(),bg:getComputedStyle(x).backgroundColor})),
     screenScrollWidth:q('#scroll-viewport').scrollWidth,screenClientWidth:q('#scroll-viewport').clientWidth};
  });
  const fitRatio=Math.min(5/3,(width-2*(14+34))/(height-2*(14+28)));
  assert(Math.abs(shape.screen.width/shape.screen.height-fitRatio)<.002,`${width}: centered 5:3-or-viewport-fit ratio`);
  assert(shape.title.right < shape.icons.left-12,`${width}: hero intersects launchers`);
  assert(shape.iconItems.every(x=>x.box.right <= shape.screen.right+eps),`${width}: launcher out of bounds`);
  assert(shape.iconItems.every(x=>x.bg.startsWith('rgba(8, 8, 8') || x.bg.startsWith('rgb(8, 8, 8')),`${width}: missing icon backing`);
  for (const kind of ['work','resume','contact']) {
   await page.evaluate(kind=>dispatchEvent(new CustomEvent('portfolio:scroll-to',{detail:kind})),kind);
   await page.waitForFunction(kind=>document.querySelector('.scroll-index [aria-current]')?.dataset.scrollSection===kind,kind);
   await page.waitForFunction(kind=>document.querySelector('#scroll-'+kind+' .scroll-window').classList.contains('is-revealed'),kind);
   const info=await page.evaluate(kind=>{
    const root=document.querySelector('#scroll-'+kind),win=root.querySelector('.scroll-window');
    const box=e=>e?.getBoundingClientRect().toJSON();
    return {
     section:box(root),win:box(win),body:box(win.querySelector('.window-body')),
     scrollWidth:document.getElementById('scroll-viewport').scrollWidth,
     clientWidth:document.getElementById('scroll-viewport').clientWidth,
     headParent:document.getElementById('crt-head-feature').parentElement.id,
     headDocked:document.getElementById('crt-head-feature').classList.contains('scroll-portrait-docked'),
     headBox:box(document.getElementById('crt-head-feature')),
     screenBox:box(document.getElementById('screen')),
     headOpacity:getComputedStyle(document.getElementById('crt-head-feature')).opacity,
     grid:getComputedStyle(root.querySelector('.projects-grid-v2')||root.querySelector('.resume-section')||root.querySelector('.contact-panel')).gridTemplateColumns,
     rows:[...root.querySelectorAll('.project-tile-v2')].map(x=>box(x)),
     covers:[...root.querySelectorAll('.project-cover-v2')].map(x=>({box:box(x),ratio:getComputedStyle(x).aspectRatio})),
     videos:[...root.querySelectorAll('.project-cover-video')].map(x=>getComputedStyle(x).objectFit),
     resume:root.querySelector('.resume-section')?{
       section:box(root.querySelector('.resume-section')),list:box(root.querySelector('.resume-list')),
       firstRow:box(root.querySelector('.resume-row')),inner:box(root.querySelector('.resume-row > div:last-child')),
       sectionColumns:getComputedStyle(root.querySelector('.resume-section')).gridTemplateColumns}:null,
     contact:root.querySelector('.contact-panel')?{
       panel:box(root.querySelector('.contact-panel')),copy:box(root.querySelector('.contact-copy')),
       photo:box(root.querySelector('.contact-photo')),
       links:[...root.querySelectorAll('.contact-link')].map(x=>({outer:box(x),label:box(x.querySelector('span')),value:box(x.querySelector('b'))}))}:null
    };
   },kind);
   assert(info.win.width>=info.section.width*.70,`${width} ${kind}: desktop window still narrow`);
   assert(info.scrollWidth<=info.clientWidth+eps,`${width} ${kind}: horizontal overflow`);
   assert.equal(info.headParent,'screen',`${width} ${kind}: WebGL must dock to the CRT screen`);
   assert(info.headDocked,`${width} ${kind}: missing bottom-center dock`);
   assert(Math.abs((info.headBox.left+info.headBox.right)/2-(info.screenBox.left+info.screenBox.right)/2)<6,
     `${width} ${kind}: portrait not horizontally centered`);
   assert(info.headBox.height<205 && info.headBox.height>115,`${width} ${kind}: portrait should be small`);
   assert(info.headBox.bottom <= info.screenBox.bottom-25,`${width} ${kind}: dock is below CRT safe zone`);
   if(kind==='work'){
    assert.equal(info.rows.length,5,`${width}: expected five projects`);
    for(let i=1;i<info.rows.length;i++) assert(info.rows[i].top>=info.rows[i-1].bottom-1,`${width}: projects not in one column`);
    assert(info.covers.every(x=>Math.abs(x.box.width/x.box.height-16/9)<.015),`${width}: media not 16:9`);
    assert(info.videos.every(x=>x==='contain'),`${width}: cropped video preview`);
   }
   if(kind==='resume'){
    assert(Math.abs(info.resume.section.width-info.resume.list.width)<eps,`${width}: CV list not full width`);
    assert(info.resume.inner.width>info.resume.firstRow.width*.55,`${width}: CV description too narrow`);
   }
   if(kind==='contact'){
    const c=info.contact;
    assert(c.photo.right<=c.panel.right+eps && c.photo.bottom<=c.panel.bottom+eps,`${width}: portrait escapes contact panel`);
    assert(c.links.every(x=>x.value.right<=x.outer.right+eps && x.value.left>=x.outer.left-eps),`${width}: contact values overflow`);
   }
  }
  await page.close();
  console.log('LAYOUT PASS',width,'5:3, hero, work video, CV, contacts, centered desktop head');
 }
 // Mobile handoff uses a square slot: preserve the original horizontal
 // centering and avoid reallocating the WebGL canvas.
 const phone=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await phone.addInitScript(()=>{sessionStorage.setItem('portfolioBootSeen','1');localStorage.setItem('portfolioPrivacyAck','1')});
 await phone.goto(base);
 await phone.waitForFunction(()=>document.body.classList.contains('site-ready'));
 await phone.waitForFunction(()=>window.__portfolioHeadState?.ready);
 const mobileBuffer=await phone.locator('#crt-head-canvas').evaluate(e=>[e.width,e.height]);
 await phone.locator('.scroll-index [data-scroll-section="work"]').click();
 await phone.waitForFunction(()=>document.querySelector('#scroll-work .scroll-window').classList.contains('is-revealed'));
 await phone.waitForFunction(()=>{
   const h=document.getElementById('crt-head-feature').getBoundingClientRect();
   const s=document.querySelector('.scroll-portrait-slot').getBoundingClientRect();
   return Math.abs((h.left+h.right-s.left-s.right)/2)<2;
 });
 assert.deepEqual(await phone.locator('#crt-head-canvas').evaluate(e=>[e.width,e.height]),mobileBuffer,
   'Mobile handoff changed the WebGL drawing buffer');
 console.log('MOBILE DOCK PASS',390,'portrait centered in original slot');
 await phone.close();
 const hybrid=await browser.newPage({viewport:{width:1440,height:900},hasTouch:true});
 await hybrid.addInitScript(()=>{sessionStorage.setItem('portfolioBootSeen','1');localStorage.setItem('portfolioPrivacyAck','1')});
 await hybrid.goto(base);
 await hybrid.waitForFunction(()=>document.body.classList.contains('site-ready'));
 await hybrid.waitForFunction(()=>window.__portfolioHeadState?.ready);
 await hybrid.locator('#scroll-viewport').evaluate(e=>e.scrollTop=900);
 await hybrid.waitForTimeout(600);
 const debug=await hybrid.evaluate(()=>{
  const head=document.getElementById('crt-head-feature');
  const viewport=document.getElementById('scroll-viewport');
  return {scrollTop:viewport.scrollTop,scrollHeight:viewport.scrollHeight,clientHeight:viewport.clientHeight,
    classes:document.body.className,headParent:head.parentElement.id,
    headOpacity:getComputedStyle(head).opacity,headVisibility:getComputedStyle(head).visibility,
    headClass:head.className,compact:matchMedia('(max-width:1024px)').matches};
 });
 console.log('HYBRID DESKTOP SCROLL DIAGNOSTICS',JSON.stringify(debug));
 assert.equal(debug.scrollTop,900,'Hybrid desktop did not scroll');
 assert.equal(debug.headParent,'screen','Hybrid WebGL did not dock to CRT');
 assert(debug.classes.includes('scroll-head-docked'),'Hybrid desktop did not enter docked mode');
 assert.equal(debug.headVisibility,'visible','Hybrid head must remain visible during reading');
 assert(Number(debug.headOpacity)>.6,'Hybrid docked head must be legible');
 // Verify real pointer-driven yaw after scrolling into a section, including
 // touch-capable laptops. The pointer is relative to the CRT, not the icon.
 const sr=await hybrid.locator('#screen').boundingBox();
 await hybrid.mouse.move(sr.x+sr.width*.18,sr.y+sr.height*.5);
 await hybrid.waitForTimeout(450);
 const leftYaw=await hybrid.evaluate(()=>window.PortfolioMotion.getPose().yaw);
 await hybrid.mouse.move(sr.x+sr.width*.82,sr.y+sr.height*.5);
 await hybrid.waitForTimeout(450);
 const rightYaw=await hybrid.evaluate(()=>window.PortfolioMotion.getPose().yaw);
 assert(rightYaw-leftYaw>.03,'Docket portrait does not follow mouse across CRT');
 // One viewport-selected preview automatically plays on desktop without hover.
 await hybrid.evaluate(()=>dispatchEvent(new CustomEvent('portfolio:scroll-to',{detail:'work'})));
 await hybrid.waitForFunction(()=>document.querySelector('#scroll-work .scroll-window').classList.contains('is-revealed'));
 await hybrid.locator('#scroll-work .project-cover-v2').first().evaluate(e=>{
   const v=document.getElementById('scroll-viewport'), r=e.getBoundingClientRect(), sr=v.getBoundingClientRect();
   v.scrollTop+=r.top-(sr.top+Math.min(95,sr.height*.13));
 });
 await hybrid.waitForFunction(()=>document.querySelectorAll('#scroll-work .is-viewport-color').length===1);
 assert.equal(await hybrid.locator('#scroll-work .is-viewport-color').count(),1,'Desktop preview not selected by viewport');
 const playback=await hybrid.locator('#scroll-work .is-viewport-color video').evaluate(v=>({
   src:v.getAttribute('src'),canPlay:Boolean(v.canPlayType('video/mp4; codecs="avc1.640028"')),muted:v.muted
 }));
 assert(playback.src && playback.muted,'Viewport preview should load automatically as a muted video');
 if(playback.canPlay){
   await hybrid.waitForFunction(()=>{
     const card=document.querySelector('#scroll-work .is-viewport-color');
     const video=card?.querySelector('video');
     return video && !video.paused && video.readyState>=2 && card.classList.contains('is-video-playing');
   },null,{timeout:20000});
 }
 const playing=await hybrid.locator('#scroll-work .project-cover-video').evaluateAll(videos=>videos.filter(v=>!v.paused).length);
 assert(playing<=1,'More than one desktop project preview is playing');
 await hybrid.close();
}finally{await browser.close()}
