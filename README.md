# V31.1 — Enhanced Lines / Balanced Glow

Questa variante mantiene la palette iridescente e la logica a linee della V31-A, ma riduce bloom, halo ed esposizione per recuperare contrasto, neri e separazione cromatica.

Principali modifiche:
- Bloom strength 0.40 → 0.16
- Bloom radius 0.32 → 0.16
- Bloom threshold 0.92 → 1.18
- Tone-mapping exposure 1.16 → 1.00
- Energia del core e degli aloni ridotta
- Highlight bianchi più localizzati
- Rim light ridotta
- Opacità desktop 1.00 → 0.96

La palette rimane volutamente satura: la correzione agisce sulla luce, non sulla cromia.

# V31-A — Enhanced Iridescent Lines

Variant based on V30. Keeps the original 3D head scan/contour-line language, but increases chroma, core brightness, halo separation and perceived volume. Uses NeutralToneMapping, controlled UnrealBloom and full desktop opacity.

# V3.0 Foundation / v11

Baseline: v10 Window Manager + v9 Fluid Type.

Changes:
- LAB removed and replaced by RESUME.TXT / CV.
- ARCHIVE ONLINE removed from the footer; only HELP and FX remain.
- Secondary windows use controlled random placement only on desktop (>1024px).
- At tablet/mobile widths (<=1024px), ABOUT / RESUME / ARCHIVE / CONTACT automatically fill the CRT safezone.
- PROJECTS remains fullscreen at every breakpoint.
- Portfolio content moved to `js/content.js`; `portfolio.js` now manages rendering, routing and window behavior.
- Resume data model and placeholder view added.
- Terminal commands updated to `resume` / `cv`; LAB commands removed.

The CRT visual baseline, loader, curvature, safezone and fluid typography are unchanged.


## V3.1 — Projects redesign
- selected work directory redesigned around large visual covers
- removed explanatory UI copy from the index
- case studies redesigned as image-led editorial pages
- existing hash routing and full-safezone PROJECTS behavior preserved
- placeholders remain intentionally abstract until real project assets are supplied


## V3.2 aesthetic polish
- CRT degauss/power transition on Projects and case-study navigation
- stronger project hover with scan sweep and OPEN PROJECT feedback
- mobile replacement for hover via intersection-triggered signal animation + tap feedback
- contextual micro-glitch on secondary window open/maximize/restore
- custom pixelated amber cursor on fine-pointer desktop devices
- respects prefers-reduced-motion


## V3.3 aesthetic refine
- degauss identico anche alla chiusura della finestra PROJECTS (X / Esc)
- vibrazione contestuale delle finestre secondarie più marcata e ancora molto breve
- nuovo cursor pixel-art con outline amber e interno scuro


## v18 — balanced tremor
- secondary windows return to CRT tremor feedback
- intensity calibrated between v13 and v14: max ~3px, minimal vertical shift/skew
- removed the prominent glitch line from the v14 window feedback
- Projects keep the approved degauss/power transition


## v19 — Pixelarticons cursor
- Removed the previous locally drawn cursor assets.
- Normal cursor: Pixelarticons `default-alt`.
- Interactive cursor: Pixelarticons `pointer`.
- Both render at 96×96 px (3× the original 32×32 cursor grid).
- Custom cursor applies only to fine mouse pointers; touch/coarse pointer devices remain unaffected.


## v20 / Self-hosted amber cursors
- Pixelarticons `default-alt` and `pointer` are now bundled locally under `assets/cursors/`.
- Removed runtime cursor requests to pixelarticons.com.
- Cursor artwork is adapted to the amber CRT palette (`#ffd08d`, `#f2a12f`, deep burnt-amber outline).
- Visual cursor size reduced from 96x96 to 80x80 px.
- Hotspots rescaled from the original 32x32 cursor grid to the 80px render size.
- Pixelarticons MIT notice bundled in `assets/cursors/LICENSE-Pixelarticons.txt`.


## v21 Cursor system
- Self-hosted Pixelarticons default-alt, pointer and text cursors in amber.
- All three render at 80x80 px.
- Cursor SVGs are preloaded and cursor.js initializes before the application scripts to eliminate the first-hover asset swap.
- Static/non-clickable text uses the text cursor; clickable controls keep pointer.
- Removed the FX: HIGH footer toggle.

