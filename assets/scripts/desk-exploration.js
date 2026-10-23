/* A visit-scoped ledger shared by genuine pages and the 777 navigation adapter. */
(() => {
 'use strict';const A=SITE_APP;if(A.exploration)return;
 const ids=Object.freeze(['computer','about','photography','memory','games','contact','music']),key='ms-desk-explore-v1',destinations={computer:['desktop.html','category.html','project.html'],about:['about.html'],photography:['photography.html'],memory:['album.html'],games:['games.html','game-catch.html','game-memory.html','game-snake.html'],contact:['contact.html']};
 let memory={seen:[],pending:null},generation=0,cancelImage=null;const valid=v=>({seen:ids.filter(id=>Array.isArray(v?.seen)&&v.seen.includes(id)),pending:v?.pending&&ids.includes(v.pending.id)&&typeof v.pending.token==='string'?v.pending:null});
 function read(){memory=valid(memory);try{const raw=sessionStorage.getItem(key);if(raw)memory=valid(JSON.parse(raw));}catch{}return memory;}
 function save(){memory=valid(memory);try{sessionStorage.setItem(key,JSON.stringify(memory));}catch{}}
 function changed(){document.dispatchEvent(new Event('site:exploration'));}
 function mark(id,token){read();if(!ids.includes(id)||!memory.pending||memory.pending.id!==id||memory.pending.token!==token)return false;const fresh=!memory.seen.includes(id);if(fresh)memory.seen.push(id);memory.pending=null;save();if(fresh)changed();return fresh;}
 function begin(id){read();if(!ids.includes(id)||memory.seen.includes(id)){memory.pending=null;save();return;}memory.pending={id,at:Date.now(),token:crypto.randomUUID()};save();}
 const filename=()=>location.pathname.split('/').pop()||'index.html';
 function imageReady(image){if(image.complete)return Promise.resolve(image.naturalWidth>0);return new Promise(resolve=>{let done=false;const finish=value=>{if(done)return;done=true;image.removeEventListener('load',loaded);image.removeEventListener('error',failed);if(cancelImage===cancel)cancelImage=null;resolve(value);},loaded=()=>finish(image.naturalWidth>0),failed=()=>finish(false),cancel=()=>finish(false);cancelImage=cancel;image.addEventListener('load',loaded,{once:true});image.addEventListener('error',failed,{once:true});if(image.complete)loaded();});}
 async function ready(){cancelImage?.();const epoch=++generation,record=read().pending;if(!record)return;if(record.id==='music'||!destinations[record.id]?.includes(filename())){memory.pending=null;save();return;}const body=document.body,route=filename();
  try{
   const checks={computer:()=>!!A.desktop&&!!document.querySelector('#window-stage'),about:()=>document.querySelectorAll('.paper-sticker').length>0,photography:()=>!!document.querySelector('#camera-photo'),memory:()=>['webgl','css3d','unavailable'].includes(body.dataset.renderer),games:()=>!!document.querySelector('#crt-content'),contact:()=>document.querySelectorAll('[data-copy-contact]').length>0};
   if(!checks[record.id]()||![...document.querySelectorAll('link[rel="stylesheet"]')].every(link=>!!link.sheet))return;const art=record.id==='photography'?document.querySelector('#camera-photo'):record.id==='memory'?document.querySelector('#flat-photo'):document.querySelector('main .device-art,main .scene-art');
   if(art&&!await imageReady(art))return;
   if(epoch===generation&&document.body===body&&route===filename()&&!document.documentElement.dataset.runtimeError)mark(record.id,record.token);
  }catch{} // A failed load leaves the destination undiscovered; retrying the desk entry can succeed.
 }
 A.exploration={ids,destinations,begin,state(){const value=read();return{seen:[...value.seen],count:value.seen.length,total:ids.length,pending:value.pending?{...value.pending}:null};},beginLink(a,url){if(document.body.dataset.page!=='desk'||!a.dataset.explore||!destinations[a.dataset.explore]?.includes(url.pathname.split('/').pop()))return;begin(a.dataset.explore);},beginMusic(){if(document.body.dataset.page==='desk')begin('music');}};
 PAGE_SCOPE.unscoped(()=>{
  document.addEventListener('DOMContentLoaded',ready,{once:true});addEventListener('site:enter',ready);addEventListener('site:leave',()=>{generation++;cancelImage?.();if(read().pending?.id==='music'){memory.pending=null;save();}});
  A.audio.element.addEventListener('error',()=>{if(read().pending?.id==='music'){memory.pending=null;save();}});
  A.audio.element.addEventListener('playing',()=>{const p=read().pending;if(document.body.dataset.page==='desk'&&p?.id==='music'&&!A.audio.element.paused&&A.audio.state().on)mark('music',p.token);});
 });
 if(document.readyState==='complete')PAGE_SCOPE.unscoped(ready);
})();
