# Portfolio — visual color system

The portfolio is deliberately monochromatic. Black, white, dark gray and light gray form the entire interface; mint is a deliberately limited signal. The head remains the main colored object.

## Canonical swatches
- Black `#050505`: frame and background.
- Dark gray `#252525`: titlebar, chrome and hover surfaces.
- Light gray `#B9B9B9`: secondary copy and interface labels.
- White `#F5F5F5`: primary typography, icons and main controls.
- Mint `#80FFCC`: a **rare accent** on the portrait, blinking hero marker, selected progress, primary CTA hover, keyboard focus and text selection.

Intermediate black/gray values may exist in the CRT shader, alpha transparency and anti-aliasing; they may not introduce any green tint. Original project imagery retains its source colors.

## Usage rules
- Mint must **not** be used on backgrounds, panels, window chrome, default icon borders or secondary hover states.
- Window surfaces stay charcoal with dark-gray titlebars. Text hierarchy: white for primary content, light gray for secondary copy.
- The 3D portrait is white/gray with only a few mint contours. Avoid broad luminous color effects.
- Preserve CRT framing, animation, clipping and mobile safe zones. The live `doto-mono` mode uses bold Doto for display, headings and project titles, Doto medium for UI/navigation/metadata, and Geist Mono for extended reading and captions; all headings use Doto. The earlier `pixel-editorial` (Geist Pixel Square/Geist Sans/Doto), `digital` (Doto/Geist Pixel), `balanced` (Redaction/Doto/Inter), and `original` (Redaction/Doto) modes remain reversible through the single type-mode switch. Do not add decorative pixel effects on top of the fonts.
- Make all visual color adjustments in `public/css/monochrome-theme.css`; it is the canonical palette and **the only stylesheet defining the UI color tokens**.
- The `:root` rules in `foundation.css`, `visual-experience.css`, `adaptive.css`, `fixes.css` and `crt-outline.css` are reserved for geometry, typography and responsive measurements.
- The separate 404 page has an inline palette by design. Its bouncing portrait uses mint in only one of six phases.

Astro serves `public/` and builds from `src/layouts/PortfolioShell.astro`. Root-level legacy snapshots are removed; `public/` and `src/` are authoritative. Production bundles the eleven CSS source files in the documented order; development loads those same sources separately. The former monolithic `style.css` is split in place without changing rules or cascade order.

## Project covers
Project directory covers are grayscale at rest. Desktop hover or keyboard focus reveals the original artwork; on touch devices, a **single tap** reveals the original colors and opens the project after a 280 ms preview. On mobile, only the most visible project card plays its video, with hysteresis between adjacent cards. The previous card immediately returns to its logo cover; the cover stays visible until a decoded video frame is available. Cards without a video retain the 650 ms CRT color scan.

## Current interface simplification

The cinematic first-visit terminal animation and its extra entry button are removed. The site displays a single localized loading label plus progress bar for a **minimum of two seconds on every visit**, and enters automatically when the application and first head frame are ready. Reduced-motion users see the same two-second minimum. The loading overlay retains an accessible progressbar. No extra hero cursor or blinking underscore is rendered.

The Selected Work introductory panel retains only its description, while About no longer renders the three summary cards; its main paragraphs are unchanged. CV capabilities now include **UI & UX DESIGN** instead of WEB DESIGN, with 3D visualization/design tools removed in EN and IT. CV skill and tool tokens use literal visual angle brackets (via pseudo-elements), not bordered chips. Project discipline tags are unchanged. A separate content-editing pass will follow later.

## Mobile loader
The `PORTFOLIO PRONTO` title wraps inside the responsive CRT safe area, without character breaking or horizontal overflow. Maintain this behavior at portrait widths and short landscape heights.

## Deliberate whitespace

