/* Shared architectural plan -> actual open portals, curved wall solids and static daylight. */
(() => {
 'use strict';
 window.buildMemoryArchitecture=({T,M,scene,renderer,occluders})=>{
  let seed=911;const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  function texture(floor=false){
   const c=document.createElement('canvas');c.width=c.height=floor?1024:256;const ctx=c.getContext('2d'),s=c.width;
   ctx.fillStyle=floor?'#e0ddd2':'#eeeade';ctx.fillRect(0,0,s,s);const image=ctx.getImageData(0,0,s,s);
   for(let i=0;i<image.data.length;i+=4){const n=(random()-.5)*(floor?5:7);for(let ch=0;ch<3;ch++)image.data[i+ch]+=n;}ctx.putImageData(image,0,0);
   // Subtle mineral clouding, without damage or conspicuous seams on plaster.
   for(let i=0;i<24;i++){const x=random()*s,y=random()*s,r=s*(.1+random()*.3),g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(140,145,131,.018)');g.addColorStop(1,'rgba(140,145,131,0)');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);}
   if(floor){ctx.lineWidth=1.1;ctx.strokeStyle='#b5b3a372';for(let i=0;i<=4;i++){ctx.beginPath();ctx.moveTo(i*s/4,0);ctx.lineTo(i*s/4,s);ctx.stroke();ctx.beginPath();ctx.moveTo(0,i*s/4);ctx.lineTo(s,i*s/4);ctx.stroke();}}
   const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;tex.wrapS=tex.wrapT=T.RepeatWrapping;tex.anisotropy=Math.min(2,renderer.capabilities.getMaxAnisotropy());return tex;
  }
  const plasterMap=texture(),stoneMap=texture(true),cream=new T.MeshStandardMaterial({color:'#eee8d5',map:plasterMap,roughness:.96}),sage=new T.MeshStandardMaterial({color:'#c2ceba',map:plasterMap,roughness:.96}),chalk=new T.MeshStandardMaterial({color:'#e5e5d7',map:plasterMap,roughness:.94}),stone=new T.MeshStandardMaterial({color:'#ece8dc',map:stoneMap,roughness:.7,metalness:.025});
  function add(geometry,material,x,y,z,rot=0,solid=true){const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);mesh.rotation.y=rot;mesh.castShadow=solid;mesh.receiveShadow=true;scene.add(mesh);if(solid)occluders.push(mesh);return mesh;}
  function box(w,h,d,x,y,z,mat,solid=true){let material=mat;if(mat===stone)material=[[d,h],[d,h],[w,d],[w,d],[w,h],[w,h]].map(([a,b])=>{const m=mat.clone();m.map=mat.map.clone();m.map.repeat.set(a/12,b/12);return m;});return add(new T.BoxGeometry(w,h,d),material,x,y,z,0,solid);}
  box(22,.12,52.8,0,-.06,0,stone,false);
  const curvedIDs=new Set(M.curves.map(c=>c.id));
  M.walls.filter(w=>!curvedIDs.has(w.id)).forEach((w,i)=>box(w.w,w.h+(i%5===1?.24:0),w.d,w.x,(w.h+(i%5===1?.24:0))/2,w.z,i%4===0?sage:i%4===1?chalk:cream));
  const p=M.pillars[0];box(p.w,p.h,p.d,p.x,p.h/2,p.z,cream);
  for(const p of M.portals){
   const half=p.span/2,hole=p.opening/2,shape=new T.Shape();
   shape.moveTo(-half,0);shape.lineTo(-half,p.h);shape.lineTo(half,p.h);shape.lineTo(half,0);shape.lineTo(hole,0);
   const top=p.kind==='arch'?p.spring:2.95;shape.lineTo(hole,top);
   if(p.kind==='arch')shape.absarc(0,p.spring,hole,0,Math.PI,false);else shape.lineTo(-hole,top);
   shape.lineTo(-hole,0);shape.closePath();
   // CSS 3D keeps the same navigable opening footprints with a lower-detail lintel.
   if(renderer.isCSSRoom){const material=p.kind==='arch'?sage:cream,jamb=(p.span-p.opening)/2,top=2.95;for(const side of [-1,1]){const offset=side*(p.opening/2+jamb/2),m=box(jamb,p.h,p.depth,p.x+Math.cos(p.rot)*offset,p.h/2,p.z-Math.sin(p.rot)*offset,material);m.rotation.y=p.rot;}const m=box(p.opening,p.h-top,p.depth,p.x,top+(p.h-top)/2,p.z,material);m.rotation.y=p.rot;continue;}
   const geometry=new T.ExtrudeGeometry(shape,{depth:p.depth,bevelEnabled:false,curveSegments:48});geometry.translate(0,0,-p.depth/2);
   add(geometry,p.kind==='arch'?sage:cream,p.x,0,p.z,p.rot);
  }
  for(const c of M.curves){
   if(renderer.isCSSRoom){for(let i=0;i<c.points.length-1;i++){const a=c.points[i],b=c.points[i+1],x=(a.x+b.x)/2,z=(a.z+b.z)/2;add(new T.BoxGeometry(Math.hypot(b.x-a.x,b.z-a.z)+.008,c.h,c.depth),cream,c.x+Math.cos(c.rot)*x+Math.sin(c.rot)*z,c.h/2,c.z-Math.sin(c.rot)*x+Math.cos(c.rot)*z,c.rot-Math.atan2(b.z-a.z,b.x-a.x));}continue;}
   const position=[],normal=[],uv=[],N=c.points.map((p,i)=>{const a=c.points[Math.max(0,i-1)],b=c.points[Math.min(c.points.length-1,i+1)],len=Math.hypot(b.x-a.x,b.z-a.z);return new T.Vector3(-(b.z-a.z)/len,0,(b.x-a.x)/len);}),point=(i,side,y)=>new T.Vector3(c.points[i].x,y,c.points[i].z).addScaledVector(N[i],side*c.depth/2);
   function quad(vertices,normals){const cross=new T.Vector3().crossVectors(vertices[1].clone().sub(vertices[0]),vertices[2].clone().sub(vertices[0])),order=cross.dot(normals[0])>=0?[0,1,2,0,2,3]:[0,2,1,0,3,2];for(const i of order){position.push(...vertices[i].toArray());normal.push(...normals[i].toArray());uv.push(vertices[i].x/3.5,vertices[i].y/3.5);}}
   for(let i=0;i<c.points.length-1;i++){for(const side of [-1,1])quad([point(i,side,0),point(i+1,side,0),point(i+1,side,c.h),point(i,side,c.h)],[N[i].clone().multiplyScalar(side),N[i+1].clone().multiplyScalar(side),N[i+1].clone().multiplyScalar(side),N[i].clone().multiplyScalar(side)]);quad([point(i,-1,c.h),point(i+1,-1,c.h),point(i+1,1,c.h),point(i,1,c.h)],Array(4).fill(new T.Vector3(0,1,0)));}
   for(const i of [0,c.points.length-1]){const n=new T.Vector3(N[i].z,0,-N[i].x).multiplyScalar(i===0?-1:1);quad([point(i,-1,0),point(i,1,0),point(i,1,c.h),point(i,-1,c.h)],Array(4).fill(n));}
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(position,3));geometry.setAttribute('normal',new T.Float32BufferAttribute(normal,3));geometry.setAttribute('uv',new T.Float32BufferAttribute(uv,2));add(geometry,cream,c.x,0,c.z,c.rot);
  }
  for(const c of M.columns){if(renderer.isCSSRoom){for(let i=0;i<16;i++){const angle=i*Math.PI/8,rad=c.r*Math.cos(Math.PI/16);add(new T.PlaneGeometry(2*c.r*Math.sin(Math.PI/16),c.h),sage,c.x+Math.cos(angle)*rad,c.h/2,c.z+Math.sin(angle)*rad,Math.PI/2-angle);} }else add(new T.CylinderGeometry(c.r,c.r,c.h,24),sage,c.x,c.h/2,c.z);}
  // Static building surfaces are batched by material: three shadow casters / ray targets.
  if(!renderer.isCSSRoom){scene.updateMatrixWorld(true);for(const material of [cream,sage,chalk]){const meshes=occluders.filter(m=>m.material===material);if(!meshes.length)continue;const arrays={position:[],normal:[],uv:[]};for(const mesh of meshes){const g=(mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone());g.applyMatrix4(mesh.matrixWorld);for(const key of Object.keys(arrays))arrays[key].push(g.getAttribute(key).array);g.dispose();scene.remove(mesh);mesh.geometry.dispose();occluders.splice(occluders.indexOf(mesh),1);}const geometry=new T.BufferGeometry();for(const[key,chunks]of Object.entries(arrays)){const data=new Float32Array(chunks.reduce((n,a)=>n+a.length,0));let offset=0;for(const chunk of chunks){data.set(chunk,offset);offset+=chunk.length;}geometry.setAttribute(key,new T.BufferAttribute(data,key==='uv'?2:3));}geometry.computeBoundingSphere();add(geometry,material,0,0,0);}}
  // Sparse, low-contrast curved floor inlays follow the entry curve; no navigation arrows.
  const c=M.curves[0];if(c){const points=c.segments.map(([a])=>new T.Vector3(a.x-.53,.006,a.z));const last=c.segments.at(-1)[1];points.push(new T.Vector3(last.x-.53,.006,last.z));const line=new T.Line(new T.BufferGeometry().setFromPoints(points),new T.LineBasicMaterial({color:'#afa997',transparent:true,opacity:.36}));scene.add(line);}
  scene.add(new T.HemisphereLight('#e7edff','#929bb0',2.1));
  const sun=new T.DirectionalLight('#fff0ce',2.6);sun.position.set(-12,18,12);sun.target.position.set(0,0,0);scene.add(sun,sun.target);
  if(!renderer.isCSSRoom){renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFShadowMap;renderer.shadowMap.autoUpdate=false;renderer.shadowMap.needsUpdate=true;sun.castShadow=true;const compact=innerWidth<760||matchMedia('(pointer:coarse)').matches;sun.shadow.mapSize.set(compact?1024:2048,compact?1024:2048);Object.assign(sun.shadow.camera,{left:-32,right:32,top:35,bottom:-35,near:1,far:85});sun.shadow.normalBias=.035;sun.shadow.bias=-.00012;sun.shadow.radius=4;sun.shadow.camera.updateProjectionMatrix();}
  scene.userData.architecture={version:M.version,detail:renderer.isCSSRoom?'simplified lintels and segmented curves':'curved portals and smooth walls',portals:M.portals.length,arches:M.portals.filter(p=>p.kind==='arch').length,curves:M.curves.length,columns:M.columns.length,shadowSize:renderer.isCSSRoom?0:sun.shadow.mapSize.x};
  return{sun};
 };
})();
