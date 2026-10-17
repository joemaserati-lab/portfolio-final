import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
 for(const [width,height] of [[1440,900],[320,568],[390,844],[667,375]]) {
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<768,isMobile:width<768});
  await page.addInitScript(()=>{sessionStorage.setItem('portfolioBootSeen','1');localStorage.setItem('portfolioPrivacyAck','1')});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  for(const slug of ['tovadu','pholia','sapy','platinum-technologies','colorcopy-large-format']) {
   await page.goto(new URL(`work/${slug}/`,base).href);
   await page.waitForFunction(()=>document.body.classList.contains('site-ready'),null,{timeout:45000});
   await page.waitForFunction(()=>!document.querySelector('#crt-head-feature').classList.contains('is-ready'));
   assert.equal(await page.locator('#crt-head-feature').isVisible(),false,'Head visible on direct project route');
   if(['platinum-technologies','colorcopy-large-format'].includes(slug)) assert.equal(await page.locator('.case-proof-v2').count(),1,'Impact/results content missing without a gallery');
   const video=page.locator('.case-media-hero-v2 video.case-media-video');
   const playback = await page.evaluate(async () => {
     const v=document.querySelector('.case-media-hero-v2 video.case-media-video');
     const url=v?.currentSrc || v?.src;
     let response;
     try { const r=await fetch(url,{method:'HEAD'}); response=r.status; } catch(e) { response=String(e); }
     return {url, response, canPlay:v?.canPlayType('video/mp4; codecs="avc1.640028"'),
       readyState:v?.readyState,networkState:v?.networkState,error:v?.error?.message,paused:v?.paused,
       expected:new URL(window.PORTFOLIO_DATA.projects.find(p=>p.slug===document.querySelector('#projects-view').dataset.project).video,document.baseURI).href};
   });
   console.log('VIDEO DIAGNOSTICS',slug,JSON.stringify(playback));
   assert.equal(playback.response,200,'Project video URL unavailable');
   assert.equal(playback.url,playback.expected,'Video URL does not match project');
   if (playback.canPlay) {
     await page.waitForFunction(()=>{
       const v=document.querySelector('.case-media-hero-v2 video.case-media-video');
       return v && v.readyState>=2 && !v.paused && v.videoWidth>0;
     },null,{timeout:15000});
   }
   const clean=await video.evaluate(v=>{
     const style=getComputedStyle(v), figure=v.closest('figure');
     const ancestors=[];
     for(let e=v;e;e=e.parentElement){const s=getComputedStyle(e);ancestors.push({filter:s.filter,opacity:s.opacity,blend:s.mixBlendMode});}
     const project=window.PORTFOLIO_DATA.projects.find(p=>p.slug===document.querySelector('#projects-view').dataset.project);
     return {filter:style.filter,opacity:style.opacity,objectFit:style.objectFit,
       videoRatio:v.getBoundingClientRect().width/v.getBoundingClientRect().height,
       originalRatio:v.videoWidth/v.videoHeight,after:getComputedStyle(figure,'::after').content,
       captionBelow:figure.querySelector('figcaption').getBoundingClientRect().top>=v.getBoundingClientRect().bottom-1,
       src:v.src,expected:new URL(project.video,document.baseURI).href,
       effects:[...document.querySelectorAll('#crt-fx,.noise,.scanlines')].map(e=>getComputedStyle(e).display),ancestors};
   });
   const reading=await page.evaluate(()=>{
    const role=document.querySelector('.case-role-v2');
    const cover=document.querySelector('.case-media-hero-v2');
    const paragraphs=[...document.querySelectorAll('.case-lead-v2>p,.case-role-v2>p,.case-story-copy p,.case-output-list p,.case-facts-v2 dd')];
    return {roleBeforeCover:Boolean(role.compareDocumentPosition(cover)&Node.DOCUMENT_POSITION_FOLLOWING),sizes:paragraphs.map(p=>parseFloat(getComputedStyle(p).fontSize))};
   });
   assert(reading.roleBeforeCover,'Role must precede artwork');
   assert(reading.sizes.every(size=>size>=16),'Case body text shrank below 16px');
   assert.equal(await page.locator('#projects-view .case-media-surface').count(),0,'Decorative placeholder presented as project media');
   assert.equal(clean.filter,'none');assert.equal(clean.opacity,'1');assert.equal(clean.objectFit,'contain');
   if (playback.canPlay) assert(Math.abs(clean.videoRatio-clean.originalRatio)<.01,'Hero video cropped or distorted');
   assert.equal(clean.after,'none');assert(clean.captionBelow,'Caption overlays hero video');assert.equal(clean.src,clean.expected);
   assert(clean.effects.every(display=>display==='none'),'Global CRT effects still overlay artwork');
   assert(clean.ancestors.every(s=>s.filter==='none'&&s.opacity==='1'&&s.blend==='normal'),'Ancestor modifies original video');
   assert(await page.locator('#projects-view').evaluate(e=>e.scrollWidth<=e.clientWidth),'Project horizontal overflow');
   if(process.env.QA_DIR && slug==='tovadu'){
    await mkdir(process.env.QA_DIR,{recursive:true});await page.screenshot({path:`${process.env.QA_DIR}/project-${width}.png`});
    await video.screenshot({path:`${process.env.QA_DIR}/original-artwork-${width}.png`});
   }
   console.log('PROJECT PASS',width,height,slug,'head hidden; original video; no CRT overlay');
  }
  await page.locator('.case-nav-v2 [data-project-slug=tovadu]').click();
  await page.waitForURL(new URL('work/tovadu/',base).href);
  assert.equal(await page.locator('#crt-head-feature').isVisible(),false);
  await page.goBack();await page.waitForURL(new URL('work/colorcopy-large-format/',base).href);
  assert.equal(await page.locator('#crt-head-feature').isVisible(),false);
  await page.locator('.projects-close').click();
  await page.waitForFunction(()=>document.querySelector('#projects-view').hidden&&document.querySelector('#crt-head-feature').classList.contains('is-ready'));
  assert(await page.locator('#crt-head-feature').isVisible(),'Head did not resume on return');
  assert(await page.locator('#crt-fx').evaluate(e=>getComputedStyle(e).display!=='none'),'CRT did not resume');
  assert.equal(await page.locator('#scroll-work .project-cover-img').count(),5,'Index covers missing on return');
  assert.equal(errors.length,0,errors.join('\n'));
  console.log('PROJECT RETURN PASS',width,height);
  await page.close();
 }
}finally{await browser.close()}
