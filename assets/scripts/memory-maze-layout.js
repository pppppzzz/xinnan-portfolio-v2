/* Deterministic connected corridors; geometry and navigation share this plan. */
(() => {
 const size=4.4,thickness=.42,height=3.85,nodes=new Map(),edges=new Set(),key=(c,r)=>c+','+r;
 function node(c,r){const k=key(c,r);if(!nodes.has(k))nodes.set(k,{key:k,c,r,x:(c-2)*size,z:(r-5.5)*size,links:[]});return nodes.get(k);}
 function path(points){points.forEach(([c,r])=>node(c,r));for(let i=1;i<points.length;i++){const [a,b]=[node(...points[i-1]),node(...points[i])];if(Math.abs(a.c-b.c)+Math.abs(a.r-b.r)!==1)throw Error('Non-adjacent corridor');const k=[a.key,b.key].sort().join('|');if(!edges.has(k)){edges.add(k);a.links.push(b.key);b.links.push(a.key);}}}
 path([[2,11],[2,10],[2,9],[3,9],[4,9],[4,8],[4,7],[3,7],[2,7],[2,6],[2,5],[1,5],[0,5],[0,4],[0,3],[1,3],[2,3],[2,2],[2,1],[3,1],[4,1],[4,0]]);
 path([[2,10],[3,10],[3,9]]);path([[4,7],[4,6],[3,6],[2,6]]);path([[0,5],[0,6],[1,6],[2,6]]);
 path([[0,3],[0,2],[0,1]]);path([[2,3],[3,3],[4,3],[4,2],[4,1]]);path([[2,9],[1,9],[0,9],[0,8],[0,7],[1,7]]);
 const directions={n:[0,-1,0],e:[1,0,-Math.PI/2],s:[0,1,Math.PI],w:[-1,0,Math.PI/2]},walls=[],wallKeys=new Set();
 for(const n of nodes.values())for(const [side,[dc,dr]]of Object.entries(directions)){const other=key(n.c+dc,n.r+dr);if(n.links.includes(other))continue;const k=[n.key,other].sort().join('|');if(wallKeys.has(k))continue;wallKeys.add(k);walls.push({id:k,x:n.x+dc*size/2,z:n.z+dr*size/2,w:dc?thickness:size+thickness,d:dr?thickness:size+thickness,h:height});}
 const pillars=[{id:'column-gallery',x:node(1,9).x,z:node(1,9).z-size/2+.47,w:1.7,d:.72,h:height},{id:'column-junction',x:node(2,6).x+1.25,z:node(2,6).z+1.25,w:.6,d:.6,h:height}];
 const assignments=[[2,11,'w'],[2,10,'w'],[3,10,'s'],[3,9,'n'],[4,9,'e'],[4,8,'w'],[4,7,'e'],[3,7,'n'],[2,7,'w'],[1,7,'s'],[0,8,'w'],[1,9,'pillar'],[3,6,'n'],[1,6,'s'],[1,5,'n'],[0,4,'e'],[0,2,'e'],[0,1,'n'],[1,3,'s'],[2,2,'w'],[3,3,'s'],[4,2,'e'],[4,0,'n']];
 const slots=assignments.map(([c,r,side])=>{const n=node(c,r);if(side==='pillar'){const p=pillars[0];return{cell:n.key,wall:p.id,x:p.x,z:p.z+p.d/2+.045,y:1.8,rot:0,width:p.w-.2,approach:{x:n.x,z:n.z+.65}};}const[dc,dr,rot]=directions[side],other=key(c+dc,r+dr);if(n.links.includes(other))throw Error('Photo cannot hang in an open corridor');return{cell:n.key,wall:[n.key,other].sort().join('|'),side,x:n.x+dc*(size/2-thickness/2-.045),z:n.z+dr*(size/2-thickness/2-.045),y:1.8,rot,width:size-.7,approach:{x:n.x,z:n.z}};});
 // New architecture occupies the existing connected plan; photographs retain their stable slots.
 const portalEdges=[[[2,11],[2,10],'arch',2.8],[[3,9],[4,9],'rectangle',2.65],[[4,8],[4,7],'arch',2.7],[[2,6],[2,5],'arch',2.9],[[0,4],[0,3],'rectangle',2.8],[[2,3],[2,2],'arch',2.6],[[3,1],[4,1],'rectangle',2.7],[[4,1],[4,0],'arch',2.8]];
 const portals=portalEdges.map(([a,b,kind,opening],i)=>{const p=node(...a),q=node(...b);if(!p.links.includes(q.key))throw Error('Portal must join an existing route');return{id:'portal-'+i,x:(p.x+q.x)/2,z:(p.z+q.z)/2,rot:p.c===q.c?0:Math.PI/2,span:size+thickness,depth:thickness+.08,h:height+(i%3)*.13,spring:2.05,kind,opening};});
 const occupied=new Set(slots.map(s=>s.wall)),curves=[];
 // Bowed complete wall faces, with shared polygon geometry/collision, never bent photographs.
 for(const [c,r,side]of [[2,11,'e'],[4,9,'s'],[2,7,'n'],[0,5,'w'],[0,1,'w'],[4,3,'e']]){
  const n=node(c,r),[dc,dr]=directions[side],id=[n.key,key(c+dc,r+dr)].sort().join('|'),wall=walls.find(w=>w.id===id);if(!wall||occupied.has(id))continue;
  const span=size+thickness,R=4.1,alpha=Math.asin(span/2/R),rot=dc?Math.PI/2:0,sign=dc?-dc:-dr,center={x:wall.x,z:wall.z},points=[];
  for(let i=0;i<=20;i++){const a=-alpha+2*alpha*i/20;points.push({x:R*Math.sin(a),z:sign*(R*Math.cos(a)-R*Math.cos(alpha))});}
  const transform=p=>({x:center.x+Math.cos(rot)*p.x+Math.sin(rot)*p.z,z:center.z-Math.sin(rot)*p.x+Math.cos(rot)*p.z});
  curves.push({...wall,rot,points,segments:points.slice(1).map((p,i)=>[transform(points[i]),transform(p)]),depth:thickness,h:height+.2});
 }
 const curvedIDs=new Set(curves.map(c=>c.id)),columns=[{id:'column-junction',x:pillars[1].x,z:pillars[1].z,r:.34,h:height+.1},{id:'column-arch-entry',x:1.58,z:node(2,10).z+1.5,r:.26,h:height+.05},{id:'column-far',x:node(4,1).x-1.45,z:node(4,1).z+1.45,r:.28,h:height+.1}];
 const solids=[...walls.filter(w=>!curvedIDs.has(w.id)),pillars[0]];
 for(const p of portals)for(const sign of [-1,1]){const w=(p.span-p.opening)/2,offset=sign*(p.opening/2+w/2);solids.push({id:p.id+'-'+sign,x:p.x+Math.cos(p.rot)*offset,z:p.z-Math.sin(p.rot)*offset,w:Math.abs(Math.cos(p.rot))*w+Math.abs(Math.sin(p.rot))*p.depth,d:Math.abs(Math.sin(p.rot))*w+Math.abs(Math.cos(p.rot))*p.depth,h:p.h});}
 const radius=.3,bounds={x0:-size*2.5+.35,x1:size*2.5-.35,z0:-size*6+.35,z1:size*6-.35};
 function segmentDistance(x,z,a,b){const dx=b.x-a.x,dz=b.z-a.z,t=Math.max(0,Math.min(1,((x-a.x)*dx+(z-a.z)*dz)/(dx*dx+dz*dz)));return Math.hypot(x-a.x-t*dx,z-a.z-t*dz);}
 function blocked(x,z){return !Number.isFinite(x)||!Number.isFinite(z)||x<bounds.x0||x>bounds.x1||z<bounds.z0||z>bounds.z1||solids.some(b=>Math.abs(x-b.x)<b.w/2+radius&&Math.abs(z-b.z)<b.d/2+radius)||columns.some(c=>Math.hypot(x-c.x,z-c.z)<c.r+radius)||curves.some(c=>c.segments.some(([a,b])=>segmentDistance(x,z,a,b)<c.depth/2+radius));}
 function cellAt(x,z){const c=Math.round(x/size+2),r=Math.round(z/size+5.5);return nodes.get(key(c,r));}
 function route(from,to){const a=cellAt(from.x,from.z),b=cellAt(to.x,to.z);if(!a||!b)return[];const queue=[a.key],previous=new Map([[a.key,null]]);for(let i=0;i<queue.length&&!previous.has(b.key);i++)for(const k of nodes.get(queue[i]).links)if(!previous.has(k)){previous.set(k,queue[i]);queue.push(k);}if(!previous.has(b.key))return[];const result=[];for(let k=b.key;k!==null;k=previous.get(k)){const n=nodes.get(k);result.push({x:n.x,z:n.z});}result.reverse();result.push({x:to.x,z:to.z});return result;}
 const start=node(2,11);window.MEMORY_MAZE={size,thickness,height,nodes,edges,walls,pillars,slots,bounds,blocked,cellAt,route,portals,curves,columns,solids,start:[start.x,1.62,start.z+.9],version:'arch-courtyards-v2'};
})();
