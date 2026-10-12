# Scroll preview

Experimental route: `/portfolio-final/scroll-preview/` on GitHub Pages.

The page is deliberately absent from the existing navigation and sitemap and has `noindex, follow`. It uses its own Astro document, CSS and client module; it never loads the production boot, window manager or History API router.

## Sources

- `src/pages/scroll-preview/index.astro`: static accessible sections and metadata. Reads the existing route data and English content dictionary at build time.
- `public/css/scroll-preview.css`: layout, existing local fonts, responsive styling and reduced-motion fallback. Colors come from the unchanged `monochrome-theme.css`.
- `public/js/scroll-preview.js`: reversible scroll transition, active section, 240 ms visual character scramble, hash navigation and touch cover preview. Imports the unchanged production portrait renderer and GLB asset; no portrait lifecycle globals are installed.

Desktop uses a sticky full-height hero over a two-viewport scroll range. Small screens and reduced-motion users get a one-viewport hero and natural document scrolling. The index uses real links, persistent accessible labels and `aria-current`. All content and links remain available without JavaScript; the portrait photo is the WebGL failure fallback.

## Removal

Delete these three implementation files and this note, then rebuild and deploy. No existing routes, data, components, stylesheets, bundling or deployment configuration require changes.

## Verification

- Astro production build and the existing `scripts/verify-build.mjs` passed.
- Original built routes and public assets compared byte-for-byte against a clean build of the parent main commit: identical.
- Playwright with installed Chromium-based Brave: 1440×900, 320×568, 390×844 and 667×375 passed horizontal overflow, four-section index, clickable navigation, contact link and no uncaught JavaScript errors. The shared 3D renderer loaded in all four sizes.
- Scroll transition checked at intermediate progress and back at zero; reduced-motion layout and immediate navigation passed.
- Desktop and mobile hero/project screenshots reviewed.
- Physical-device testing and a Lighthouse audit of this experimental URL are not included in these local checks. Existing production loader/window/close behavior was not exercised locally; its built output is unchanged.
