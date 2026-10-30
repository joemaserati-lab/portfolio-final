# Edoardo Rappanello — portfolio

Static Astro portfolio with a native scroll layout, CRT transitions and a Three.js portrait.

## Development

Requires Node.js 22 or newer. Run `npm ci`, then `npm run dev`.
Run `npm run build && npm run check` before publishing; `npm run preview` serves `dist/`. For browser tests, run `npx playwright install chromium`, start the preview server, then `npm run test:ui`.

## Source map

- `src/layouts/PortfolioShell.astro`: shared document, metadata, loader and hero.
- `src/components/ScrollSections.astro`, `ScrollNavigation.astro`, `PortfolioFooter.astro`: permanent scroll structure.
- `src/pages/`: indexable homepage, sections and project URLs. `/scroll-preview/` is only a compatibility redirect.
- `src/data/routes.mjs`: route metadata and sitemap registry.
- `src/data/portfolio.mjs`: shared English and Italian content, including project results.
- `public/js/content.js`: selects the shared dictionaries embedded by Astro.
- `src/components/StaticReader.astro`: complete static reading view if JavaScript is disabled or the runtime fails.
- `public/js/portfolio.js`: canonical routing, content rendering, project cases and CV overlay.
- `public/js/portfolio-scroll.js`: native scroll, icon navigation, portrait docking and mobile viewport color.
- `public/js/boot.js`, `head3d.js`, `head-scan-effect.js`: loader and 3D lifecycle. There are no generated runtime adapters.
- `public/css/portfolio-scroll.css`: scroll-specific layout and transitions. `scripts/build-css.mjs` includes it in the production CSS bundle.

CSS and JavaScript URLs use the version in `package.json` to invalidate browser caches on release. Release **2.0.19** stabilizes the no-JavaScript reader and adaptive 3D rendering. Bump both `package.json` and `package-lock.json` for subsequent releases.

Edit source files only. `dist/`, `.astro/` and `public/css/portfolio.bundle.css` are generated and ignored.

## Interaction and routes

Home, Selected Works, About and Contact scroll naturally inside the CRT. Existing `/work/`, `/about/`, `/contact/`, `/resume/` and `/work/<slug>/` links remain supported. Projects use their canonical URLs with browser Back/Forward support; CV is the only remaining OS dialog.

Desktop portrait motion follows the mouse. Mobile portrait rotation follows one full turn over the page, with a transform-based large-to-small handoff. Mobile navigation uses icons and the active section label; language and privacy controls live in the footer. Cover color reveals use a restrained scan transition. Reduced-motion preferences are respected.

## Checks and deployment

`tests/portfolio-regression.mjs` checks desktop and 320×568, 390×844, 667×375 touch layouts, loader, portrait, projects, navigation, footer, privacy, language and reduced motion. `tests/routes-regression.mjs` checks direct links, redirects and browser history. `tests/css-render-parity.mjs` compares source styles with the generated bundle.

GitHub Actions runs the static build and browser regression suite. GitHub Pages publishes `dist/` from `main`; Lighthouse reports run after deployment. Scores are reported by each audit rather than kept as permanent claims in this document.

Production URL: https://joemaserati-lab.github.io/portfolio-final/

GA4 remains consent-first and inactive while its Measurement ID is `G-XXXXXXXXXX`. The consent panel does not open automatically while analytics is unconfigured.

`tests/technical-regression.mjs` checks direct-route title alignment, project keyboard focus, metadata after navigation and the no-JavaScript/runtime-failure reading view.

The 3D head retains its approved shader, colors and pointer tracking. At the stable dock boundary it uses a smaller GPU buffer and a 30fps render budget, while its hero state keeps the original interaction frame rate. Pixel/DPR budgets are capped for mobile; `window.PortfolioMotion.getRenderStats()` exposes dimensions and quality for diagnostics. GitHub Actions uses a software WebGL renderer, so Lighthouse results must be validated against physical devices.

Direct project visits defer the 3D portrait and CRT until returning to a scroll section. Homepage content is revealed as soon as its runtime is ready; the portrait settles independently.

## Typography
The complete site typography is defined in `public/css/typography.css` and documented in `TYPOGRAPHY.md`. Run `node tests/typography-regression.mjs` against the local preview to verify reading, controls, captions, narrow/short layouts and the 404 page.

### Low-power GPU handling (v2.0.20)

The Three.js portrait retains the same scanned-contour shader and mouse interaction. Its shader now skips organic-color computations for fragments where the final result is mathematically only the neutral rim or transparent fade. Hardware-accelerated GPUs keep the original 60/30 fps budgets; software WebGL (SwiftShader/llvmpipe) and repeatedly stalled renderers automatically enter lower-pixel, lower-FPS modes to keep the main browser thread responsive. The fallback is intentionally per-device: it does not alter visual layouts or project media. `PortfolioMotion.getRenderStats()` exposes `backend`, `lastDrawMs`, `drawnFrames`, `pixels` and `fpsBudget` for diagnostics. PageSpeed lab scores in software-GPU environments should still be interpreted separately from real device field metrics.
