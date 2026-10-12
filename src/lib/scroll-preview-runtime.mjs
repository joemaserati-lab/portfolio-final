import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
function replace(source, from, to) {
  if (!source.includes(from)) throw new Error(`Scroll adapter: upstream hook changed: ${from.slice(0, 60)}`);
  return source.replace(from, to);
}
export function runtime(name, base) {
  let source = readFileSync(resolve(process.cwd(), `public/js/${{boot:'boot',portfolio:'portfolio',head:'head3d',effect:'head-scan-effect'}[name]}.js`), 'utf8');
  if (name === 'effect') {
    source = replace(source, 'touchMaxPixels: 1400000', 'touchMaxPixels: 2200000');
    source = replace(source, 'touchMaxDpr: 1.25', 'touchMaxDpr: 2');
    source = replace(source, '  let fitX = 1, fitY = 1;', '  let fitX = 1, fitY = 1;\n  let scrollYaw = null, presentationScale = 1;');
    source = replace(source, '    root.rotation.y += (pointer.x * PRESET.mouseAmount - root.rotation.y) * ease;', `    if (scrollYaw !== null) root.rotation.set(-0.015, reducedMotion ? 0 : scrollYaw, 0);
    else root.rotation.y += (pointer.x * PRESET.mouseAmount - root.rotation.y) * ease;`);
    source = replace(source, '    root.rotation.x += ((pointer.y * PRESET.mouseAmount * 0.40 - 0.015) - root.rotation.x) * ease;', '    if (scrollYaw === null) root.rotation.x += ((pointer.y * PRESET.mouseAmount * 0.40 - 0.015) - root.rotation.x) * ease;');
    source = replace(source, '    setPointer(x, y) {', `    setScrollRotation(value) {
      if (scrollYaw === value) return;
      scrollYaw = value;
      if (value !== null) root.rotation.set(-0.015, reducedMotion ? 0 : value, 0);
      if (!raf && !paused) refresh();
    },
    setPresentationScale(value) {
      if (Math.abs(value - presentationScale) < .001) return;
      presentationScale = value; resize();
    },
    setPointer(x, y) {
      if (scrollYaw !== null) return;`);
    source = replace(source, 'const nativeDpr = Math.min(devicePixelRatio || 1, maxDpr);', 'const nativeDpr = Math.min(devicePixelRatio || 1, maxDpr) * presentationScale;');
    source = replace(source, 'const pixelRatio = Math.max(0.38, Math.min(nativeDpr, budgetDpr));', 'const pixelRatio = Math.max(0.05, Math.min(nativeDpr, budgetDpr));');
    return source;
  }
  if (name === 'boot') {
    source = replace(source, "const headReady = Promise.resolve({ ok: true, gated: true });", "const headReady = touchDevice ? Promise.all([trackedDomReady, trackedFontsReady]).then(() => loadHead()) : Promise.resolve({ ok: true, gated: true });");
    source = replace(source, "loadScript('js/portfolio.js')", "loadScript('scroll-preview/runtime/portfolio.js')");
    return replace(source, "new URL('js/head3d.js', document.baseURI)", "new URL('scroll-preview/runtime/head.js', document.baseURI)");
  }
  if (name === 'head') {
    source = replace(source, 'requestAnimationFrame(() => effect?.setPaused(true));', 'requestAnimationFrame(sync);');
    source = replace(source, "'../assets/models/human_head_reference3.glb'", `'${base}assets/models/human_head_reference3.glb'`);
    source = replace(source, "from './head-scan-effect.js'", `from '${base}scroll-preview/runtime/effect.js'`);
    source = replace(source, "feature.classList.toggle('is-window-open', windowOpen);", "// The portrait remains present on the scroll route, including project cases.");
    source = replace(source, 'effect.setPaused(!shouldBeVisible || windowOpen);', 'effect.setPaused(!shouldBeVisible);');
    source = replace(source, '  function onPointerMove(event) {', `  function onScrollPose(event) {
    effect?.setScrollRotation(event.detail.yaw);
    effect?.setPresentationScale(event.detail.renderScale);
  }
  addEventListener('portfolio:scroll-pose', onScrollPose);
  function onPointerMove(event) {`);
    source = replace(source, '      getStatus: getMotionStatus,', '      getStatus: getMotionStatus,\n      getPose: () => ({ yaw: effect?.root.rotation.y, pitch: effect?.root.rotation.x }),');
    source = replace(source, '    observer?.disconnect();', "    removeEventListener('portfolio:scroll-pose', onScrollPose);\n    observer?.disconnect();");
    return source;
  }
  source = source.replaceAll("document.querySelectorAll('.os-window", "document.querySelectorAll('#window-layer .os-window").replaceAll("document.querySelector('.os-window')", "document.querySelector('#window-layer .os-window')");
  source = replace(source, "const BASE_URL = new URL('../', SCRIPT_URL);", 'const BASE_URL = new URL(document.baseURI);');
  source = replace(source, '    const path = normalizeLocalPath();', `    const hash = location.hash.slice(1);
    if (hash.startsWith('project=')) return {type:'project',slug:decodeURIComponent(hash.slice(8))};
    if (hash === 'resume') return {type:'section',kind:'resume'};
    return {type:'home'};
    const path = normalizeLocalPath();`);
  source = replace(source, '    return `${BASE_PATH}${relative}`;', "    const hash = route.type==='project' ? `project=${encodeURIComponent(route.slug)}` : route.type==='section' ? route.kind : route.type==='work' ? 'work' : 'home';\n    return `${BASE_PATH}scroll-preview/#${hash}`;");
  source = replace(source, '    openLauncher(el.dataset.open);', `    if (el.dataset.open === 'resume') openLauncher('resume');
    else window.dispatchEvent(new CustomEvent('portfolio:scroll-to', {detail: el.dataset.open === 'projects' ? 'work' : el.dataset.open}));`);
  source = replace(source, "    if(!openProjectsView()) return false;\n    projectsView.classList.remove('case-mode');", "    closeProjectsView();\n    window.dispatchEvent(new CustomEvent('portfolio:scroll-to', {detail:'work'}));\n    return true;\n    projectsView.classList.remove('case-mode');");
  source = replace(source, '    if(back) returnToRoute(target);\n    else commitRoute(target);\n  }\n\n  function openLauncher', "    commitRoute(target,{replace:true});\n    window.dispatchEvent(new CustomEvent('portfolio:scroll-return'));\n  }\n\n  function openLauncher");
  source = replace(source, "  addEventListener('popstate',route);", "  addEventListener('popstate',()=>route());");
  source = replace(source, '  onReady();', `  window.ScrollPortfolio = {
    content: kind => contents[kind === 'work' ? 'projects' : kind](),
    openProject: slug => navigateToProject(slug),
    close: () => { closeProjectsView(); clearWindowsExcept(); },
    refresh: syncLocalizedData
  };
  dispatchEvent(new CustomEvent('portfolio:scroll-runtime'));
  onReady();`);
  return source;
}
