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
- Keep the layout, font system, animation, clipping and mobile safe zones intact.
- Make all visual color adjustments in `public/css/monochrome-theme.css`; it is the canonical palette and **the only stylesheet defining the UI color tokens**. Keep the root mirror `css/monochrome-theme.css` synchronized for legacy checks.
- The `:root` rules in `style.css`, `fixes.css` and `crt-outline.css` are reserved for geometry, typography and responsive measurements.
- The separate 404 page has an inline palette by design. Its bouncing portrait uses mint in only one of six phases.

Astro serves `public/` and builds from `src/layouts/PortfolioShell.astro`. Structural CSS and shader sources have root mirrors for legacy tooling.

## Project covers
Project directory covers are grayscale at rest. Desktop hover or keyboard focus reveals the original artwork; on touch devices, tap once for the color preview and tap again to open. Viewport-triggered mobile animations must not reveal colors automatically.
