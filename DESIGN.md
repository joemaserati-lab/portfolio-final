# Portfolio — visual color system

The portfolio remains predominantly monochromatic. Black, white, dark gray and light gray form the entire interface. Mint is a deliberately limited interactive signal; red is a separate, equally restrained typographic identity color. The head remains the main colored object.

## Canonical swatches
- Black `#050505`: frame and background.
- Dark gray `#252525`: titlebar, chrome and hover surfaces.
- Light gray `#B9B9B9`: secondary copy and interface labels.
- White `#F5F5F5`: primary typography, icons and main controls.
- Mint `#80FFCC`: a **rare functional signal** on the portrait, progress, primary CTA hover, keyboard focus and text selection.
- Red `#FF2D3A`: **Doto signature glyphs only** — `.`, `•`, `[ ]`, `<>` — used on headings, section labels, project indexes, back links and CTA punctuation.

Intermediate black/gray values may exist in the CRT shader, alpha transparency and anti-aliasing; they may not introduce any green tint. Original project imagery retains its source colors.

## Usage rules
- Mint must **not** be used on backgrounds, panels, window chrome, default icon borders or secondary hover states.
- Red is reserved for deliberate Doto punctuation and docked navigation labels; it does not become the default for all links, hovers, focus, backgrounds or status indicators. Decorative Doto glyphs remain red in all interaction states; ordinary punctuation in prose, email addresses and URLs is not recolored.
- Window surfaces stay charcoal with dark-gray titlebars. Text hierarchy: white for primary content, light gray for secondary copy.
- The 3D portrait is white/gray with only a few mint contours. Avoid broad luminous color effects.
- Preserve CRT framing, animation, clipping and mobile safe zones. The live `doto-mono` mode uses bold Doto for display, headings and project titles, Doto medium for UI/navigation/metadata, and JetBrains Mono for extended reading and captions; all headings use Doto. The earlier `pixel-editorial` (Geist Pixel Square/Geist Sans/Doto), `digital` (Doto/Geist Pixel), `balanced` (Redaction/Doto/Inter), and `original` (Redaction/Doto) modes remain reversible through the single type-mode switch. Do not add decorative pixel effects on top of the fonts.
- Make all visual color adjustments in `public/css/monochrome-theme.css`; it is the canonical palette and **the only stylesheet defining the UI color tokens**.
- The `:root` rules in `foundation.css`, `visual-experience.css`, `adaptive.css`, `fixes.css` and `crt-outline.css` are reserved for geometry, typography and responsive measurements.
- The separate 404 page has an inline palette by design. Its bouncing portrait uses mint in only one of six phases.

Astro serves `public/` and builds from `src/layouts/PortfolioShell.astro`. Root-level legacy snapshots are removed; `public/` and `src/` are authoritative. Production bundles the eleven CSS source files in the documented order; development loads those same sources separately. The former monolithic `style.css` is split in place without changing rules or cascade order.

## Red Doto glyph language
The visual signature uses four Doto marks: point `.` closes headings, bullet `•` precedes dates and ongoing status, square brackets `[ ]` frame the full hero CTA, loader and CV locations; angle brackets `<>` remain available for external case links, not the hero CTA. Project cards show only `• YEAR` or localized `• IN CORSO`, without the old project index line. Scrolled navigation labels are red and the mobile active work label reads `Works`. The canonical color token is `--red` in `public/css/monochrome-theme.css`. `public/css/typography.css` owns glyph typography and pseudo-element layout; dynamic case-study and directory marks live in `public/js/portfolio.js`. Keep title fitting, physical CRT space, mobile layouts and original project covers unchanged. See `TYPOGRAPHY.md`.

## Project covers
Project directory covers are grayscale at rest. Desktop hover or keyboard focus reveals the original artwork; on touch devices, a **single tap** reveals the original colors and opens the project after a 280 ms preview. On mobile, only the most visible project card plays its video, with hysteresis between adjacent cards. The previous card immediately returns to its logo cover; the cover stays visible until a decoded video frame is available. Cards without a video retain the 650 ms CRT color scan.

## Current interface simplification

The cinematic first-visit terminal animation and its extra entry button are removed. The site displays a single localized loading label plus progress bar for a **minimum of two seconds on every visit**, and enters automatically when the application and first head frame are ready. Reduced-motion users see the same two-second minimum. The loading overlay retains an accessible progressbar. No extra hero cursor or blinking underscore is rendered.

