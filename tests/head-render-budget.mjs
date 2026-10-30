import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const browser = await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
  for (const {width,height,isMobile,hasTouch} of [
    {width:1440,height:900,isMobile:false,hasTouch:false},
    {width:390,height:844,isMobile:true,hasTouch:true}
  ]) {
    const page = await browser.newPage({viewport:{width,height},isMobile,hasTouch});
    await page.addInitScript(()=>{
      sessionStorage.setItem('portfolioBootSeen','1');
      localStorage.setItem('portfolioPrivacyAck','1');
    });
    await page.goto(base);
    await page.waitForFunction(()=>document.body.classList.contains('site-ready') &&
      window.PortfolioMotion?.getRenderStats?.()?.pixels>0,null,{timeout:60000});
    const hero = await page.evaluate(()=>window.PortfolioMotion.getRenderStats());
    assert(['main','worker'].includes(hero.execution),'Missing rendering execution mode');
    console.log('HEAD EXECUTION',width,height,hero.execution,hero.renderer);
    assert(hero.pixels>0 && hero.fpsBudget>0,'Head GPU not initialized');
    // Software WebGL can never be equated with a dedicated GPU. On that
    // backend the governor intentionally starts below the usual FPS budget.
    if (hero.backend === 'none') {
      assert(hero.fpsBudget>=24,'Hardware-GPU hero unexpectedly throttled');
    } else {
      assert(hero.fpsBudget<=16,'Software/stalled GPU did not enter safe pacing');
    }
    if (isMobile) {
      assert(hero.pixels<=1102500,'Mobile hero exceeds pixel budget');
      if (hero.backend === 'software')
        assert(hero.pixels<=212500,'Software mobile GPU not protected');
      assert(hero.pixelRatio<=1.51,'Mobile hero DPR not capped');
    } else {
      assert(hero.pixels<=1502500,'Desktop hero exceeds pixel budget');
      if (hero.backend === 'software')
        assert(hero.pixels<=212500,'Software desktop GPU not protected');
    }

    // Once the transition settles, the visible head is much smaller.
    await page.locator('#scroll-viewport').evaluate(e=>e.scrollTop=e.clientHeight*1.2);
    await page.waitForFunction(()=>window.PortfolioMotion?.getRenderStats?.()?.scale<.65,
      null,{timeout:15000});
    const dock = await page.evaluate(()=>window.PortfolioMotion.getRenderStats());
    assert(dock.pixels<hero.pixels*.55,
      `Docked head GPU buffer did not shrink at ${width}: ${hero.pixels} to ${dock.pixels}`);
    assert(dock.fpsBudget<=30,'Docked render budget exceeds 30fps');
    assert(dock.drawnFrames>=hero.drawnFrames,'Frame accounting went backwards');
    assert(dock.lastDrawMs>=0,'Missing draw duration diagnostics');
    assert(await page.locator('#crt-head-feature').isVisible(),'GPU optimization hid head');

    await page.locator('#scroll-viewport').evaluate(e=>e.scrollTop+=100);
    await page.waitForTimeout(250);
    const stable=await page.evaluate(()=>window.PortfolioMotion.getRenderStats());
    assert.deepEqual([stable.width,stable.height],[dock.width,dock.height],
      'Stable dock repeatedly reallocates GPU buffers');

    if (!isMobile) {
      const screen=await page.locator('#screen').boundingBox();
      await page.mouse.move(screen.x+screen.width*.16,screen.y+screen.height*.5);
      await page.waitForFunction(()=>{
        const stats=window.PortfolioMotion.getRenderStats();
        return stats.pointerTarget?.[0]<-.5 &&
          window.PortfolioMotion.getPose().yaw<-.06;
      },null,{timeout:10000});
      const left=await page.evaluate(()=>window.PortfolioMotion.getPose().yaw);
      await page.mouse.move(screen.x+screen.width*.84,screen.y+screen.height*.5);
      // Software-GPU workers may run at 6–10fps. Wait for rendered motion,
      // not a fixed timeout that can elapse before the next frame.
      // Capture yaw in the same browser animation observation that verified
      // the rotation. A later cross-process read can race an intermediate
      // worker pose update and falsely report that the mouse stopped working.
      const rightHandle=await page.waitForFunction(previous=>{
        const stats=window.PortfolioMotion.getRenderStats();
        const yaw=window.PortfolioMotion.getPose().yaw;
        return stats.pointerTarget?.[0]>.5 && yaw>previous+.04 ? yaw : false;
      },left,{timeout:10000});
      const right=await rightHandle.jsonValue();
      assert(right-left>.04,'The docked head no longer follows mouse movement');
      console.log('DOCKED HEAD POINTER',JSON.stringify({left,right,delta:right-left,
        stats:await page.evaluate(()=>window.PortfolioMotion.getRenderStats())}));
    }

    await page.locator('#scroll-viewport').evaluate(e=>e.scrollTop=0);
    await page.waitForFunction(()=>window.PortfolioMotion?.getRenderStats?.()?.scale===1,
      null,{timeout:15000});
    const restored=await page.evaluate(()=>window.PortfolioMotion.getRenderStats());
    assert(restored.pixels>dock.pixels*1.5,'Hero framebuffer was not restored');
    console.log('3D GPU BUDGET PASS',width,height,JSON.stringify({hero,dock,restored}));
    await page.close();
  }
} finally { await browser.close(); }
