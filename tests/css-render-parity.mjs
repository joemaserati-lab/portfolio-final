import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const root = resolve(import.meta.dirname, '..');
const sourceFiles = ['foundation.css','workspace.css','visual-experience.css','adaptive.css','fixes.css','crt-outline-base.css','project-covers.css','monochrome-theme.css','crt-outline.css'];
const rawCss = sourceFiles.map(name =>
  readFileSync(resolve(root,'public/css',name),'utf8')
).join('\n\n');
const url = process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const browser = await chromium.launch({ headless: true });
const selectors = ['html','body','.crt-stage','.screen','.desktop','.hero-intro','.hero-intro h1','.primary-action','.desktop-icons','#crt-head-feature','.boot-loader','#boot-gate','#boot-gate h2','.boot-enter' ,'#projects-view'];
const props = ['display','position','font-family','font-size','font-weight','line-height','letter-spacing','color','background-color','padding-top','padding-right','padding-bottom','padding-left','margin-top','margin-left','border-radius','border-top-width','border-top-color','overflow-x','overflow-y','max-width','grid-template-columns','z-index'];

async function snapshot(width, height, unminified) {
  const context = await browser.newContext({ viewport: { width,height }, deviceScaleFactor: 1, isMobile: width < 600, hasTouch: width < 600 });
  const page = await context.newPage();
  if (unminified) {
    await page.route('**/css/portfolio.bundle.css', route =>
      route.fulfill({status:200, contentType:'text/css; charset=utf-8', body:rawCss})
    );
  }
  await page.goto(url, { waitUntil:'domcontentloaded' });
  await page.evaluate(() => document.fonts.ready);
  const result = await page.evaluate(({selectors,props}) => {
    const data = {};
    for (const selector of selectors) {
      const element = document.querySelector(selector);
      if (!element) throw new Error('Missing selector for CSS parity: ' + selector);
      const style = getComputedStyle(element);
      data[selector] = Object.fromEntries(props.map(prop=>[prop,style.getPropertyValue(prop)]));
    }
    return data;
  }, {selectors,props});
  await context.close();
  return result;
}

try {
  for (const [width,height] of [[390,844],[320,568],[1440,900]]) {
    const original = await snapshot(width,height,true);
    const minimized = await snapshot(width,height,false);
    assert.deepEqual(minimized,original,'Computed CSS differs after whitespace compression at ' + width + 'x' + height);
    console.log('CSS RENDER PARITY: PASS',width + 'x' + height);
  }
} finally {
  await browser.close();
}
