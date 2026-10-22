/* Deterministic connected corridors; geometry and navigation share this plan. */
(() => {
 const size=4.4,thickness=.22,height=3.65,nodes=new Map(),edges=new Set(),key=(c,r)=>c+','+r;
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
 const allSolids=[...walls,...pillars],radius=.3,bounds={x0:-size*2.5+.35,x1:size*2.5-.35,z0:-size*6+.35,z1:size*6-.35};
 function blocked(x,z){return x<bounds.x0||x>bounds.x1||z<bounds.z0||z>bounds.z1||allSolids.some(b=>Math.abs(x-b.x)<b.w/2+radius&&Math.abs(z-b.z)<b.d/2+radius);}
 function cellAt(x,z){const c=Math.round(x/size+2),r=Math.round(z/size+5.5);return nodes.get(key(c,r));}
 function route(from,to){const a=cellAt(from.x,from.z),b=cellAt(to.x,to.z);if(!a||!b)return[];const queue=[a.key],previous=new Map([[a.key,null]]);for(let i=0;i<queue.length&&!previous.has(b.key);i++)for(const k of nodes.get(queue[i]).links)if(!previous.has(k)){previous.set(k,queue[i]);queue.push(k);}if(!previous.has(b.key))return[];const result=[];for(let k=b.key;k!==null;k=previous.get(k)){const n=nodes.get(k);result.push({x:n.x,z:n.z});}result.reverse();result.push({x:to.x,z:to.z});return result;}
 const start=node(2,11);window.MEMORY_MAZE={size,thickness,height,nodes,edges,walls,pillars,slots,bounds,blocked,cellAt,route,start:[start.x,1.62,start.z],version:'corridors-v1'};
})();
