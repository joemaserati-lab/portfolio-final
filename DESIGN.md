# Portfolio visual language

The homepage is a monochrome CRT/desktop interface. It must not develop a green cast.

## Interface colors
- Black: `#050505` — outer frame, screen shadows and background.
- Dark gray: `#252525` — panels, chrome and secondary surfaces.
- Light gray: `#B9B9B9` — supporting text and dividers.
- White: `#F5F5F5` — primary text and icon outlines.
- Lime: `#C7FF5B` — a **rare accent**, never a base or ambient tint.

The portrait uses white and neutral gray scan contours, with a few narrow lime accents. It is the visual focal point. No red, mint, teal, violet or orange. Raster scanlines, noise, glows, CRT shader, panel shadows, borders, and large surfaces must remain neutral. Do not tint large areas with lime.

Use lime only for the portrait's selected contours and a handful of interactive feedback elements: blinking hero caret, keyboard focus, selected/hovered controls and small loader progress. Project artwork retains its original colors because it is the subject of the case study, not part of the UI palette.

Typography, spacing, CRT shape, layout, motion, responsive safe zones and page behavior are intentionally unchanged by this color revision.

Astro publishes assets from `public/`; corresponding root copies are maintained for existing tooling. Active theme: `public/css/monochrome-theme.css`; source: `src/layouts/PortfolioShell.astro`. Keep the two copies in sync for subsequent updates.
