import assert from 'node:assert/strict';
const {chromium}=await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base=process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const browser=await chromium.launch({headless:true,...(process.env.PLAYWRIGHT_EXECUTABLE_PATH?{executablePath:process.env.PLAYWRIGHT_EXECUTABLE_PATH}:{}),args:['--use-gl=swiftshader','--enable-webgl']});
const page=await browser.newPage({viewport:{width:1440,height:900}});
await page.addInitScript(()=>{sessionStorage.setItem('portfolioBootSeen','1');localStorage.setItem('portfolioPrivacyAck','1')});
const errors=[];page.on('pageerror',error=>errors.push(error.message));
async function ready(){await page.waitForFunction(()=>document.body.classList.contains('site-ready')&&window.Portfolio,null,{timeout:50000});}
for(const path of ['','work/','about/','contact/','resume/','work/tovadu/','work/pholia/','work/sapy/','work/platinum-technologies/','work/colorcopy-large-format/']){
 const response=await page.goto(new URL(path,base).href);assert.equal(response.status(),200);await ready();
 assert.equal(await page.locator('link[rel=canonical]').getAttribute('href'),new URL(path,base).href);
 assert.equal(await page.locator('meta[name=robots][content*=noindex]').count(),0);
 if(path.startsWith('work/')&&path!=='work/'){
  assert.equal(await page.locator('#projects-view').getAttribute('data-view'),'case');
  assert.equal(await page.locator('#projects-view').getAttribute('data-project'),path.split('/')[1]);
 }else if(path==='resume/'){
  await page.waitForFunction(()=>document.querySelector('.scroll-index [aria-current]')?.dataset.scrollSection==='resume');
  assert.equal(await page.locator('#scroll-resume .resume-row').count(),8);
  assert.equal(await page.locator('#window-layer .os-window[data-kind=resume]').count(),0);
 }
 else if(path)await page.waitForFunction(kind=>document.querySelector('.scroll-index [aria-current]')?.dataset.scrollSection===kind,path.slice(0,-1));
 console.log('ROUTE PASS',path||'/');
}
await page.goto(new URL('work/tovadu/',base).href);await ready();
await page.locator('.case-nav-v2 [data-project-slug=pholia]').click();await page.waitForURL(new URL('work/pholia/',base).href);
await page.goBack();await page.waitForFunction(()=>document.getElementById('projects-view').dataset.project==='tovadu');
await page.goForward();await page.waitForFunction(()=>document.getElementById('projects-view').dataset.project==='pholia');
await page.locator('.projects-close').click();await page.waitForURL(new URL('work/',base).href);
await page.goto(new URL('scroll-preview/#project=sapy',base).href);await ready();assert.equal(page.url(),new URL('work/sapy/',base).href);
await page.goto(new URL('scroll-preview/#about',base).href);await ready();assert.equal(page.url(),new URL('about/',base).href);
assert.equal(errors.length,0,errors.join('\n'));
console.log('PASS project next/previous, browser history, preview redirects');
await browser.close();
