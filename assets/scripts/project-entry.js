// A project is a directory, not an image-viewer shortcut.
window.projectEntry=(p,context={})=>{
 const A=SITE_APP,images=[...new Map(p.media.filter(m=>m.type==='image').map(m=>[m.src,m])).values()],videos=new Set(p.media.filter(m=>m.type==='video').map(m=>m.src));
 const parts=[images.length?images.length+' '+A.L({zh:'张图片',en:images.length===1?'image':'images'}):'',videos.size?A.L({zh:'含影片',en:'Film'}):'',p.links.length?A.L({zh:'含外链',en:'Links'}):'',A.L({zh:'项目介绍',en:'Project notes'})].filter(Boolean);
 const desktop=document.body.dataset.page==='desktop',origin=context.origin||(desktop&&!A.params.has('category')?'featured':'category'),category=context.category||A.params.get('type')||A.params.get('category')||p.types[0];
 const target=A.href('project.html',{id:p.id,category,origin,listPage:context.page??(A.params.get(desktop?'featured':'page')||0)});
 const previews=images.slice(0,Math.min(2,images.length));
 return `<a class="work-tile project-entry" data-project-id="${A.esc(p.id)}" href="${A.esc(target)}" data-internal><span class="project-folder" aria-hidden="true"><span class="folder-back"></span><span class="folder-paper-set">${previews.map((m,i)=>`<img class="folder-preview preview-${i}" src="${A.esc(m.prev||m.src)}" alt="" loading="lazy" draggable="false">`).join('')}</span><span class="folder-front"><i class="folder-seam"></i><span class="folder-mark">▦</span></span></span><span class="work-title">${A.esc(A.L(p.title))}</span><span class="project-entry-meta">${A.esc(parts.join(' · '))}</span><span class="project-entry-open">${A.L({zh:'查看项目 →',en:'View project →'})}</span></a>`;
};
