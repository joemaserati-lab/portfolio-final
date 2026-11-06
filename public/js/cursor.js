(() => {
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
  if (!finePointer.matches) return;

  const cursor = document.getElementById('pixelart-cursor') || document.createElement('div');
  cursor.id = 'pixelart-cursor';
  cursor.className = 'pixelart-cursor is-default';
  cursor.setAttribute('aria-hidden', 'true');
  if (!cursor.isConnected) document.body.appendChild(cursor);

  const label = document.createElement('span');
  label.className = 'cursor-project-label';
  const glyph = document.createElement('span');
  glyph.className = 'cursor-project-glyph';
  glyph.textContent = '•';
  const caption = document.createElement('span');
  label.append(glyph, caption);
  cursor.replaceChildren(label);

  // Derive the three hotspots from the original 32px SVG grid and CSS size.
  const cursorSize = parseFloat(getComputedStyle(cursor).width) || 48;
  const scale = cursorSize / 32;
  const HOTSPOTS = {
    default: { x: 4 * scale, y: 1 * scale },
    pointer: { x: 12 * scale, y: 1 * scale },
    text: { x: 16 * scale, y: 16 * scale }
  };

  const pointerSelector = [
    'a', 'button', '[role="button"]', '[data-open]', '[data-command]',
    '.desktop-icon', '.project-tile-v2', '.window-controls button',
    '.terminal-toggle', '.case-back-v2', '.case-nav-v2 button',
    '.archive-project'
  ].join(',');

  const textInteractiveSelector = 'input:not([type="button"]):not([type="submit"]):not([type="reset"]),textarea,[contenteditable="true"]';
  const textSearchBoundarySelector = [
    '.window-body', '.window-titlebar', '.desktop', '.footerbar', '.terminal-panel',
    '.terminal-output', '.projects-index-v2', '.case-study-v2', '.boot-loader'
  ].join(',');

  let x = -200;
  let y = -200;
  let type = 'default';
  let raf = 0;
  let cover = null;
  let geometryDirty = true;
  let bounds;
  let labelWidth = 0;
  let labelHeight = 0;
  let retarget = false;

  function updateLabel(){
    caption.textContent = document.documentElement.lang === 'it' ? 'VEDI PROGETTO' : 'VIEW PROJECT';
    geometryDirty = true;
    schedule();
  }
  updateLabel();

  function setCover(next){
    if(next === cover) return;
    cover?.classList.remove('has-project-cursor');
    cover = next;
    cover?.classList.add('has-project-cursor');
  }

  function draw(){
    raf = 0;
    if(retarget){
      retarget = false;
      if(cursor.classList.contains('is-visible')) setType(resolveType(document.elementFromPoint(x, y)));
    }
    if(type === 'project'){
      if(geometryDirty){
        const screen = document.getElementById('screen');
        const rect = screen?.getBoundingClientRect();
        const insetX = Math.max(28, (rect?.width || innerWidth) * .04);
        const insetY = Math.max(28, (rect?.height || innerHeight) * .025);
        // Extra inset protects the rounded CRT corners, not just the viewport.
        bounds = {left: Math.max(0, rect?.left || 0) + insetX,
          top: Math.max(0, rect?.top || 0) + insetY,
          right: Math.min(innerWidth, rect?.right || innerWidth) - insetX,
          bottom: Math.min(innerHeight, rect?.bottom || innerHeight) - insetY};
        labelWidth = label.offsetWidth;
        labelHeight = label.offsetHeight;
        geometryDirty = false;
      }
      let left = x + 18;
      let top = y + 18;
      if(left + labelWidth > bounds.right) left = x - labelWidth - 18;
      if(top + labelHeight > bounds.bottom) top = y - labelHeight - 18;
      left = Math.max(bounds.left, Math.min(left, bounds.right - labelWidth));
      top = Math.max(bounds.top, Math.min(top, bounds.bottom - labelHeight));
      cursor.style.transform = `translate3d(${Math.round(left)}px,${Math.round(top)}px,0)`;
      return;
    }
    const h = HOTSPOTS[type];
    cursor.style.transform = `translate3d(${Math.round(x-h.x)}px,${Math.round(y-h.y)}px,0)`;
  }
  function schedule(){ if(!raf) raf=requestAnimationFrame(draw); }
  function setType(next){
    if(next===type) return;
    type=next;
    cursor.classList.toggle('is-default', type==='default');
    cursor.classList.toggle('is-pointer', type==='pointer');
    cursor.classList.toggle('is-text', type==='text');
    cursor.classList.toggle('is-project', type==='project');
    schedule();
  }

  // True only when the pointer is inside the rendered rectangle of actual text.
  // This deliberately avoids treating the padding/empty area of cards and windows as text.
  function pointHitsText(root, px, py){
    if(!root) return false;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node){
        if(!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        const parent = node.parentElement;
        if(!parent) return NodeFilter.FILTER_REJECT;
        if(parent.closest(pointerSelector)) return NodeFilter.FILTER_REJECT;
        const style = getComputedStyle(parent);
        if(style.display==='none' || style.visibility==='hidden' || style.opacity==='0') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const range = document.createRange();
    let node;
    let inspected = 0;
    while((node = walker.nextNode()) && inspected < 160){
      inspected++;
      range.selectNodeContents(node);
      for(const rect of range.getClientRects()){
        // Tiny tolerance keeps the cursor stable on antialiased glyph edges,
        // without expanding to the surrounding container area.
        if(px >= rect.left - 1 && px <= rect.right + 1 && py >= rect.top - 1 && py <= rect.bottom + 1){
          range.detach?.();
          return true;
        }
      }
    }
    range.detach?.();
    return false;
  }

  function resolveType(target, px=x, py=y){
    const nextCover = finePointer.matches && target instanceof Element
      ? target.closest('.project-tile-v2 .project-cover-v2') : null;
    setCover(nextCover);
    if(nextCover) return 'project';
    if(!(target instanceof Element)) return 'default';
    if(target.closest(pointerSelector)) return 'pointer';
    if(target.closest(textInteractiveSelector)) return 'text';

    // Search only the nearest meaningful UI region, then test the real text rectangles inside it.
    const boundary = target.closest(textSearchBoundarySelector) || target;
    if(pointHitsText(boundary, px, py)) return 'text';
    return 'default';
  }

  document.addEventListener('pointermove', e => {
    if(!finePointer.matches) return;
    if(e.pointerType && e.pointerType!=='mouse') return;
    x=e.clientX; y=e.clientY;
    setType(resolveType(e.target, x, y));
    cursor.classList.add('is-visible');
    schedule();
  }, {passive:true});

  document.addEventListener('pointerover', e => {
    if(!finePointer.matches) return;
    if(e.pointerType && e.pointerType!=='mouse') return;
    setType(resolveType(e.target, e.clientX, e.clientY));
  }, {passive:true});

  function hide(){
    cursor.classList.remove('is-visible');
    setCover(null);
    setType('default');
  }
  function refresh(){ geometryDirty = true; retarget = true; schedule(); }
  addEventListener('scroll', refresh, {passive:true, capture:true});
  addEventListener('resize', refresh, {passive:true});
  addEventListener('portfolio:langchange', () => { updateLabel(); refresh(); });
  addEventListener('portfolio:project-opened', hide);
  addEventListener('portfolio:project-closed', refresh);
  document.fonts?.ready.then(refresh);
  finePointer.addEventListener('change', hide);
  document.addEventListener('keydown', hide);
  document.documentElement.addEventListener('mouseleave', hide);
  document.documentElement.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));
  addEventListener('blur', hide);
})();
