/* Persistent desk progress and one precise, quiet hint at a time. */
(() => {
 'use strict';if(document.body.dataset.page!=='desk')return;
 const A=SITE_APP,E=A.exploration,reduced=matchMedia('(prefers-reduced-motion: reduce)'),tip=document.createElement('output');tip.id='desk-explore-progress';tip.setAttribute('aria-live','polite');tip.setAttribute('aria-atomic','true');document.body.append(tip);
 let disposed=false,pressed=false,hintTimer=0,glowTimer=0,hint=null,lastDiscovery=performance.now(),lastMove=0,lastOperation=0,nextAt=lastDiscovery+12000,bag=[],modalWasOpen=false;
 const modal=()=>!!document.querySelector('dialog[open],[role=menu]:not([hidden])');
 function words(){const s=E.state();tip.textContent=A.L(s.count===s.total?{zh:'都被你发现啦 7/7',en:'You found them all! · 7/7'}:{zh:'看看有什么 '+s.count+'/7',en:'Let’s look around · '+s.count+'/7'});tip.dataset.count=s.count;}
 function avoidOverlap(){const label=document.querySelector('.scene-tip:not([hidden])');if(!label)return;const a=tip.getBoundingClientRect(),b=label.getBoundingClientRect();if(a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top)label.style.top=Math.max(62,a.top-b.height-10)+'px';}
 function clearGlow(){clearTimeout(glowTimer);glowTimer=0;document.querySelectorAll('.scene-outline .explore-glow').forEach(n=>n.classList.remove('explore-glow'));hint=null;}
 function pause(){clearTimeout(hintTimer);hintTimer=0;clearGlow();}
 function plan(){clearTimeout(hintTimer);hintTimer=0;if(disposed||document.hidden||modal()||reduced.matches||E.state().count===E.ids.length)return;hintTimer=setTimeout(suggest,Math.max(60,nextAt-performance.now()));}
 function suggest(){hintTimer=0;const now=performance.now();if(disposed||document.hidden||modal()||reduced.matches||E.state().count===E.ids.length){clearGlow();return;}
  // Plain pointer motion does not reset the discovery deadline; recent input only defers it.
  if(pressed||now-lastMove<1300||now-lastOperation<1800){nextAt=Math.max(nextAt,now+1800);plan();return;}
  const seen=E.state().seen,active=document.querySelector('.scene-hotspot:hover')?.dataset.explore||document.activeElement?.dataset.explore;
  let remaining=E.ids.filter(id=>!seen.includes(id)&&id!==active);if(!remaining.length)remaining=E.ids.filter(id=>!seen.includes(id));
  bag=bag.filter(id=>remaining.includes(id));if(!bag.length){bag=[...remaining];for(let i=bag.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]];}}
  const id=bag.pop(),a=document.querySelector('.scene-hotspot[data-explore="'+id+'"]'),key=a?.dataset.i18nLabel;
  if(key){const layers=[...document.querySelectorAll('.scene-outline [data-outline="'+key+'"],.scene-outline [data-light="'+key+'"]')];if(layers.length===2){hint=id;layers.forEach(n=>n.classList.add('explore-glow'));glowTimer=setTimeout(clearGlow,1500);}}
  nextAt=now+26000;plan();
 }
 function operation(){lastOperation=performance.now();clearGlow();nextAt=Math.max(nextAt,lastOperation+1800);plan();}
 function discover(){words();tip.classList.remove('changed');void tip.offsetWidth;tip.classList.add('changed');setTimeout(()=>tip.classList.remove('changed'),250);lastDiscovery=performance.now();nextAt=lastDiscovery+12000;clearGlow();plan();}
 document.addEventListener('pointermove',()=>{lastMove=performance.now();if(pressed)operation();});document.addEventListener('pointerdown',()=>{pressed=true;operation();});document.addEventListener('pointerup',()=>{pressed=false;operation();});document.addEventListener('pointercancel',()=>{pressed=false;operation();});document.addEventListener('keydown',operation);document.addEventListener('site:exploration',discover);document.addEventListener('site:language',words);
 const observer=new MutationObserver(()=>{avoidOverlap();const open=modal();if(open){pause();tip.classList.add('behind-dialog');}else{tip.classList.remove('behind-dialog');if(modalWasOpen){nextAt=Math.max(nextAt,performance.now()+6000);plan();}}modalWasOpen=open;});observer.observe(document.body,{subtree:true,attributes:true,attributeFilter:['open','hidden']});
 document.addEventListener('visibilitychange',()=>{pause();if(!document.hidden){pressed=false;nextAt=Math.max(nextAt,performance.now()+6000);plan();}});addEventListener('resize',avoidOverlap);addEventListener('blur',pause);addEventListener('focus',()=>{pressed=false;nextAt=Math.max(nextAt,performance.now()+6000);plan();});reduced.addEventListener('change',()=>{pause();plan();});
 addEventListener('site:leave',()=>{disposed=true;pause();observer.disconnect();tip.remove();delete window.DESK_GUIDE_AUDIT;});
 if(A.params.has('qa'))window.DESK_GUIDE_AUDIT=()=>({progress:E.state(),visible:tip.classList.contains('visible'),hint,hintTimer:!!hintTimer,pressed,lastDiscovery,lastMove,nextAt,glows:[...document.querySelectorAll('.scene-outline .explore-glow')].map(n=>n.dataset.outline||n.dataset.light)});
 words();const shown=A.storage.sessionGet('ms-desk-guide-shown-v1',A.deskProgressSeen||false);A.deskProgressSeen=true;A.storage.sessionSet('ms-desk-guide-shown-v1',true);if(shown)tip.classList.add('visible');else{void tip.offsetWidth;requestAnimationFrame(()=>tip.classList.add('visible'));}plan();
})();
