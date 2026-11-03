import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.AUDIT_URL||'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
 for(const fallback of [false,true]) {
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.route('https://fonts.googleapis.com/**',route=>route.abort('failed'));
  await page.route('https://fonts.gstatic.com/**',route=>route.abort('failed'));
  let release;
  const blocked=new Promise(resolve=>release=resolve);
  let localRequested=false;
  await page.route('**/assets/font/*-variable.woff2*',async route=>{
    if(fallback) return route.abort('failed');
    localRequested=true;
    await blocked;
    await route.continue();
  });
  if(fallback) await page.route('**/assets/font/Doto-500.woff2*',async route=>{
    localRequested=true;
    await blocked;
    await route.continue();
  });
  await page.goto(base,{waitUntil:'domcontentloaded'});
  const pending=await page.evaluate(()=>({
    pending:document.documentElement.classList.contains('fonts-pending'),
    title:getComputedStyle(document.querySelector('#boot-gate h2')).visibility,
    body:getComputedStyle(document.querySelector('.shell')).visibility,
    progress:getComputedStyle(document.querySelector('#boot-progress')).visibility
  }));
  assert.equal(pending.pending,true,'Missing first-paint font guard');
  assert.equal(pending.title,'hidden','Loader displayed system font');
  assert.equal(pending.body,'hidden','Portfolio displayed system font');
  assert.equal(pending.progress,'visible','Font guard must not hide progress bar');
  release();
  await page.waitForFunction(()=>document.documentElement.classList.contains('fonts-ready'),null,{timeout:20000});
  const status=await page.evaluate(()=>({
    local:document.documentElement.classList.contains('fonts-local-fallback'),
    title:getComputedStyle(document.querySelector('#boot-gate h2')).fontFamily,
    titleVisibility:getComputedStyle(document.querySelector('#boot-gate h2')).visibility,
    available:[...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family)
  }));
  assert(localRequested,'Expected local font was not requested');
  assert.equal(status.local,fallback,'Local primary/backup font selection is incorrect');
  const family=fallback?'Doto Fallback':'Doto';
  assert(status.title.includes(family),'Loader reverted to browser default font');
  assert(status.available.includes(family),'Local Doto not actually loaded');
  assert.equal(status.titleVisibility,'visible','Loader did not reveal after font load');
  await page.waitForFunction(()=>document.body.classList.contains('site-ready'),null,{timeout:45000});
  assert(await page.evaluate(family=>getComputedStyle(document.querySelector('.hero-intro h1')).fontFamily.includes(family),family),
    'Page displayed browser fallback typography');
  console.log('FONTS FIRST-PAINT PASS',fallback?'local backup':'local variable fonts','no default font in loader/site');
  await page.close();
 }
}finally{await browser.close()}
