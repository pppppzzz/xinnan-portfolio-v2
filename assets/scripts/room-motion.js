/* One speed preference and swept, axis-sliding collision for every room input. */
(() => {
 'use strict';
 const config=Object.freeze({min:.35,max:2.5,step:.1,wheelPixels:100,wheelGap:220,substep:.075,maxFrame:.2,walk:1.8,route:2.4,smoothing:12});
 const clamp=value=>Math.max(config.min,Math.min(config.max,Number.isFinite(value)?value:1));
 function create(initial=1){
  let target=clamp(Number(initial)),current=target,accumulated=0,lastWheel=-Infinity;
  return{get target(){return target;},get current(){return current;},set(value){target=Math.round(clamp(Number(value))*100)/100;return target;},
   tick(dt){current+=(target-current)*(1-Math.exp(-config.smoothing*Math.max(0,dt)));if(Math.abs(current-target)<.001)current=target;return clamp(current);},
   clearWheel(){accumulated=0;lastWheel=-Infinity;},
   wheel(delta,mode,now,pageHeight){
    if(!Number.isFinite(delta)||!delta)return false;
    if(now-lastWheel>config.wheelGap)accumulated=0;lastWheel=now;
    const pixels=delta*(mode===1?16:mode===2?Math.max(1,pageHeight):1);
    if(accumulated&&Math.sign(accumulated)!==Math.sign(pixels))accumulated=0;
    accumulated+=Math.max(-300,Math.min(300,pixels));
    const steps=Math.trunc(Math.abs(accumulated)/config.wheelPixels);if(!steps)return false;
    const direction=Math.sign(accumulated);accumulated-=direction*steps*config.wheelPixels;
    const before=target;this.set(target-direction*steps*config.step);return before!==target;
   }};
 }
 function slide(position,dx,dz,blocked){
  if(!Number.isFinite(dx)||!Number.isFinite(dz))return false;
  const count=Math.max(1,Math.ceil(Math.hypot(dx,dz)/config.substep)),sx=dx/count,sz=dz/count;let moved=false;
  for(let i=0;i<count;i++){
   const x=position.x+sx;if(sx&&!blocked(x,position.z)){position.x=x;moved=true;}
   const z=position.z+sz;if(sz&&!blocked(position.x,z)){position.z=z;moved=true;}
  }return moved;
 }
 window.ROOM_MOTION={config,create,slide};
})();
