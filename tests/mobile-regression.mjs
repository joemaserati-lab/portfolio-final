import { chromium } from 'playwright';
import assert from 'node:assert/strict';

const url = process.env.AUDIT_URL || 'http://127.0.0.1:4321/portfolio-final/';
const browser = await chromium.launch({ headless: true, args: ['--use-gl=swiftshader', '--enable-webgl'] });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 3
});
await context.addInitScript(() => {
  try {
    localStorage.setItem('portfolioLang', 'it');
    localStorage.setItem('portfolioPrivacyAck', '1');
  } catch {}
});
const page = await context.newPage();
try {
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => {
    const enter = document.getElementById('boot-enter');
    return document.body.classList.contains('site-ready') || (enter && !enter.disabled);
  }, null, { timeout: 50000 });

  const gate = await page.evaluate(() => {
    const heading = document.querySelector('#boot-gate h2');
    const frame = document.querySelector('#boot-gate');
    if (!heading || !frame) return null;
    const hr = heading.getBoundingClientRect();
    const fr = frame.getBoundingClientRect();
    return {
      title: heading.textContent.trim(),
      fits: hr.left >= fr.left - 2 && hr.right <= fr.right + 2,
      noTextOverflow: heading.scrollWidth <= heading.clientWidth + 2
    };
  });
  assert.ok(gate, 'Mobile boot title missing');
  if (gate.title.includes('PORTFOLIO PRONTO')) {
    assert.ok(gate.fits && gate.noTextOverflow, 'PORTFOLIO PRONTO overflows mobile boot safe area');
  }

  if (!(await page.evaluate(() => document.body.classList.contains('site-ready')))) {
    await page.locator('#boot-enter').click({ timeout: 15000 });
  }
  await page.waitForFunction(() => document.body.classList.contains('site-ready'), null, { timeout: 25000 });

  await page.locator('.primary-action').click({ timeout: 10000 });
  await page.waitForFunction(() => {
    const view = document.querySelector('#projects-view');
    return view && !view.hidden && view.dataset.view === 'directory';
  }, null, { timeout: 10000 });

  const tile = page.locator('.project-tile-v2').first();
  assert.equal(await page.locator('.project-tile-v2').count(), 5, 'Project directory count changed');
  await tile.click({ timeout: 10000 });
  const preview = await tile.evaluate(element => element.classList.contains('is-color-preview'));
  assert.ok(preview, 'A single mobile tap must reveal the colored artwork before navigation');
  await page.waitForURL(/\/work\/tovadu\/$/, { timeout: 10000 });
  assert.equal(await page.locator('#projects-view').getAttribute('data-view'), 'case', 'Single tap did not open case study');
  console.log('MOBILE REGRESSION: PASS', { boot: gate.title, preview, route: page.url() });
} finally {
  await browser.close();
}
