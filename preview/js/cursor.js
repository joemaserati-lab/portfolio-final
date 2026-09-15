(() => {
  const finePointer = matchMedia('(hover:hover) and (pointer:fine)');
  if (!finePointer.matches) return;

  const cursor = document.getElementById('pixelart-cursor') || document.createElement('div');
  cursor.id = 'pixelart-cursor';
  cursor.className = 'pixelart-cursor is-default';
  cursor.setAttribute('aria-hidden', 'true');
  if (!cursor.isConnected) document.body.appendChild(cursor);

  // Pixelarticons hotspots scaled from the original 32px grid to 80px (2.5x).
  const HOTSPOTS = {
    default: { x: 10, y: 2.5 },   // 4,1 -> x2.5
    pointer: { x: 30, y: 2.5 },   // 12,1 -> x2.5
    text:    { x: 40, y: 40 }     // 16,16 -> x2.5
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

  function draw(){
    raf = 0;
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
    if(!(target instanceof Element)) return 'default';
    if(target.closest(pointerSelector)) return 'pointer';
    if(target.closest(textInteractiveSelector)) return 'text';

    // Search only the nearest meaningful UI region, then test the real text rectangles inside it.
    const boundary = target.closest(textSearchBoundarySelector) || target;
    if(pointHitsText(boundary, px, py)) return 'text';
    return 'default';
  }

  document.addEventListener('pointermove', e => {
    if(e.pointerType && e.pointerType!=='mouse') return;
    x=e.clientX; y=e.clientY;
    setType(resolveType(e.target, x, y));
    cursor.classList.add('is-visible');
    schedule();
  }, {passive:true});

  document.addEventListener('pointerover', e => {
    setType(resolveType(e.target, e.clientX, e.clientY));
  }, {passive:true});

  document.documentElement.addEventListener('mouseleave', () => cursor.classList.remove('is-visible'));
  document.documentElement.addEventListener('mouseenter', () => cursor.classList.add('is-visible'));
  addEventListener('blur', () => cursor.classList.remove('is-visible'));
})();
