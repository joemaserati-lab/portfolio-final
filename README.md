# Edoardo Rappanello — Portfolio

Interactive multidisciplinary portfolio built with Astro, vanilla JavaScript and Three.js.

**Live:** https://joemaserati-lab.github.io/portfolio-final/

The site combines a static, SEO-friendly architecture with a custom CRT / desktop-OS interface. Astro handles the build, routes and metadata; the browser experience remains deliberately lightweight and framework-free.

---

## Overview

This portfolio is designed as an interactive operating-system-like environment rather than a conventional scrolling website.

The interface includes:

- a curved CRT display and phosphor-style visual treatment
- an animated Three.js head built from a custom GLB model and contour-line shader
- a staged loader and terminal-style boot sequence
- OS-style windows for About, Resume and Contact
- a fullscreen project directory and case-study system
- real static routes for every section and project
- English / Italian interface support
- custom cursor behaviour on fine-pointer devices
- touch-specific interaction and rendering paths
- responsive safe zones for curved CRT edges, notches and mobile browser UI
- consent-first analytics support
- reduced-motion handling

The visual system is custom-built. No React, Vue or client-side UI framework is used.

---

## Stack

```text
Astro 7.3.4
HTML
CSS
Vanilla JavaScript
Three.js
GitHub Pages
GitHub Actions
Lighthouse
Playwright
```

Local development and CI require:

```text
Node.js >= 22
```

---

## Architecture

Astro is used as the static application shell.

```text
Astro
├── builds real static routes
├── generates page metadata
├── generates project URLs
├── generates sitemap.xml
└── renders the shared portfolio shell
        │
        └── Browser runtime
            ├── vanilla JavaScript
            ├── Three.js
            ├── CRT effects
            ├── window manager
            ├── History API routing
            ├── language system
            └── privacy / analytics controls
```

The final production output is still static HTML, CSS, JavaScript and assets.

There is no server runtime, database or client-side framework hydration.

---

## Project structure

```text
.
├── src/
│   ├── data/
│   │   └── routes.mjs
│   ├── layouts/
│   │   └── PortfolioShell.astro
│   └── pages/
│       ├── index.astro
│       ├── about/
│       │   └── index.astro
│       ├── resume/
│       │   └── index.astro
│       ├── contact/
│       │   └── index.astro
│       ├── work/
│       │   ├── index.astro
│       │   └── [slug].astro
│       ├── sitemap.xml.js
│       └── 404.astro
│
├── public/
│   ├── assets/
│   │   ├── cursors/
│   │   ├── favicon/
│   │   ├── font/
│   │   ├── images/
│   │   ├── models/
│   │   └── video/
│   ├── css/
│   ├── js/
│   ├── robots.txt
│   └── .nojekyll
│
├── astro.config.mjs
├── package.json
└── .github/
    └── workflows/
        ├── astro-build.yml
        ├── astro-pages.yml
        └── lighthouse-audit.yml
```

### Source of truth

The production Astro build uses:

```text
src/       page structure, route data and Astro templates
public/    CSS, JavaScript, fonts, images, video and 3D assets
```

Some pre-Astro static files still exist at repository root as migration / rollback copies. They are not the primary source for production.

---

## Routes

Every indexable section has a real static URL.

```text
/
├── about/
├── resume/
├── contact/
└── work/
    ├── tovadu/
    ├── pholia/
    ├── sapy/
    ├── platinum-technologies/
    └── colorcopy-large-format/
```

Astro generates these routes at build time.

Inside the interface, navigation still behaves like a desktop application: the History API updates the URL while windows and project views open without a conventional page reload.

Direct visits to a route render the full CRT shell and open the requested section automatically.

Legacy hash URLs are migrated by the runtime router.

---

## Project data

Route metadata is centralized in:

```text
src/data/routes.mjs
```

Project pages are generated from:

```text
src/pages/work/[slug].astro
```

Current project routes:

```text
TOVADÙ
PHOLIÀ
SAPY
PLATINUM TECHNOLOGIES
COLORCOPY LARGE FORMAT
```

Interactive case-study content is rendered by the portfolio runtime under `public/js/`.

---

## Runtime

The main browser-side systems live in:

```text
public/js/
├── boot.js
├── content.js
├── portfolio.js
├── fixes.js
├── head3d.js
├── head-scan-effect.js
├── crt.js
├── i18n.js
├── privacy.js
├── analytics.js
└── cursor.js
```

### Boot flow

The first visit uses a resource-aware loader followed by a short terminal-style boot sequence.

The critical path is intentionally separated from decorative rendering:

```text
page shell
→ fonts / interface
→ ready state
→ user enters
→ site reveal
→ deferred CRT / 3D work on touch devices
```

On mobile, expensive Three.js initialization is kept out of the click-to-interface transition.

A dedicated Playwright CI check measures this path separately from Lighthouse.

Latest verified touch-entry sample:

```text
CLICK → site-entering   1.082 s
CLICK → site-ready      1.847 s
post-click long tasks   0
```

This metric is intentionally separate from Lighthouse because standard Lighthouse does not reproduce the full interactive entry flow.

---

## Three.js head

The 3D head uses:

```text
Three.js
GLTFLoader
custom contour-line shader
procedural iridescent colour flow
adaptive frame pacing
pixel-budget-based resolution
touch fallback interaction
```

The model is loaded from:

```text
public/assets/models/human_head_reference3.glb
```

Desktop and touch devices use different rendering budgets.

Current touch profile:

```text
max render pixels   1,400,000
max DPR             1.25
target frame rate   30 fps
antialiasing        enabled
```

The mobile profile prioritizes image quality while keeping GPU cost bounded and leaving the initial UI transition free of heavy WebGL work.

