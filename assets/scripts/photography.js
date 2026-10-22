/* Independent camera playback page, using only the separately audited photo set. */
(() => {
 'use strict';
 const A=SITE_APP, groups=window.PHOTOGRAPHY;
 const words={title:['我眼里的世界','Through My Eyes'],stage:['舞台摄影','Stage Photography'],portrait:['人像摄影','Portrait Photography'],playback:['照片回放','Photo playback'],previous:['上一张','Previous photo'],next:['下一张','Next photo'],enlarge:['放大查看','Enlarge photo'],returnDesk:['返回书桌','Return to desk'],loading:['正在读取照片…','Loading photo…'],failed:['照片未能加载。可以重试，或继续浏览其他照片。','This photo could not load. Retry or continue browsing.'],retry:['重试','Retry'],thumbs:['照片缩略图','Photo thumbnails'],photo:['照片','Photo'],studies:['功能预览 · 视觉待调整','Functional preview · design pending'],layoutA:['A · 下方按键','A · Controls below'],layoutB:['B · 侧面按键','B · Controls beside'],close:['关闭','Close'],fit:['适合屏幕','Fit'],zoomIn:['放大','Zoom in'],zoomOut:['缩小','Zoom out']};
 words.switchCategory=['分类','Category'];
 const t=k=>words[k]?.[A.lang==='en'?1:0]||'';
 const remembered=A.storage.sessionGet('ms-photography',{category:'stage',indices:{stage:0,portrait:0}});
 const state={category:groups.some(g=>g.id===A.params.get('category'))?A.params.get('category'):remembered.category,index:0};
 if(!groups.some(g=>g.id===state.category))state.category='stage';
 const group=()=>groups.find(g=>g.id===state.category);
 const clamp=n=>Math.max(0,Math.min(group().items.length-1,Number.isFinite(n)?Math.floor(n):0));
 state.index=clamp(A.params.has('index')?Number(A.params.get('index')):Number(remembered.indices[state.category]||0));
 const image=document.querySelector('#camera-photo'), rail=document.querySelector('#camera-thumbnails'), error=document.querySelector('#camera-error'), status=document.querySelector('#camera-loading'), enlarge=document.querySelector('#photo-enlarge'), openButton=document.querySelector('#photo-open');
 let failed=false,loaded=false,touch=null,suppressClick=false;
 function save(){remembered.category=state.category;remembered.indices[state.category]=state.index;A.storage.sessionSet('ms-photography',remembered);A.query({category:state.category,index:state.index,layout:null});}
 function localize(){document.querySelectorAll('[data-photo-word]').forEach(n=>n.textContent=t(n.dataset.photoWord));document.querySelectorAll('[data-photo-label]').forEach(n=>n.setAttribute('aria-label',t(n.dataset.photoLabel)));document.title=t('title')+' · ZHOU XINNAN';image.alt=A.L(group().title);document.querySelector('#camera-category').textContent=A.L(group().title);status.textContent=failed?'':t('loading');document.querySelectorAll('[data-category]').forEach(b=>b.setAttribute('aria-selected',String(b.dataset.category===state.category)));document.querySelectorAll('[data-layout]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.layout===state.layout)));[...rail.children].forEach((b,i)=>{b.setAttribute('aria-label',`${t('photo')} ${i+1} / ${group().items.length}`);b.querySelector('img').alt='';});}
 function paint(){
  save();failed=false;loaded=false;enlarge.disabled=openButton.disabled=true;error.hidden=true;status.hidden=false;
  image.src=group().items[state.index].src;
  rail.innerHTML=group().items.map((item,i)=>`<button type="button" class="camera-thumb" data-index="${i}" aria-current="${i===state.index?'true':'false'}"><img src="${A.esc(item.thumb)}" alt="" loading="lazy" decoding="async"></button>`).join('');
  rail.querySelectorAll('button').forEach(b=>b.onclick=()=>select(Number(b.dataset.index)));
  document.querySelector('#camera-counter').textContent=`${state.index+1} / ${group().items.length}`;
  document.querySelector('#photo-prev').disabled=state.index===0;document.querySelector('#photo-next').disabled=state.index===group().items.length-1;
  localize();if(document.querySelector('#mobile-photo-category')){const select=document.querySelector('#mobile-photo-category');select.innerHTML=groups.map(g=>'<option value="'+g.id+'">'+A.L(g.title)+'</option>').join('');select.value=state.category;}
  requestAnimationFrame(()=>{const b=rail.children[state.index];rail.scrollTo({left:Math.max(0,b.offsetLeft-rail.clientWidth/2+b.clientWidth/2),behavior:'auto'});});
  [-1,1].forEach(delta=>{const item=group().items[state.index+delta];if(item){const next=new Image();next.src=item.src;}});
 }
 function select(index){const next=clamp(index);if(next!==state.index){state.index=next;paint();}}
 image.addEventListener('load',()=>{loaded=true;failed=false;status.hidden=true;error.hidden=true;enlarge.disabled=openButton.disabled=false;image.classList.remove('failed');});
 image.addEventListener('error',()=>{failed=true;loaded=false;status.hidden=true;error.hidden=false;enlarge.disabled=openButton.disabled=true;});
 document.querySelector('#photo-retry').onclick=()=>{image.removeAttribute('src');image.src=group().items[state.index].src;error.hidden=true;status.hidden=false;failed=false;localize();};
 document.querySelector('#photo-prev').onclick=()=>select(state.index-1);document.querySelector('#photo-next').onclick=()=>select(state.index+1);
 document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{if(state.category===b.dataset.category)return;state.category=b.dataset.category;state.index=clamp(remembered.indices[state.category]||0);paint();});
 // Shared temporary viewer retains native history and the final selected photo on close.
 function open(){if(loaded)A.openViewer(group().items,state.index,index=>{state.index=index;paint();});}
 enlarge.onclick=()=>{if(suppressClick){suppressClick=false;return;}open();};
 document.querySelector('#photo-open').onclick=open;
 document.querySelector('#camera-full-key').onclick=open;document.querySelector('#photo-replay').onclick=open;document.querySelector('#camera-category-key').onclick=()=>document.querySelector('[data-category="'+(state.category==='stage'?'portrait':'stage')+'"]').click();
 document.querySelectorAll('[data-mobile-photo]').forEach(b=>b.onclick=()=>b.dataset.mobilePhoto==='open'?open():select(state.index+(b.dataset.mobilePhoto==='prev'?-1:1)));
 const mobileCategory=document.querySelector('#mobile-photo-category');mobileCategory.onchange=()=>document.querySelector('[data-category="'+mobileCategory.value+'"]').click();
 function mobileLabels(){mobileCategory.innerHTML=groups.map(g=>'<option value="'+g.id+'">'+A.L(g.title)+'</option>').join('');mobileCategory.value=state.category;}document.addEventListener('site:language',mobileLabels);
 document.addEventListener('keydown',e=>{if(document.querySelector('dialog[open]')||e.altKey||e.ctrlKey||e.metaKey||e.target.closest('select,input,textarea'))return;if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();select(state.index+(e.key==='ArrowLeft'?-1:1));}});
 enlarge.addEventListener('pointerdown',e=>{touch={x:e.clientX,y:e.clientY};});
 enlarge.addEventListener('pointerup',e=>{if(touch&&Math.abs(e.clientX-touch.x)>50&&Math.abs(e.clientX-touch.x)>Math.abs(e.clientY-touch.y)*1.4){suppressClick=true;select(state.index+(e.clientX<touch.x?1:-1));}touch=null;});
 document.querySelector('[data-back]').href=A.parent('desk.html');
 document.addEventListener('site:language',localize);paint();
})();
