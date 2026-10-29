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
- Preserve CRT framing, animation, clipping and mobile safe zones. Redaction remains the editorial display voice. In balanced mode it also handles individual case-study titles; Doto handles interface, project-directory titles and metadata; Inter handles long-form copy, case facts and informative subheads. The original all-Doto reading voice is reversible via the typography configuration.
- Make all visual color adjustments in `public/css/monochrome-theme.css`; it is the canonical palette and **the only stylesheet defining the UI color tokens**.
- The `:root` rules in `foundation.css`, `visual-experience.css`, `adaptive.css`, `fixes.css` and `crt-outline.css` are reserved for geometry, typography and responsive measurements.
- The separate 404 page has an inline palette by design. Its bouncing portrait uses mint in only one of six phases.

Astro serves `public/` and builds from `src/layouts/PortfolioShell.astro`. Root-level legacy snapshots are removed; `public/` and `src/` are authoritative. Production bundles the eleven CSS source files in the documented order; development loads those same sources separately. The former monolithic `style.css` is split in place without changing rules or cascade order.

## Project covers
Project directory covers are grayscale at rest. Desktop hover or keyboard focus reveals the original artwork; on touch devices, a **single tap** reveals the original colors and opens the project after a 280 ms preview. On mobile, only the most visible project card plays its video, with hysteresis between adjacent cards. The previous card immediately returns to its logo cover; the cover stays visible until a decoded video frame is available. Cards without a video retain the 650 ms CRT color scan.

## Mobile loader
The `PORTFOLIO PRONTO` title wraps inside the responsive CRT safe area, without character breaking or horizontal overflow. Maintain this behavior at portrait widths and short landscape heights.

## Permanent scroll layout
`portfolio-scroll.css` is the final source layer in the production bundle. Mobile language and privacy controls belong to the footer; privacy panels remain accessible above navigation. The retired window manager and build-time preview adapters must not be reintroduced.

## Case-study reading hierarchy
Role precedes original artwork; client, deliverables and year follow it. Distinguish titles and reading copy through scale, line-height and spacing, preserve full-frame covers and use neutral rules and spacing rather than decorative panels. Body copy must not shrink below 16 px on narrow or short viewports.

## Complete typography system
`public/css/typography.css` is the canonical source for type roles, sizes, leading, tracking and font families. The mode is configured once in `src/data/typography.mjs`, and shared by the main shell and the 404 page. It follows the existing structural layers in source and production. See `TYPOGRAPHY.md`. Component modules may define icon glyph geometry and font-face registration, but must not reintroduce content type scales.
