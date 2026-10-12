const home = document.querySelector('.sp-home');
const stage = document.querySelector('.sp-stage');
const links = [...document.querySelectorAll('.sp-index a')];
const sections = links.map(link => document.querySelector(link.hash));
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const mobile = matchMedia('(max-width: 767px)');
let effect, frame, scrambleFrame, active = 0;

function setActive(index) {
  if (index === active) return;
  cancelAnimationFrame(scrambleFrame);
  links.forEach((link, i) => {
    link.toggleAttribute('aria-current', i === index);
    if (i === index) link.setAttribute('aria-current', 'location');
    link.querySelector('.sp-label').textContent = link.querySelector('.sp-label').dataset.label;
  });
  active = index;
  if (reduced.matches) return;
  const label = links[index].querySelector('.sp-label');
  const value = label.dataset.label;
  const start = performance.now();
  function tick(now) {
    const progress = Math.min(1, (now - start) / 240);
    label.textContent = [...value].map((char, i) => char === ' ' || i < progress * value.length ? char : '·/—'[Math.floor((now / 45 + i) % 3)]).join('');
    if (progress < 1) scrambleFrame = requestAnimationFrame(tick);
  }
  scrambleFrame = requestAnimationFrame(tick);
}
function update() {
  frame = null;
  const rect = home.getBoundingClientRect();
  const distance = home.offsetHeight - stage.offsetHeight;
  const progress = !reduced.matches && !mobile.matches && distance > 0 ? Math.max(0, Math.min(1, -rect.top / distance)) : 0;
  stage.style.setProperty('--sp-progress', progress.toFixed(4));
  stage.style.setProperty('--sp-hero-events', progress > .7 ? 'none' : 'auto');
  document.querySelector('.sp-hero-copy').inert = progress > .7;
  let index = 0;
  sections.forEach((section, i) => { if (section.getBoundingClientRect().top <= innerHeight * .45) index = i; });
  if (innerHeight + scrollY >= document.documentElement.scrollHeight - 4) index = sections.length - 1;
  setActive(index);
  effect?.setPaused(document.hidden || rect.bottom <= 0 || rect.top >= innerHeight || progress >= .98);
}
function schedule() { if (!frame) frame = requestAnimationFrame(update); }
addEventListener('scroll', schedule, { passive: true });
addEventListener('resize', schedule, { passive: true });
document.addEventListener('visibilitychange', schedule);
reduced.addEventListener('change', () => { effect?.setReducedMotion(reduced.matches); schedule(); });
mobile.addEventListener('change', schedule);
document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
  const target = document.querySelector(link.hash);
  if (!target) return;
  event.preventDefault();
  history.pushState(null, '', link.hash);
  target.scrollIntoView({ behavior: reduced.matches || mobile.matches ? 'instant' : 'smooth', block: 'start' });
  target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
}));
addEventListener('popstate', () => { document.getElementById(location.hash.slice(1) || 'sp-home')?.scrollIntoView(); });
document.querySelectorAll('.sp-project').forEach(link => link.addEventListener('click', event => {
  if (!matchMedia('(hover: none)').matches || reduced.matches || event.detail === 0 || event.metaKey || event.ctrlKey) return;
  event.preventDefault();
  link.classList.add('sp-color');
  setTimeout(() => { location.href = link.href; }, 280);
}));
update();
// Reuse the production portrait renderer; no production lifecycle globals are installed.
const head = document.querySelector('.sp-head');
import('./head-scan-effect.js').then(({ mountHeadScanEffect }) => {
  effect = mountHeadScanEffect({ container: head, canvas: head.querySelector('canvas'), modelUrl: new URL('../assets/models/human_head_reference3.glb', import.meta.url).href, reducedMotion: reduced.matches, onError: () => head.classList.remove('is-ready') });
  effect.ready.then(() => { if (!effect.disposed) head.classList.add('is-ready'); schedule(); }).catch(() => {});
  addEventListener('pointermove', event => effect?.setPointer(event.clientX / innerWidth * 2 - 1, event.clientY / innerHeight * 2 - 1), { passive: true });
}).catch(() => {});
addEventListener('pagehide', event => { if (event.persisted) effect?.setPaused(true); else effect?.destroy(); });
addEventListener('pageshow', schedule);
