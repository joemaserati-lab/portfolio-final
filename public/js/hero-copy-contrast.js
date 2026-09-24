(() => {
  const copy = document.querySelector('.hero-copy');
  const feature = document.getElementById('crt-head-feature');
  const desktop = document.getElementById('desktop');
  const windowLayer = document.getElementById('window-layer');
  const projectsView = document.getElementById('projects-view');
  if (!copy || !feature) return;

  const coarsePointer = matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
  let frame = 0;
  let active = false;

  const style = document.createElement('style');
  style.textContent = `
    .hero-copy {
      transition: background-color .18s ease, box-shadow .18s ease;
    }
    .hero-copy.is-over-head {
      background: rgba(5, 3, 8, .68) !important;
      box-shadow: 0 0 0 8px rgba(5, 3, 8, .68) !important;
    }
    @media (max-width: 720px) {
      .hero-copy.is-over-head {
        background: rgba(5, 3, 8, .74) !important;
        box-shadow: 0 0 0 6px rgba(5, 3, 8, .74) !important;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .hero-copy { transition: none; }
    }
  `;
  document.head.append(style);

  function getHeadZone() {
    const rect = feature.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;

    // The WebGL canvas spans a large transparent area. Use a tighter central
    // zone matching the visible head instead of the whole canvas rectangle.
    const zoneHeight = rect.height * (coarsePointer ? 0.82 : 0.84);
    const zoneWidth = Math.min(
      rect.width * (coarsePointer ? 0.68 : 0.72),
      zoneHeight * (coarsePointer ? 0.74 : 0.78)
    );
    const centerX = rect.left + rect.width * 0.5;
    const centerY = rect.top + rect.height * (coarsePointer ? 0.49 : 0.50);

    return {
      left: centerX - zoneWidth * 0.5,
      right: centerX + zoneWidth * 0.5,
      top: centerY - zoneHeight * 0.5,
      bottom: centerY + zoneHeight * 0.5
    };
  }

  function intersects(copyRect, headRect) {
    const width = Math.max(0, Math.min(copyRect.right, headRect.right) - Math.max(copyRect.left, headRect.left));
    const height = Math.max(0, Math.min(copyRect.bottom, headRect.bottom) - Math.max(copyRect.top, headRect.top));
    if (!width || !height) return false;

    const copyArea = Math.max(copyRect.width * copyRect.height, 1);
    const overlapRatio = (width * height) / copyArea;

    // Small hysteresis keeps the backing from flickering around a breakpoint.
    return active
      ? width > 4 && height > 4 && overlapRatio > 0.003
      : width > 12 && height > 8 && overlapRatio > 0.01;
  }

  function update() {
    frame = 0;

    const windowOpen = Boolean(windowLayer?.querySelector('.os-window')) || Boolean(projectsView && !projectsView.hidden);
    const headVisible = feature.classList.contains('is-ready') && !feature.classList.contains('is-failed');
    const siteVisible = !document.body.classList.contains('booting');
    const headZone = headVisible && siteVisible && !windowOpen ? getHeadZone() : null;
    const next = Boolean(headZone && intersects(copy.getBoundingClientRect(), headZone));

    if (next === active) return;
    active = next;
    copy.classList.toggle('is-over-head', active);
  }

  function schedule() {
    if (!frame) frame = requestAnimationFrame(update);
  }

  const resizeObserver = 'ResizeObserver' in window ? new ResizeObserver(schedule) : null;
  resizeObserver?.observe(copy);
  resizeObserver?.observe(feature);
  if (desktop) resizeObserver?.observe(desktop);

  const stateObserver = new MutationObserver(schedule);
  stateObserver.observe(feature, { attributes: true, attributeFilter: ['class'] });
  stateObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  if (windowLayer) stateObserver.observe(windowLayer, { childList: true, subtree: true });
  if (projectsView) stateObserver.observe(projectsView, { attributes: true, attributeFilter: ['hidden'] });

  addEventListener('resize', schedule, { passive: true });
  addEventListener('orientationchange', schedule, { passive: true });
  addEventListener('portfolio:booted', schedule);
  addEventListener('portfolio:head-settled', schedule);
  document.fonts?.ready.then(schedule).catch(() => {});

  schedule();
})();
