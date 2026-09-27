import {COLS,ROWS,WORLDS,SKINS} from './engine.mjs';
import {POWER_INFO} from './chapters.mjs';
export const CELL=32,WIDTH=COLS*CELL,HEIGHT=ROWS*CELL;
const pos=v=>(v+.5)*CELL;
const hash=(x,y)=>{const n=Math.sin(x*127.1+y*311.7)*43758.5453;return n-Math.floor(n);};
export class MazeRenderer{
  constructor(canvas,{atlas,chapterAtlas,wallAtlas,worldImages=[],environment,createCanvas,scale=1,reducedMotion=false}){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.atlas=atlas;this.environment=environment;this.makeCanvas=createCanvas;this.scale=scale;this.reducedMotion=reducedMotion;
    this.chapterAtlas=chapterAtlas;this.wallAtlas=wallAtlas;this.worldImages=worldImages;
    this.canvas.width=WIDTH*scale;this.canvas.height=HEIGHT*scale;this.board=null;this.boardWorld=-1;this.particles=[];this.floats=[];this.shake=0;
    this.dot=createCanvas(52,52);const c=this.dot.getContext('2d');const g=c.createRadialGradient(26,26,1,26,26,25);g.addColorStop(0,'#fff6b1');g.addColorStop(.12,'#ffe568');g.addColorStop(.24,'#ffba36bc');g.addColorStop(.47,'#ff950326');g.addColorStop(1,'#ff8c0000');c.fillStyle=g;c.fillRect(0,0,52,52);c.fillStyle='#fff0a0';c.beginPath();c.ellipse(26,26,4,5,0,0,Math.PI*2);c.fill();
  }
  sprite(ctx,id,x,y,w,h=w,flip=false,rotation=0){
    const atlas=id>=16?this.chapterAtlas:this.atlas;if(!atlas)return;
    const index=id>=16?id-16:id,s=atlas.width/4,sh=atlas.height/(id>=16?2:4),sx=(index%4)*s,sy=Math.floor(index/4)*sh;
    ctx.save();ctx.translate(x,y);if(rotation)ctx.rotate(rotation);if(flip)ctx.scale(-1,1);ctx.drawImage(atlas,sx,sy,s,sh,-w/2,-h/2,w,h);ctx.restore();
  }
  buildBoard(game){
    const c=this.makeCanvas(WIDTH,HEIGHT),ctx=c.getContext('2d'),world=WORLDS[game.world];
    ctx.fillStyle=world.floor;ctx.fillRect(0,0,WIDTH,HEIGHT);
    if(this.environment){ctx.globalAlpha=.065;ctx.drawImage(this.environment,0,0,WIDTH,HEIGHT);ctx.globalAlpha=1;}
    if(this.worldImages[game.world]){ctx.globalAlpha=.15;ctx.drawImage(this.worldImages[game.world],0,0,WIDTH,HEIGHT);ctx.globalAlpha=1;}
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++){
      if(game.walkable(x,y)){
        const n=hash(x,y);ctx.fillStyle=game.world>=4?world.accent+'13':game.world===1?`rgba(135,77,30,${.05+n*.11})`:game.world===3?`rgba(117,81,146,${.05+n*.10})`:`rgba(92,129,105,${.035+n*.085})`;
        ctx.fillRect(x*CELL+1,y*CELL+1,CELL-2,CELL-2);ctx.strokeStyle='#a2bbac05';ctx.strokeRect(x*CELL+2,y*CELL+2,CELL-4,CELL-4);
      }
    }
    ctx.shadowColor='#000b';ctx.shadowBlur=7;ctx.shadowOffsetY=5;
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(!game.walkable(x,y)&&game.map[y][x]!=='C'){
      ctx.fillStyle=world.stone;ctx.beginPath();ctx.roundRect(x*CELL+1,y*CELL+1,CELL-2,CELL-2,5);ctx.fill();
    }
    ctx.shadowBlur=0;ctx.shadowOffsetY=0;
    for(let y=0;y<ROWS;y++)for(let x=0;x<COLS;x++)if(!game.walkable(x,y)&&game.map[y][x]!=='C'){
      ctx.save();
      if(game.world===3)ctx.filter='hue-rotate(155deg) saturate(.85)';
      if(world.texture&&!this.wallAtlas)ctx.filter=world.texture;
      const connections=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>game.map[y+dy]?.[x+dx]==='#');
      const vertical=connections[2]&&connections[3]&&!connections[0]&&!connections[1];
      const accent=hash(x,y)>.86 || (connections.filter(Boolean).length===2 && connections[0]!==connections[1] && connections[2]!==connections[3]);
      if(game.world>=4&&this.wallAtlas){
        const side=this.wallAtlas.width/2,index=game.world-4,baseX=(index%2)*side,baseY=Math.floor(index/2)*side;
        const variant=Math.floor(hash(x,y)*4),patches=[[.14,.14],[.68,.15],[.14,.7],[.69,.69]],patch=patches[variant];
        const sx=baseX+(accent?.11:patch[0])*side,sy=baseY+(accent?.11:patch[1])*side,size=side*(accent?.82:.23);
        ctx.save();ctx.translate(pos(x),pos(y));if(vertical)ctx.rotate(Math.PI/2);ctx.drawImage(this.wallAtlas,sx,sy,size,size,-CELL/2,-CELL/2,CELL,CELL);ctx.restore();
        ctx.strokeStyle='#020b0966';ctx.strokeRect(x*CELL+1,y*CELL+1,CELL-2,CELL-2);
      }
      else if(accent){this.sprite(ctx,world.sprite,pos(x),pos(y),CELL*1.23,CELL*1.23,false,0);}
      else if(this.atlas){
        const size=this.atlas.width/4,id=world.sprite,variant=Math.floor(hash(x,y)*3),sx=(id%4)*size+43+variant*67,sy=Math.floor(id/4)*size+31;
        ctx.save();ctx.translate(pos(x),pos(y));if(vertical)ctx.rotate(Math.PI/2);
        ctx.drawImage(this.atlas,sx,sy,69,72,-CELL/2,-CELL/2,CELL,CELL);
        ctx.restore();
        ctx.strokeStyle='#020b0977';ctx.lineWidth=1;ctx.strokeRect(x*CELL+1,y*CELL+1,CELL-2,CELL-2);
      }
      ctx.restore();
      if(hash(x,y)>.8){ctx.fillStyle=world.color+'22';ctx.fillRect(x*CELL+4,y*CELL+3,24,1);}
    }
    const vignette=ctx.createRadialGradient(WIDTH/2,HEIGHT/2,WIDTH*.28,WIDTH/2,HEIGHT/2,HEIGHT*.73);vignette.addColorStop(0,'#00000000');vignette.addColorStop(1,'#00100a8a');ctx.fillStyle=vignette;ctx.fillRect(0,0,WIDTH,HEIGHT);
    ctx.strokeStyle=world.color+'66';ctx.lineWidth=1;ctx.strokeRect(14,14,WIDTH-28,HEIGHT-28);
    this.board=c;this.boardWorld=game.world;
  }
  glow(ctx,x,y,r,color,opacity=1){ctx.save();ctx.globalAlpha=opacity;const g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color+'75');g.addColorStop(.45,color+'2b');g.addColorStop(1,color+'00');ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();}
  burst(x,y,color,count=14){if(this.reducedMotion)return;for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,v=35+Math.random()*95;this.particles.push({x:pos(x),y:pos(y),vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.35+Math.random()*.6,full:1,color,size:1.5+Math.random()*3});}if(this.particles.length>200)this.particles.splice(0,this.particles.length-200);}
  float(text,x,y,color='#ffe087'){this.floats.push({text,x:pos(x),y:pos(y),life:1.05,color});}
  draw(game,now,dt){
    if(!this.board||this.boardWorld!==game.world)this.buildBoard(game);
    const ctx=this.ctx,t=this.reducedMotion?0:now,world=WORLDS[game.world];
    ctx.setTransform(this.scale,0,0,this.scale,0,0);ctx.clearRect(0,0,WIDTH,HEIGHT);ctx.save();
    if(this.shake>0&&!this.reducedMotion){ctx.translate(Math.sin(t*65)*this.shake*6,Math.cos(t*79)*this.shake*5);this.shake=Math.max(0,this.shake-dt*2);}
    ctx.drawImage(this.board,0,0);
    this.drawFeatures(ctx,game,t);
    const cx=pos(10),cy=pos(11.5);
    this.glow(ctx,cx,cy,85,world.color,.8+.2*Math.sin(t*2));
    ctx.save();if(world.texture)ctx.filter=world.texture;this.sprite(ctx,15,cx,cy-3,115,115);ctx.restore();
    for(let i=0;i<8;i++){
      const a=t*.25+i*Math.PI/4,x=cx+Math.cos(a)*42,y=cy+Math.sin(a)*25;ctx.fillStyle=world.color;ctx.globalAlpha=.2+.3*Math.sin(t*1.5+i)**2;ctx.beginPath();ctx.arc(x,y,1.3,0,Math.PI*2);ctx.fill();
    }ctx.globalAlpha=1;
    for(const [key,type] of game.pellets){
      const x=key%COLS,y=Math.floor(key/COLS),px=pos(x),py=pos(y);
      if(type==='power'){
        this.glow(ctx,px,py,37,'#ffb53c',.8);const s=34+Math.sin(t*3)*2;this.sprite(ctx,8,px,py,s,s);
      }else{ctx.globalAlpha=.86+.14*Math.sin(t*2+x*.5+y*.6);ctx.drawImage(this.dot,px-15,py-15,30,30);}
    }ctx.globalAlpha=1;
    for(const [key,type] of game.powers){const id=POWER_INFO[type].id,x=pos(key%COLS),y=pos(Math.floor(key/COLS));this.sprite(ctx,id,x,y+Math.sin(t*2.4+key)*2,30,30);}
    if(game.effects.magnet>0){
      const p=game.player;ctx.save();ctx.strokeStyle='#6ddeffaa';ctx.lineWidth=1.5;ctx.setLineDash([4,10]);ctx.lineDashOffset=-t*18;ctx.beginPath();ctx.ellipse(pos(p.x),pos(p.y),65,57,0,0,Math.PI*2);ctx.stroke();ctx.restore();
    }
    for(const e of game.enemies){
      if(e.eaten>0)continue;const px=pos(e.x),py=pos(e.y),fear=game.effects.bite>0,flash=game.effects.bite<2&&Math.floor(t*7)%2===0;
      ctx.save();ctx.globalAlpha=e.delay>0?.65:1;if(game.effects.freeze>0)ctx.filter='grayscale(.8) brightness(1.4)';this.sprite(ctx,fear&&!flash?5:4+e.id,px,py-2+Math.sin(t*5+e.id)*2,44,44,e.dir===3);ctx.restore();
    }
    if(game.respawn<=0){
      const p=game.player,px=pos(p.x),py=pos(p.y),moving=p.progress>0&&game.state==='playing',bounce=moving?Math.sin(t*19)*2:0;
      if(game.effects.bite>0){this.glow(ctx,px,py,43,'#ffb72b',1);ctx.save();ctx.strokeStyle='#ffdc8299';ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,24+Math.sin(t*8)*2,0,Math.PI*2);ctx.stroke();ctx.restore();}
      const skinSprite=SKINS[game.skin].sprite??game.skin;
      if(game.effects.shield>0){ctx.save();ctx.strokeStyle='#7bfff0';ctx.lineWidth=2.5;this.glow(ctx,px,py,36,'#5eeadc',.65);ctx.beginPath();ctx.arc(px,py,28,0,Math.PI*2);ctx.stroke();ctx.restore();}
      if(game.effects.speed>0)for(let i=1;i<=3;i++){ctx.globalAlpha=(4-i)*.065;this.sprite(ctx,skinSprite,px-(p.dir===1?1:p.dir===3?-1:0)*i*8,py+((p.dir===0?1:p.dir===2?-1:0)*i*8),48,48,p.dir===3);}ctx.globalAlpha=1;
      ctx.save();if(game.invincible>0&&game.state==='playing')ctx.globalAlpha=.55+.45*Math.sin(t*14)**2;
      if(game.effects.phase>0)ctx.globalAlpha=.5;
      const tilt=moving?Math.sin(t*14)*.035:0;this.sprite(ctx,skinSprite,px,py-9+bounce,game.skin>=4?61:75,game.skin>=4?61:75,p.dir===3,tilt);ctx.restore();
      if(game.state==='ready'){ctx.fillStyle='#ffe29e';ctx.font='bold 10px Trebuchet MS, sans-serif';ctx.textAlign='center';ctx.shadowColor='#000';ctx.shadowBlur=6;ctx.fillText('YOU',px,py+26);ctx.shadowBlur=0;}
    }
    for(let i=this.particles.length-1;i>=0;i--){const p=this.particles[i];p.life-=dt;if(p.life<=0){this.particles.splice(i,1);continue;}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=45*dt;ctx.globalAlpha=Math.min(p.life*2,1);ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(p.x,p.y,p.size,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;
    for(let i=this.floats.length-1;i>=0;i--){const f=this.floats[i];f.life-=dt;if(f.life<=0){this.floats.splice(i,1);continue;}f.y-=25*dt;ctx.globalAlpha=Math.min(f.life*2.5,1);ctx.font='900 19px Trebuchet MS, sans-serif';ctx.textAlign='center';ctx.lineWidth=4;ctx.strokeStyle='#041217';ctx.strokeText(f.text,f.x,f.y);ctx.fillStyle=f.color;ctx.fillText(f.text,f.x,f.y);}ctx.globalAlpha=1;
    if(!this.reducedMotion){for(let i=0;i<14;i++){const x=(hash(i,3)*WIDTH+Math.sin(t*.3+i)*15),y=(hash(i,7)*HEIGHT-t*3+i*20+HEIGHT*5)%HEIGHT;ctx.globalAlpha=.15+.25*Math.sin(t+i)**2;ctx.fillStyle=world.color;ctx.beginPath();ctx.arc(x,y,1.2,0,Math.PI*2);ctx.fill();}ctx.globalAlpha=1;}
    ctx.restore();
  }
  drawFeatures(ctx,game,t){
    for(const [key,feature] of game.features){const x=pos(key%COLS),y=pos(Math.floor(key/COLS));ctx.save();
      if(feature.type==='current'){
        ctx.translate(x,y);ctx.rotate(game.currentDirection(feature)===1?0:Math.PI);ctx.strokeStyle='#6de9e0aa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-8,-6);ctx.lineTo(-1,0);ctx.lineTo(-8,6);ctx.stroke();
      }else if(feature.type==='portal'){
        const color=feature.label==='A'?'#ffbe61':'#bf8eff';this.glow(ctx,x,y,29,color,.65);ctx.strokeStyle=color;ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(x,y,12,10,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#fff0cc';ctx.font='bold 12px Trebuchet MS';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(feature.label,x,y);
      }else if(feature.type==='bloom'){
        ctx.globalAlpha=game.bloomActive()?.5:.13;ctx.fillStyle='#a2ed79';ctx.beginPath();ctx.roundRect(x-14,y-14,28,28,8);ctx.fill();
      }ctx.restore();
    }
    if(game.stormActive()){ctx.save();ctx.strokeStyle='#bedaffaa';ctx.lineWidth=6;ctx.strokeRect(3,3,WIDTH-6,HEIGHT-6);ctx.restore();}
  }
}
