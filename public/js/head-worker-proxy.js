// Worker facade preserves the mountHeadScanEffect API used by head3d.js.
// The exact approved shader/model run on OffscreenCanvas where available.
// If the worker cannot render, recreate the transferred canvas and load
// the original main-thread renderer rather than leaving the portrait blank.
export function mountHeadScanEffect({container,canvas,modelUrl,reducedMotion=false,onError}={}) {
  let worker, fallback, initialized=false, transferred=false, settled=false;
  let disposed=false, stats, resolveReady, rejectReady;
  const rotation={x:-.015,y:0};
  const pending={paused:true,reducedMotion,scroll:null,scale:1,pointer:null};
  const ready=new Promise((resolve,reject)=>{resolveReady=resolve;rejectReady=reject});
  let resizeObserver, lastSize='';
  const useLatest=()=> {
    if(!fallback) return;
    fallback.setReducedMotion(pending.reducedMotion);
    fallback.setScrollRotation(pending.scroll?.yaw??null,pending.scroll?.presence??0);
    fallback.setPresentationScale(pending.scale);
    if(pending.pointer)fallback.setPointer(...pending.pointer);
    fallback.setPaused(pending.paused);
  };
  function completeReady(){
    if(settled||disposed)return;
    settled=true;
    resolveReady();
  }
  function send(type,extra={}){
    if(!worker||!initialized||disposed)return;
    worker.postMessage({type,...extra});
  }
  function updateSize(){
    if(!container||disposed)return;
    const width=Math.max(1,Math.round(container.clientWidth));
    const height=Math.max(1,Math.round(container.clientHeight));
    const key=width+'x'+height;
    if(key===lastSize)return;
    lastSize=key;
    if(fallback)return; // Original ResizeObserver lives inside the fallback.
    send('resize',{width,height});
  }
  async function fallbackToMain(reason){
    if(fallback||disposed)return;
    worker?.terminate();
    worker=null;initialized=false;
    try {
      let renderCanvas=canvas;
      if(transferred) {
        renderCanvas=canvas.cloneNode(false);
        canvas.replaceWith(renderCanvas);
      }
      const effectUrl=new URL('./head-scan-effect.bundle.js',import.meta.url);
      effectUrl.searchParams.set('v',window.PORTFOLIO_ASSET_VERSION);
      const module=await import(effectUrl.href);
      if(disposed)return;
      fallback=module.mountHeadScanEffect({
        container,canvas:renderCanvas,modelUrl,reducedMotion:pending.reducedMotion,
        onError
      });
      await fallback.ready;
      if(!disposed&&!fallback.disposed){
        useLatest();
        completeReady();
      }
    } catch(error) {
      if(!disposed) {onError?.(error);rejectReady(error);}
    }
  }
  const api={
    ready,
    get root(){return fallback?.root || {rotation}},
    get disposed(){return disposed || Boolean(fallback?.disposed)},
    getRenderStats(){return fallback?.getRenderStats()||stats},
    setScrollRotation(yaw,presence=0){
      pending.scroll={yaw,presence};
      if(fallback)fallback.setScrollRotation(yaw,presence);
      else send('scroll',{yaw,presence});
    },
    setPresentationScale(value){
      pending.scale=value;
      if(fallback)fallback.setPresentationScale(value);
      else send('scale',{value});
    },
    setPointer(x,y){
      pending.pointer=[x,y];
      if(fallback)fallback.setPointer(x,y);
      else send('pointer',{x,y});
    },
    setPaused(value){
      pending.paused=Boolean(value);
      if(fallback)fallback.setPaused(value);
      else send('paused',{value:Boolean(value)});
    },
    setReducedMotion(value){
      pending.reducedMotion=Boolean(value);
      if(fallback)fallback.setReducedMotion(value);
      else send('motion',{value:Boolean(value)});
    },
    destroy(){
      disposed=true;
      resizeObserver?.disconnect();
      worker?.terminate();
      fallback?.destroy();
      if(!settled){settled=true;resolveReady();}
    }
  };
  try{
    const url=new URL('./head-render-worker.bundle.js',import.meta.url);
    url.searchParams.set('v',window.PORTFOLIO_ASSET_VERSION);
    worker=new Worker(url,{type:'module'});
    const timer=setTimeout(()=>fallbackToMain(new Error('Worker probe timed out')),3500);
    worker.onerror=error=>{
      clearTimeout(timer);
      if(!fallback) void fallbackToMain(error);
    };
    worker.onmessage=event=>{
      const data=event.data||{};
      if(disposed)return;
      if(data.type==='probe'){
        clearTimeout(timer);
        if(!data.supported){void fallbackToMain(new Error('Worker WebGL2 unavailable'));return}
        try {
          const transferredCanvas=canvas.transferControlToOffscreen();
          transferred=true;
          const width=Math.max(1,Math.round(container.clientWidth));
          const height=Math.max(1,Math.round(container.clientHeight));
          lastSize=width+'x'+height;
          initialized=true;
          worker.postMessage({
            type:'init',canvas:transferredCanvas,modelUrl,width,height,
            deviceDpr:devicePixelRatio||1,
            coarsePointer:matchMedia('(pointer:coarse)').matches,
            reducedMotion:pending.reducedMotion
          },[transferredCanvas]);
          send('scroll',pending.scroll||{yaw:null,presence:0});
          send('scale',{value:pending.scale});
          if(pending.pointer)send('pointer',{x:pending.pointer[0],y:pending.pointer[1]});
          send('paused',{value:pending.paused});
          resizeObserver=new ResizeObserver(updateSize);
          resizeObserver.observe(container);
        } catch(error){void fallbackToMain(error)}
      } else if(data.type==='ready'){
        stats=data.stats;
        completeReady();
      } else if(data.type==='stats'){
        stats=data.stats;
      } else if(data.type==='pose'){
        rotation.x=data.x;rotation.y=data.y;
        if(data.stats)stats=data.stats;
      } else if(data.type==='error'){
        void fallbackToMain(new Error(data.message));
      }
    };
    worker.postMessage({type:'probe'});
  }catch(error){void fallbackToMain(error)}
  return api;
}
