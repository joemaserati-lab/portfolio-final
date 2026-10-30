// Dedicated CRT WebGL renderer: same vertex/fragment shaders and uniforms as
// the main-thread fallback. Only GL commands move off the UI thread.
let surfaces=null, programs=null, renderer='', backend='normal';
let resizes=0, backgroundPixels=0, overlayPixels=0, lastDrawMs=0;
function send(type, extra={}) { self.postMessage({type,...extra}); }
function makeProgram(canvas, alpha, frag) {
  const gl=canvas.getContext('webgl',{antialias:false,alpha,premultipliedAlpha:false});
  if(!gl) throw new Error('Offscreen WebGL unavailable');
  const vs='attribute vec2 p; varying vec2 vUv; void main(){vUv=p*.5+.5;gl_Position=vec4(p,0.,1.);}';
  function compile(type,src) {
    const sh=gl.createShader(type);
    gl.shaderSource(sh,src);gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))
      throw new Error(gl.getShaderInfoLog(sh)||'CRT shader compilation failed');
    return sh;
  }
  const pr=gl.createProgram();
  gl.attachShader(pr,compile(gl.VERTEX_SHADER,vs));
  gl.attachShader(pr,compile(gl.FRAGMENT_SHADER,frag));
  gl.linkProgram(pr);
  if(!gl.getProgramParameter(pr,gl.LINK_STATUS))
    throw new Error(gl.getProgramInfoLog(pr)||'CRT shader linking failed');
  gl.useProgram(pr);
  const b=gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER,b);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]),gl.STATIC_DRAW);
  const loc=gl.getAttribLocation(pr,'p');
  gl.enableVertexAttribArray(loc);
  gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
  return {gl,pr,uniforms:{
    r:gl.getUniformLocation(pr,'r'),t:gl.getUniformLocation(pr,'t'),
    raster:gl.getUniformLocation(pr,'uRaster'),triad:gl.getUniformLocation(pr,'uTriad'),
    noise:gl.getUniformLocation(pr,'uNoise'),roll:gl.getUniformLocation(pr,'uRoll')
  }};
}
function stats() {
  return {backend,renderer,backgroundPixels,overlayPixels,lastDrawMs,surfaceResizes:resizes};
}
function resizeOne(canvas,P,width,height,maxPixels,maxDpr,dpr) {
  const ratio=Math.max(.12,Math.min(Math.min(dpr||1,maxDpr),
    Math.sqrt(maxPixels/Math.max(1,width*height))));
  const w=Math.max(1,Math.round(width*ratio));
  const h=Math.max(1,Math.round(height*ratio));
  if(P.lastW===w&&P.lastH===h)return;
  canvas.width=w;canvas.height=h;
  P.lastW=w;P.lastH=h;resizes++;
  P.gl.viewport(0,0,w,h);
  P.gl.useProgram(P.pr);
  P.gl.uniform2f(P.uniforms.r,w,h);
}
self.onmessage=event=>{
  const d=event.data||{};
  try {
    if(d.type==='probe') {
      let supported=false;
      try {
        if(typeof OffscreenCanvas==='function') {
          const canvas=new OffscreenCanvas(2,2);
          const gl=canvas.getContext('webgl');
          supported=Boolean(gl);
          gl?.getExtension('WEBGL_lose_context')?.loseContext();
        }
      } catch {}
      send('probe',{supported});return;
    }
    if(d.type==='init') {
      surfaces={bg:d.bg,fx:d.fx};
      programs={bg:makeProgram(surfaces.bg,false,d.bgFrag),
        fx:makeProgram(surfaces.fx,true,d.fxFrag)};
      const gl=programs.bg.gl;
      const ext=gl.getExtension('WEBGL_debug_renderer_info');
      renderer=String(ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL)||'':
        gl.getParameter(gl.RENDERER)||'');
      if(/swiftshader|llvmpipe|softpipe|software rasterizer/i.test(renderer))
        backend='software';
      programs.fx.gl.enable(programs.fx.gl.BLEND);
      programs.fx.gl.blendFunc(programs.fx.gl.SRC_ALPHA,programs.fx.gl.ONE);
      send('ready',{stats:stats()});return;
    }
    if(d.type==='resize') {
      if(!surfaces||!programs)return;
      resizeOne(surfaces.bg,programs.bg,d.width,d.height,d.maxPixels,d.maxDpr,d.dpr);
      resizeOne(surfaces.fx,programs.fx,d.width,d.height,d.maxPixels,d.maxDpr,d.dpr);
      backgroundPixels=surfaces.bg.width*surfaces.bg.height;
      overlayPixels=surfaces.fx.width*surfaces.fx.height;
      send('resized',{stats:stats()});return;
    }
    if(d.type==='draw') {
      if(!programs||!backgroundPixels)return;
      const start=performance.now(), p=d.p, t=d.time;
      for(const P of [programs.bg,programs.fx]) {
        P.gl.useProgram(P.pr);P.gl.uniform1f(P.uniforms.t,t);
      }
      const f=programs.fx.gl,u=programs.fx.uniforms;
      f.uniform1f(u.raster,p.raster);f.uniform1f(u.triad,p.triad);
      f.uniform1f(u.noise,p.noise);f.uniform1f(u.roll,p.roll);
      programs.bg.gl.drawArrays(programs.bg.gl.TRIANGLES,0,6);
      f.clearColor(0,0,0,0);f.clear(f.COLOR_BUFFER_BIT);
      f.drawArrays(f.TRIANGLES,0,6);
      lastDrawMs=performance.now()-start;
      send('drawn',{stats:stats()});return;
    }
    if(d.type==='dispose')close();
  } catch(e) {send('error',{message:String(e?.stack||e)});}
};
