# Scroll extension of the original CRT portfolio

Route: `/portfolio-final/scroll-preview/`. The production homepage and every existing route remain unchanged.

## Reuse, not redesign

The page renders the unchanged `PortfolioShell.astro` with Astro's container API, then adds a native scrolling viewport and a text-only section index. The original loader, hero, four desktop icons, full production CSS bundle, local fonts, CRT renderer, custom cursor, language selector, privacy controls and content dictionaries are reused directly. The original project, About and Contact markup is produced by the existing portfolio runtime's content functions.

The three preview runtime endpoints are generated from the original boot, portfolio and head sources at build time. `src/lib/scroll-preview-runtime.mjs` adapts only their preview routing, content exposure and portrait lifecycle. Guarded string replacements deliberately fail the build if upstream hooks change. Production scripts are never edited or replaced.

## Scroll behavior

The first viewport contains the original hero. Scrolling expands the matching original folder glyph into a window outline and reveals the corresponding existing content. The same transformation reverses on scroll back. Folder clicks and the section index scroll to content; Resume keeps its original window. Project covers keep the single-touch 280 ms color preview and open the original case-study renderer. Cases and Resume stay under preview-local hashes; close/back return to the scrolling context.

The original head remains at its original hero position at scroll zero. It moves to a persistent side area on desktop or compact upper area on mobile, keeps rendering while content is open, and receives scroll-driven pose updates in addition to pointer/touch input. Reduced motion disables the folder morph, pose animation and character scramble. Section navigation uses fixed accessible labels plus a visual 240 ms scramble.

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

The dedicated Playwright test covers fresh-entry loader, original icons, five original project cards, persistent 3D head, section navigation, project open/close, preview-local URLs, reverse scroll to the original hero, horizontal overflow, returning visits, reduced motion and language change at 1440×900, 320×568, 390×844 and 667×375. The dedicated PR workflow runs it against the production build and saves screenshots.

Physical-device testing and Lighthouse measurements specifically of this experimental route remain outside these checks. Existing production checks continue to run unchanged.
