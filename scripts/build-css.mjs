import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

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
  'crt-outline.css'
];
const contents = sources.map(name =>
  `/* Source: ${name} */\n` + readFileSync(resolve(root, 'public/css', name), 'utf8')
);
const output = resolve(root, 'public/css/portfolio.bundle.css');
writeFileSync(output, contents.join('\n\n') + '\n');
console.log(`Bundled ${sources.length} stylesheets (original cascade order): ${output}`);