## v22 Precise text cursor
- The amber `text` cursor now activates only over the rendered rectangles of actual text nodes.
- Empty padding and surrounding areas inside small cards/windows remain on `default-alt`.
- Clickable elements still always take priority and use the amber `pointer` cursor.


## v23 Adaptive Bento Grid
- Case-study galleries now use a dense 12-column bento system instead of isolated aspect-ratio tiles.
- Desktop pattern closes every band at 7/5 and 5/7, eliminating empty grid areas.
- Odd final media automatically becomes full-width.
- Tablet reflows to two equal columns; mobile reflows to a single 4:3 column.
- Hero media, routing, cursor system and CRT interactions are unchanged.


## v25 Soft Glow
- restored original VT323 typography from v23
- removed Silkscreen / IBM Plex Mono exploration
- softened CRT outer halo: lower opacity, wider blur, no visible border


## v26 External Halo
- Restored VT323 from v23/v25.
- Replaced the almost invisible radial halo with a true external curved drop-shadow halo.
- No visible border: the screen covers the halo core, leaving only a soft amber bloom around the CRT silhouette.


## V4.5 — Redaction 50 display test + matched external bloom
- VT323 is unchanged for all UI/system/body elements.
- Redaction 50 is scoped to the main name, Selected Work heading and major case-study titles only.
- The Redaction 50 test font loads remotely; no font binary is bundled in this package.
- External CRT halo now uses an opaque hidden light source and a 4-stage warm bloom matched to the YOUR NAME phosphor glow.


## V30 — Iridescent head palette
This variant keeps the V29 portfolio structure, GLB model, Three.js interaction, responsive fitting and lifecycle unchanged.
Only the head shader treatment was revised to match the supplied visual reference: electric violet/periwinkle, lilac, warm peach/orange, cream and white chrome highlights. Scan bands are slightly wider and organically warped to make the palette read as fluid iridescence rather than the previous magenta/cyan treatment.

Main edited file: `js/head-scan-effect.js`.


Update v31.2:
- glow and bloom reduced significantly
- palette shifted from red/blue toward orange + lilac/violet
- white highlights localized more tightly


V31.3 update:
- further reduced bloom and outer glow
- palette shifted from blue/amber toward lilac/violet + orange
- local iridescent palette distribution added to avoid simple left/right color split
- highlights tightened and warmed toward cream


V31.4 update:
- replaced regional colour fields with a multi-scale 3D domain-warped flow field
- colours now cycle continuously through violet, lilac, cream, peach and orange across the full head
- two warped samples plus micro-variation are blended to avoid discrete colour spots
- slow procedural colour movement added while respecting reduced-motion mode
- bloom and outer glow reduced again; brightness is concentrated inside the scan lines


V31.5 update:
- color-only site-wide UI harmonization
- palette aligned to the head using restrained lilac/violet neutrals with soft peach accents
- no structural, layout or motion changes
- cursor SVGs recolored to match the new UI palette


## V31.5-LW — lightweight runtime pass
- same visual language and palette, focused on runtime optimization rather than design changes
- head scan capped to lower effective DPR (desktop 1.5 / touch 1.2)
- head scan render loop throttled to 45 FPS on desktop and 30 FPS on touch devices
- CRT WebGL overlays throttled to 30 FPS
- CRT overlay DPR capped to 1.25
- page-hidden redraw suppression added
- renderer power preference relaxed on non-desktop devices


## V31.5-LW2 — real loader + project transition cleanup
- degauss/power transition removed from individual case-study opening and previous/next project navigation
- degauss retained for opening PROJECTS.DIR
- boot screen now waits for DOM, local/remote fonts, page load, CRT video and settled 3D model loading
- model is preloaded in parallel with the rest of the page
- boot includes a 15 s safety timeout and graceful fallbacks instead of hanging indefinitely


## V31.5-LW3 — harmonized launch
- resource-aware loader retained as the launch gate
- loader rows now reveal progressively rather than appearing as an instant checklist
- minimum boot presence calibrated to ~1.55 s, with a short READY hold before release
- loader-to-site crossfade refined to ~0.86 s
- initial page composition reveals in sequence: CRT/head, hero label/name/copy/CTA, then desktop icons
- first hidden 3D warm-up frame added before the loader releases
- reduced-motion mode bypasses the entrance choreography
- project-level navigation still opens without degauss; degauss remains reserved for PROJECTS.DIR
