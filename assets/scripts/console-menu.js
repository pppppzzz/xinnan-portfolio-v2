(() => {
 const A=SITE_APP,links=[...document.querySelectorAll('[data-game]')],start=document.querySelector('#console-start'),chosen=document.createElement('output');chosen.className='console-chosen';document.querySelector('.crt-content h1').append(chosen);let index=Math.max(0,Math.min(2,Number(A.params.get('selected'))||0));
 function select(n){index=(n+3)%3;links.forEach((a,i)=>a.setAttribute('aria-current',String(i===index)));start.href=A.href(links[index].getAttribute('href'));chosen.textContent=A.t(['catch','memory','snake'][index]+'Title');A.query({selected:index});}
 A.gameMenu={select,get index(){return index;},confirm:()=>start.click()};links.forEach((a,i)=>{a.href=A.href(a.getAttribute('href'));a.addEventListener('focus',()=>select(i));a.addEventListener('pointerenter',()=>select(i));});
 document.addEventListener('keydown',e=>{if(e.defaultPrevented||document.querySelector('dialog[open]')||!e.target.closest('.crt-content,.hardware-button'))return;if(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key)){e.preventDefault();select(index+(['ArrowLeft','ArrowUp'].includes(e.key)?-1:1));}if(e.key==='Enter'&&!e.target.closest('a,button')){e.preventDefault();start.click();}});
 function title(){document.title=A.t('games')+' · ZHOU XINNAN';select(index);}document.addEventListener('site:language',title);title();
})();
