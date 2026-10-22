(() => {
  'use strict';const A=SITE_APP;const game=document.body.dataset.page.replace('game-','');const channel={catch:0,memory:1,snake:2}[game];
  const controller=window.CURRENT_GAME=TV_GAMES.mount(document.querySelector('#game-arena'),channel);
  document.querySelector('#game-resume').onclick=controller.start;document.querySelector('#game-pause').onclick=controller.pause;document.querySelector('#game-restart').onclick=controller.restart;
  document.querySelector('#game-help').onclick=()=>{controller.pause();document.querySelector('#game-help-dialog').showModal();};
  function refresh(){document.title=A.t(game+'Title')+' · ZHOU XINNAN';document.querySelector('.tv-screen').setAttribute('aria-label',A.t(game+'Title'));}
  document.addEventListener('site:language',refresh);refresh();
})();
