/* Discrete grid rules shared by the TV controller and rule checks. No DOM or timers. */
(function () {
  'use strict';
  var DIRECTIONS={right:[1,0],down:[0,1],left:[-1,0],up:[0,-1]};
  function same(a,b){return a.x===b.x&&a.y===b.y;}
  function opposite(a,b){return DIRECTIONS[a][0]+DIRECTIONS[b][0]===0&&DIRECTIONS[a][1]+DIRECTIONS[b][1]===0;}
  function passable(game,x,y){
    if(x<0||x>=game.cols||y<0||y>=game.rows)return false;
    var band=Math.max(2,Math.round(game.rows*.28)),width=Math.max(4,Math.round(game.cols*.36)),left=Math.floor((game.cols-width)/2);
    return y<band||y>=game.rows-band||(x>=left&&x<left+width);
  }
  function food(game,random){
    var free=[];
    for(var y=0;y<game.rows;y++)for(var x=0;x<game.cols;x++){
      var cell={x:x,y:y};if(passable(game,x,y)&&!game.body.some(function(p){return same(cell,p);}))free.push(cell);
    }
    // Enumerate the empty cells; a full board never enters a random retry loop.
    if(!free.length){game.food=null;game.status='won';return;}
    var choice=free[Math.floor(random()*free.length)];
    game.food={x:choice.x,y:choice.y,pet:Math.floor(random()*4)};
  }
  function create(cols,rows,random){
    var x=Math.floor(cols/2),y=Math.floor(Math.max(2,Math.round(rows*.28))/2);
    var game={map:'i-v1',cols:cols,rows:rows,body:[{x:x,y:y},{x:x-1,y:y},{x:x-2,y:y},{x:x-3,y:y}],dir:'right',turns:[],score:0,status:'playing',food:null};
    food(game,random||Math.random);return game;
  }
  function turn(game,direction){
    if(game.status!=='playing'||!DIRECTIONS[direction]||game.turns.length>=2)return false;
    var last=game.turns.length?game.turns[game.turns.length-1]:game.dir;
    if(last===direction||opposite(last,direction))return false;
    game.turns.push(direction);return true;
  }
  function step(game,random){
    if(game.status!=='playing')return game.status;
    if(game.turns.length)game.dir=game.turns.shift(); // Exactly one turn per grid step.
    var d=DIRECTIONS[game.dir],head=game.body[0];
    var next={x:head.x+d[0],y:head.y+d[1]};
    if(!passable(game,next.x,next.y)){game.status='lost';return 'lost';}
    var growing=game.food&&same(next,game.food);
    // Unless growing, the tail leaves in this same step and is a legal destination.
    var occupied=game.body.slice(0,game.body.length-(growing?0:1));
    if(occupied.some(function(p){return same(p,next);})){game.status='lost';return 'lost';}
    game.body.unshift(next);
    if(growing){game.score++;food(game,random||Math.random);return game.status==='won'?'won':'ate';}
    game.body.pop();return 'moved';
  }
  function restore(raw){
    if(!raw||!Number.isInteger(raw.cols)||!Number.isInteger(raw.rows)||raw.cols<4||raw.cols>32||raw.rows<4||raw.rows>20||!DIRECTIONS[raw.dir]||!Array.isArray(raw.body)||raw.body.length<4||raw.body.length>raw.cols*raw.rows)return null;
    if(raw.map!=='i-v1')return null; // The controller explains when an older map needs a fresh round.
    var seen=new Set(),validCell=function(p){return p&&Number.isInteger(p.x)&&Number.isInteger(p.y)&&passable(raw,p.x,p.y);};
    if(!raw.body.every(function(p){var key=p.x+','+p.y;if(!validCell(p)||seen.has(key))return false;seen.add(key);return true;}))return null;
    if(['playing','lost','won'].indexOf(raw.status)<0||!Number.isInteger(raw.score)||raw.score<0)return null;
    if(raw.food&&(!validCell(raw.food)||seen.has(raw.food.x+','+raw.food.y)||!Number.isInteger(raw.food.pet)||raw.food.pet<0||raw.food.pet>3))return null;
    if(!raw.food&&raw.status!=='won')return null;
    var g={map:'i-v1',cols:raw.cols,rows:raw.rows,body:raw.body.map(function(p){return {x:p.x,y:p.y};}),dir:raw.dir,turns:[],score:raw.score,status:raw.status,food:raw.food?Object.assign({},raw.food):null};
    (raw.turns||[]).slice(0,2).forEach(function(direction){turn(g,direction);});return g;
  }
  window.TV_SNAKE={create:create,turn:turn,step:step,restore:restore,passable:passable};
})();
