import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const base=process.env.AUDIT_URL||'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
 for(const [width,height] of [[320,568],[390,844],[667,375],[1024,768],[1440,900],[1920,1080],[2560,1440]]) {
  const page=await browser.newPage({viewport:{width,height},hasTouch:width<768,isMobile:width<768});
  await page.goto(base,{waitUntil:'domcontentloaded'});
  const boot=await page.evaluate(()=>{
   const screen=document.querySelector('#screen').getBoundingClientRect(),loader=document.querySelector('#boot-loader').getBoundingClientRect();
   const outline=getComputedStyle(document.body,'::before');
   return {screen:screen.toJSON(),loader:loader.toJSON(),outlineLeft:parseFloat(outline.left)};
  });
  for(const key of ['x','y','width','height']) assert(Math.abs(boot.screen[key]-boot.loader[key])<1,`${width}: loader misaligned (${key})`);
  assert(Math.abs(boot.screen.x-boot.outlineLeft)<1,`${width}: outline misaligned`);
  if(width>1024) {
   assert(Math.abs(boot.screen.width/boot.screen.height-4/3)<.002,`${width}: expected classic 4:3`);
   assert(Math.abs(boot.screen.left-(width-boot.screen.right))<1,`${width}: screen not centered`);
  }
  await page.waitForFunction(()=>document.body.classList.contains('site-ready')&&!document.getElementById('boot-loader'),null,{timeout:45000});
  await page.evaluate(()=>document.fonts.ready);
  if(width<=1024) {
   const geometry=await page.evaluate(()=>{
    const selectors=['#screen','.hero-intro','.desktop-icons','.scroll-index'];
    const snapshot=()=>selectors.map(s=>document.querySelector(s).getBoundingClientRect().toJSON());
    const classic=snapshot();document.documentElement.dataset.crtFormat='wide';const wide=snapshot();document.documentElement.dataset.crtFormat='classic';return {classic,wide};
   });
   assert.deepEqual(geometry.classic,geometry.wide,`${width}: mobile layout changed`);
  }
  const state=await page.evaluate(()=>({filter:getComputedStyle(document.querySelector('.crt-stage')).filter,overflow:document.querySelector('#scroll-viewport').scrollWidth>document.querySelector('#scroll-viewport').clientWidth+1}));
  assert(state.filter.includes(width<=1024?'crt-optics-mobile':'crt-optics'),`${width}: optical filter absent`);
  assert(!state.overflow,`${width}: horizontal overflow`);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.crt-stage').evaluate(e=>getComputedStyle(e).filter),'none',`${width}: reduced motion must disable optics`);
  await page.emulateMedia({reducedMotion:'no-preference'});
  await page.locator('.primary-action').click();
  await page.waitForFunction(()=>document.querySelector('.scroll-index [aria-current]')?.dataset.scrollSection==='work'&&document.querySelector('#scroll-work .scroll-window').classList.contains('is-revealed'));
  assert.equal(await page.locator('#scroll-work .project-tile-v2').count(),5);
  await page.goto(new URL('work/tovadu/',base).href);
  await page.waitForFunction(()=>document.body.classList.contains('site-ready')&&document.querySelector('#projects-view').dataset.view==='case');
  assert((await page.locator('.crt-stage').evaluate(e=>getComputedStyle(e).filter)).includes('crt-optics'),`${width}: case study lost global optics`);
  await page.locator('.projects-close').click();
  await page.waitForFunction(()=>document.querySelector('#projects-view').hidden&&document.querySelector('#crt-head-feature').classList.contains('is-ready'));
  console.log('CRT PASS',width,height,'geometry, mobile parity, optics, motion, CTA, case close/head resume');
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:800,height:600}});
 await page.goto(new URL('404.html',base).href);
 assert((await page.locator('.scene').evaluate(e=>getComputedStyle(e).filter)).includes('crt-optics-mobile'),'404 optics absent');
 // A deterministic pixel probe proves the SVG actually distorts rendered HTML.
 await page.evaluate(()=>{
  const e=document.createElement('div');e.id='optics-probe';e.style.cssText='position:fixed;left:240px;top:180px;width:240px;height:160px;z-index:9999;background:repeating-linear-gradient(90deg,white 0 2px,black 2px 12px);filter:url(#crt-optics)';document.body.append(e);
 });
 const filtered=(await page.locator('#optics-probe').screenshot()).toString('base64');
 await page.locator('#optics-probe').evaluate(e=>e.style.filter='none');
 const plain=(await page.locator('#optics-probe').screenshot()).toString('base64');
 const changed=await page.evaluate(async ([a,b])=>{
  const pixels=async value=>{const image=await createImageBitmap(new Blob([Uint8Array.from(atob(value),c=>c.charCodeAt(0))],{type:'image/png'}));const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;const ctx=canvas.getContext('2d');ctx.drawImage(image,0,0);return ctx.getImageData(0,0,canvas.width,canvas.height).data;};
  const x=await pixels(a),y=await pixels(b);let different=0;for(let i=0;i<x.length;i+=4)if(Math.abs(x[i]-y[i])>8)different++;return different;
 },[filtered,plain]);
 assert(changed>20,`Optics did not affect rendered pixels (${changed})`);
 console.log('CRT PASS 404 and live DOM displacement pixels',changed);
}finally{await browser.close()}
