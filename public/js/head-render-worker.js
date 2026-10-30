import { mountHeadScanEffect } from './head-scan-effect.js';

let effect, surface, lastPoseAt = -Infinity;
function report(type, extra = {}) {
  postMessage({ type, ...extra });
}
function reportStats() {
  if (effect && !effect.disposed) report('stats',{stats:effect.getRenderStats()});
}
self.onmessage = async event => {
  const data = event.data || {};
  try {
    if (data.type === 'probe') {
      // Check actual WebGL2 support INSIDE this worker before the caller
      // transfers the visible canvas (which is not reversible).
      let supported = false;
      try {
        if (typeof OffscreenCanvas === 'function' &&
            typeof requestAnimationFrame === 'function') {
          const test = new OffscreenCanvas(2,2);
          const gl = test.getContext('webgl2');
          supported = Boolean(gl);
          gl?.getExtension('WEBGL_lose_context')?.loseContext();
        }
      } catch {}
      report('probe',{supported});
      return;
    }
    if (data.type === 'init') {
      surface = {clientWidth:data.width,clientHeight:data.height};
      effect = mountHeadScanEffect({
        container:surface, canvas:data.canvas, modelUrl:data.modelUrl,
        workerMode:true, reducedMotion:data.reducedMotion,
        coarsePointerOverride:data.coarsePointer, deviceDpr:data.deviceDpr,
        onError:error=>report('error',{message:String(error?.message||error)}),
        onFrame:(x,y,now)=>{
          if(now-lastPoseAt >= 35) {
            lastPoseAt = now;
            report('pose',{x,y,stats:effect?.getRenderStats()});
          }
        }
      });
      await effect.ready;
      if (!effect.disposed) report('ready',{stats:effect.getRenderStats()});
      return;
    }
    if (!effect || effect.disposed) return;
    switch (data.type) {
      case 'resize': effect.setViewportSize(data.width,data.height);reportStats();break;
      case 'pointer': effect.setPointer(data.x,data.y);break;
      case 'scroll': effect.setScrollRotation(data.yaw,data.presence);break;
      case 'scale': effect.setPresentationScale(data.value);reportStats();break;
      case 'paused': effect.setPaused(data.value);break;
      case 'motion': effect.setReducedMotion(data.value);break;
      case 'stats': reportStats();break;
      case 'dispose': effect.destroy();close();break;
    }
  } catch (error) {
    report('error',{message:String(error?.stack||error)});
  }
};
