import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { transform, build as bundleJavaScript } from 'esbuild';

const root = resolve(import.meta.dirname, '..');
const sources = [
  'foundation.css',
  'workspace.css',
  'visual-experience.css',
  'adaptive.css',
  'fixes.css',
  'crt-outline-base.css',
  'project-covers.css',
  'monochrome-theme.css',
  'crt-outline.css',
  'portfolio-scroll.css',
  'typography.css'
];
const contents = sources.map(name =>
  `/* Source: ${name} */\n` + readFileSync(resolve(root, 'public/css', name), 'utf8')
);
const sourceCss = contents.join('\n\n') + '\n';

// Whitespace-only minification preserves the approved palette, rules,
// selector names, animations, custom properties and source cascade.
// Do not enable identifier or syntax rewriting without visual comparison.
const result = await transform(sourceCss, {
  loader: 'css',
  minifyWhitespace: true,
  minifySyntax: false,
  minifyIdentifiers: false,
  legalComments: 'none',
  target: 'es2020'
});
const output = resolve(root, 'public/css/portfolio.bundle.css');
writeFileSync(output, result.code);
const percent = ((1 - result.code.length / sourceCss.length) * 100).toFixed(1);
console.log(`Bundled ${sources.length} stylesheets in canonical order: ${sourceCss.length} → ${result.code.length} bytes (-${percent}%).`);

// The 3D head needs no external runtime CDN.
await bundleJavaScript({
  absWorkingDir: root,
  entryPoints: ['public/js/head-scan-effect.js'],
  outfile: 'public/js/head-scan-effect.bundle.js',
  bundle: true, minify: true, legalComments: 'eof',
  platform: 'browser', format: 'esm', target: ['es2022']
});
console.log('Bundled Three.js head module for same-origin delivery.');
