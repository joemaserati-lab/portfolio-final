# Scroll extension of the original CRT portfolio

Route: `/portfolio-final/scroll-preview/`. The production homepage and every existing route remain unchanged.

## Reuse, not redesign

The page renders the unchanged `PortfolioShell.astro` with Astro's container API, then adds a native scrolling viewport and responsive section navigation. The original loader, hero, four desktop icons, full production CSS bundle, local fonts, CRT renderer, custom cursor, language selector, privacy controls and content dictionaries are reused directly. The original project, About and Contact markup is produced by the existing portfolio runtime's content functions.

The three preview runtime endpoints are generated from the original boot, portfolio and head sources at build time. `src/lib/scroll-preview-runtime.mjs` adapts only their preview routing, content exposure and portrait lifecycle. Guarded string replacements deliberately fail the build if upstream hooks change. Production scripts are never edited or replaced.

## Scroll behavior

The first viewport contains the original hero. On desktop, the original launcher icons first collapse into a persistent small-icon menu in the upper-right CRT safe area. Each window grows from its matching mini icon. The outline completes before the content becomes visible: the first 80% of the section-entry scroll opens the frame; the remaining 20% powers a horizontal CRT line and raster reveal. Incoming content stays hidden and inert during outline expansion, and is not interactive until the raster completes. Mobile keeps the existing folder origin. The frame and raster both reverse on scroll back, with the content hidden before the frame closes. Folder clicks and the section index scroll to content; Resume keeps its original window. Project covers keep the single-touch 280 ms color preview and open the original case-study renderer. Cases and Resume stay under preview-local hashes; close/back return to the scrolling context.

The original head remains at its original hero position at scroll zero. It moves to a persistent side area on desktop or compact upper area on mobile, keeps rendering while content is open, and receives scroll-driven pose updates in addition to pointer/touch input. On mobile, the portrait is aligned to the actual content window edge in a reserved upper strip (76–96 px, or 64 px in short landscape); the scrolling viewport is clipped below that strip so text cannot pass behind the portrait. Reduced motion disables the folder morph, pose animation and character scramble. On desktop, the left section index is removed: the four mini icons have a single current-section name beneath them, with stable accessible text and a visual 240 ms scramble. The former left-index spacing is reclaimed for the content. On mobile, the four section links sit inside the CRT safe area, above its lower edge; the active link has full white contrast, charcoal fill, a mint underline and a short refresh animation. Existing bottom controls are shifted upward to reserve this internal navigation row. Reduced motion disables these additional transitions.

## Files and removal

Remove only these experiment files and rebuild:

- `src/pages/scroll-preview/` (page and generated runtime endpoint)
- `src/lib/scroll-preview-runtime.mjs`
- `public/css/scroll-preview.css`
- `public/js/scroll-preview.js`
- `tests/scroll-preview.mjs`
- `.github/workflows/scroll-preview.yml`
- this note

The route stays outside the original navigation and sitemap and is marked `noindex, follow`.

## Validation

Production build and existing route verification passed locally. All original built pages and public assets were byte-for-byte identical to the clean original build. Computed hero font, spacing and geometry matched the original homepage at 1440×900, 320×568 and 667×375.

The dedicated Playwright test also checks hidden/inert content before outline completion, CRT raster clipping afterward, reverse hiding, the desktop mini-icon origin/click action, and mobile portrait/window alignment and clearance. Navigation checks verify the hidden desktop index, caption beneath the mini icons, mobile containment within the CRT, stronger active-state contrast and unobstructed touch targets. It covers fresh-entry loader, original icons, five original project cards, persistent 3D head, section navigation, project open/close, preview-local URLs, reverse scroll to the original hero, horizontal overflow, returning visits, reduced motion and language change at 1440×900, 320×568, 390×844 and 667×375. The dedicated PR workflow runs it against the production build and saves screenshots.

Physical-device testing and Lighthouse measurements specifically of this experimental route remain outside these checks. Existing production checks continue to run unchanged.
