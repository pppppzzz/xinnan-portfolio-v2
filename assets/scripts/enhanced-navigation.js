/* Every destination remains a standalone HTML document; same-origin visits keep audio alive. */
(() => {
 const A=SITE_APP,S=PAGE_SCOPE;let busy=false;let loadedURL=location.pathname+location.search,currentKey=history.state?.key||crypto.randomUUID();history.replaceState({...history.state,sitePage:true,key:currentKey},'',location.href);
 const assets=new Set(['assets/vendor/three.js','assets/vendor/css3d.js','assets/vendor/room-css-adapter.js','assets/scripts/page-runtime.js','assets/scripts/common.js','assets/scripts/shared-core.js','assets/scripts/desk-exploration.js','assets/scripts/enhanced-navigation.js']);
 const vendors=new Set([...document.scripts].map(s=>s.getAttribute('src')?.split('?')[0]).filter(p=>p?.includes('/vendor/')));
 const local=url=>url.origin===location.origin&&url.pathname.startsWith(new URL('.',location.href).pathname)&&/^(index|desk|desktop|category|project|about|album|photography|video|games|game-catch|game-memory|game-snake|contact)\.html$/.test(url.pathname.split('/').pop());
 function loadScript(src){return new Promise((resolve,reject)=>{const script=document.createElement('script');script.src=src;script.onload=()=>{script.remove();resolve();};script.onerror=()=>{script.remove();reject(Error('Script '+src));};document.head.append(script);});}
 async function navigate(url,{pop=false,transition=null}={}){
  if(busy)return;busy=true;document.documentElement.dataset.navigation='loading';
  try{
   const response=await fetch(url.href,{credentials:'same-origin'});if(!response.ok)throw Error(String(response.status));const doc=new DOMParser().parseFromString(await response.text(),'text/html');
   const art=doc.querySelector('.scene-art,.device-art');if(art?.getAttribute('src')){const image=new Image();image.src=new URL(art.getAttribute('src'),url.href).href;try{await image.decode();}catch{}}const key=url.pathname.split('/').pop()+url.search;const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
   if(!reduced){document.body.classList.add(transition?'approach':'page-leaving');if(transition)document.body.classList.add('approach-'+transition);await new Promise(resolve=>PAGE_SCOPE.unscoped(()=>setTimeout(resolve,transition?480:90)));}
   A.closeViewerForNavigation();A.audio.preparePage();S.end();
   const previousCSS=[...document.head.querySelectorAll('link[rel=stylesheet]')];const css=[...doc.querySelectorAll('link[rel=stylesheet]')];await Promise.all(css.map(link=>new Promise(resolve=>{const next=link.cloneNode();next.onload=resolve;next.onerror=resolve;document.head.append(next);})));previousCSS.forEach(l=>l.remove());
   if(!pop)history.pushState({sitePage:true,key:crypto.randomUUID()},'',key);
   document.title=doc.title;for(const attr of [...document.body.attributes])document.body.removeAttribute(attr.name);for(const attr of [...doc.body.attributes])document.body.setAttribute(attr.name,attr.value);document.body.replaceChildren(...[...doc.body.childNodes].map(n=>document.importNode(n,true)));document.documentElement.style.removeProperty('--approach-x');document.documentElement.style.removeProperty('--approach-y');
   S.start();A.mountPage();
   for(const tag of doc.querySelectorAll('script[src]')){const src=tag.getAttribute('src'),id=src.split('?')[0];if(id.includes('/vendor/')){if(vendors.has(id))continue;vendors.add(id);}else if(assets.has(id))continue;await loadScript(src);}
   A.refreshLanguage();A.audio.afterPage();loadedURL=location.pathname+location.search;currentKey=history.state?.key;document.documentElement.dataset.navEpoch=String(Number(document.documentElement.dataset.navEpoch||0)+1);window.dispatchEvent(new Event('site:enter'));document.body.focus({preventScroll:true});
  }catch(error){console.error('Navigation could not complete',error);location.assign(url.href);}finally{busy=false;delete document.documentElement.dataset.navigation;}
 }
 S.unscoped(()=>{
 document.addEventListener('click',e=>{const a=e.target.closest('a[href]');if(!a||e.defaultPrevented||e.button||e.ctrlKey||e.metaKey||e.shiftKey||e.altKey||a.hasAttribute('download')||a.target&&a.target!=='_self')return;const url=new URL(a.href,location.href);if(!local(url)||url.hash)return;A.exploration?.beginLink(a,url);e.preventDefault();if(A.desktop?.handles(url)){A.desktop.navigate(url);return;}if(a.dataset.transition){const board=document.querySelector('.scene-board')?.getBoundingClientRect(),r=a.getBoundingClientRect();document.documentElement.style.setProperty('--approach-x',(a.dataset.zoomX&&board?board.width*Number(a.dataset.zoomX)/100:r.left+r.width/2-(board?.left||0))+'px');document.documentElement.style.setProperty('--approach-y',(a.dataset.zoomY&&board?board.height*Number(a.dataset.zoomY)/100:r.top+r.height/2-(board?.top||0))+'px');}navigate(url,{transition:a.dataset.transition});});
 window.addEventListener('popstate',()=>{if(A.handleViewerHistory())return;const next=location.pathname+location.search;if(A.desktop?.handles(new URL(location.href))){A.desktop.restoreRoute(new URL(location.href));return;}if(history.state?.key===currentKey||next===loadedURL)return;navigate(new URL(location.href),{pop:true});});
 });
 A.navigate=target=>navigate(new URL(target,location.href));
})();
