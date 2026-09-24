import { allIndexablePaths } from '../data/routes.mjs';

export const prerender = true;

export function GET({ site }) {
  const basePath = import.meta.env.BASE_URL.endsWith('/') ? import.meta.env.BASE_URL : `${import.meta.env.BASE_URL}/`;
  const root = new URL(basePath, site ?? 'https://joemaserati-lab.github.io');
  const lastmod = '2026-09-24';
  const urls = allIndexablePaths.map(path => {
    const loc = new URL(path, root).href;
    return `  <url>\n    <loc>${loc}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`;
  }).join('\n');
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
  return new Response(body, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8' }
  });
}
