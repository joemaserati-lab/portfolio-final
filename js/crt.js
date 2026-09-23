(() => {
  const bg = document.getElementById('crt-bg');
  const fx = document.getElementById('crt-fx');
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
    contentOpen: false
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
      vec3 c=vec3(.015,.0005,.009);
      c += vec3(.062,.003,.036) * pow(max(0.,1.-d*.82), 1.85) * (.78 + center*.22);
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
      vec3 triad=col<1.?vec3(1.,.03,.58):(col<2.?vec3(1.,.18,.78):vec3(.86,.02,.92));
      vec3 triadTint=(triad-vec3(.5))*uTriad*.06;
      float n=(h(floor(px/2.)+floor(t*24.))-.5)*uNoise;
      float y=fract(vUv.y + t*.048);
      float band=exp(-pow((y-.50)*15.,2.))*uRoll;
      vec3 c=vec3(raster*.24,.01*raster*.24,.14*raster*.24)+triadTint+vec3(n*.24,n*.04,n*.16)+vec3(.46,.015,.27)*band;
      float a=clamp(raster*.86+abs(n)*.34+band*.12+uTriad*.05,0.,.18);
      gl_FragColor=vec4(c,a);
    }`;

  const bgP=makeProgram(bg,false,bgFrag), fxP=makeProgram(fx,true,fxFrag);
  if (!bgP || !fxP) return;
  fxP.gl.enable(fxP.gl.BLEND); fxP.gl.blendFunc(fxP.gl.SRC_ALPHA,fxP.gl.ONE);

  const PERFORMANCE = Object.freeze({
    largeSurfaceThreshold: 3000000,
    maxPixels: 1500000,
    largeMaxPixels: 1000000,
    maxDpr: 1.0,
    normalFps: 30,
    largeFps: 24,
    contentFps: 12
  });

  function currentFps(){
    if(state.contentOpen) return PERFORMANCE.contentFps;
    return state.largeSurface ? PERFORMANCE.largeFps : PERFORMANCE.normalFps;
  }

  function resizeOne(canvas, P, width, height, maxPixels){
    const nativeDpr=Math.min(devicePixelRatio||1,PERFORMANCE.maxDpr);
    const budgetDpr=Math.sqrt(maxPixels/Math.max(1,width*height));
    const dpr=Math.max(0.34,Math.min(nativeDpr,budgetDpr));
    canvas.width=Math.max(1,Math.round(width*dpr)); canvas.height=Math.max(1,Math.round(height*dpr));
    P.gl.viewport(0,0,canvas.width,canvas.height); P.gl.useProgram(P.pr); P.gl.uniform2f(P.uniforms.r,canvas.width,canvas.height);
  }
  function resize(){
    const width=Math.max(screen.clientWidth,1), height=Math.max(screen.clientHeight,1);
    const estimated=width*height*Math.pow(Math.min(devicePixelRatio||1,1.5),2);
    state.largeSurface=estimated>PERFORMANCE.largeSurfaceThreshold;
    const maxPixels=state.largeSurface?PERFORMANCE.largeMaxPixels:PERFORMANCE.maxPixels;
    document.body.classList.toggle('perf-crt-large',state.largeSurface);
    document.body.classList.toggle(
      'perf-large-surface',
      document.body.classList.contains('perf-head-large') ||
      document.body.classList.contains('perf-crt-large') ||
      document.body.classList.contains('perf-constrained')
    );
    resizeOne(bg,bgP,width,height,maxPixels); resizeOne(fx,fxP,width,height,maxPixels);
    state.lastDraw=0;
  }
  addEventListener('resize',resize,{passive:true});
  if('ResizeObserver' in window) new ResizeObserver(resize).observe(screen);
  resize();

  function setPreset(name){
    state.preset=name; document.body.classList.remove('fx-medium','fx-low','fx-off');
    if(name==='medium')document.body.classList.add('fx-medium'); if(name==='low')document.body.classList.add('fx-low'); if(name==='off')document.body.classList.add('fx-off');
  }
  window.CRT = { setPreset, getPreset:()=>state.preset, presets:['high','medium','low','off'] };
  if(state.reduced) setPreset('low');

  function syncHit(now,p){
    if(!p.sync || state.reduced || now < state.nextSync) return;
    state.nextSync=now+6500+Math.random()*11000;
    if(Math.random() > p.sync) return;
    screen.style.setProperty('--sync-y',`${22+Math.random()*56}%`); screen.classList.add('crt-sync-hit');
    setTimeout(()=>screen.classList.remove('crt-sync-hit'),35+Math.random()*40);
  }

  function draw(now){
    const t=(now-state.start)/1000, p=PRESETS[state.preset];
    for(const P of [bgP,fxP]){P.gl.useProgram(P.pr);P.gl.uniform1f(P.uniforms.t,t);}
    fxP.gl.uniform1f(fxP.uniforms.raster,p.raster); fxP.gl.uniform1f(fxP.uniforms.triad,p.triad); fxP.gl.uniform1f(fxP.uniforms.noise,p.noise); fxP.gl.uniform1f(fxP.uniforms.roll,p.roll);
    bgP.gl.drawArrays(bgP.gl.TRIANGLES,0,6); fxP.gl.clearColor(0,0,0,0); fxP.gl.clear(fxP.gl.COLOR_BUFFER_BIT); fxP.gl.drawArrays(fxP.gl.TRIANGLES,0,6);

    if(!state.reduced && now>state.nextJitter){ state.nextJitter=now+500+Math.random()*900; }
    const flick = 1 - p.flicker*(.35+.65*Math.abs(Math.sin(t*16.1)+Math.sin(t*3.2))*.5);
    screen.style.setProperty('--crt-brightness',flick.toFixed(4));
    syncHit(now,p);
  }

  function animate(now){
    state.frameHandle = requestAnimationFrame(animate);
    if(document.hidden) return;
    const frameMs=1000/currentFps();
    if(!state.lastDraw || now - state.lastDraw >= frameMs - 1.0){
      state.lastDraw = now;
      draw(now);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if(document.hidden) return;
    state.lastDraw = 0;
    draw(performance.now());
  }, {passive:true});

  const syncContentState=()=>{
    state.contentOpen=document.body.classList.contains('content-panel-open') || document.body.classList.contains('projects-open');
    state.lastDraw=0;
  };
  new MutationObserver(syncContentState).observe(document.body,{attributes:true,attributeFilter:['class']});
  syncContentState();

  state.frameHandle = requestAnimationFrame(animate);
})();
