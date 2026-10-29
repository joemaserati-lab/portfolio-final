import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.AUDIT_URL||'http://127.0.0.1:4321/portfolio-final/';
const b=await chromium.launch();
try {
 for(const [width,height] of [[320,568],[390,844],[667,375],[1024,768],[1200,800],[1440,900],[1920,1080],[2560,1440]]){
  const p=await b.newPage({viewport:{width,height},reducedMotion:'reduce'});
  await p.goto(base);
  await p.waitForFunction(()=>document.body.classList.contains('site-ready')&&!document.getElementById('boot-loader'));
  await p.evaluate(()=>document.fonts.ready);
  for(const lang of ['en','it']) {
   await p.evaluate(lang=>window.PortfolioI18n.setLang(lang),lang);
   for(const kind of ['home','work','about','resume','contact','tovadu','pholia','sapy','platinum-technologies','colorcopy-large-format']) {
    await p.evaluate(kind=>kind.includes('-')||['tovadu','pholia','sapy'].includes(kind)?window.Portfolio.openProject(kind):window.dispatchEvent(new CustomEvent('portfolio:scroll-to',{detail:kind})),kind);
    await p.waitForFunction(kind=>['tovadu','pholia','sapy','platinum-technologies','colorcopy-large-format'].includes(kind)?document.querySelector('#projects-view').dataset.project===kind:document.querySelector('.scroll-index [aria-current]')?.dataset.scrollSection===kind,kind);
    if(!['home','tovadu','pholia','sapy','platinum-technologies','colorcopy-large-format'].includes(kind))await p.waitForFunction(kind=>document.querySelector(`#scroll-${kind} .scroll-window`).classList.contains('is-revealed'),kind);
    await p.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))));
    const result=await p.evaluate(kind=>{
     const selector=['tovadu','pholia','sapy','platinum-technologies','colorcopy-large-format'].includes(kind)?'#projects-view':`#scroll-${kind}`;
     const root=document.querySelector(selector),errors=[];
     for(const e of root.querySelectorAll('h1,h2,h3,h4,h5,p,dt,dd,figcaption,.desktop-icon>[data-i18n],.resume-period,.resume-row small,.tags span,.contact-link,.primary-action,.case-back-v2,.case-live-link')){
      const box=e.getBoundingClientRect();if(!box.width||!box.height||getComputedStyle(e).visibility==='hidden')continue;
      const range=document.createRange();range.selectNodeContents(e);
      if([...range.getClientRects()].some(r=>r.width&& (r.left<box.left-2||r.right>box.right+2)))errors.push({tag:e.tagName,cls:e.className,text:e.textContent.trim().slice(0,55),width:box.width,scroll:e.scrollWidth});
     }
     return {errors,alignment:kind==='home'?{title:document.querySelector('.hero-intro h1').getBoundingClientRect().top,icon:document.querySelector('.desktop-icons .icon-glyph').getBoundingClientRect().top}:null};
    },kind);
    assert.deepEqual(result.errors,[],`${width} ${lang} ${kind}: text escaped its container`);
    if(width>1024&&result.alignment) assert(Math.abs(result.alignment.title-result.alignment.icon)<1,`${width} ${lang}: hero icons must align with H1`);
    if(['tovadu','pholia','sapy','platinum-technologies','colorcopy-large-format'].includes(kind)){await p.locator('.projects-close').click();await p.waitForFunction(()=>document.querySelector('#projects-view').hidden);}
   }
  }
  console.log('CONTAINMENT PASS',width,'EN/IT sections, five projects, hero alignment');await p.close();
 }
}finally{await b.close()}
