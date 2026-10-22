/* Coordinates are measured against each supplied clean image's own dimensions. */
(() => {
 const A=SITE_APP,words={resetStickers:['贴纸复位','Reset stickers'],screenMode:['屏幕模式','Screen mode'],deviceMode:['完整设备','Full device']};
 const view=document.querySelector('.device-viewport'),board=document.querySelector('.device-board');if(!board)return;
 function fit(){const width=Number(board.dataset.artWidth),height=Number(board.dataset.artHeight),r=view.getBoundingClientRect(),s=Math.min(r.width/width,r.height/height);board.style.setProperty('--device-scale',s);board.style.width=width*s+'px';board.style.height=height*s+'px';}
 new ResizeObserver(fit).observe(view);fit();
 function labels(){document.querySelectorAll('[data-local]').forEach(n=>n.textContent=words[n.dataset.local]?.[A.lang==='en'?1:0]||'');}
 document.querySelectorAll('[data-screen-mode]').forEach(b=>b.onclick=()=>{const on=document.body.classList.toggle('screen-only');b.dataset.local=on?'deviceMode':'screenMode';labels();});
 document.addEventListener('site:language',labels);labels();
})();
