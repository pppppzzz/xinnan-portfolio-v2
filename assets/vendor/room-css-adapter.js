// CSS 3D geometry renderer for devices where a WebGL context is unavailable.
// It mirrors the same Three.js room meshes, camera and picking geometry.
class CompatibleRoomRenderer {
  constructor(canvas){
    this.canvas=canvas;this.css=new THREE.CSS3DRenderer();this.scene=new THREE.Scene();this.records=new Map();this.imageURLs=new WeakMap();this.generatedURLs=new Set();
    this.domElement=this.css.domElement;Object.assign(this.domElement.style,{position:'fixed',inset:'0',zIndex:'0',pointerEvents:'none',background:'#738583'});
    this.domElement.setAttribute('aria-hidden','true');document.body.prepend(this.domElement);canvas.style.zIndex='1';this.capabilities={getMaxAnisotropy:()=>1};this.isCSSRoom=true;
  }
  setPixelRatio(){}
  dispose(){for(const r of this.records.values())for(const f of r.faces){this.scene.remove(f.object);f.el.remove();}this.records.clear();for(const url of this.generatedURLs)URL.revokeObjectURL(url);this.generatedURLs.clear();this.domElement.remove();}
  setSize(w,h){this.css.setSize(w,h);this.canvas.width=w;this.canvas.height=h;}
  makeFaces(mesh){
    const p=mesh.geometry.parameters;let descriptors=[];
    if(mesh.geometry.type==='BoxGeometry'){
      const w=p.width,h=p.height,d=p.depth;
      descriptors=[
        [w,h,0,0,d/2,0,0],[w,h,0,0,-d/2,0,Math.PI],
        [d,h,w/2,0,0,0,Math.PI/2],[d,h,-w/2,0,0,0,-Math.PI/2],
        [w,d,0,h/2,0,-Math.PI/2,0],[w,d,0,-h/2,0,Math.PI/2,0]
      ];
    }else if(mesh.geometry.type==='PlaneGeometry'){descriptors=[[p.width,p.height,0,0,0,0,0]];}
    const faces=descriptors.map(d=>{
      const el=document.createElement('div');Object.assign(el.style,{width:d[0]*100+'px',height:d[1]*100+'px',backfaceVisibility:'hidden',overflow:'hidden',imageRendering:'auto'});
      const object=new THREE.CSS3DObject(el);object.matrixAutoUpdate=false;this.scene.add(object);
      const local=new THREE.Matrix4().compose(new THREE.Vector3(d[2],d[3],d[4]),new THREE.Quaternion().setFromEuler(new THREE.Euler(d[5],d[6],0)),new THREE.Vector3(.01,.01,.01));
      return{el,object,local,styleKey:''};
    });return{faces,geometry:mesh.geometry.id};
  }
  render(source,camera){
    source.updateMatrixWorld(true);camera.updateMatrixWorld(true);if(source.userData.skyFallbackColor)this.domElement.style.background=source.userData.skyFallbackColor;const found=new Set();
    source.traverse(mesh=>{
      if(!mesh.isMesh||!mesh.visible||!mesh.material||mesh.material.visible===false)return;
      found.add(mesh.id);let record=this.records.get(mesh.id);
      if(record&&record.geometry!==mesh.geometry.id){record.faces.forEach(f=>{this.scene.remove(f.object);f.el.remove()});this.records.delete(mesh.id);record=null;}
      if(!record){record=this.makeFaces(mesh);this.records.set(mesh.id,record)}
      record.faces.forEach((face,i)=>{
        const mat=Array.isArray(mesh.material)?mesh.material[[4,5,0,1,2,3][i]]:mesh.material;let imageURL='';if(mat.map?.image){const im=mat.map.image;if(!this.imageURLs.has(im)){let url=im.tagName==='CANVAS'?im.toDataURL():im.currentSrc||im.src||'';if(url.startsWith('data:')){const pair=url.split(','),binary=atob(pair[1]),bytes=new Uint8Array(binary.length);for(let j=0;j<binary.length;j++)bytes[j]=binary.charCodeAt(j);url=URL.createObjectURL(new Blob([bytes],{type:pair[0].slice(5).split(';')[0]}));}if(url.startsWith('blob:'))this.generatedURLs.add(url);this.imageURLs.set(im,url);}imageURL=this.imageURLs.get(im);}
        const rep=mat.map?.repeat;const color=mat.color?.getStyle()||'#8c9d96';const illuminated=!!mat.emissive&&mat.emissive.getHex()!==0&&mat.emissiveIntensity>0;
        face.object.matrix.multiplyMatrices(mesh.matrixWorld,face.local);
        const isPhoto=mat.type==='MeshBasicMaterial'&&!!mat.map;
        const k=[color,mat.map?.id,mat.map?.version,rep?.x,rep?.y,isPhoto,illuminated].join('|');
        if(k!==face.styleKey){
          face.styleKey=k;face.el.style.backgroundColor=color;
          face.el.style.backgroundImage=imageURL?'url("'+imageURL+'")':'none';
          face.el.style.backgroundSize=rep?(100/rep.x)+'% '+(100/rep.y)+'%':'100% 100%';
          face.el.style.backgroundRepeat='repeat';
          face.el.style.filter=isPhoto?'none':illuminated?'brightness(1.3)':'brightness('+([.82,.74,.77,.7,.91,.65][i]||.78)+') saturate(.75)';
        }
        const selected=mesh.userData.pictureGroup?.userData.outline.visible;
        face.el.style.outline=selected&&mesh.geometry.type==='PlaneGeometry'?'1px solid #e6eed5':'none';
      });
    });
    for(const[id,r]of this.records){if(!found.has(id)){r.faces.forEach(f=>{this.scene.remove(f.object);f.el.remove()});this.records.delete(id)}}
    this.css.render(this.scene,camera);
  }
}