The opening screen uses a restrained editorial footprint inside the CRT safe area: a narrower hero column, reduced Doto display scale, smaller Geist Mono introduction, and larger gaps between name, description and CTA. The 3D head stays in its original position and remains the visual counterweight. Spacing changes are in `public/css/portfolio-scroll.css`; the two hero font-size tokens (`--type-hero-display`, `--type-hero-copy`) are scoped to `doto-mono` in `public/css/typography.css`. Desktop scroll sections use larger top/bottom breathing space. Mobile portrait receives moderate extra spacing, while short landscape keeps existing collision-safe geometry. Keep these changes reversible through the branch/PR and do not increase paragraph font sizes to fill whitespace.

## Sitewide rhythm and typographic identities

The quiet-space direction extends from home to About, Selected Work, Resume, Contact and the five case studies. `public/css/portfolio-scroll.css` holds the source for spacing, section rhythm, media separation and responsive compacting; do not add spacer elements or rewrite content to create whitespace. In `doto-mono`, professional role titles, employers, clients, and the profile role use Doto, while descriptive paragraphs use Geist Mono; informative headings use Doto. The no-JavaScript reading view keeps the same identity distinction. Narrow/short mobile layouts keep their protected navigation and existing behavior. The next phase of content/element cleanup is intentionally **not** included here.

## Permanent scroll layout
`portfolio-scroll.css` is the final source layer in the production bundle. Mobile language and privacy controls belong to the footer; privacy panels remain accessible above navigation. The retired window manager and build-time preview adapters must not be reintroduced.

## Case-study reading hierarchy
Role precedes original artwork; client, deliverables and year follow it. Distinguish titles and reading copy through scale, line-height and spacing, preserve full-frame covers and use neutral rules and spacing rather than decorative panels. Body copy must not shrink below 16 px on narrow or short viewports.

## Complete typography system
`public/css/typography.css` is the canonical source for type roles, sizes, leading, tracking and font families. The mode is configured once in `src/data/typography.mjs`, and shared by the main shell and the 404 page. It follows the existing structural layers in source and production. See `TYPOGRAPHY.md`. Component modules may define icon glyph geometry and font-face registration, but must not reintroduce content type scales.

The semantic H1–H5 scale and role classes are documented in `TYPOGRAPHY.md`. CV groups use H3 and their role titles use H4 with the existing optical size. Short landscape uses a 32px hero display to protect the fixed navigation band.

## Reversible classic CRT experiment

`src/data/crt-experiment.mjs` controls this preview. Set `classicDesktop: false` to restore the wide geometry, or `subtleOptics: false` to remove the new optical treatment independently. Desktop ratio is 4:3 as confirmed by the user. Only widths above 1024px with a landscape ratio of at least 4:3 receive centered side margins; phone/tablet frame and content geometry remain unchanged. The outline and loader use the same bounds as the display. Home anchors fit the available screen container rather than the full browser width.

The global optical treatment is inspired by https://codepen.io/fand/pen/YPXBwVd but uses native SVG displacement of the live DOM, rather than its VFX-JS capture/GLSL pipeline. The static radial displacement has a maximum theoretical offset of 3px per axis on desktop, 1px on mobile. No time-varying glitch, RGB splitting, extra scanlines or new runtime dependency is added. It applies across portfolio sections, case studies and the 404; reduced motion and forced colors disable it. Case-study images remain original, with only this subtle shared glass warp. Text stays selectable and accessible; pointer geometry differs by at most those small offsets.

`tests/crt-experiment-regression.mjs` checks 4:3 proportions, centered frame/loader alignment, exact mobile layout parity with the wide mode, reduced motion, global optics, CTA navigation, case close/head restoration and actual distorted pixels on a deterministic HTML probe. This is a preview and is not published automatically.

### Publication alignment and containment
Desktop hero icons share the H1 top anchor through `--hero-top-gap`; the icon hit area retains its padding and mobile navigation stays unchanged. Below 1025px, Selected Work and case title wrappers stretch to their grid track so the heading's own box can contain its text. The existing long-word fitter also recognizes semantic CV H4 titles. `tests/containment-regression.mjs` checks actual text fragments against their own container bounds after fitting, all sections and five projects in EN/IT at eight viewports, plus desktop hero alignment. Media regression permits only the explicitly enabled optical filter on the stage; source video, opacity, aspect ratio and absence of overlays remain checked.
