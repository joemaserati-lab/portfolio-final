(() => {
  let bg = document.getElementById('crt-bg');
  let fx = document.getElementById('crt-fx');
  const screen = document.getElementById('screen') || document.querySelector('.screen');
  if (!bg || !fx || !screen) return;

  const state = {
    preset: 'high',
    start: performance.now(),
    nextSync: performance.now() + 5000 + Math.random() * 7000,
    nextJitter: performance.now() + 900,
    reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
    frameHandle: 0,
    lastDraw: 0,
    largeSurface: false,
    contentOpen: false,
    backend: 'normal', renderer: '', lastDrawMs: 0,
    slowDraws: 0, slowIntervals: 0, lastTick: 0,
    surfaceResizes: 0
  };

  const PRESETS = {
    high:   { raster:.82, triad:.31, noise:.067, roll:.082, flicker:.024, jitter:.24, sync:1 },
    medium: { raster:.58, triad:.21, noise:.041, roll:.058, flicker:.015, jitter:.15, sync:.72 },
    low:    { raster:.34, triad:.10, noise:.021, roll:.031, flicker:.008, jitter:.07, sync:.35 },
    off:    { raster:0,   triad:0,   noise:0,    roll:0,    flicker:0,    jitter:0,   sync:0 }
  };

  function makeProgram(canvas, alpha, frag) {
    const gl = canvas.getContext('webgl', { antialias:false, alpha, premultipliedAlpha:false });
    if (!gl) return null;
    const vs = `attribute vec2 p; varying vec2 vUv; void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}`;
    const compile = (type, src) => {
      const sh=gl.createShader(type); gl.shaderSource(sh,src); gl.compileShader(sh);
      if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)) console.warn(gl.getShaderInfoLog(sh));
      return sh;
    };
    const pr=gl.createProgram(); gl.attachShader(pr,compile(gl.VERTEX_SHADER,vs)); gl.attachShader(pr,compile(gl.FRAGMENT_SHADER,frag)); gl.linkProgram(pr); gl.useProgram(pr);
    const b=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,b); gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
    const loc=gl.getAttribLocation(pr,'p'); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    return {gl,pr, uniforms:{
      r:gl.getUniformLocation(pr,'r'), t:gl.getUniformLocation(pr,'t'), raster:gl.getUniformLocation(pr,'uRaster'), triad:gl.getUniformLocation(pr,'uTriad'), noise:gl.getUniformLocation(pr,'uNoise'), roll:gl.getUniformLocation(pr,'uRoll')
    }};
  }

  const bgFrag = `precision mediump float; varying vec2 vUv; uniform vec2 r; uniform float t;
    float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);} 
    void main(){
      vec2 uv=vUv; vec2 q=uv-.5; q.x*=r.x/r.y; float d=length(q);
      float center=1.0-smoothstep(.0,.95,d);
      float n=h(floor(gl_FragCoord.xy/4.)+floor(t*7.));
      vec3 c=vec3(.012);
      c += vec3(.038) * pow(max(0.,1.-d*.82), 1.85) * (.78 + center*.22);
      c += (n-.5)*.008;
      gl_FragColor=vec4(c,1.);
    }`;

  const fxFrag = `precision mediump float; varying vec2 vUv; uniform vec2 r; uniform float t; uniform float uRaster,uTriad,uNoise,uRoll;
    float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);} 
    void main(){
      vec2 px=gl_FragCoord.xy;
      float scan=.5+.5*cos(px.y*3.14159265);
      float raster=(1.-scan)*uRaster*.17;
      float col=mod(floor(px.x),3.);
      vec3 triad=vec3(0.92);
      vec3 triadTint=(triad-vec3(.5))*uTriad*.06;
      float n=(h(floor(px/2.)+floor(t*24.))-.5)*uNoise;
      float y=fract(vUv.y + t*.048);
      float band=exp(-pow((y-.50)*15.,2.))*uRoll;
      vec3 c=vec3(raster*.18)+triadTint+vec3(n*.18)+vec3(.24)*band;
      float a=clamp(raster*.86+abs(n)*.34+band*.12+uTriad*.05,0.,.18);
      gl_FragColor=vec4(c,a);
    }`;

  // Delay WebGL context creation until the worker probe has completed. A
  // canvas with a main-thread context cannot be transferred to a worker.
  let bgP=null,fxP=null,worker=null,workerReady=false,workerBusy=false;
  let workerTransferred=false,fallbackStarted=false,workerInitTimer=0;
  let workerStats={backgroundPixels:0,overlayPixels:0};
  let workerScriptUrl=null;

  const PERFORMANCE = Object.freeze({
    largeSurfaceThreshold: 3000000,
    maxPixels: 1200000,
    largeMaxPixels: 800000,
    maxDpr: 1.0,
    normalFps: 30,
    largeFps: 24,
    contentFps: 12,
    // Software GL renders synchronously on the UI CPU. Retain the exact
    // shader formula while scaling pixel and frame work to available power.
    softwareMobile: {maxPixels: 90000, maxDpr: .65, fps: 6},
    softwareDesktop: {maxPixels: 240000, maxDpr: .65, fps: 10},
    strugglingMobile: {maxPixels: 180000, maxDpr: .80, fps: 12},
    strugglingDesktop: {maxPixels: 400000, maxDpr: .85, fps: 16}
  });

  const coarse = matchMedia('(pointer: coarse)').matches;
  function initializeMainRenderer() {
    bgP=makeProgram(bg,false,bgFrag);
    fxP=makeProgram(fx,true,fxFrag);
    if(!bgP || !fxP) return;
    fxP.gl.enable(fxP.gl.BLEND);
    fxP.gl.blendFunc(fxP.gl.SRC_ALPHA,fxP.gl.ONE);
    try {
      const gl=bgP.gl,ext=gl.getExtension('WEBGL_debug_renderer_info');
      state.renderer=String(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)||'':
        gl.getParameter(gl.RENDERER)||'');
      if(/swiftshader|llvmpipe|softpipe|software rasterizer/i.test(state.renderer))
        state.backend='software';
    } catch {}
  }
  function fallbackToMain(error) {
    if(fallbackStarted)return;
    fallbackStarted=true;
    clearTimeout(workerInitTimer);
    worker?.terminate();worker=null;workerReady=false;workerBusy=false;
    // A transferred canvas is irrevocable. Replace only its canvas DOM nodes,
    // retaining their IDs, attributes, class names and positioning.
    if(workerTransferred) {
      const restoredBg=bg.cloneNode(false),restoredFx=fx.cloneNode(false);
      bg.replaceWith(restoredBg);fx.replaceWith(restoredFx);
      bg=restoredBg;fx=restoredFx;workerTransferred=false;
    }
    workerStats={backgroundPixels:0,overlayPixels:0};
    if(error)console.warn('[CRT] Returning to main-thread WebGL:',error);
    initializeMainRenderer();
    resize();
  }
  function startWorker() {
    const canTransfer=typeof Worker==='function'&&
      typeof bg.transferControlToOffscreen==='function'&&
      typeof fx.transferControlToOffscreen==='function'&&
      /(?:Chrome|Chromium|Edg)\//.test(navigator.userAgent);
    if(!canTransfer){initializeMainRenderer();return;}
    try {
      workerScriptUrl=new URL('./crt-render-worker.js',document.currentScript.src);
      workerScriptUrl.searchParams.set('v',window.PORTFOLIO_ASSET_VERSION||'2.0.21');
      worker=new Worker(workerScriptUrl,{type:'module'});
      workerInitTimer=setTimeout(()=>fallbackToMain('Worker initialization timed out'),15000);
      worker.onerror=e=>fallbackToMain(e.message||'Worker error');
      worker.onmessage=event=>{
        const d=event.data||{};
        if(fallbackStarted)return;
        if(d.type==='probe') {
          if(!d.supported){fallbackToMain('OffscreenCanvas WebGL unavailable');return;}
          try {
            const bgSurface=bg.transferControlToOffscreen();
            const fxSurface=fx.transferControlToOffscreen();
            workerTransferred=true;
            worker.postMessage({
              type:'init',bg:bgSurface,fx:fxSurface,bgFrag,fxFrag
            },[bgSurface,fxSurface]);
          } catch(error){fallbackToMain(error);}
        } else if(d.type==='ready') {
          clearTimeout(workerInitTimer);
          workerReady=true;
          state.backend=d.stats.backend;
          state.renderer=d.stats.renderer;
          resize();
        } else if(d.type==='resized'||d.type==='drawn') {
          workerStats=d.stats;
          state.lastDrawMs=d.stats.lastDrawMs;
          state.surfaceResizes=d.stats.surfaceResizes;
          if(d.type==='drawn')workerBusy=false;
        } else if(d.type==='error')fallbackToMain(d.message);
      };
      worker.postMessage({type:'probe'});
    } catch(error){fallbackToMain(error);}
  }
  const profile = () => state.backend === 'software'
    ? PERFORMANCE[coarse ? 'softwareMobile' : 'softwareDesktop']
    : state.backend === 'struggling'
      ? PERFORMANCE[coarse ? 'strugglingMobile' : 'strugglingDesktop']
      : null;
  function enterConstrainedMode() {
    if (state.backend !== 'normal') return;
    state.backend='struggling';
    // Defer allocation until the current frame has finished.
    queueMicrotask(resize);
  }

  function currentFps(){
    const effective=profile();
    if(effective) return effective.fps;
    if(state.contentOpen) return PERFORMANCE.contentFps;
    return state.largeSurface ? PERFORMANCE.largeFps : PERFORMANCE.normalFps;
  }

  function resizeOne(canvas, P, width, height, maxPixels, maxDpr){
    const nativeDpr=Math.min(devicePixelRatio||1,maxDpr);
    const budgetDpr=Math.sqrt(maxPixels/Math.max(1,width*height));
    const dpr=Math.max(0.12,Math.min(nativeDpr,budgetDpr));
    const nextW=Math.max(1,Math.round(width*dpr));
    const nextH=Math.max(1,Math.round(height*dpr));
    // Setting unchanged canvas dimensions resets WebGL buffers and can
    // incur expensive software-GPU reallocation.
    if(P.lastW===nextW && P.lastH===nextH) return false;
    canvas.width=nextW; canvas.height=nextH;
    P.lastW=nextW;P.lastH=nextH;
    state.surfaceResizes++;
    P.gl.viewport(0,0,nextW,nextH);
    P.gl.useProgram(P.pr);
    P.gl.uniform2f(P.uniforms.r,nextW,nextH);
    return true;
  }
  function resize(){
    const width=Math.max(screen.clientWidth,1), height=Math.max(screen.clientHeight,1);
    const estimated=width*height*Math.pow(Math.min(devicePixelRatio||1,1.5),2);
    state.largeSurface=estimated>PERFORMANCE.largeSurfaceThreshold;
    const runtime=profile();
    const maxPixels=runtime?.maxPixels ||
      (state.largeSurface?PERFORMANCE.largeMaxPixels:PERFORMANCE.maxPixels);
    const maxDpr=runtime?.maxDpr || PERFORMANCE.maxDpr;
    document.body.classList.toggle('perf-crt-large',state.largeSurface);
    document.body.classList.toggle(
      'perf-large-surface',
      document.body.classList.contains('perf-head-large') ||
      document.body.classList.contains('perf-crt-large') ||
      document.body.classList.contains('perf-constrained')
    );
    if(workerReady) {
      worker?.postMessage({type:'resize',width,height,maxPixels,maxDpr,
        dpr:devicePixelRatio||1});
      return;
    }
    if(!bgP || !fxP)return;
    const bgChanged=resizeOne(bg,bgP,width,height,maxPixels,maxDpr);
    const fxChanged=resizeOne(fx,fxP,width,height,maxPixels,maxDpr);
    if(bgChanged || fxChanged) state.lastDraw=0;
  }
  addEventListener('resize',resize,{passive:true});
  if('ResizeObserver' in window) new ResizeObserver(resize).observe(screen);
  startWorker();
  resize();

  function setPreset(name){
    state.preset=name; document.body.classList.remove('fx-medium','fx-low','fx-off');
    if(name==='medium')document.body.classList.add('fx-medium'); if(name==='low')document.body.classList.add('fx-low'); if(name==='off')document.body.classList.add('fx-off');
  }
  window.CRT = {
    setPreset, getPreset:()=>state.preset, presets:['high','medium','low','off'],
    getRenderStats:()=>({
      backend:state.backend, renderer:state.renderer,
      execution:workerReady?'worker':'main',
      fpsBudget:currentFps(), lastDrawMs:state.lastDrawMs,
      backgroundPixels:workerReady?workerStats.backgroundPixels:bg.width*bg.height,
      overlayPixels:workerReady?workerStats.overlayPixels:fx.width*fx.height,
      surfaceResizes:state.surfaceResizes
    })
  };
  if(state.reduced) setPreset('low');

  function syncHit(now,p){
    if(!p.sync || state.reduced || now < state.nextSync) return;
    state.nextSync=now+6500+Math.random()*11000;
    if(Math.random() > p.sync) return;
    screen.style.setProperty('--sync-y',`${22+Math.random()*56}%`); screen.classList.add('crt-sync-hit');
    setTimeout(()=>screen.classList.remove('crt-sync-hit'),35+Math.random()*40);
  }

  function draw(now){
    const begin=performance.now();
    const t=(now-state.start)/1000, p=PRESETS[state.preset];
    if(workerReady && !workerBusy) {
      // At most one software-GPU draw can be queued. Slow CRT rendering never
      // backs up input, scrolling or the main animation thread.
      workerBusy=true;
      worker.postMessage({type:'draw',time:t,p:{
        raster:p.raster,triad:p.triad,noise:p.noise,roll:p.roll
      }});
    } else if(bgP && fxP) {
      for(const P of [bgP,fxP]){P.gl.useProgram(P.pr);P.gl.uniform1f(P.uniforms.t,t);}
      fxP.gl.uniform1f(fxP.uniforms.raster,p.raster); fxP.gl.uniform1f(fxP.uniforms.triad,p.triad); fxP.gl.uniform1f(fxP.uniforms.noise,p.noise); fxP.gl.uniform1f(fxP.uniforms.roll,p.roll);
      bgP.gl.drawArrays(bgP.gl.TRIANGLES,0,6); fxP.gl.clearColor(0,0,0,0); fxP.gl.clear(fxP.gl.COLOR_BUFFER_BIT); fxP.gl.drawArrays(fxP.gl.TRIANGLES,0,6);
    }

    if(!state.reduced && now>state.nextJitter){ state.nextJitter=now+500+Math.random()*900; }
    const flick = 1 - p.flicker*(.35+.65*Math.abs(Math.sin(t*16.1)+Math.sin(t*3.2))*.5);
    screen.style.setProperty('--crt-brightness',flick.toFixed(4));
    syncHit(now,p);
    if(!workerReady)state.lastDrawMs=performance.now()-begin;
    if(!workerReady && state.backend==='normal') {
      if(state.lastDrawMs>=75) state.slowDraws++;
      else state.slowDraws=Math.max(0,state.slowDraws-1);
      if(state.slowDraws>=2) enterConstrainedMode();
    }
  }

  function animate(now){
    if (state.caseOpen) { state.frameHandle = 0; return; }
    state.frameHandle = requestAnimationFrame(animate);
    if(document.hidden || state.caseOpen) return;
    const frameMs=1000/currentFps();
    // React to sustained long rAF intervals when the GL vendor string is
    // unavailable (for example, a browser hiding software rasterizer info).
    if(state.backend==='normal' && state.lastTick) {
      if(now-state.lastTick>Math.max(110,frameMs*2.8)) state.slowIntervals++;
      else state.slowIntervals=Math.max(0,state.slowIntervals-1);
      if(state.slowIntervals>=4) enterConstrainedMode();
    }
    state.lastTick=now;
    if(!state.lastDraw || now - state.lastDraw >= frameMs - 1.0){
      state.lastDraw = now;
      draw(now);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if(document.hidden || state.caseOpen) return;
    state.lastDraw = 0;
    draw(performance.now());
  }, {passive:true});

  const syncContentState=()=>{
    state.contentOpen=document.body.classList.contains('content-panel-open') || document.body.classList.contains('projects-open');
    state.caseOpen = document.body.classList.contains('project-case-open');
    const video = document.querySelector('.crt-background-video');
    if (state.caseOpen) {
      cancelAnimationFrame(state.frameHandle);
      state.frameHandle = 0;
      if (video && !video.paused) { video.dataset.resumeAfterCase = '1'; video.pause(); }
    } else {
      if (!state.frameHandle) state.frameHandle = requestAnimationFrame(animate);
      if (video?.dataset.resumeAfterCase) { delete video.dataset.resumeAfterCase; video.play().catch(() => {}); }
    }
    state.lastDraw=0;
  };
  new MutationObserver(syncContentState).observe(document.body,{attributes:true,attributeFilter:['class']});
  syncContentState();

  if (!state.frameHandle && !state.caseOpen) state.frameHandle = requestAnimationFrame(animate);
})();