---

## CRT and responsive geometry

The CRT is treated as a physical display surface rather than a standard rectangular viewport.

The screen itself always fills the available CRT area. Interactive content is then placed inside a protected inner region.

The canonical responsive geometry is maintained in:

```text
public/css/crt-outline.css
```

It accounts for:

```text
CRT curvature
device safe-area insets
notches / Dynamic Island
home indicator
mobile browser chrome
short landscape layouts
very narrow phones
fullscreen windows
scroll clearance
language / privacy controls
desktop launcher spacing
project and case-study overflow
```

Fullscreen surfaces such as windows and Projects paint edge-to-edge inside the CRT; only their interactive content respects the internal safe zone.

---

## Performance strategy

The project intentionally avoids a heavy SPA architecture.

Key decisions:

```text
Astro static output
no React / Vue hydration
vanilla JavaScript interactions
deferred decorative rendering
30 fps touch 3D target
adaptive GPU pixel budgets
reduced rendering while hidden
deferred project image decoding
lazy CRT / Three.js startup
prefers-reduced-motion support
```

The production site is small and most runtime cost comes from visual effects rather than application logic.

### Latest Lighthouse sample

Verified after the current mobile 3D quality update on 25 September 2026:

| Metric | Mobile | Desktop |
| --- | ---: | ---: |
| Performance | **92** | **97** |
| Accessibility | **100** | **100** |
| Best Practices | **100** | **100** |
| SEO | **100** | **100** |
| FCP | 1.2 s | 0.3 s |
| LCP | 1.8 s | 0.4 s |
| Speed Index | 4.1 s | 0.3 s |
| TBT | 100 ms | 0 ms |
| CLS | 0.133 | 0.110 |
| TTI | 1.8 s | 0.4 s |
| Transfer size | 122 KiB | 122 KiB |

Lighthouse scores can vary between CI runs. The main remaining measurable issue is CLS; the interactive entry flow is monitored separately because it is not represented well by the standard Lighthouse score.

---

## SEO

Astro creates standalone HTML for every public route.

Each route can define:

```text
<title>
meta description
canonical URL
Open Graph metadata
Twitter metadata
JSON-LD
```

The sitemap is generated from the same route data used by the site.

Current public base:

```text
https://joemaserati-lab.github.io/portfolio-final/
```

Current Astro configuration:

```js
site: 'https://joemaserati-lab.github.io',
base: '/portfolio-final',
output: 'static',
trailingSlash: 'always'
```

When moving to a custom domain, `site`, `base`, canonical URLs and any hardcoded deployment paths must be reviewed together.

---

## Privacy and analytics

The interface includes a custom privacy / cookie control.

GA4 is consent-first and is not loaded until analytics consent is granted.

The analytics runtime currently contains a placeholder Measurement ID:

```text
G-XXXXXXXXXX
```

Therefore GA4 is intentionally inactive until a real Measurement ID is configured.

No advertising or profiling integration is required by the current portfolio runtime.

---

## Local development

Install dependencies:

```bash
npm install
```

Start Astro in development mode:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production output:

```bash
npm run preview
```

Astro writes the generated site to:

```text
dist/
```

---

## CI and deployment

Three GitHub Actions workflows protect the production build.

### Astro Build Check

```text
.github/workflows/astro-build.yml
```

Runs the static build and verifies that critical routes and assets are present in `dist/`.

The check covers:

```text
home
about
resume
contact
work index
all project routes
404
sitemap
portfolio runtime
CRT CSS
3D model
```

### GitHub Pages deployment

```text
.github/workflows/astro-pages.yml
```

Builds the latest `main` branch and publishes only:

```text
dist/
```

using the official GitHub Pages deployment actions.

### Performance audit

```text
.github/workflows/lighthouse-audit.yml
```

Runs after a successful Pages deployment and performs:

```text
Lighthouse mobile
Lighthouse desktop
performance summary
touch-device entry-flow measurement
post-click long-task detection
report artifact upload
```

---

## Adding a project

A new public project requires two layers.

First, add its route metadata to:

```text
src/data/routes.mjs
```

Then add its interactive content and media references to the portfolio runtime data under:

```text
public/js/
```

Astro will generate the static `/work/<slug>/` route through `src/pages/work/[slug].astro`.

Any new route should also be covered by the build verification workflow if it becomes part of the permanent public project set.

---

## Development rules

This project is intentionally sensitive to visual regressions because the interface depends on nested clipping, fixed CRT geometry, GPU effects and custom responsive behaviour.

Changes should preserve these principles:

```text
do not turn the site into a client-side SPA
do not introduce framework hydration without a measurable reason
keep decorative WebGL outside the critical interaction path
keep fullscreen surfaces separate from their internal safe zones
avoid duplicate responsive override systems
preserve direct-link routing and static SEO output
verify touch and desktop independently
measure interaction smoothness as well as Lighthouse
```

For responsive work, test at minimum:

```text
320 × 568
360 × 800
390 × 844
430 × 932
667 × 375
844 × 390
768 × 1024
1024 × 768
1366 × 768
1920 × 1080
2560 × 1440
```

---

## Current priorities

The Astro migration is complete and production is served from the generated static build.

Remaining technical work is primarily incremental:

```text
reduce CLS
consolidate remaining legacy CSS
complete final real-device QA
configure GA4 when required
switch metadata to the final custom domain
remove obsolete root-level migration copies after final validation
```

---

## Build philosophy

The project uses Astro to improve maintainability without changing the nature of the delivered website.

The target remains:

```text
static HTML
+ native CSS
+ vanilla JavaScript
+ Three.js where visually necessary
```

Astro is the build architecture, not the visual runtime.
