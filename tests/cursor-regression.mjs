import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const base=process.env.AUDIT_URL||'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true,args:['--use-gl=swiftshader','--enable-webgl']});
try {
 for(const [width,height] of [[1440,900],[2560,1440]]){
  const page=await browser.newPage({viewport:{width,height}});
  await page.goto(base);
  await page.waitForFunction(()=>document.body.classList.contains('site-ready'));
  await page.waitForFunction(()=>Boolean(document.getElementById('pixelart-cursor')));
  const check=async(type,x,y,selector)=>{
    const output=await page.evaluate(({type,x,y,selector})=>{
      const target=selector==='body'?document.body:selector==='input'?(()=>{
       const input=document.createElement('input');
       input.style.cssText='position:fixed;top:20px;left:20px;width:100px;height:30px';
       document.body.append(input);return input;
      })():document.querySelector(selector);
      target.dispatchEvent(new PointerEvent('pointermove',{pointerType:'mouse',clientX:x,clientY:y,bubbles:true}));
      return new Promise(resolve=>requestAnimationFrame(()=>{
        const c=document.getElementById('pixelart-cursor');
        const rect=c.getBoundingClientRect();
        const style=getComputedStyle(c);
        resolve({type:c.classList.contains('is-'+type),width:rect.width,height:rect.height,
          x:rect.left,y:rect.top,backgroundSize:style.backgroundSize,
          source:style.backgroundImage});
        if(selector==='input')target.remove();
      }));
    },{type,x,y,selector});
    assert(output.type,`${width}: ${type} cursor variant not selected`);
    assert.equal(output.width,48,`${width}: custom cursor not 48px wide`);
    assert.equal(output.height,48,`${width}: custom cursor not 48px tall`);
    assert.equal(output.backgroundSize,'48px 48px',`${width}: SVG background mis-sized`);
    assert(output.source.includes('assets/cursors/'),`${width}: cursor SVG artwork lost`);
    const offsets={default:[6,1.5],pointer:[18,1.5],text:[24,24]};
    // draw() snaps the final hotspot to physical CSS pixel positions.
    assert(Math.abs(output.x-Math.round(x-offsets[type][0]))<1,
      `${width}: ${type} hotspot X is misaligned`);
    assert(Math.abs(output.y-Math.round(y-offsets[type][1]))<1,
      `${width}: ${type} hotspot Y is misaligned`);
  };
  await check('default',10,10,'body');
  await check('pointer',450,300,'.desktop-icon');
  await check('text',130,170,'input');
  const icons=await page.evaluate(()=>({
    hero:document.querySelector('.desktop-icons .icon-glyph').getBoundingClientRect().toJSON(),
    mini:document.querySelector('.scroll-mini-icon .icon-glyph').getBoundingClientRect().toJSON()
  }));
  assert.equal(Math.round(icons.hero.width),50,`${width}: hero icon should be 50px wide`);
  assert.equal(Math.round(icons.hero.height),40,`${width}: hero icon should be 40px tall`);
  assert.equal(Math.round(icons.mini.width),28,`${width}: previous mini icon size not restored`);
  console.log('CURSOR + ICONS PASS',width,'48px cursor, precise hotspots, smaller hero icons and unchanged mini navigation');
  await page.close();
 }
 const tablet=await browser.newPage({viewport:{width:820,height:900}});
 await tablet.goto(base);
 await tablet.waitForFunction(()=>document.body.classList.contains('site-ready'));
 const tabletGlyph=await tablet.locator('.desktop-icons .desktop-icon .icon-glyph').first().boundingBox();
 assert.equal(Math.round(tabletGlyph.width),38,'Tablet hero icon should be 38px');
 assert.equal(Math.round(tabletGlyph.height),32,'Tablet hero icon should be 32px tall');
 await tablet.close();
 const phone=await browser.newPage({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 await phone.goto(base);
 await phone.waitForFunction(()=>document.body.classList.contains('site-ready'));
 const phoneGlyph=await phone.locator('.desktop-icons .desktop-icon .icon-glyph').first().boundingBox();
 assert.equal(Math.round(phoneGlyph.width),34,'Phone hero icon should be 34px');
 assert.equal(Math.round(phoneGlyph.height),30,'Phone hero icon should be 30px tall');
 assert.equal(await phone.locator('#pixelart-cursor').count(),0,'Custom mouse pointer appeared on touch');
 await phone.close();
}finally{await browser.close()}
