import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.AUDIT_URL||'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
 for (const {width,height,isMobile,hasTouch} of [
   {width:1440,height:900,isMobile:false,hasTouch:false},
   {width:390,height:844,isMobile:true,hasTouch:true}
 ]) {
  const page=await browser.newPage({viewport:{width,height},isMobile,hasTouch});
  await page.addInitScript(()=>{
   localStorage.setItem('portfolioPrivacyAck','1');
   sessionStorage.setItem('portfolioBootSeen','1');
  });
  await page.goto(base);
  await page.waitForFunction(()=>document.body.classList.contains('site-ready')&&
   window.CRT?.getRenderStats?.()?.backgroundPixels>0,null,{timeout:30000});
  const first=await page.evaluate(()=>window.CRT.getRenderStats());
  assert(first.backgroundPixels>0&&first.overlayPixels>0,'CRT shader surfaces are not initialized');
  assert.equal(first.backgroundPixels,first.overlayPixels,'CRT surfaces use different pixel budgets');
  assert(['normal','software','struggling'].includes(first.backend),'Unknown CRT performance profile');
  // Playwright Chromium supports OffscreenCanvas WebGL. In this CI configuration,
  // the two CRT shaders must actually run in the dedicated worker, not just
  // compile in a main-thread fallback and conceal the software-GPU bottleneck.
  assert.equal(first.execution,'worker','CRT WebGL did not move off the main thread');
  if(first.backend==='software') {
   const budget=isMobile?90000:240000;
   assert(first.backgroundPixels<=budget+1000,'Software CRT exceeds its per-surface pixel budget');
   assert(first.fpsBudget<=(isMobile?6:10),'Software CRT is drawing too often');
  } else {
   assert(first.backgroundPixels<=1201000,'CRT exceeds the normal GPU pixel limit');
  }
  await page.waitForTimeout(350);
  const settled=await page.evaluate(()=>window.CRT.getRenderStats());
  await page.evaluate(()=>dispatchEvent(new Event('resize')));
  await page.waitForTimeout(300);
  const resizeTest=await page.evaluate(()=>window.CRT.getRenderStats());
  assert.equal(resizeTest.backgroundPixels,settled.backgroundPixels,'Resize changed CRT resolution at the same viewport');
  assert.equal(resizeTest.surfaceResizes,settled.surfaceResizes,'Unchanged viewport needlessly reallocated WebGL buffers');
  const shaderStillWorks=await page.locator('#crt-bg').evaluate(canvas=>canvas.width>0&&canvas.height>0);
  assert(shaderStillWorks,'CRT background render canvas missing');
  await page.evaluate(()=>window.CRT.setPreset('low'));
  assert.equal(await page.evaluate(()=>window.CRT.getPreset()),'low','CRT preset control was lost');
  await page.evaluate(()=>window.CRT.setPreset('high'));
  console.log('CRT ADAPTIVE GPU PASS',width,height,JSON.stringify(first));
  await page.close();
 }
}finally{await browser.close()}
