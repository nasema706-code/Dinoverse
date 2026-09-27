import {NEW_SKINS,NEW_WORLDS,chapterMaze,PICKUP_ANCHORS} from './chapters.mjs';
export const DIRS = [{x:0,y:-1},{x:1,y:0},{x:0,y:1},{x:-1,y:0}];
export const SKINS = [
  {id:'classic',name:'Classic',color:'#a9df38',unlock:0},
  {id:'fire',name:'Fire',color:'#ff624b',unlock:1500},
  {id:'ice',name:'Ice',color:'#58dfff',unlock:4500},
  {id:'shadow',name:'Shadow',color:'#c67cff',unlock:9000},...NEW_SKINS
];
export const WORLDS = [
  {id:'jungle',name:'Jungle Ruins',short:'Jungle',color:'#39dcc6',stone:'#39483c',floor:'#091d1c',accent:'#9ebe46',sprite:12,speed:3.35},
  {id:'volcano',name:'Volcano',short:'Volcano',color:'#ff763c',stone:'#503831',floor:'#25110e',accent:'#ff863e',sprite:13,speed:3.65},
  {id:'ice',name:'Ice Caves',short:'Ice',color:'#63dfff',stone:'#345060',floor:'#081c2c',accent:'#a1eaff',sprite:14,speed:3.9},
  {id:'space',name:'Space Islands',short:'Space',color:'#b989ff',stone:'#493554',floor:'#190f2b',accent:'#d78bff',sprite:12,speed:4.1},...NEW_WORLDS
];
export const BASE_MAP = [
'#####################',
'#o........#........o#',
'#.###.###.#.###.###.#',
'#.#.....#...#.....#.#',
'#.#.###.#####.###.#.#',
'#...#...........#...#',
'###.#.###.#.###.#.###',
'#...#...#.#.#...#...#',
'#.#####.#...#.#####.#',
'#.......#...#.......#',
'#.###.#.#####.#.###.#',
'#...#.#.#CCC#.#.#...#',
'###.#.#.#CCC#.#.#.###',
'#...#...#####...#...#',
'#.#####...#...#####.#',
'#.......#...#.......#',
'#.###.#.#####.#.###.#',
'#...#.#.......#.#...#',
'###.#.###.#.###.#.###',
'#...#.....#.....#...#',
'#.#######.#.#######.#',
'#o.................o#',
'#####################'
];
export const COLS=21, ROWS=23;
export const tileKey=(x,y)=>y*COLS+x;
const actor=(x,y,dir=3)=>({x,y,cx:x,cy:y,nx:x,ny:y,progress:0,dir,queued:dir});
const emptyEffects=()=>({bite:0,speed:0,mega:0,magnet:0,shield:0,freeze:0,phase:0,stomp:0});
export class MazeGame {
  constructor({onEvent=()=>{}}={}) { this.onEvent=onEvent; this.skin=0; this.world=0; this.state='ready'; this.score=0; this.lives=3; this.time=0; this.reset(0); }
  emit(type,data={}) {this.onEvent({type,...data});}
  reset(world=0) {
    this.world=Number.isInteger(world)?Math.max(0,Math.min(WORLDS.length-1,world)):0;
    this.map=this.world>=4?chapterMaze(this.world):BASE_MAP.map(r=>r.split(''));
    if(this.world>=1&&this.world<4) for(const [x,y] of [[4,3],[16,3],[4,19],[16,19]]) this.map[y][x]='.';
    if(this.world>=2&&this.world<4) for(const [x,y] of [[10,1],[10,19]]) this.map[y][x]='.';
    if(this.world===3) for(const [x,y] of [[8,9],[12,9],[10,6]]) this.map[y][x]='.';
    this.pellets=new Map();this.powers=new Map();this.effects=emptyEffects();this.features=new Map();this.portalCooldown=0;
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(this.walkable(x,y))this.pellets.set(tileKey(x,y),'dot');
    const used=new Set([tileKey(10,21)]);
    this.homes=[[9,9],[11,9],[9,15],[11,15]].map(([x,y])=>this.nearestOpen(x,y,used));
    this.placeFeatures(used);
    const types=this.world<4?['speed','mega','magnet','speed','mega','magnet']:
      [WORLDS[this.world].special,WORLDS[this.world].special,...['shield','freeze','phase','stomp'].filter(t=>t!==WORLDS[this.world].special),['freeze','phase','stomp','shield'][this.world-4]];
    PICKUP_ANCHORS[this.world].forEach(([ax,ay],i)=>{
      const [x,y]=this.nearestOpen(ax,ay,used),key=tileKey(x,y);
      if(i<4)this.pellets.set(key,'power');
      else{this.powers.set(key,types[i-4]);this.pellets.delete(key);}
    });
    this.pellets.delete(tileKey(10,21));this.initialPellets=this.pellets.size;
    this.score=0; this.lives=3;this.time=0;this.combo=0;this.state='ready';this.invincible=0;this.lastChomp=-1;this.respawn=0;
    this.resetActors();this.emit('reset');
  }
  walkable(x,y) {return x>=0&&x<COLS&&y>=0&&y<ROWS&&this.map[y][x]!== '#'&&this.map[y][x]!=='C';}
  nearestOpen(tx,ty,used=new Set()){
    let result=null,distance=Infinity;
    for(let y=1;y<ROWS-1;y++)for(let x=1;x<COLS-1;x++)if(this.walkable(x,y)&&!used.has(tileKey(x,y))){const d=Math.abs(x-tx)+Math.abs(y-ty);if(d<distance){result=[x,y];distance=d;}}
    if(!result)throw new Error('No free corridor for level content');used.add(tileKey(...result));return result;
  }
  placeFeatures(used){
    if(this.world===4)for(const y of [5,17])for(let x=2;x<19;x++)if(this.walkable(x,y))this.features.set(tileKey(x,y),{type:'current',dir:y===5?1:3});
    if(this.world===5){
      for(const [a,b,label] of [[[1,3],[19,19],'A'],[[17,3],[3,19],'B']]){
        const from=this.nearestOpen(...a,used),to=this.nearestOpen(...b,used);
        this.features.set(tileKey(...from),{type:'portal',to,label});this.features.set(tileKey(...to),{type:'portal',to:from,label});
        this.pellets.delete(tileKey(...from));this.pellets.delete(tileKey(...to));
      }
    }
    if(this.world===6)for(let y=3;y<21;y+=4)for(let x=2;x<20;x++)if(this.walkable(x,y))this.features.set(tileKey(x,y),{type:'bloom'});
  }
  currentDirection(feature){return (feature.dir+(Math.floor(this.time/12)%2)*2)%4;}
  bloomActive(){return this.world===6&&this.time%10<6;}
  stormActive(){return this.world===7&&this.time%16>=12;}
  playerSpeed(){
    let speed=this.effects.speed>0?7:5.1;
    const feature=this.features.get(tileKey(this.player.cx,this.player.cy));
    if(feature?.type==='current'){const dir=this.currentDirection(feature);if(this.player.dir===dir)speed*=1.25;else if(this.player.dir===(dir+2)%4)speed*=.8;}
    return speed;
  }
  enterCell(x,y){
    this.eatAt(x,y);const feature=this.features.get(tileKey(x,y));
    if(this.state==='playing'&&feature?.type==='portal'&&this.portalCooldown<=0){
      const p=this.player,queued=p.queued;Object.assign(p,actor(...feature.to,p.dir));p.queued=queued;this.portalCooldown=.65;
      this.emit('portal',{x:p.x,y:p.y});this.eatAt(p.cx,p.cy);
    }
  }
  mechanicStatus(){
    if(this.world===4)return `Tide ${Math.floor(this.time/12)%2?'west':'east'} · reverses in ${Math.ceil(12-this.time%12)}s`;
    if(this.world===5)return 'Portal pairs A ↔ A · B ↔ B';
    if(this.world===6)return this.bloomActive()?`Spore bloom · double points on glowing patches · ${Math.ceil(6-this.time%10)}s`:`Next bloom in ${Math.ceil(10-this.time%10)}s`;
    if(this.world===7)return this.stormActive()?`Storm surge · spirits move faster · ${Math.ceil(16-this.time%16)}s`:`Next storm in ${Math.ceil(12-this.time%16)}s`;
    return 'Collect every orb to clear the maze';
  }
  resetActors() {
    this.player=actor(10,21,3);
    this.enemies=this.homes.map(([x,y],i)=>({...actor(x,y,i<2?0:i===2?3:1),id:i,delay:1.6+i*1.2,eaten:0}));
    this.portalCooldown=0;
    this.invincible=2.5;
  }
  start() { if(this.state==='ready'||this.state==='paused') { this.state='playing';this.emit('state'); } }
  pause() {if(this.state==='playing'){this.state='paused';this.emit('state');}}
  turn(dir) {
    if(!Number.isInteger(dir)||dir<0||dir>3)return;
    const p=this.player;p.queued=dir;
    if(this.state==='playing'&&p.progress>0&&dir===(p.dir+2)%4){
      const oldX=p.cx,oldY=p.cy;p.cx=p.nx;p.cy=p.ny;p.nx=oldX;p.ny=oldY;p.progress=1-p.progress;p.dir=dir;
      p.x=p.cx+DIRS[dir].x*p.progress;p.y=p.cy+DIRS[dir].y*p.progress;
    }
  }
  addScore(n,x=this.player.x,y=this.player.y) {
    const points=n*(this.effects.mega>0?2:1);this.score+=points;this.emit('score',{points,x,y});return points;
  }
  eatAt(x,y) {
    const key=tileKey(x,y),pellet=this.pellets.get(key),power=this.powers.get(key);
    if(pellet){
      this.pellets.delete(key);const bloom=this.bloomActive()&&this.features.get(key)?.type==='bloom';this.addScore(pellet==='power'?50:bloom?20:10,x,y);
      if(pellet==='power'){this.effects.bite=8;this.combo=0;this.emit('power',{effect:'bite',x,y});}
      else this.emit('chomp',{x,y});
    }
    if(power){
      this.powers.delete(key);this.effects[power]=({speed:7,freeze:8,phase:8,stomp:4})[power]||10;
      if(power==='stomp')for(const e of this.enemies){Object.assign(e,actor(...this.homes[e.id],0));e.delay=4;e.eaten=0;}
      this.addScore(100,x,y);this.emit('power',{effect:power,x,y});
    }
    if(this.pellets.size===0&&this.state==='playing'){this.addScore(500+this.lives*100);this.state='won';this.emit('win',{world:this.world,score:this.score});}
  }
  playerDirection(p) {
    const q=DIRS[p.queued],d=DIRS[p.dir];
    if(this.walkable(p.cx+q.x,p.cy+q.y))return p.queued;
    if(this.walkable(p.cx+d.x,p.cy+d.y))return p.dir;
    return -1;
  }
  distanceMap(tx,ty) {
    tx=Math.round(tx);ty=Math.round(ty);
    if(!this.walkable(tx,ty)){
      let best=Infinity,bx=10,by=21;
      for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(this.walkable(x,y)){
        const dist=(x-tx)**2+(y-ty)**2;if(dist<best){best=dist;bx=x;by=y;}
      }
      tx=bx;ty=by;
    }
    const dist=new Int16Array(COLS*ROWS).fill(-1),q=[tileKey(tx,ty)];dist[q[0]]=0;
    for(let i=0;i<q.length;i++){
      const key=q[i],x=key%COLS,y=Math.floor(key/COLS);
      for(const d of DIRS){const nx=x+d.x,ny=y+d.y,k=tileKey(nx,ny);if(this.walkable(nx,ny)&&dist[k]<0){dist[k]=dist[key]+1;q.push(k);}}
    }
    return dist;
  }
  enemyDirection(e) {
    let options=[0,1,2,3].filter(i=>this.walkable(e.cx+DIRS[i].x,e.cy+DIRS[i].y));
    if(options.length>1)options=options.filter(i=>i!==(e.dir+2)%4);
    if(!options.length)return -1;
    let tx=this.player.x,ty=this.player.y;
    const fright=this.effects.bite>0;
    if(!fright){
      const scatter=Math.floor(this.time/16)%3===0;
      if(scatter){const corners=[[19,1],[1,1],[19,21],[1,21]];[tx,ty]=corners[e.id];}
      else if(e.id===1){tx+=DIRS[this.player.dir].x*4;ty+=DIRS[this.player.dir].y*4;}
      else if(e.id===2){tx=20-tx;ty=22-ty;}
      else if(e.id===3&&Math.hypot(tx-e.cx,ty-e.cy)<5){tx=1;ty=21;}
    }
    const distances=this.distanceMap(tx,ty);
    options.sort((a,b)=>{
      const da=distances[tileKey(e.cx+DIRS[a].x,e.cy+DIRS[a].y)];
      const db=distances[tileKey(e.cx+DIRS[b].x,e.cy+DIRS[b].y)];
      return fright?db-da:da-db;
    });
    return options[0];
  }
  move(e,distance,decide,onCell=()=>{}) {
    let safety=0;
    while(distance>0.000001&&safety++<20&&this.state==='playing'){
      if(e.progress===0){const dir=decide(e);if(dir<0)break;e.dir=dir;e.nx=e.cx+DIRS[dir].x;e.ny=e.cy+DIRS[dir].y;}
      const amount=Math.min(1-e.progress,distance);e.progress+=amount;distance-=amount;
      e.x=e.cx+DIRS[e.dir].x*e.progress;e.y=e.cy+DIRS[e.dir].y*e.progress;
      if(e.progress>=0.999999){e.cx=e.nx;e.cy=e.ny;e.x=e.cx;e.y=e.cy;e.progress=0;onCell(e.cx,e.cy);}
    }
  }
  update(dt) {
    if(this.state!=='playing')return;
    dt=Math.max(0,Math.min(0.05,dt));this.time+=dt;
    for(const k of Object.keys(this.effects))this.effects[k]=Math.max(0,this.effects[k]-dt);
    this.invincible=Math.max(0,this.invincible-dt);
    this.portalCooldown=Math.max(0,this.portalCooldown-dt);
    if(this.respawn>0){this.respawn-=dt;if(this.respawn<=0){this.resetActors();this.emit('respawn');}return;}
    const speed=this.playerSpeed();
    this.move(this.player,dt*speed,p=>this.playerDirection(p),(x,y)=>this.enterCell(x,y));
    if(this.state!=='playing')return;
    if(this.effects.magnet>0){
      const p=this.player;
      for(const [key,type] of this.pellets){const x=key%COLS,y=Math.floor(key/COLS);if(type==='dot'&&Math.hypot(x-p.x,y-p.y)<2.2){this.eatAt(x,y);this.emit('magnet',{x,y});}}
    }
    for(const e of this.enemies){
      if(e.eaten>0){e.eaten-=dt;continue;}
      if(e.delay>0){e.delay-=dt;continue;}
      let enemySpeed=this.effects.bite>0?2.2:WORLDS[this.world].speed*(this.stormActive()?1.24:1);
      if(this.bloomActive()&&this.features.get(tileKey(e.cx,e.cy))?.type==='bloom')enemySpeed*=.55;
      if(this.effects.freeze>0)enemySpeed=0;
      this.move(e,dt*enemySpeed,g=>this.enemyDirection(g));
      if(Math.hypot(e.x-this.player.x,e.y-this.player.y)<0.66){
        if(this.effects.bite>0){
          const x=e.x,y=e.y,points=this.addScore(200*(2**Math.min(this.combo++,3)),x,y);Object.assign(e,actor(...this.homes[e.id],0));e.eaten=4;e.delay=0;
          this.emit('capture',{x,y,points});
        }else if(this.invincible<=0&&this.effects.phase<=0){
          if(this.effects.shield>0){this.effects.shield=0;this.invincible=1.5;this.emit('shield',{x:this.player.x,y:this.player.y});continue;}
          this.lives--;this.effects=emptyEffects();this.emit('hit',{x:this.player.x,y:this.player.y,lives:this.lives});
          if(this.lives===0){this.state='over';this.emit('over',{score:this.score});}
          else{this.respawn=1.1;this.invincible=2;}
          break;
        }
      }
    }
  }
  snapshot(){return {state:this.state,world:WORLDS[this.world].name,character:SKINS[this.skin].name,score:this.score,lives:this.lives,orbsRemaining:this.pellets.size,effects:{...this.effects}};}
}
