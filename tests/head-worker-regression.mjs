import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.AUDIT_URL||'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try{
 for(const fallback of [false,true]){
  const page=await browser.newPage({viewport:{width:1440,height:900}});
  await page.addInitScript(force=>{
   sessionStorage.setItem('portfolioBootSeen','1');
   localStorage.setItem('portfolioPrivacyAck','1');
   window.__headTasks=[];
   try{new PerformanceObserver(list=>{
    for(const e of list.getEntries())window.__headTasks.push({start:e.startTime,duration:e.duration});
   }).observe({type:'longtask',buffered:true})}catch{}
   if(force)Object.defineProperty(HTMLCanvasElement.prototype,
    'transferControlToOffscreen',{value:undefined,configurable:true});
  },fallback);
  await page.goto(base);
  await page.waitForFunction(()=>document.body.classList.contains('site-ready')&&
   window.PortfolioMotion?.getRenderStats?.()?.pixels>0,null,{timeout:60000});
  const before=await page.evaluate(()=>window.PortfolioMotion.getRenderStats());
  assert.equal(before.execution,fallback?'main':'worker',
   'Wrong WebGL execution mode: '+(fallback?'fallback':'worker'));
  const start=await page.evaluate(()=>performance.now());
  await page.waitForTimeout(1700);
  const metrics=await page.evaluate(start=>{
   const entries=window.__headTasks.filter(e=>e.start>=start);
   return {tbt:entries.reduce((n,e)=>n+Math.max(0,e.duration-50),0),
    count:entries.length,stats:window.PortfolioMotion.getRenderStats()};
  },start);
  console.log('HEAD MAIN THREAD',before.execution,
   JSON.stringify({tbtMs:Math.round(metrics.tbt),tasks:metrics.count,frames:metrics.stats.drawnFrames}));
  assert(metrics.stats.drawnFrames>=before.drawnFrames,'Head animation stalled');
  const rect=await page.locator('#screen').boundingBox();
  await page.mouse.move(rect.x+rect.width*.16,rect.y+rect.height*.5);
  await page.waitForFunction(()=>{
    const s=window.PortfolioMotion.getRenderStats();
    return s.pointerTarget?.[0]<-.5 && window.PortfolioMotion.getPose().yaw<-.06;
  },null,{timeout:10000});
  const left=await page.evaluate(()=>window.PortfolioMotion.getPose().yaw);
  const leftStats=await page.evaluate(()=>window.PortfolioMotion.getRenderStats());
  await page.mouse.move(rect.x+rect.width*.84,rect.y+rect.height*.5);
  // Slow software WebGL may deliver the pointer immediately, but its next
  // animation frame arrives later. Assert actual visible motion, not a fixed
  // wall-clock sleep or the receipt of a pointer message alone.
  await page.waitForFunction(previous=>{
    const s=window.PortfolioMotion.getRenderStats();
    return s.pointerTarget?.[0]>.5 &&
      window.PortfolioMotion.getPose().yaw>previous+.04;
  },left,{timeout:10000});
  const right=await page.evaluate(()=>window.PortfolioMotion.getPose().yaw);
  console.log('HEAD POINTER',before.execution,JSON.stringify({left,right,delta:right-left,
    leftStats,stats:await page.evaluate(()=>window.PortfolioMotion.getRenderStats())}));
  assert(right-left>.04,'Mouse follow lost');
  await page.locator('#scroll-viewport').evaluate(e=>e.scrollTop=e.clientHeight*1.2);
  await page.waitForFunction(()=>window.PortfolioMotion?.getRenderStats?.()?.scale<.65,null,{timeout:20000});
  const dock=await page.evaluate(()=>window.PortfolioMotion.getRenderStats());
  assert(dock.pixels<before.pixels*.55,'Dock did not reduce GPU buffer');
  await page.locator('#scroll-viewport').evaluate(e=>e.scrollTop=0);
  await page.waitForFunction(()=>window.PortfolioMotion?.getRenderStats?.()?.scale===1,null,{timeout:20000});
  assert(await page.locator('#crt-head-feature').isVisible(),'Head missing after returning home');
  console.log('HEAD WORKER/FALLBACK PASS',before.execution);
  await page.close();
 }
 // Safari/iPhone use the original GPU-safe renderer instead of trying an
 // incompatible OffscreenCanvas path. Emulating its UA in Chromium verifies
 // our feature gate, not Safari's actual GPU implementation.
 const safari=await browser.newPage({
  viewport:{width:390,height:844},isMobile:true,hasTouch:true,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
 });
 await safari.addInitScript(()=>{
  localStorage.setItem('portfolioPrivacyAck','1');
  sessionStorage.setItem('portfolioBootSeen','1');
 });
 await safari.goto(base);
 await safari.waitForFunction(()=>document.body.classList.contains('site-ready')&&
  window.PortfolioMotion?.getRenderStats?.()?.pixels>0,null,{timeout:60000});
 const safariStats=await safari.evaluate(()=>window.PortfolioMotion.getRenderStats());
 assert.equal(safariStats.execution,'main','Non-Chromium browser must retain the optimized main renderer');
 assert(safariStats.pixels<=1102500,'Mobile fallback exceeds GPU pixel budget');
 assert(await safari.locator('#crt-head-feature').isVisible(),'Fallback portrait missing on mobile');
 console.log('MOBILE SAFARI-UA FALLBACK PASS (Chromium simulation)',safariStats.quality);
 await safari.close();
 // An actual failure to construct Worker (permissions/CSP/unsupported browser)
 // must also transparently use the original renderer without transferring canvas.
 const denied=await browser.newPage({viewport:{width:1440,height:900}});
 await denied.addInitScript(()=>{
  localStorage.setItem('portfolioPrivacyAck','1');
  sessionStorage.setItem('portfolioBootSeen','1');
  window.Worker=class BlockedWorker {
   constructor(){throw new Error('Worker blocked for fallback smoke test')}
  };
 });
 await denied.goto(base);
 await denied.waitForFunction(()=>document.body.classList.contains('site-ready')&&
  window.PortfolioMotion?.getRenderStats?.()?.pixels>0,null,{timeout:60000});
 assert.equal(await denied.evaluate(()=>window.PortfolioMotion.getRenderStats().execution),'main',
  'Blocked Worker must automatically fall back to the main-thread renderer');
 assert(await denied.locator('#crt-head-feature').isVisible(),'Failed Worker left the hero without a portrait');
 console.log('WORKER-CONSTRUCTION FAILURE FALLBACK PASS');
 await denied.close();
}finally{await browser.close()}
