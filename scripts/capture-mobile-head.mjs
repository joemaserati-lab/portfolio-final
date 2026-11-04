import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
const base=process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const out=process.env.HEAD_CAPTURE_DIR || '/tmp/mobile-head-captures';
await mkdir(out,{recursive:true});
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
 for(const [width,height] of [[320,568],[360,800],[390,844],[430,932],[667,375]]){
  const context=await browser.newContext({
   viewport:{width,height},deviceScaleFactor:1,
   isMobile:true,hasTouch:true,reducedMotion:'reduce'
  });
  const page=await context.newPage();
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  let releaseHead;
  const headGate=new Promise(resolve=>{releaseHead=resolve});
  await page.route('**/js/head3d.js*',async route=>{await headGate;await route.continue()});
  const prefix=width+'x'+height;
  try{
   await page.goto(base,{waitUntil:'domcontentloaded',timeout:40000});
   await page.waitForFunction(()=>document.body.classList.contains('site-ready') &&
      document.querySelector('.crt-head-poster')?.complete &&
      document.querySelector('.crt-head-poster')?.naturalWidth>0,null,{timeout:60000});
   const poster=page.locator('.crt-head-poster');
   const source=await poster.evaluate(e=>e.currentSrc);
   const blob=await page.request.get(source);
   if(blob.ok())await writeFile(path.join(out,prefix+'-original-poster.webp'),await blob.body());
   const posterGeometry=await page.evaluate(()=>{
      const head=document.querySelector('#crt-head-feature');
      const poster=head.querySelector('.crt-head-poster');
      const canvas=head.querySelector('canvas');
      const rect=element=>{
        const r=element.getBoundingClientRect(),s=getComputedStyle(element);
        return {left:r.left,top:r.top,width:r.width,height:r.height,
          opacity:s.opacity,objectFit:s.objectFit||null,objectPosition:s.objectPosition||null};
      };
      return {head:rect(head),poster:rect(poster),canvas:rect(canvas),
       src:poster.currentSrc,naturalWidth:poster.naturalWidth,naturalHeight:poster.naturalHeight,
       layout:{innerWidth,innerHeight,devicePixelRatio:window.devicePixelRatio}};
   });
   await page.locator('#crt-head-feature').screenshot({path:path.join(out,prefix+'-poster-frame.png'),animations:'disabled'});
   await page.screenshot({path:path.join(out,prefix+'-poster-page.png'),animations:'disabled'});
   releaseHead();
   await page.waitForFunction(()=>window.__portfolioHeadState?.ready &&
      document.querySelector('#crt-head-feature')?.classList.contains('is-ready'),null,{timeout:90000});
   await page.waitForTimeout(450);
   const modelGeometry=await page.evaluate(()=>{
      const head=document.querySelector('#crt-head-feature');
      const poster=head.querySelector('.crt-head-poster');
      const rect=head.getBoundingClientRect();
      return {headRect:{left:rect.left,top:rect.top,width:rect.width,height:rect.height},
        headOpacity:getComputedStyle(head).opacity,
        posterOpacity:getComputedStyle(poster).opacity,
        canvasOpacity:getComputedStyle(head.querySelector('canvas')).opacity,
        headState:window.__portfolioHeadState};
   });
   await page.locator('#crt-head-feature').screenshot({path:path.join(out,prefix+'-model-frame.png'),animations:'disabled'});
   await page.screenshot({path:path.join(out,prefix+'-model-page.png'),animations:'disabled'});
   // Extract a raw renderer frame against both black and white backgrounds.
   await page.addStyleTag({content:[
     'html,body{background:#000!important;background-image:none!important}',
     '#screen,#desktop,#crt-head-feature{background:transparent!important;background-image:none!important;box-shadow:none!important}',
     '#crt-head-feature{opacity:1!important}',
     '.noise,.scanlines,.screen-reflection,.edge-light,.scroll-index,.crt-head-poster{visibility:hidden!important}',
     '#screen::before,#screen::after,#desktop::before,#desktop::after{content:none!important}'
   ].join('')});
   await page.locator('#crt-head-canvas').screenshot({path:path.join(out,prefix+'-model-black.png'),animations:'disabled'});
   try{await page.locator('#crt-head-canvas').screenshot({path:path.join(out,prefix+'-model-alpha.png'),animations:'disabled',omitBackground:true});}
   catch(err){console.warn('Alpha canvas capture unavailable',String(err));}
   await page.evaluate(()=>{document.documentElement.style.setProperty('background','#fff','important');document.body.style.setProperty('background','#fff','important')});
   await page.locator('#crt-head-canvas').screenshot({path:path.join(out,prefix+'-model-white.png'),animations:'disabled'});
   await writeFile(path.join(out,prefix+'-measure.json'),
     JSON.stringify({poster:posterGeometry,model:modelGeometry,errors},null,2));
   console.log('CAPTURE OK',prefix,source,JSON.stringify({poster:posterGeometry.head,model:modelGeometry.headRect}));
  }catch(error){
    releaseHead?.();
    await writeFile(path.join(out,prefix+'-error.txt'),String(error)+'\n'+errors.join('\n'));
    console.error('CAPTURE FAILED',prefix,error);
    process.exitCode=1;
  }finally{await context.close();}
 }
}finally{await browser.close();}
