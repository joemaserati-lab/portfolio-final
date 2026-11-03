import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, relative } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const deploymentVersion = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')).version;
const dist = resolve(root, 'dist');
const assets = {};
function collect(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) collect(path);
    else {
      const name = relative(dist, path).replaceAll('\\', '/');
      // HTML stays network-only. Exclude videos, partial responses and the
      // service worker itself; cache only the deployed static asset inventory.
      if (!/^(?:assets\/(?:font|images|models|cursors|favicon)\/|css\/|js\/)/.test(name) ||
          !/\.(?:css|js|woff2?|webp|png|svg|glb)$/.test(name)) continue;
      assets[name] = createHash('sha256').update(readFileSync(path)).digest('hex');
    }
  }
}
collect(dist);
const manifest = JSON.stringify(Object.fromEntries(Object.entries(assets).sort()));
const revision = createHash('sha256').update(manifest).digest('hex').slice(0, 16);
const runtime = readFileSync(resolve(root, 'public/js/asset-cache-worker.js'), 'utf8');
writeFileSync(resolve(dist, 'asset-cache-worker.js'),
  `const ASSET_REVISIONS = ${manifest};\nconst BUILD_REVISION = ${JSON.stringify(revision)};\nconst DEPLOYMENT_VERSION = ${JSON.stringify(deploymentVersion)};\n${runtime}`);
console.log(`Versioned asset cache: ${Object.keys(assets).length} static assets, revision ${revision}.`);
