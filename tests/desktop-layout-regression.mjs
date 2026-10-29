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
     headHidden:document.body.classList.contains('scroll-head-hidden'),
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
   assert.equal(info.headParent,'desktop',`${width} ${kind}: desktop WebGL head was reparented`);
   assert(info.headHidden,`${width} ${kind}: WebGL must not obstruct scroll reading`);
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
  console.log('LAYOUT PASS',width,'5:3, hero, work video, CV, contacts, stationary head');
 }
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
 await hybrid.close();
}finally{await browser.close()}
