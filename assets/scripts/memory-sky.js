/* A distant, world-fixed curved canopy. The ordinary image is NOT a panorama. */
(() => {
 'use strict';
 window.createMemorySky=({scene,renderer,onChange,isDisposed})=>{
  const T=window.THREE,color='#879deb',state={status:'loading',source:'assets/xinnan-memory-sky-approved.png',mapping:'two distant 180-degree curved sectors from the same ordinary image; soft edge joins and zenith cap; no mirrored image or claimed panoramic source',dimensions:null};
  scene.background=new T.Color(color);scene.userData.skyFallbackColor=color;
  if(renderer.isCSSRoom){state.status='simplified';onChange();return state;}
  const geometry=new T.SphereGeometry(720,80,40,0,Math.PI*2,0,Math.PI/2+.045);
  const material=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,depthTest:true,toneMapped:false,fog:false,
   uniforms:{skyImage:{value:null},edgeColor:{value:new T.Color(color)}},
   vertexShader:'varying vec3 skyRay; void main(){skyRay=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
   fragmentShader:'uniform sampler2D skyImage;varying vec3 skyRay;void main(){vec3 ray=normalize(skyRay);float u=fract(atan(ray.x,-ray.z)/3.141592654+.5);float v=clamp(asin(max(0.,ray.y))/1.3962634,0.,1.);vec3 original=texture2D(skyImage,vec2(u,v)).rgb;vec3 join=texture2D(skyImage,vec2(fract(u+.5),v)).rgb;float edge=smoothstep(0.,.10,min(u,1.-u));vec3 color=mix(join,original,edge);vec3 cap=texture2D(skyImage,vec2(.5,.995)).rgb;color=mix(color,cap,smoothstep(.91,1.,v));gl_FragColor=vec4(color,1.);\n#include <colorspace_fragment>\n}'});
  const sky=new T.Mesh(geometry,material);sky.name='approved-distant-memory-sky';sky.position.set(0,-6,0);sky.renderOrder=-1000;sky.visible=false;scene.add(sky);
  new T.TextureLoader().load(state.source,texture=>{
   if(isDisposed()){texture.dispose();return;}
   texture.colorSpace=T.SRGBColorSpace;texture.wrapS=texture.wrapT=T.ClampToEdgeWrapping;
   texture.generateMipmaps=false;texture.minFilter=T.LinearFilter;texture.magFilter=T.LinearFilter;
   material.uniforms.skyImage.value=texture;material.map=texture;sky.visible=true;state.status='ready';state.dimensions=[texture.image.width,texture.image.height];onChange();
  },undefined,()=>{if(!isDisposed()){state.status='unavailable';onChange();}});
  return state;
 };
})();
