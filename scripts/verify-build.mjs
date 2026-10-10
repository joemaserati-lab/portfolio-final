import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { projects } from '../src/data/routes.mjs';

const root = resolve(import.meta.dirname, '..');
const dir = path => resolve(root, path);
const routes = ['', 'about/', 'contact/', 'resume/', 'work/', 'work/tovadu/', 'work/pholia/', 'work/sapy/', 'work/platinum-technologies/', 'work/colorcopy-large-format/'];
const base = 'https://joemaserati-lab.github.io/portfolio-final/';
assert.ok(existsSync(dir('dist/404.html')), '404.html missing');
assert.ok(existsSync(dir('dist/css/portfolio.bundle.css')), 'CSS bundle missing');
for (const route of routes) {
  const file = dir(`dist/${route}index.html`);
  assert.ok(existsSync(file), `Missing built route: ${route}`);
  const html = readFileSync(file, 'utf8');
  assert.ok(html.includes('<link rel="canonical"'), `No canonical: ${route}`);
  assert.ok(html.includes(base + route), `Incorrect canonical: ${route}`);
  assert.ok(html.includes('css/portfolio.bundle.css'), `Bundled styles missing: ${route}`);
  assert.ok(!html.includes('href="css/fixes.css"'), `Legacy multi-stylesheet production output: ${route}`);
  if (route.startsWith('work/') && route !== 'work/') {
    assert.ok(html.includes('project-fallback'), `No static case study fallback: ${route}`);
  }
}
for (const path of ['index.html','404.html','assets','css','js','about','contact','resume','work','robots.txt','sitemap.xml']) {
  assert.ok(!existsSync(dir(path)), `Legacy root snapshot remains: ${path}`);
}
const bundle = readFileSync(dir('dist/css/portfolio.bundle.css'), 'utf8');
for (const source of ['style.css','fixes.css','crt-outline-base.css','project-covers.css','monochrome-theme.css','crt-outline.css']) {
  assert.ok(bundle.includes(`/* Source: ${source} */`), `Missing stylesheet: ${source}`);
}

/* Keep the Astro route registry aligned with the browser project directory. */
const runtimeSource = readFileSync(dir('public/js/content.js'), 'utf8');
const browserSlugs = [...runtimeSource.matchAll(/slug:'([^']+)'/g)].map(match => match[1]);
const routeSlugs = projects.map(project => project.slug);
assert.deepEqual(browserSlugs, routeSlugs, 'Astro and browser project slugs differ');
for (const project of projects) {
  assert.ok(existsSync(dir('public/' + project.image)), 'Project cover missing: ' + project.image);
}
assert.ok(!bundle.includes('assets/images/projects/'), 'Redundant CSS project backgrounds were reintroduced');

console.log(`Build verified: ${routes.length} routes, static project summaries, single CSS bundle, no root mirrors.`);
