/* Three quiet, local games inside the supplied transparent TV frame. No audio. */
(function () {
  'use strict';
  var ROOT = 'assets/media/tv-games/';
  var PETS = [
    ['sticker-cat-blue.png', '蓝猫', 'Blue cat', [1315,1197], [124,164,1192,1125]],
    ['sticker-cat-blue-white.png', '蓝白猫', 'Blue and white cat', [1313,1198], [68,111,1246,1140]],
    ['sticker-cat-orange.png', '橘白猫', 'Orange and white cat', [1315,1197], [16,60,1300,1174]],
    ['sticker-poodle-grey.png', '灰色泰迪', 'Grey poodle', [1536,1024], [151,65,1388,975]],
    ['sticker-budgie-blue-white.png', '蓝白虎皮鹦鹉', 'Blue and white budgie', [1316,1195], [213,98,1103,1115]]
  ];
  var WORDS = {
    zh: { tv:'复古电视小游戏', screen:'电视游戏屏幕', channel:'换台', brightness:'亮度', off:'关闭电视', on:'打开电视', catchTitle:'接住毛茸茸', memoryTitle:'宠物翻翻乐', start:'开始游戏', again:'再玩一次', resume:'继续', paused:'已暂停', catchHelp:'移动鼠标或按 ← → 控制软垫，接住毛茸茸。每局 30 秒。', touchHelp:'在屏幕内左右拖动软垫，接住毛茸茸。每局 30 秒。', memoryHelp:'翻开两张牌，找出相同的小动物。', score:'分数', time:'剩余', pairs:'已配对', result:'本局分数', done:'全都找到啦！', card:'翻开卡片', matched:'已配对', face:'已翻开' },
    en: { tv:'Retro TV games', screen:'TV game screen', channel:'Change channel', brightness:'Brightness', off:'Turn TV off', on:'Turn TV on', catchTitle:'Catch the Fluff', memoryTitle:'Pet Pairs', start:'Start', again:'Play again', resume:'Continue', paused:'Paused', catchHelp:'Move the mouse or use ← → to catch the pets. A gentle 30-second round.', touchHelp:'Drag the cushion across the screen to catch the pets. A 30-second round.', memoryHelp:'Turn over two cards and find the matching pets.', score:'Score', time:'Left', pairs:'Paired', result:'Your score', done:'All five pairs found!', card:'Turn card', matched:'Matched', face:'Face up' }
  };
  Object.assign(WORDS.zh,{snakeTitle:'格子贪吃蛇',snakeStart:'开始',snakeHelp:'方向键 / WASD 转向，空格暂停。碰墙或身体结束。',snakeTouchHelp:'滑动或点方向键转向，碰墙或身体结束。',pause:'暂停',snakeWon:'棋盘填满啦！',resizeHint:'尺寸已变，当前局已保留。',newBoard:'新开一局',up:'向上',down:'向下',left:'向左',right:'向右',best:'本次最高',bestLong:'本次访问最高分',roundOver:'本局结束',guide:'这台电视能玩。'});
  Object.assign(WORDS.en,{snakeTitle:'Grid Snake',snakeStart:'Start',snakeHelp:'Arrows / WASD to turn; Space to pause. Walls and your body end the round.',snakeTouchHelp:'Swipe or tap to turn. Avoid walls and your body.',pause:'Pause',snakeWon:'Board complete!',resizeHint:'Resized; your round is saved.',newBoard:'New round',up:'Up',down:'Down',left:'Left',right:'Right',best:'Visit best',bestLong:'Best score this visit',roundOver:'Round over',guide:'This TV is playable.'});
  Object.assign(WORDS.zh,{score:'本局得分',best:'最高得分',bestLong:'本次访问最高得分',elapsed:'本局用时',fastest:'最快纪录',fastestLong:'本次访问最快完成用时',memoryHelp:'翻开两张牌，找出相同的小动物。首次翻牌开始计时，用时越短越好。',snakeHelp:'方向键 / WASD 转向，空格暂停。避开边界、障碍和身体。',snakeTouchHelp:'滑动或点方向键转向，避开边界、障碍和身体。',mapChanged:'地图已更新为工字型，请开始新一局。'});
  Object.assign(WORDS.en,{score:'Score',best:'Best',bestLong:'Best score this visit',elapsed:'Time',fastest:'Fastest',fastestLong:'Fastest completed round this visit',memoryHelp:'Find the five matching pairs. The first flip starts the clock; a shorter time is better.',snakeHelp:'Arrows / WASD to turn; Space to pause. Avoid walls, obstacles and your body.',snakeTouchHelp:'Swipe or tap to turn. Avoid walls, obstacles and your body.',mapChanged:'The new I-shaped map needs a fresh round.'});
  // New black-eye head: main opaque silhouette measured at alpha > 220.
  var HEAD={src:ROOT+'game-budgie-head.png',canvas:[1254,1254],box:[157,236,1163,1018]};
  // Sampled from the centre of game-budgie-body-straight.png (600,620).
  // Canvas joins the supplied straight/corner/tail reference shapes into one unbroken ribbon.
  var BODY_COLOR='#68b6f4';
  Object.assign(WORDS.zh,{guide:'这台电视能玩。',knobGuide:'拧一拧，换个游戏。'});
  Object.assign(WORDS.en,{guide:'This TV is playable.',knobGuide:'Give it a turn. Try another game.'});
  WORDS.zh.memoryChanged='旧局未完整计时；重玩后记录最快用时。';
  WORDS.en.memoryChanged='This older round was not fully timed. Replay to set a fastest time.';
  function make(tag, cls, parent) {
    var node = document.createElement(tag); node.className = cls || '';
    if (parent) parent.appendChild(node); return node;
  }
  function pet(id, parent, cls) {
    var p = PETS[id], box = p[4], w = box[2]-box[0], h = box[3]-box[1];
    var wrap = make('span', 'tv-pet ' + (cls || ''), parent);
    wrap.style.setProperty('--pet-ratio', w + '/' + h);
    var img = make('img', '', wrap); img.src = 'assets/media/stickers/' + p[0];
    img.alt = ''; img.draggable = false;
    // Remove only the measured transparent canvas margin, never stretch a pet.
    img.style.width = p[3][0]/w*100+'%';
    img.style.left = -box[0]/w*100+'%'; img.style.top = -box[1]/h*100+'%';
    return wrap;
  }
  function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }
  function renderSnakeHead(tile,direction){
    var rotor=make('span','tv-snake-head dir-'+direction,tile),art=make('span','tv-head-art',rotor),img=make('img','',art),b=HEAD.box,w=b[2]-b[0],h=b[3]-b[1];
    art.style.aspectRatio=w+'/'+h;art.style.width=Math.min(1,w/h)*100+'%';
    img.src=HEAD.src;img.alt='';img.draggable=false;img.style.width=HEAD.canvas[0]/w*100+'%';img.style.left=-b[0]/w*100+'%';img.style.top=-b[1]/h*100+'%';
  }
  function shuffle(a) {
    for (var i=a.length-1; i>0; i--) { var j=Math.floor(Math.random()*(i+1)), t=a[i]; a[i]=a[j]; a[j]=t; }
    return a;
  }

  window.TV_GAMES = { mount: function (page, selectedChannel) {
    var cardBackPreload=new Image(); cardBackPreload.src=ROOT+'game-card-back.png';
    var headPreload=new Image();headPreload.src=HEAD.src;
    var section = make('section', 'tv-section', page);
    var tv = make('div', 'pet-tv', section);
    var screen = make('div', 'tv-screen', tv); screen.tabIndex = 0; screen.setAttribute('role', 'group');
    var picture = make('div', 'tv-picture', screen);
    var hud = make('div', 'tv-hud', picture), channelLabel = make('span','tv-channel',hud), stats=make('span','tv-stats',hud);
    stats.setAttribute('role','status'); stats.setAttribute('aria-live','off');
    var scoreStat=make('span','tv-stat tv-score',stats),bestStat=make('span','tv-stat tv-best',stats),extraStat=make('span','tv-stat tv-extra',stats);
    var views = [make('div','tv-game tv-catch',picture), make('div','tv-game tv-memory',picture),make('div','tv-game tv-snake',picture)];
    var field = make('div','tv-catch-field',views[0]);
    var cushion = make('img','tv-cushion',field); cushion.src=ROOT+'game-pet-cushion.png'; cushion.alt=''; cushion.draggable=false;
    var cardsHost = make('div','tv-cards',views[1]);
    var snakeArea=make('div','tv-snake-area',views[2]),snakeBoard=make('div','tv-snake-board',snakeArea);
    snakeBoard.setAttribute('aria-hidden','true');
    var snakeControls=make('div','tv-snake-controls',views[2]);
    ['left','up','down','right'].forEach(function(direction,i){
      var button=make('button','tv-snake-direction',snakeControls);button.type='button';button.dataset.direction=direction;button.textContent=['←','↑','↓','→'][i];
      button.addEventListener('pointerdown',function(e){if(channel===2&&running()){e.preventDefault();screen.focus({preventScroll:true});}});
      button.addEventListener('click',function(){if(channel===2&&running()){TV_SNAKE.turn(games[2].board,direction);screen.focus({preventScroll:true});}});
    });
    var snakePause=make('button','tv-snake-pause tv-pause',hud);snakePause.type='button';
    snakePause.addEventListener('pointerdown',function(e){e.preventDefault();screen.focus({preventScroll:true});});
    snakePause.addEventListener('click',function(){if(games[channel].status==='running')pause();else if(games[channel].status==='paused')start(channel);});
    var overlays = views.map(function(view){return make('div','tv-overlay',view);});
    var snow = make('div','tv-static',picture); snow.hidden=true;
    var frame=make('img','tv-frame',tv); frame.src=ROOT+'tv-frame.png'; frame.alt=''; frame.draggable=false;
    var tune=make('button','tv-control tv-knob tv-channel-knob',tv); tune.type='button';
    var dim=make('button','tv-control tv-knob tv-brightness-knob',tv); dim.type='button'; dim.setAttribute('role','slider'); dim.setAttribute('aria-valuemin','40'); dim.setAttribute('aria-valuemax','120');
    [tune,dim].forEach(function (control) {
      var rotor=make('span','tv-knob-rotor',control), img=make('img','',rotor); img.src=ROOT+'tv-knob.png'; img.alt=''; img.draggable=false;
    });
    var power=make('button','tv-control tv-power',tv); power.type='button';
    var guide=make('div','tv-guide',picture);guide.hidden=true;guide.setAttribute('role','note');
    var guideCopy=make('span','tv-guide-copy',guide);
    var knobHint=make('div','tv-knob-hint',tv);knobHint.hidden=true;knobHint.setAttribute('role','note');
    var knobArrow=document.createElementNS('http://www.w3.org/2000/svg','svg');knobArrow.classList.add('tv-knob-arrow');knobArrow.setAttribute('aria-hidden','true');knobArrow.setAttribute('hidden','');tv.appendChild(knobArrow);
    var arrowPath=document.createElementNS('http://www.w3.org/2000/svg','path');knobArrow.appendChild(arrowPath);
    var channel=0, powered=true, visible=false, leaving=false, transitioning=false, snowTimer=0;
    var brightness=1, dial=0, raf=0, previous=0, pointer=null, keys={left:false,right:false};
    var reduced=matchMedia('(prefers-reduced-motion: reduce)');
    var touch=matchMedia('(pointer: coarse)');
    var games=[freshCatch(),freshMemory(),freshSnake()],snakeHelpSeen=false,memoryHelpSeen=false,snakeCells=[],snakePointer=null,snakeCanvas=null;
    var saveKey='zn_about_tv_round_v1';
    var bestKey='zn_tv_visit_best_v1',bestScores=[0,0,0],fastestKey='zn_tv_memory_fastest_seconds_v1',fastest=null;
    var guideUsed=false,guideDismissed=false,guideTimer=0,guideFade=0;
    try{var savedBest=JSON.parse(sessionStorage.getItem(bestKey));if(Array.isArray(savedBest))bestScores=bestScores.map(function(n,i){return i!==1&&Number.isFinite(savedBest[i])?Math.max(0,Math.floor(savedBest[i])):0;});}catch(e){}
    try{var savedTime=JSON.parse(sessionStorage.getItem(fastestKey));if(Number.isFinite(savedTime)&&savedTime>0)fastest=savedTime;}catch(e){}
    function freshCatch() { return {status:'idle',elapsed:0,score:0,spawn:.25,x:500,pets:[],effects:[]}; }
    function freshMemory() { return {status:'idle',cards:[],open:[],pairs:0,wait:0,elapsed:0,clockStarted:false}; }
    function freshSnake() { return {status:'idle',board:null,accumulator:0,resized:false,mapChanged:false}; }
    function words() { return WORDS[APP.lang] || WORDS.zh; }
    function title(i) { return words()[['catchTitle','memoryTitle','snakeTitle'][i]]; }
    function running() { return powered && visible && !leaving && !document.hidden && !transitioning && games[channel].status==='running'; }
    function stopLoop() { if(raf) cancelAnimationFrame(raf); raf=0; previous=0; keys.left=keys.right=false; }
    function release() {
      if(pointer!==null) { try{field.releasePointerCapture(pointer);}catch(e){} pointer=null; }
      if(snakePointer){try{snakeArea.releasePointerCapture(snakePointer.id);}catch(e){}snakePointer=null;}
      keys.left=keys.right=false;
    }
    function clearCatch() {
      games[0].pets.forEach(function(p){p.el.remove();});
      games[0].effects.forEach(function(p){p.el.remove();});
      games[0].pets=[]; games[0].effects=[];
    }
    function roundScore(i){var g=games[i];return i===0?g.score:i===1?g.elapsed:g.board?g.board.score:0;}
    function formatTime(seconds){var tenths=Math.floor(Math.max(0,seconds)*10),minutes=Math.floor(tenths/600);return minutes+':'+String(Math.floor(tenths/10)%60).padStart(2,'0')+'.'+tenths%10;}
    function recordBest(i){
      if(i===1){var g=games[1];if(!g.legacyTiming&&g.status==='ended'&&g.pairs===5&&g.clockStarted&&g.elapsed>0&&(fastest===null||g.elapsed<fastest)){fastest=g.elapsed;try{sessionStorage.setItem(fastestKey,JSON.stringify(fastest));}catch(e){}}return;}
      var score=roundScore(i);if(score<=bestScores[i])return;
      bestScores[i]=score;try{sessionStorage.setItem(bestKey,JSON.stringify(bestScores));}catch(e){} // Memory fallback is already updated.
    }
    function writeStat(node,label,value){
      if(!node.firstChild){make('span','tv-stat-label',node);make('strong','',node);}
      node.firstChild.textContent=label;node.lastChild.textContent=value;node.dataset.value=value;
    }
    function paintStats() {
      var w=words(), g=games[channel];
      writeStat(scoreStat,channel===1?w.elapsed:w.score,channel===1?formatTime(g.elapsed):roundScore(channel));
      writeStat(bestStat,channel===1?w.fastest:w.best,channel===1?(fastest===null?'--':formatTime(fastest)):bestScores[channel]);
      scoreStat.dataset.seconds=channel===1?g.elapsed:'';bestStat.dataset.seconds=channel===1&&fastest!==null?fastest:'';
      bestStat.title=channel===1?w.fastestLong:w.bestLong;bestStat.setAttribute('aria-label',bestStat.title+' '+bestStat.dataset.value);
      stats.classList.toggle('has-two-stats',channel===2);
      extraStat.hidden=channel===2;
      if(channel!==2)writeStat(extraStat,channel===0?w.time:w.pairs,channel===0?Math.max(0,Math.ceil(30-g.elapsed))+'s':g.pairs+'/5');
    }
    function paintCards() {
      var w=words(); games[1].cards.forEach(function(c,i){
        c.el.classList.toggle('is-open',c.open||c.matched); c.el.classList.toggle('is-matched',c.matched);
        c.el.setAttribute('aria-pressed',String(c.open||c.matched));
        c.el.setAttribute('aria-disabled',String(c.matched || games[1].wait>0 || games[1].status!=='running'));
        c.el.setAttribute('aria-label',c.open||c.matched ? PETS[c.id][APP.lang==='en'?2:1]+' · '+(c.matched?w.matched:w.face) : w.card+' '+(i+1));
      });
    }
    function celebration(parent) {
      var row=make('div','tv-celebration',parent); row.setAttribute('aria-hidden','true');
      [3,1,0,2,4].forEach(function(id){pet(id,row);});
    }
    function paintOverlay(i) {
      var g=games[i], o=overlays[i], w=words(); o.hidden=g.status==='running';
      if(o.hidden) return;
      o.replaceChildren(); var heading=make('h2','',o);
      heading.textContent=g.status==='paused'?w.paused:g.status==='ended'?(i===1?w.done:i===2&&g.board.status==='won'?w.snakeWon:w.roundOver):title(i);
      if(g.status==='ended'){var result=make('p','tv-result',o);writeStat(make('span','tv-stat',result),i===1?w.elapsed:w.result,i===1?formatTime(g.elapsed):roundScore(i));writeStat(make('span','tv-stat',result),i===1?w.fastest:w.best,i===1?(fastest===null?'--':formatTime(fastest)):bestScores[i]);}
      if(g.status==='ended'&&i!==2&&!(i===1&&g.legacyTiming)) celebration(o);
      if(i===1&&g.legacyTiming)make('p','',o).textContent=w.memoryChanged;
      if(g.status==='idle'&&(i===0||i===1&&!memoryHelpSeen||i===2&&!snakeHelpSeen)) { var hint=make('p','tv-instructions',o); hint.textContent=i===0?(touch.matches?w.touchHelp:w.catchHelp):i===1?w.memoryHelp:touch.matches?w.snakeTouchHelp:w.snakeHelp; }
      var resized=i===2&&g.status==='paused'&&g.resized;
      if(i===2&&g.mapChanged)make('p','',o).textContent=w.mapChanged;
      if(resized)make('p','',o).textContent=w.resizeHint;
      var actions=resized?make('div','tv-snake-actions',o):o;
      var action=make('button','tv-action',actions); action.type='button';
      action.textContent=w[g.status==='paused'?'resume':g.status==='ended'?'again':i===2?'snakeStart':'start'];
      action.addEventListener('click',function(){start(i);});
      if(resized){var reset=make('button','tv-action tv-snake-reset',actions);reset.type='button';reset.textContent=w.newBoard;reset.addEventListener('click',function(){start(2,true);});}
    }
    function paint() {
      var w=words(); section.setAttribute('aria-label',w.tv); screen.setAttribute('aria-label',w.screen);
      guideCopy.textContent=w.guide;
      knobHint.textContent=w.knobGuide;
      channelLabel.textContent='CH 0'+(channel+1);
      tune.setAttribute('aria-label',w.channel+' · CH 0'+(channel+1)); tune.dataset.tip=w.channel;
      dim.setAttribute('aria-label',w.brightness); dim.dataset.tip=w.brightness;
      dim.setAttribute('aria-valuenow',Math.round(brightness*100)); dim.setAttribute('aria-valuetext',Math.round(brightness*100)+'%');
      power.setAttribute('aria-label',w[powered?'off':'on']); power.setAttribute('aria-pressed',String(powered)); power.dataset.tip=w[powered?'off':'on'];
      tv.classList.toggle('is-off',!powered);
      picture.classList.toggle('is-snake',channel===2);
      screen.setAttribute('aria-hidden',String(!powered)); screen.inert=!powered;
      views.forEach(function(v,i){v.hidden=i!==channel; v.dataset.state=games[i].status;});
      field.classList.toggle('is-running',running() && channel===0);
      snakePause.hidden=['running','paused'].indexOf(games[channel].status)<0;
      snakePause.textContent=games[channel].status==='paused'?w.resume:w.pause;
      snakePause.setAttribute('aria-label',snakePause.textContent);
      snakeControls.querySelectorAll('button').forEach(function(button){button.setAttribute('aria-label',w[button.dataset.direction]);button.disabled=games[2].status!=='running';});
      snakeArea.classList.toggle('is-running',channel===2&&running());
      paintStats(); paintCards();views.forEach(function(v,i){paintOverlay(i);});layoutGuide();if(channel===2)drawSnake();
    }
    function pause() {
      settleClock();
      var changed=false; games.forEach(function(g){if(g.status==='running'){g.status='paused';changed=true;}});
      stopLoop(); release(); if(changed) paint();
    }
    function saveRound() {
      // Full-page navigation may not use the browser's back/forward cache.
      // Save only this tab's small game models, never elements or live timers.
      try { sessionStorage.setItem(saveKey,JSON.stringify({channel:channel,powered:powered,brightness:brightness,dial:dial,
        catchGame:{status:games[0].status,elapsed:games[0].elapsed,score:games[0].score,spawn:games[0].spawn,x:games[0].x,
          pets:games[0].pets.map(function(p){return {id:p.id,x:p.x,y:p.y,width:p.width,height:p.height,speed:p.speed,age:p.age||0,tilt:p.tilt};})},
        memoryGame:{metric:'elapsed-v1',legacyTiming:!!games[1].legacyTiming,status:games[1].status,pairs:games[1].pairs,elapsed:games[1].elapsed,clockStarted:games[1].clockStarted,helpSeen:memoryHelpSeen,wait:games[1].wait,open:games[1].open,
          cards:games[1].cards.map(function(c){return {id:c.id,open:c.open,matched:c.matched};})},
        snakeGame:{status:games[2].status,board:games[2].board,accumulator:games[2].accumulator,helpSeen:snakeHelpSeen,resized:games[2].resized}
      })); }catch(e){}
    }
    function restoreRound() {
      try {
        var raw=sessionStorage.getItem(saveKey);sessionStorage.removeItem(saveKey);if(!raw)return;
        var data=JSON.parse(raw),a=data.catchGame,b=data.memoryGame;
        if(!a || !b || !Array.isArray(a.pets) || !Array.isArray(b.cards) || a.pets.length>12 || b.cards.length>10)return;
        var valid=function(s){return ['idle','paused','running','ended'].indexOf(s)>=0;};
        if(!valid(a.status)||!valid(b.status))return;
        memoryHelpSeen=!!b.helpSeen;
        channel=data.channel===1?1:data.channel===2?2:0;powered=data.powered!==false;brightness=clamp(Number(data.brightness)||1,.4,1.2);dial=Number(data.dial)||0;
        games[0]=Object.assign(freshCatch(),a,{effects:[],status:a.status==='running'?'paused':a.status});
        games[0].pets=a.pets.filter(function(p){return PETS[p.id]&&[p.x,p.y,p.width,p.height,p.speed,p.tilt].every(Number.isFinite);}).map(function(p){
          p.el=pet(p.id,field,'tv-falling');p.el.style.width=p.width/10+'%';p.el.style.left=(p.x-p.width/2)/10+'%';p.el.style.top=p.y/7.3+'%';p.el.style.transform='rotate('+p.tilt+'deg)';return p;
        });
        if(b.cards.length===10 && b.cards.every(function(c){return PETS[c.id];})) {
          buildCards(b.cards.map(function(c){return c.id;}));
          games[1].status=b.status==='running'?'paused':b.status;games[1].pairs=clamp(b.pairs||0,0,5);games[1].wait=clamp(b.wait||0,0,.8);
          games[1].elapsed=b.metric==='elapsed-v1'?Math.max(0,Number(b.elapsed)||0):0;games[1].clockStarted=b.metric==='elapsed-v1'&&!!b.clockStarted;
          // An unfinished old scoring round can continue, but never contributes an incomplete time.
          games[1].legacyTiming=b.metric!=='elapsed-v1'||!!b.legacyTiming;
          games[1].open=(b.open||[]).filter(function(i){return Number.isInteger(i)&&i>=0&&i<10;}).slice(0,2);
          games[1].cards.forEach(function(c,i){c.open=!!b.cards[i].open;c.matched=!!b.cards[i].matched;});
        }
        var savedSnake=data.snakeGame;
        if(savedSnake){snakeHelpSeen=!!savedSnake.helpSeen;
          // Older rounds may contain a budgie food. Keep the position and round, use a cat instead.
          if(savedSnake.board&&savedSnake.board.food&&savedSnake.board.food.pet===4)savedSnake.board.food.pet=0;
          var restored=TV_SNAKE.restore(savedSnake.board);
          if(restored&&valid(savedSnake.status)){
            var preferred=snakeDimensions();
            games[2]={status:savedSnake.status==='running'?'paused':savedSnake.status,board:restored,accumulator:clamp(Number(savedSnake.accumulator)||0,0,.224),resized:!!savedSnake.resized||restored.cols>preferred.cols||restored.rows>preferred.rows};
          }
          else if(savedSnake.board){games[2]=freshSnake();games[2].mapChanged=true;}
        }
        picture.style.setProperty('--tv-brightness',brightness);dim.style.setProperty('--knob-turn',((brightness-1)*160)+'deg');tune.style.setProperty('--knob-turn',dial+'deg');
      }catch(e){field.querySelectorAll('.tv-pet,.tv-catch-point').forEach(function(n){n.remove();});games=[freshCatch(),freshMemory(),freshSnake()];cardsHost.replaceChildren();}
    }
    function suspend() { leaving=true; pause(); endSnow();hideGuide(false);observer.disconnect();guideObserver.disconnect();snakeResize.disconnect();saveRound(); }
    function start(i,fresh) {
      var rect=screen.getBoundingClientRect();visible=rect.width>0&&rect.height>0&&Math.max(0,Math.min(rect.right,innerWidth)-Math.max(rect.left,0))*Math.max(0,Math.min(rect.bottom,innerHeight)-Math.max(rect.top,0))/(rect.width*rect.height)>=.35;
      if(!powered || transitioning || !visible || leaving || document.hidden || i!==channel) return;
      hideGuide(true);
      var g=games[i];
      if(fresh||g.status!=='paused') {
        if(i===0) { clearCatch(); games[0]=freshCatch(); }
        else if(i===1) { games[1]=freshMemory();memoryHelpSeen=true;buildCards(); }
        else { games[2]=freshSnake();var size=snakeDimensions();games[2].board=TV_SNAKE.create(size.cols,size.rows);snakeHelpSeen=true; }
        g=games[i];
      }
      g.status='running';if(i===2)g.resized=false;paint(); screen.focus({preventScroll:true}); requestLoop();
    }
    function finish() {
      if(channel===1)settleClock();
      games[channel].status='ended';recordBest(channel);stopLoop(); release(); paint();
      overlays[channel].querySelector('button').focus({preventScroll:true});
    }
    function buildCards(order) {
      cardsHost.replaceChildren();
      games[1].cards=(order || shuffle([0,0,1,1,2,2,3,3,4,4])).map(function(id,i){
        var button=make('button','tv-card',cardsHost); button.type='button';
        button.addEventListener('pointerdown',function(e){if(channel===1&&running()){e.preventDefault();screen.focus({preventScroll:true});}});
        var back=make('span','tv-card-back',button), img=make('img','',back); img.src=ROOT+'game-card-back.png';img.alt='';img.draggable=false;
        var face=make('span','tv-card-face',button); pet(id,face);
        var card={id:id,el:button,open:false,matched:false};
        button.addEventListener('click',function(){turnCard(i);});return card;
      });
    }
    function turnCard(i) {
      var g=games[1], c=g.cards[i];
      if(channel!==1 || !running() || g.wait>0 || c.open || c.matched) return;
      settleClock();if(!g.clockStarted){g.clockStarted=true;previous=performance.now();requestLoop();}
      c.open=true; g.open.push(i); paintCards();
      if(g.open.length===2) {
        var a=g.cards[g.open[0]], b=g.cards[g.open[1]];
        if(a.id===b.id) { a.matched=b.matched=true;g.open=[];g.pairs++;paintCards();paintStats();if(g.pairs===5)finish(); }
        else { g.wait=.8;paintCards();paintStats();requestLoop(); }
      }
    }
    function setCushion() { cushion.style.left=(games[0].x/10-18.5)+'%'; }
    function spawn() {
      var g=games[0], id=Math.floor(Math.random()*5), p=PETS[id], box=p[4];
      var width=75+Math.random()*18, height=width*(box[3]-box[1])/(box[2]-box[0]);
      var node=pet(id,field,'tv-falling'); node.style.width=width/10+'%';
      // 1.45× the former speed; a gentle acceleration removes the long initial wait.
      // The visible pet reaches the cushion in about 2.6–3 seconds.
      g.pets.push({id:id,el:node,x:100+Math.random()*800,y:-height,width:width,height:height,speed:(115+Math.random()*30+g.elapsed*.4)*1.45,age:0,tilt:Math.random()*16-8});
    }
    function caught(p) {
      var g=games[0]; g.score++;recordBest(0);
      p.el.classList.remove('tv-falling');p.el.classList.add('tv-caught');p.el.style.transform='rotate('+p.tilt+'deg)';
      g.effects.push({el:p.el,time:.36});
      var point=make('span','tv-catch-point',field);point.textContent='+1';point.style.left=p.x/10+'%';point.style.top=p.y/7.3+'%';
      g.effects.push({el:point,time:.42}); paintStats();
    }
    function advanceCatch(dt) {
      var g=games[0];g.elapsed=Math.min(30,g.elapsed+dt);
      if(keys.left)g.x-=dt*600;if(keys.right)g.x+=dt*600;g.x=clamp(g.x,205,795);setCushion();
      g.spawn-=dt;if(g.spawn<=0){spawn();g.spawn=.65+Math.random()*.25;}
      g.pets=g.pets.filter(function(p){
        var oldBottom=p.y+p.height,age=p.age||0;p.y+=p.speed*dt+45*(age*dt+dt*dt/2);p.age=age+dt;
        // A pet's visible lower body must actually cross the cushion seat.
        // The transparent PNG canvas is excluded on both pets and cushion.
        var seat=635, crossed=oldBottom<=seat && p.y+p.height>=seat;
        p.el.style.left=(p.x-p.width/2)/10+'%';p.el.style.top=p.y/7.3+'%';p.el.style.transform='rotate('+p.tilt+'deg)';
        if(crossed && Math.abs(p.x-g.x)<137+p.width*.3){caught(p);return false;}
        if(p.y>740){p.el.remove();return false;}return true;
      });
      g.effects=g.effects.filter(function(p){p.time-=dt;if(p.time<=0){p.el.remove();return false;}return true;});
      paintStats();if(g.elapsed>=30)finish();
    }
    function advanceMemory(dt) {
      var g=games[1];if(g.clockStarted)g.elapsed+=dt;paintStats();if(g.wait<=0)return;g.wait=Math.max(0,g.wait-dt);
      if(g.wait===0){g.open.forEach(function(i){g.cards[i].open=false;});g.open=[];paintCards();}
    }
    function snakeDimensions(){
      var r=snakeArea.getBoundingClientRect();
      // Between the early large tiles and the previous 28×18 board. Existing rounds keep their grid.
      if(touch.matches||matchMedia('(max-width: 600px)').matches||screen.clientWidth<360){var cols=screen.clientWidth<230?14:screen.clientWidth<360?16:18;return {cols:cols,rows:clamp(Math.round(cols*r.height/r.width),6,10)};}
      return {cols:clamp(Math.round(14*r.width/r.height),20,24),rows:14};
    }
    function drawSnake(){
      var g=games[2],board=g.board;if(!board){snakeBoard.replaceChildren();snakeCells=[];return;}
      var area=snakeArea.getBoundingClientRect();if(!area.width||!area.height)return;
      var gap=area.width<300?.65:1,cell=Math.max(1,Math.floor(Math.min((area.width-gap*(board.cols-1))/board.cols,(area.height-gap*(board.rows-1))/board.rows)));
      snakeBoard.style.gridTemplateColumns='repeat('+board.cols+','+cell+'px)';snakeBoard.style.gridAutoRows=cell+'px';snakeBoard.style.gap=gap+'px';
      if(snakeCells.length!==board.cols*board.rows){snakeBoard.replaceChildren();snakeCells=[];for(var n=0;n<board.cols*board.rows;n++){var tile=make('div','tv-snake-cell',snakeBoard);snakeCells.push(tile);}snakeCanvas=make('canvas','tv-snake-ribbon',snakeBoard);}
      snakeCells.forEach(function(tile,index){var x=index%board.cols,y=Math.floor(index/board.cols);tile.className='tv-snake-cell';tile.classList.toggle('is-wall',!TV_SNAKE.passable(board,x,y));tile.dataset.x=x;tile.dataset.y=y;tile.replaceChildren();});
      board.body.forEach(function(p,i){var tile=snakeCells[p.y*board.cols+p.x];tile.classList.add(i===0?'is-head':'is-body');if(i===0)renderSnakeHead(tile,board.dir);});
      if(board.food){var f=board.food,tile=snakeCells[f.y*board.cols+f.x];tile.classList.add('is-food');var sticker=pet(f.pet,tile),bounds=PETS[f.pet][4];sticker.style.width=Math.min(.88,.88*(bounds[2]-bounds[0])/(bounds[3]-bounds[1]))*100+'%';}
      // One continuous stroke, with rounded joins and a short rounded tail. No tiled capsules.
      var width=board.cols*cell+(board.cols-1)*gap,height=board.rows*cell+(board.rows-1)*gap,dpr=devicePixelRatio||1;
      snakeCanvas.width=Math.round(width*dpr);snakeCanvas.height=Math.round(height*dpr);snakeCanvas.style.width=width+'px';snakeCanvas.style.height=height+'px';
      var ctx=snakeCanvas.getContext('2d');ctx.scale(dpr,dpr);ctx.strokeStyle=BODY_COLOR;ctx.lineWidth=cell*.56;ctx.lineCap='round';ctx.lineJoin='round';
      ctx.beginPath();board.body.slice().reverse().forEach(function(p,i){var x=p.x*(cell+gap)+cell/2,y=p.y*(cell+gap)+cell/2;if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});ctx.stroke();
      snakeBoard.dataset.cols=board.cols;snakeBoard.dataset.rows=board.rows;snakeBoard.dataset.direction=board.dir;
    }
    function advanceSnake(dt){
      var g=games[2];g.accumulator+=dt;
      while(g.accumulator>=.225&&g.status==='running'){g.accumulator-=.225;var result=TV_SNAKE.step(g.board);recordBest(2);drawSnake();paintStats();if(result==='lost'||result==='won')finish();}
    }
    function needsLoop(){return channel!==1||games[1].clockStarted||games[1].wait>0;}
    function requestLoop() { if(!raf && running() && needsLoop()){if(!previous)previous=performance.now();raf=requestAnimationFrame(tick);} }
    function settleClock(now){
      if(!previous||games[channel].status!=='running')return;
      now=now||performance.now();var dt=Math.max(0,(now-previous)/1000);previous=now;
      if(channel===0)advanceCatch(dt);else if(channel===1)advanceMemory(dt);else advanceSnake(dt);
    }
    function tick(now) {
      raf=0;if(!running()){previous=0;return;}
      // Real active elapsed time, independent of refresh rate. Every pause clears this anchor.
      settleClock(now);
      if(running() && needsLoop())requestLoop();else previous=0;
    }
    function endSnow() { clearTimeout(snowTimer);snowTimer=0;transitioning=false;snow.hidden=true;snow.replaceChildren(); }
    function hideGuide(dismiss){
      var wasVisible=!guide.hidden;
      clearTimeout(guideTimer);clearTimeout(guideFade);guideTimer=guideFade=0;
      guide.hidden=true;knobHint.hidden=true;knobArrow.setAttribute('hidden','');guide.classList.remove('is-fading');knobHint.classList.remove('is-fading');knobArrow.classList.remove('is-fading');tv.classList.remove('has-guide');tune.classList.remove('is-guided');
      tv.style.removeProperty('--tv-guide-end');
      if(wasVisible)snakeSize=null; // Removing the reserved note is not a window resize or a game pause.
      if(dismiss)guideDismissed=true; // Interaction is not evidence that the guide was actually seen.
    }
    function layoutGuide(){
      if(guide.hidden)return;
      // Use the actual HUD and wrapped text height, so neither language nor phone widths overlap it.
      guide.style.top=(hud.offsetTop+hud.offsetHeight+3)+'px';
      tv.style.setProperty('--tv-guide-end',(guide.offsetTop+guide.offsetHeight+4)+'px');
      var bounds=tv.getBoundingClientRect(),dial=tune.getBoundingClientRect(),x=dial.left-bounds.left,y=dial.top-bounds.top;
      var room=innerWidth-bounds.right-22,beside=room>=64;
      var width=beside?Math.min(156,room):Math.min(148,bounds.width*.26,innerWidth-24);
      knobHint.style.width=width+'px';
      var left=beside?bounds.width+10:clamp(x+dial.width/2+8-width/2,0,bounds.width-width);
      var top=beside?y+dial.height/2-knobHint.offsetHeight/2:-8-knobHint.offsetHeight;
      knobHint.style.left=left+'px';knobHint.style.top=top+'px';
      // Keep the arrow outside the hit target, and point at the UPPER channel dial in both layouts.
      var from=beside?{x:left-4,y:top+knobHint.offsetHeight/2}:{x:left+width*.55,y:top+knobHint.offsetHeight+3};
      var to=beside?{x:x+dial.width+4,y:y+dial.height/2}:{x:x+dial.width/2,y:y-3};
      var ox=Math.min(from.x,to.x)-7,oy=Math.min(from.y,to.y)-14,sw=Math.abs(from.x-to.x)+14,sh=Math.abs(from.y-to.y)+28;
      knobArrow.style.left=ox+'px';knobArrow.style.top=oy+'px';knobArrow.style.width=sw+'px';knobArrow.style.height=sh+'px';knobArrow.setAttribute('viewBox','0 0 '+sw+' '+sh);
      var sx=from.x-ox,sy=from.y-oy,tx=to.x-ox,ty=to.y-oy,cx=(sx+tx)/2,cy=beside?sy-8:sy;
      var angle=Math.atan2(ty-cy,tx-cx),len=5;
      arrowPath.setAttribute('d','M '+sx+' '+sy+' Q '+cx+' '+cy+' '+tx+' '+ty+' M '+(tx-len*Math.cos(angle-.55))+' '+(ty-len*Math.sin(angle-.55))+' L '+tx+' '+ty+' L '+(tx-len*Math.cos(angle+.55))+' '+(ty-len*Math.sin(angle+.55)));
      knobHint.dataset.placement=beside?'right':'above-dial';
    }
    function showGuide(){return;
      var r=screen.getBoundingClientRect(),height=Math.max(0,Math.min(r.bottom,innerHeight)-Math.max(r.top,85));
      var required=Math.min(r.height*.65,Math.max(0,innerHeight-100)*.75);
      if(guideUsed||guideDismissed||!powered||leaving||transitioning||document.hidden||games[channel].status==='running'||r.width<=0||height<required||height<=0)return;
      guide.hidden=false;knobHint.hidden=false;knobArrow.removeAttribute('hidden');tv.classList.add('has-guide');tune.classList.add('is-guided');
      layoutGuide();
      // In-memory only: once during this page stay, prepared anew on the next entry.
      guideUsed=true;
      guideTimer=setTimeout(function(){guide.classList.add('is-fading');knobHint.classList.add('is-fading');knobArrow.classList.add('is-fading');guideFade=setTimeout(function(){hideGuide(false);},250);},5500);
    }
    function changeChannel(direction) {
      hideGuide(true);
      var delta=typeof direction==='number'?direction:1;
      pause(); endSnow();channel=(channel+delta+views.length)%views.length;dial+=52*delta;tune.style.setProperty('--knob-turn',dial+'deg');
      paint(); if(!powered)return;
      transitioning=true; snow.hidden=false;
      if(Math.random()<.25)pet(Math.floor(Math.random()*5),snow);
      snowTimer=setTimeout(function(){endSnow();paint();},310);
    }
    function setBrightness(value) { hideGuide(true);brightness=clamp(value,.4,1.2);picture.style.setProperty('--tv-brightness',brightness);dim.style.setProperty('--knob-turn',((brightness-1)*160)+'deg');paint(); }
    function powerSwitch() {
      hideGuide(true);
      pause();endSnow();powered=!powered;
      if(!powered){clearCatch();games=[freshCatch(),freshMemory(),freshSnake()];cardsHost.replaceChildren();snakeBoard.replaceChildren();snakeCells=[];}
      paint();
    }
    tune.addEventListener('click',changeChannel);
    tune.addEventListener('keydown',function(e){if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();changeChannel(e.key==='ArrowLeft'?-1:1);}});
    power.addEventListener('click',powerSwitch);
    dim.addEventListener('click',function(){setBrightness(brightness>=1.15?.5:brightness+.2);});
    dim.addEventListener('keydown',function(e){
      var delta={ArrowLeft:-.1,ArrowDown:-.1,ArrowRight:.1,ArrowUp:.1}[e.key];
      if(delta){e.preventDefault();setBrightness(brightness+delta);}
      else if(e.key==='Home'||e.key==='End'){e.preventDefault();setBrightness(e.key==='Home'?.4:1.2);}
    });
    function rotary(control,isChannel) {
      var gesture=null, swallow=false;
      control.addEventListener('pointerdown',function(e){
        if(!e.isPrimary || e.button!==0)return;
        hideGuide(true);
        var r=control.getBoundingClientRect();
        gesture={id:e.pointerId,x:r.x+r.width/2,y:r.y+r.height/2,startX:e.clientX,startY:e.clientY,angle:0,last:0,moved:false,value:brightness};
        gesture.last=Math.atan2(e.clientY-gesture.y,e.clientX-gesture.x);control.setPointerCapture(e.pointerId);
      });
      control.addEventListener('pointermove',function(e){
        if(!gesture || gesture.id!==e.pointerId)return;
        var angle=Math.atan2(e.clientY-gesture.y,e.clientX-gesture.x), delta=angle-gesture.last;
        if(delta>Math.PI)delta-=Math.PI*2;if(delta<-Math.PI)delta+=Math.PI*2;
        gesture.angle+=delta;gesture.last=angle;
        if(Math.abs(gesture.angle)>.12 && Math.hypot(e.clientX-gesture.startX,e.clientY-gesture.startY)>5)gesture.moved=true;
        if(gesture.moved){control.classList.add('is-dragging');e.preventDefault();
          if(isChannel)control.style.setProperty('--knob-turn',(dial+gesture.angle*180/Math.PI)+'deg');
          else setBrightness(gesture.value+gesture.angle/Math.PI*.8);
        }
      });
      function done(e){
        if(!gesture || gesture.id!==e.pointerId)return;
        if(gesture.moved){swallow=e.type==='pointerup';if(isChannel){if(e.type==='pointerup')changeChannel(gesture.angle>=0?1:-1);else control.style.setProperty('--knob-turn',dial+'deg');}}
        gesture=null;control.classList.remove('is-dragging');
      }
      control.addEventListener('pointerup',done);control.addEventListener('pointercancel',done);control.addEventListener('lostpointercapture',done);
      control.addEventListener('click',function(e){if(swallow){swallow=false;e.stopImmediatePropagation();e.preventDefault();}},true);
    }
    rotary(tune,true);rotary(dim,false);
    function moveCushion(e) {
      var r=field.getBoundingClientRect();games[0].x=clamp((e.clientX-r.left)/r.width*1000,205,795);setCushion();
    }
    field.addEventListener('pointerdown',function(e){
      if(channel!==0 || !running() || !e.isPrimary || e.button!==0)return;
      pointer=e.pointerId;field.setPointerCapture(pointer);screen.focus({preventScroll:true});moveCushion(e);e.preventDefault();
    });
    field.addEventListener('pointermove',function(e){
      if(channel===0 && running() && (e.pointerType==='mouse' || pointer===e.pointerId)){moveCushion(e);if(pointer!==null)e.preventDefault();}
    });
    field.addEventListener('pointerup',release);field.addEventListener('pointercancel',release);field.addEventListener('lostpointercapture',function(){pointer=null;});
    snakeArea.addEventListener('pointerdown',function(e){
      if(channel!==2||!running()||!e.isPrimary||e.button!==0)return;
      snakePointer={id:e.pointerId,x:e.clientX,y:e.clientY};snakeArea.setPointerCapture(e.pointerId);screen.focus({preventScroll:true});e.preventDefault();
    });
    snakeArea.addEventListener('pointermove',function(e){
      if(!snakePointer||snakePointer.id!==e.pointerId||!running())return;
      var dx=e.clientX-snakePointer.x,dy=e.clientY-snakePointer.y;
      if(Math.max(Math.abs(dx),Math.abs(dy))>=7){TV_SNAKE.turn(games[2].board,Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');snakePointer.x=e.clientX;snakePointer.y=e.clientY;}
      e.preventDefault();
    });
    snakeArea.addEventListener('pointerup',release);snakeArea.addEventListener('pointercancel',release);snakeArea.addEventListener('lostpointercapture',function(){snakePointer=null;});
    screen.addEventListener('keydown',function(e){
      if(channel===2&&document.activeElement===screen&&powered){
        if(e.ctrlKey||e.metaKey||e.altKey)return;
        var g=games[2],direction={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',a:'left',s:'down',d:'right'}[e.key.length===1?e.key.toLowerCase():e.key];
        if(e.code==='Space'&&(g.status==='running'||g.status==='paused')){e.preventDefault();if(!e.repeat){if(g.status==='running')pause();else start(2);}return;}
        if(direction&&running()){e.preventDefault();TV_SNAKE.turn(g.board,direction);}return;
      }
      if(channel!==0 || !running() || document.activeElement!==screen)return;
      if(e.key==='ArrowLeft'||e.key==='ArrowRight'){e.preventDefault();keys[e.key==='ArrowLeft'?'left':'right']=true;}
    });
    screen.addEventListener('keyup',function(e){if(e.key==='ArrowLeft')keys.left=false;if(e.key==='ArrowRight')keys.right=false;});
    screen.addEventListener('focusout',function(e){keys.left=keys.right=false;
      if(e.relatedTarget&&screen.contains(e.relatedTarget))return;
      Promise.resolve().then(function(){if(games[channel].status==='running'&&!screen.contains(document.activeElement))pause();});
    });
    var snakeSize=null;
    window.addEventListener('resize',function(){
      pause();if(games[2].board){games[2].resized=true;paint();}layoutGuide();showGuide();
    },{passive:true});
    var snakeResize=new ResizeObserver(function(){
      if(channel!==2)return;var r=snakeArea.getBoundingClientRect();if(!r.width||!r.height)return;
      var size=r.width.toFixed(1)+','+r.height.toFixed(1);
      if(snakeSize&&snakeSize!==size&&games[2].board&&games[2].status==='running'){pause();games[2].resized=true;paint();}
      snakeSize=size;drawSnake();
    });snakeResize.observe(snakeArea);
    var observer=new IntersectionObserver(function(entries){
      visible=entries[0].isIntersecting && entries[0].intersectionRatio>=.35;
      if(!visible){pause();endSnow();hideGuide(false);}
    },{threshold:[0,.35,.65]}); observer.observe(screen);
    var guideObserver=new IntersectionObserver(function(entries){if(entries[0].isIntersecting)showGuide();},{threshold:[0,.25,.35,.5,.65,.85,1]});guideObserver.observe(screen);
    document.addEventListener('visibilitychange',function(){if(document.hidden){pause();endSnow();hideGuide(false);}});
    window.addEventListener('pagehide',suspend);
    window.addEventListener('pageshow',function(e){
      leaving=false;
      // BFCache restores the same document and its old flags; it is nevertheless a new page entry.
      if(e.persisted){hideGuide(false);guideUsed=false;guideDismissed=false;}
      observer.observe(screen);guideObserver.observe(screen);snakeResize.observe(snakeArea);
      try{sessionStorage.removeItem(saveKey);}catch(error){}
      requestAnimationFrame(showGuide); // Also handles a restored scroll position with TV already visible.
    });
    window.addEventListener('blur',pause);
    APP.onLang(paint);
    // One shared loop: idle/paused channels have none; the memory clock starts at the first flip.
    restoreRound();channel=selectedChannel;guideDismissed=true;[0,1,2].forEach(recordBest);paint();setCushion();
    return {suspend:suspend, pause:pause, start:function(){start(channel);}, restart:function(){start(channel,true);}};
  }};
})();
