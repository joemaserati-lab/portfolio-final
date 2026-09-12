import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.min.js';

const canvas=document.getElementById('frame-3d');
const stage=document.getElementById('crt-stage');
const screen=document.getElementById('screen');

if(canvas&&stage&&screen){
  let renderer,scene,camera,root;
  let resizeTimer=0;

  function superellipsePoints(w,h,n=4.6,count=96,z=0){
    const pts=[]; const a=w/2,b=h/2; const p=2/n;
    for(let i=0;i<count;i++){
      const t=(i/count)*Math.PI*2;
      const c=Math.cos(t),s=Math.sin(t);
      const x=a*Math.sign(c)*Math.pow(Math.abs(c),p);
      const y=b*Math.sign(s)*Math.pow(Math.abs(s),p);
      pts.push(new THREE.Vector3(x,y,z));
    }
    return pts;
  }

  function ringGeometry(rings){
    const verts=[]; const indices=[]; const count=rings[0].length;
    for(const ring of rings) for(const p of ring) verts.push(p.x,p.y,p.z);
    for(let r=0;r<rings.length-1;r++){
      const a=r*count,b=(r+1)*count;
      for(let i=0;i<count;i++){
        const j=(i+1)%count;
        indices.push(a+i,a+j,b+i, a+j,b+j,b+i);
      }
    }
    const g=new THREE.BufferGeometry();
    g.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
    g.setIndex(indices); g.computeVertexNormals();
    return g;
  }

  function curvedGlassGeometry(w,h){
    const g=new THREE.PlaneGeometry(w,h,28,20);
    const p=g.attributes.position;
    const bulge=Math.min(w,h)*0.024;
    for(let i=0;i<p.count;i++){
      const x=p.getX(i)/(w/2), y=p.getY(i)/(h/2);
      const r2=Math.min(1,x*x*.93+y*y*1.07);
      const z=(1-Math.pow(r2,0.72))*bulge;
      p.setZ(i,z);
    }
    g.computeVertexNormals(); return g;
  }

  function init(){
    renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:false,powerPreference:'low-power'});
    renderer.setClearColor(0x000000,0); renderer.outputColorSpace=THREE.SRGBColorSpace; renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.15));
    scene=new THREE.Scene();
    camera=new THREE.PerspectiveCamera(32,1,0.1,5000);
    root=new THREE.Group(); scene.add(root);
    scene.add(new THREE.HemisphereLight(0xffd6ad,0x120702,1.15));
    const key=new THREE.DirectionalLight(0xffd0a2,.88); key.position.set(-.7,.9,1.5); scene.add(key);
    const rim=new THREE.DirectionalLight(0xffa14a,.12); rim.position.set(.9,-.15,.7); scene.add(rim);
    document.body.classList.add('frame3d-ready');
    rebuild();
  }

  function clearRoot(){
    while(root.children.length){
      const o=root.children.pop(); o.geometry?.dispose();
      if(Array.isArray(o.material)) o.material.forEach(m=>m.dispose()); else o.material?.dispose();
    }
  }

  function rebuild(){
    if(!renderer)return;
    clearRoot();
    const sr=stage.getBoundingClientRect(), rr=screen.getBoundingClientRect();
    const W=sr.width,H=sr.height, IW=rr.width,IH=rr.height;
    if(W<20||H<20||IW<20||IH<20)return;

    renderer.setSize(W,H,false); camera.aspect=W/H;
    const fov=THREE.MathUtils.degToRad(camera.fov);
    camera.position.set(0,0,(H/2)/Math.tan(fov/2)+80); camera.updateProjectionMatrix();

    const depth=Math.min(W,H)*0.028;
    const rings=[
      superellipsePoints(W-2,H-2,4.9,96,-depth*.70),
      superellipsePoints(W-8,H-8,4.9,96,0),
      superellipsePoints(IW+30,IH+26,4.55,96,depth*.30),
      superellipsePoints(IW+12,IH+10,4.4,96,depth*.62),
      superellipsePoints(IW,IH,4.25,96,depth*.22)
    ];
    const frame=new THREE.Mesh(ringGeometry(rings),new THREE.MeshStandardMaterial({color:0x030201,roughness:.82,metalness:.06,emissive:0x050201,emissiveIntensity:.035}));
    root.add(frame);

    const lipRings=[
      superellipsePoints(IW+14,IH+12,4.4,96,depth*.63),
      superellipsePoints(IW+5,IH+4,4.25,96,depth*.72),
      superellipsePoints(IW-2,IH-2,4.12,96,depth*.30)
    ];
    const lip=new THREE.Mesh(ringGeometry(lipRings),new THREE.MeshStandardMaterial({color:0x050302,roughness:.76,metalness:.04,emissive:0x000000,emissiveIntensity:0}));
    root.add(lip);

    const glassMat=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.FrontSide,vertexShader:`
      varying vec3 vN; varying vec3 vV; varying vec2 vUv2;
      void main(){vUv2=uv;vec4 mv=modelViewMatrix*vec4(position,1.0);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}
    `,fragmentShader:`
      precision highp float; varying vec3 vN; varying vec3 vV; varying vec2 vUv2;
      void main(){
        float fres=pow(1.0-max(dot(normalize(vN),normalize(vV)),0.0),3.1);
        float edge=smoothstep(.55,1.0,length((vUv2-.5)*2.0));
        float top=smoothstep(.72,.08,vUv2.y)*smoothstep(.03,.42,vUv2.x)*.035;
        vec3 warm=vec3(1.0,.66,.34);
        vec3 c=warm*(fres*.055+top*.42);
        float a=.002+fres*.028+top*.16;
        gl_FragColor=vec4(c,a);
      }
    `});
    const glass=new THREE.Mesh(curvedGlassGeometry(IW-3,IH-3),glassMat); glass.position.z=depth*.78; root.add(glass);

    renderer.render(scene,camera);
  }

  function schedule(){clearTimeout(resizeTimer);resizeTimer=setTimeout(rebuild,90)}
  addEventListener('resize',schedule,{passive:true});
  if('ResizeObserver'in window){new ResizeObserver(schedule).observe(stage);new ResizeObserver(schedule).observe(screen)}
  try{init()}catch(err){console.warn('Three.js CRT shell fallback:',err)}
}