The Selected Work introductory panel retains only its description, while About no longer renders the three summary cards; its main paragraphs are unchanged. CV capabilities now include **UI & UX DESIGN** instead of WEB DESIGN, with 3D visualization/design tools removed in EN and IT. CV skill and tool tokens use literal visual angle brackets (via pseudo-elements), not bordered chips. Project discipline tags are unchanged. A separate content-editing pass will follow later.

## Mobile loader
The `PORTFOLIO PRONTO` title wraps inside the responsive CRT safe area, without character breaking or horizontal overflow. Maintain this behavior at portrait widths and short landscape heights.

## Deliberate whitespace

The opening screen uses a restrained editorial footprint inside the CRT safe area: a narrower hero column, reduced Doto display scale, smaller JetBrains Mono introduction, and larger gaps between name, description and CTA. The 3D head stays in its original position and remains the visual counterweight. Spacing changes are in `public/css/portfolio-scroll.css`; the two hero font-size tokens (`--type-hero-display`, `--type-hero-copy`) are scoped to `doto-mono` in `public/css/typography.css`. Desktop scroll sections use larger top/bottom breathing space. Mobile portrait receives moderate extra spacing, while short landscape keeps existing collision-safe geometry. Keep these changes reversible through the branch/PR and do not increase paragraph font sizes to fill whitespace.

## Sitewide rhythm and typographic identities

The quiet-space direction extends from home to About, Selected Work, Resume, Contact and the five case studies. `public/css/portfolio-scroll.css` holds the source for spacing, section rhythm, media separation and responsive compacting; do not add spacer elements or rewrite content to create whitespace. In `doto-mono`, professional role titles, employers, clients, and the profile role use Doto, while descriptive paragraphs use JetBrains Mono; informative headings use Doto. The no-JavaScript reading view keeps the same identity distinction. Narrow/short mobile layouts keep their protected navigation and existing behavior. The next phase of content/element cleanup is intentionally **not** included here.

## Permanent scroll layout
`portfolio-scroll.css` is the final source layer in the production bundle. Mobile language and privacy controls belong to the footer; privacy panels remain accessible above navigation. The retired window manager and build-time preview adapters must not be reintroduced.

## Case-study reading hierarchy
Role precedes original artwork; client, deliverables and year follow it. Distinguish titles and reading copy through scale, line-height and spacing, preserve full-frame covers and use neutral rules and spacing rather than decorative panels. Body copy must not shrink below 16 px on narrow or short viewports.

## Complete typography system
`public/css/typography.css` is the canonical source for type roles, sizes, leading, tracking and font families. The mode is configured once in `src/data/typography.mjs`, and shared by the main shell and the 404 page. It follows the existing structural layers in source and production. See `TYPOGRAPHY.md`. Component modules may define icon glyph geometry and font-face registration, but must not reintroduce content type scales.

The semantic H1–H5 scale and role classes are documented in `TYPOGRAPHY.md`. CV groups use H3 and their role titles use H4 with the existing optical size. Short landscape uses a 32px hero display to protect the fixed navigation band.

## Centered classic CRT, without experimental glass filtering

`src/data/crt-experiment.mjs` controls the desktop CRT geometry. Set `classicDesktop: false` to restore the wide frame; `desktopRatio: 4 / 3` keeps the 4:3 proportions. Only landscape desktop viewports wider than 1024px receive the side margins; mobile and tablet remain unchanged. The screen outline and loader share its bounds, and hero text, head and icons fit the reduced desktop width.

The CodePen-inspired global SVG `feDisplacementMap` treatment was removed after it caused significant rendering slowdown without a perceptible improvement. The `CrtOptics` component, its DOM filter definitions, CSS activation and HTML flags are absent, including on the 404 and project case pages. Original image and video media no longer pass through this full-stage filter. The geometry and content changes from PR #39 are retained.

`tests/crt-experiment-regression.mjs` now checks classic 4:3 proportions, loader and outline alignment, unchanged mobile geometry, absence of optical filters on home, case studies and 404, CTA navigation, and case close/head restoration.

### Publication alignment and containment
Desktop hero icons share the H1 top anchor through `--hero-top-gap`; the icon hit area retains its padding and mobile navigation stays unchanged. Below 1025px, Selected Work and case title wrappers stretch to their grid track so the heading's own box can contain its text. The existing long-word fitter also recognizes semantic CV H4 titles. `tests/containment-regression.mjs` checks actual text fragments against their own container bounds after fitting, all sections and five projects in EN/IT at eight viewports, plus desktop hero alignment. Media regression requires no ancestor optical filter, preserving source video, opacity, aspect ratio and absence of overlays.
