import {MazeGame,SKINS,WORLDS} from './engine.mjs';
import {MazeRenderer} from './render.mjs';
import {GameAudio,WORLD_MUSIC} from './audio.mjs';
import {CHAPTERS,POWER_INFO} from './chapters.mjs';
import {normalizeProgress,canPlayWorld,canUseSkin} from './progress.mjs';
const $=id=>document.getElementById(id);
const fmt=n=>Math.floor(n).toLocaleString('en-GB');
const STORAGE='apex-chomp-v1';
const effectInfo=POWER_INFO;
const skinNotes=['The original glow gobbler','A little fire. A lot of bite.','Cool under pressure','A creature of the neon night'];
let storageAvailable=true;
function readProgress(){try{return normalizeProgress(JSON.parse(localStorage.getItem(STORAGE)||'null'));}catch{storageAvailable=false;return normalizeProgress(null);}}
const progress=readProgress();
let selectedChapter=progress.world>=4?1:0;
let saveTimer=null;
function saveProgress(){try{localStorage.setItem(STORAGE,JSON.stringify(progress));}catch{storageAvailable=false;}$('save-label').textContent=storageAvailable?'Progress saved on this device':'Progress lasts for this session';publishCloud(null);}
function scheduleSave(){if(!saveTimer)saveTimer=setTimeout(()=>{saveTimer=null;saveProgress();},900);}
let cloudQuiet=false;
function publishCloud(run){
  if(cloudQuiet||window.parent===window)return;
  window.parent.postMessage({
    source:'apex-chomp',
    progress:{best:progress.best,completed:[...progress.completed],skin:progress.skin,world:progress.world,sound:progress.sound},
    run,
  },location.origin);
}
window.addEventListener('message',event=>{
  if(event.origin!==location.origin)return;
  const msg=event.data;
  if(!msg||msg.source!=='dinoverse'||msg.type!=='hydrate'||!msg.progress)return;
  const incoming=normalizeProgress(msg.progress);
  cloudQuiet=true;
  progress.completed=[...new Set([...progress.completed,...incoming.completed])];
  if(incoming.best>progress.best){
    progress.best=incoming.best;
    progress.skin=incoming.skin;
    progress.world=incoming.world;
  }
  progress.sound=incoming.sound;
  selectedChapter=progress.world>=4?1:0;
  if(game)game.skin=progress.skin;
  audio.enabled=progress.sound;
  try{localStorage.setItem(STORAGE,JSON.stringify(progress));}catch{/* keep session */}
  renderSelection();updateSound();updateHud();updateOverlay();
  cloudQuiet=false;
  $('save-label').textContent='Saved under your hunter name';
});
const audio=new GameAudio();audio.enabled=progress.sound;
let renderer=null,game=null,assetsReady=false,toastTimer,calloutTimer,effectsSignature='',lastNow=0,lastUi=0,confirmAction=null,confirmWasRunning=false,helpWasRunning=false;
function spriteStyle(id){const chapter=id>=16,index=chapter?id-16:id;return `--sprite-image:url('assets/${chapter?'chapter2-sprites':'sprites'}.webp');--sprite-size:400% ${chapter?'200':'400'}%;--sx:${(index%4)*100/3}%;--sy:${Math.floor(index/4)*100/(chapter?1:3)}%`;}
function applySprites(root=document){root.querySelectorAll('[data-sprite]').forEach(el=>{el.style.cssText=spriteStyle(Number(el.dataset.sprite));});}
function icon(name){return `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;}
function toast(text){$('toast').textContent=text;$('toast').classList.add('visible');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').classList.remove('visible'),4200);}
function announce(text){$('announcer').textContent=text;}
function callout(text,duration=1000){$('callout').textContent=text;$('callout').classList.add('visible');clearTimeout(calloutTimer);calloutTimer=setTimeout(()=>$('callout').classList.remove('visible'),duration);}
function isWorldUnlocked(i){return canPlayWorld(progress,i);}
function isSkinUnlocked(i){return canUseSkin(progress,i);}
function updateSound(){const b=$('sound');b.innerHTML=icon(audio.enabled?'sound':'mute');b.setAttribute('aria-label',audio.enabled?'Mute sound':'Enable sound');b.setAttribute('aria-pressed',String(audio.enabled));b.title=audio.enabled?'Mute sound':'Enable sound';}
function renderSelection(){
  const first=selectedChapter*4,world=WORLDS[game.world],chapter=CHAPTERS[selectedChapter];
  const skinLock=s=>s.unlockWorld!==undefined?'clear Space Islands':`score ${fmt(s.unlock)} in one run`;
  $('skins').innerHTML=SKINS.slice(first,first+4).map((s,n)=>{const i=first+n;return `<button class="skin-card ${isSkinUnlocked(i)?'':'locked'}" style="--skin-color:${s.color}" data-skin="${i}" aria-pressed="${game.skin===i}" aria-label="${s.name}${isSkinUnlocked(i)?'':`, locked: ${skinLock(s)}`}"><span class="sprite" style="${spriteStyle(s.sprite??i)}" aria-hidden="true"></span><strong>${['Trike','Stego','Raptor','Anky'][i-4]||s.name}</strong>${isSkinUnlocked(i)?'':`<svg class="card-lock" aria-hidden="true"><use href="#i-lock"/></svg>`}</button>`;}).join('');
  $('worlds').innerHTML=WORLDS.slice(first,first+4).map((w,n)=>{const i=first+n;return `<button class="world-card ${isWorldUnlocked(i)?'':'locked'}" data-world="${i}" aria-pressed="${game.world===i}" aria-label="${w.name}${isWorldUnlocked(i)?'':`, locked: clear ${WORLDS[i-1].name} first`}"><img class="world-art" src="assets/world-${w.id}.webp" alt=""><strong>${w.name}</strong>${isWorldUnlocked(i)?(progress.completed.includes(i)?'<svg class="card-lock" aria-label="Completed"><use href="#i-check"/></svg>':''):'<svg class="card-lock" aria-hidden="true"><use href="#i-lock"/></svg>'}</button>`;}).join('');
  const powerKeys=selectedChapter?['shield','freeze','phase','stomp']:['bite','speed','mega','magnet'];
  $('power-ups').innerHTML=powerKeys.map(k=>{const p=effectInfo[k];return `<button class="power-card" data-power="${k}"><span class="sprite" style="${spriteStyle(p.id)}" aria-hidden="true"></span><strong>${p.name}</strong><span>${p.short}</span></button>`;}).join('');
  $('skin-count').textContent=`${SKINS.slice(first,first+4).filter((_,n)=>isSkinUnlocked(first+n)).length} / 4`;
  $('world-count').textContent=`${WORLDS.slice(first,first+4).filter((_,n)=>isWorldUnlocked(first+n)).length} / 4`;
  $('skin-note').textContent=`${SKINS[game.skin].name} · ${SKINS[game.skin].note||skinNotes[game.skin]}`;
  $('world-note').textContent=progress.completed.length===WORLDS.length?'Eight worlds explored. Your next best score awaits.':selectedChapter&&!isWorldUnlocked(4)?'Clear Space Islands to unlock Lost Realms.':selectedChapter?'Clear each realm to open the next. All four new dinosaurs are yours.':progress.completed.includes(3)?'Chapter 02 is open. Discover Lost Realms.':'Clear each maze to discover the next world.';
  $('chapter-name').textContent=chapter.name;$('chapter-info').textContent=chapter.subtitle;
  document.querySelectorAll('[data-chapter]').forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.chapter)===selectedChapter)));
  $('note-number').textContent=selectedChapter?'02':'01';$('tip').textContent=selectedChapter?'New powers. New routes. The golden Super bite orbs still turn spirits into prey.':'The big golden orbs turn the hunters into the hunted.';
  $('next-chapter').hidden=!!selectedChapter;$('next-chapter').textContent=isWorldUnlocked(4)?'02 · Enter Lost Realms':'02 · Preview the next chapter';
  const sprite=SKINS[game.skin].sprite??game.skin;
  document.querySelectorAll('.avatar,.overlay-character').forEach(el=>{el.dataset.sprite=sprite;el.style.cssText=spriteStyle(sprite);});
  document.documentElement.style.setProperty('--cyan',world.color);
  document.documentElement.style.setProperty('--scene-image',`url('assets/${game.world>=4?`world-${world.id}`:'environment'}.webp')`);
  $('world-rule').textContent=world.rule||'Gather every glow. Outsmart the spirits.';
  $('maze-type').textContent=world.maze||'Classic ruins';
  $('music-label').textContent=audio.enabled?`♫ ${WORLD_MUSIC[world.id].name}`:'Sound off';
  $('chapter-cover').hidden=game.world<4;
  $('cover-world').src=`assets/world-${world.id}.webp`;$('cover-world').alt=world.name;
  $('cover-world-title').textContent=world.name;$('cover-world-rule').textContent=world.rule||'';
}
function updateHud(){
  $('score').textContent=fmt(game.score);$('best').textContent=fmt(progress.best);$('lives').textContent=`× ${game.lives}`;$('lives').setAttribute('aria-label',`${game.lives} lives`);
  const eaten=game.initialPellets-game.pellets.size;$('orb-count').textContent=`${eaten} / ${game.initialPellets} orbs`;$('orb-progress').style.width=`${100*eaten/game.initialPellets}%`;
  $('world-label').textContent=WORLDS[game.world].name;$('mechanic-status').textContent=game.mechanicStatus();$('mechanic-status').classList.toggle('storm-active',game.stormActive());
  const sig=Object.entries(game.effects).map(([k,v])=>v>0?`${k}${Math.ceil(v)}`:'').join('|');
  if(sig!==effectsSignature){effectsSignature=sig;$('active-effects').innerHTML=Object.entries(game.effects).filter(([,v])=>v>0).map(([k,v])=>`<span class="effect-pill" style="--effect-color:${effectInfo[k].color}"><span class="sprite" style="${spriteStyle(effectInfo[k].id)}" aria-hidden="true"></span>${effectInfo[k].name} ${Math.ceil(v)}s</span>`).join('');}
}
function updateOverlay(){
  const state=game.state,world=WORLDS[game.world],overlay=$('overlay');overlay.hidden=state==='playing';$('secondary').hidden=true;$('launch').disabled=!assetsReady;
  $('overlay-world').textContent=`CHAPTER 0${game.world<4?1:2} · ${world.name.toUpperCase()}`;
  const action=state==='paused'?'Resume game':'Pause game';$('pause').setAttribute('aria-label',action);$('pause').title=`${action} (P or Escape)`;$('pause').innerHTML=icon(state==='paused'?'play':'pause');$('pause').disabled=state==='ready'||state==='won'||state==='over';
  $('overlay-hint').textContent='Arrow keys · WASD · Swipe';
  if(state==='ready'){$('overlay-title').textContent='Ready to chomp?';$('overlay-text').textContent=world.rule||'Gather every glow. Outsmart the spirits.';$('launch-text').textContent=assetsReady?(game.world===0?'Enter the jungle':`Enter ${world.short.toLowerCase()}`):'Waking the ruins…';}
  else if(state==='paused'){$('overlay-title').textContent='Catch your breath.';$('overlay-text').textContent='Your adventure can wait.';$('launch-text').textContent='Keep chomping';$('secondary').hidden=false;$('secondary').textContent='Start a new run';$('overlay-hint').textContent='P or Escape to resume';}
  else if(state==='over'){$('overlay-title').textContent='One more bite?';$('overlay-text').innerHTML=`${fmt(game.score)} points · ${game.initialPellets-game.pellets.size} orbs collected<br>${game.score>=progress.best&&game.score>0?'A new personal best.':'Your next adventure is waiting.'}`;$('launch-text').textContent='Try again';$('overlay-hint').textContent='Your best score and unlocks are saved.';}
  else if(state==='won'){const last=game.world===WORLDS.length-1,chapterEnd=game.world===3;$('overlay-title').textContent=last?'Apex of the DinoVerse.':chapterEnd?'A new chapter awaits.':'World devoured!';$('overlay-text').innerHTML=`${fmt(game.score)} points${last?'<br>Eight worlds. One mighty appetite.':chapterEnd?'<br>Lost Realms and four dinosaurs unlocked.':`<br>${WORLDS[game.world+1].name} unlocked.`}`;$('launch-text').textContent=last?'Play again':chapterEnd?'Enter Chapter 02':`Explore ${WORLDS[game.world+1].short}`;$('secondary').hidden=last;$('secondary').textContent='Replay this world';$('overlay-hint').textContent=last?'You conquered every world.':'Your score and remaining lives travel with you.';}

}
function recordScore(){
  if(game.score<=progress.best)return;const old=progress.best;progress.best=game.score;scheduleSave();
  const unlocked=SKINS.filter(s=>s.unlock>old&&s.unlock<=progress.best);
  if(unlocked.length){renderSelection();toast(`${unlocked.map(s=>s.name).join(' & ')} unlocked! Choose your new dinosaur in Character Select.`);audio.power();}
}
function onEvent(e){
  if(!game)return;
  if(e.type==='score'){recordScore();return;}
  if(e.type==='chomp'){audio.chomp();return;}
  if(e.type==='power'){audio.power();renderer?.burst(e.x,e.y,effectInfo[e.effect].color,22);callout(effectInfo[e.effect].name,1100);announce(`${effectInfo[e.effect].name} activated`);}
  if(e.type==='capture'){audio.capture();renderer?.burst(e.x,e.y,'#81f1ff',22);renderer?.float(`+${fmt(e.points)}`,e.x,e.y);}
  if(e.type==='magnet')renderer?.burst(e.x,e.y,'#78ddff',2);
  if(e.type==='portal'){audio.click();renderer?.burst(e.x,e.y,'#ddb3ff',18);callout('PORTAL HOP',700);}
  if(e.type==='shield'){audio.capture();renderer?.burst(e.x,e.y,'#6df1dd',22);callout('SHIELD SAVED YOU',1000);}
  if(e.type==='hit'){audio.hit();if(renderer)renderer.shake=.5;renderer?.burst(e.x,e.y,'#ffb135',30);if(e.lives>0)callout(`${e.lives} LIVES LEFT`,900);announce(`${e.lives} lives left`);saveProgress();}
  if(e.type==='respawn')callout('CHOMP ON!',750);
  if(e.type==='win'){
    if(!progress.completed.includes(game.world))progress.completed.push(game.world);saveProgress();publishCloud({score:game.score,world:game.world,outcome:'won'});audio.music(false);audio.win();renderSelection();announce(`${WORLDS[game.world].name} cleared. Score ${game.score}.`);
    renderer?.burst(game.player.x,game.player.y,'#ffe37b',60);updateOverlay();
  }
  if(e.type==='over'){audio.music(false);saveProgress();publishCloud({score:game.score,world:game.world,outcome:'over'});updateOverlay();announce(`Game over. ${game.score} points.`);}
  if(e.type==='state'){updateOverlay();audio.music(game.state==='playing',WORLDS[game.world].id);}
  if(e.type==='reset'){audio.setWorld(WORLDS[game.world].id);if(renderer){renderer.board=null;renderer.particles=[];renderer.floats=[];}effectsSignature='';updateOverlay();updateHud();}
}
game=new MazeGame({onEvent});game.skin=isSkinUnlocked(progress.skin)?progress.skin:0;game.reset(isWorldUnlocked(progress.world)?progress.world:0);
function startGame(){if(!assetsReady)return;audio.init();game.start();$('game').focus({preventScroll:true});updateOverlay();announce(`${WORLDS[game.world].name}. ${game.lives} lives. Collect all the golden orbs.`);}
function newRun(world=game.world){audio.music(false);if(world>=4&&game.world<4&&game.skin<4&&isSkinUnlocked(4)){game.skin=4;progress.skin=4;}game.reset(world);progress.world=world;selectedChapter=world>=4?1:0;renderSelection();updateHud();updateOverlay();saveProgress();showPanel(false);}
function launch(){
  if(!assetsReady)return;
  if(game.state==='won'&&game.world<WORLDS.length-1){const score=game.score,lives=game.lives;newRun(game.world+1);game.score=score;game.lives=lives;startGame();updateHud();}
  else if(game.state==='over'||game.state==='won'){newRun();startGame();}
  else startGame();
}
function requestNewRun(world=game.world){
  if((game.state==='playing'||game.state==='paused')&&game.score>0){confirmWasRunning=game.state==='playing';game.pause();confirmAction=()=>{newRun(world);startGame();};$('confirm-title').textContent=world===game.world?'Start a new run?':`Explore ${WORLDS[world].name}?`;$('confirm-text').textContent='Your best score is saved. This run will start again with three lives.';$('confirm-dialog').showModal();}
  else {newRun(world);}
}
function showPanel(loadout){if(loadout&&game.state==='playing')game.pause();document.body.classList.toggle('show-loadout',loadout);$('show-game').classList.toggle('selected',!loadout);$('show-loadout').classList.toggle('selected',loadout);$('show-game').setAttribute('aria-pressed',String(!loadout));$('show-loadout').setAttribute('aria-pressed',String(loadout));}
function move(dir){if(!assetsReady||$('help-dialog').open||$('confirm-dialog').open)return;if(game.state==='ready')startGame();if(game.state==='playing')game.turn(dir);}
function togglePause(){if(game.state==='playing')game.pause();else if(game.state==='paused'&&!document.hidden)startGame();}
$('launch').addEventListener('click',launch);
$('secondary').addEventListener('click',()=>requestNewRun());
$('pause').addEventListener('click',togglePause);
$('restart').addEventListener('click',()=>requestNewRun());
$('sound').addEventListener('click',()=>{audio.setEnabled(!audio.enabled);progress.sound=audio.enabled;updateSound();renderSelection();saveProgress();if(audio.enabled)audio.click();});
$('skins').addEventListener('click',e=>{const b=e.target.closest('[data-skin]');if(!b)return;const i=Number(b.dataset.skin);if(!isSkinUnlocked(i)){toast(SKINS[i].unlockWorld!==undefined?'Clear Space Islands to unlock all four Chapter 02 dinosaurs.':`Score ${fmt(SKINS[i].unlock)} in one run to unlock ${SKINS[i].name}. Best so far: ${fmt(progress.best)}.`);return;}game.skin=i;progress.skin=i;renderSelection();saveProgress();audio.click();announce(`${SKINS[i].name} selected`);});
$('worlds').addEventListener('click',e=>{const b=e.target.closest('[data-world]');if(!b)return;const i=Number(b.dataset.world);if(!isWorldUnlocked(i)){toast(`Clear ${WORLDS[i-1].name} to unlock ${WORLDS[i].name}.`);return;}if(i===game.world){showPanel(false);return;}requestNewRun(i);});
$('show-game').addEventListener('click',()=>showPanel(false));$('show-loadout').addEventListener('click',()=>showPanel(true));
$('power-ups').addEventListener('click',e=>{const b=e.target.closest('[data-power]');if(b)toast(effectInfo[b.dataset.power].description);});
document.querySelectorAll('[data-chapter]').forEach(b=>b.addEventListener('click',()=>{selectedChapter=Number(b.dataset.chapter);renderSelection();audio.click();}));
$('next-chapter').addEventListener('click',()=>{selectedChapter=1;renderSelection();$('chapter-nav').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});});
$('help').addEventListener('click',()=>{helpWasRunning=game.state==='playing';game.pause();$('help-dialog').showModal();});
document.querySelectorAll('[data-close]').forEach(b=>b.addEventListener('click',()=>$(b.dataset.close).close()));
$('help-dialog').addEventListener('close',()=>{if(helpWasRunning&&game.state==='paused'&&!document.hidden)startGame();helpWasRunning=false;});
$('confirm-cancel').addEventListener('click',()=>$('confirm-dialog').close());
$('confirm-yes').addEventListener('click',()=>{const action=confirmAction;confirmAction=null;confirmWasRunning=false;$('confirm-dialog').close();action?.();});
$('confirm-dialog').addEventListener('close',()=>{confirmAction=null;if(confirmWasRunning&&game.state==='paused'&&!document.hidden)startGame();confirmWasRunning=false;});
for(const d of document.querySelectorAll('dialog'))d.addEventListener('click',e=>{if(e.target===d){const r=d.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)d.close();}});
window.addEventListener('keydown',e=>{
  if($('help-dialog').open||$('confirm-dialog').open)return;
  if(['INPUT','SELECT','TEXTAREA'].includes(e.target.tagName))return;
  const key=e.key.toLowerCase(),dirs={arrowup:0,w:0,arrowright:1,d:1,arrowdown:2,s:2,arrowleft:3,a:3};
  if(key in dirs){e.preventDefault();if(!document.body.classList.contains('show-loadout'))move(dirs[key]);}
  else if(key==='p'||key==='escape'){e.preventDefault();togglePause();}
  else if((key===' '||key==='enter')&&e.target===$('game')){e.preventDefault();if(game.state==='playing')togglePause();else launch();}
});
document.querySelectorAll('[data-dir]').forEach(b=>b.addEventListener('pointerdown',e=>{e.preventDefault();audio.init();move(Number(b.dataset.dir));}));
let touch=null;
$('game').addEventListener('pointerdown',e=>{if(e.pointerType==='mouse')return;touch={x:e.clientX,y:e.clientY,id:e.pointerId};try{$('game').setPointerCapture(e.pointerId);}catch{};audio.init();});
$('game').addEventListener('pointermove',e=>{if(!touch||touch.id!==e.pointerId)return;const dx=e.clientX-touch.x,dy=e.clientY-touch.y;if(Math.max(Math.abs(dx),Math.abs(dy))>16){move(Math.abs(dx)>Math.abs(dy)?dx>0?1:3:dy>0?2:0);touch.x=e.clientX;touch.y=e.clientY;}});
$('game').addEventListener('pointerup',()=>{touch=null;});$('game').addEventListener('pointercancel',()=>{touch=null;});
document.addEventListener('visibilitychange',()=>{if(document.hidden){game.pause();audio.music(false);saveProgress();}});
window.addEventListener('blur',()=>{if(game.state==='playing')game.pause();});window.addEventListener('pagehide',saveProgress);
function loadImage(src){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error(`Unable to load ${src}`));img.src=src;});}
function createCanvas(w,h){const c=document.createElement('canvas');c.width=w;c.height=h;return c;}
function frame(ms){
  const now=ms/1000,dt=lastNow?Math.min(.05,now-lastNow):0;lastNow=now;game.update(dt);
  renderer?.draw(game,now,dt);
  if(now-lastUi>.08){updateHud();lastUi=now;}
  requestAnimationFrame(frame);
}
function registerAgentTools(){
  const context=document.modelContext;if(!context?.registerTool)return;const lifecycle=new AbortController();window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});
  const definitions=[
    {name:'get_apex_chomp_state',title:'Read Apex Chomp state',description:'Read the current game state, score, remaining orbs and saved unlocks.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({...game.snapshot(),best:progress.best,unlockedCharacters:SKINS.filter((_,i)=>isSkinUnlocked(i)).map(s=>s.name),unlockedWorlds:WORLDS.filter((_,i)=>isWorldUnlocked(i)).map(w=>w.name)})},
    {name:'set_apex_chomp_pause',title:'Pause or resume Apex Chomp',description:'Pause or resume the current run. Does not start a new run.',inputSchema:{type:'object',properties:{paused:{type:'boolean'}},required:['paused'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{if(!input||typeof input.paused!=='boolean')throw new Error('paused must be a boolean');if(!assetsReady)throw new Error('The game is still loading');if(input.paused)game.pause();else if(game.state==='paused'&&!document.hidden&&!$('help-dialog').open&&!$('confirm-dialog').open)game.start();else if(!input.paused&&game.state!=='playing')throw new Error('Start the game using the visible play button first');return game.snapshot();}},
    {name:'select_apex_chomp_character',title:'Select Apex Chomp character',description:'Equip an unlocked dinosaur character. Locked characters cannot be selected.',inputSchema:{type:'object',properties:{character:{type:'string',enum:SKINS.map(s=>s.id)}},required:['character'],additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute:input=>{const i=SKINS.findIndex(s=>s.id===input?.character);if(i<0)throw new Error('Unknown character');if(!isSkinUnlocked(i))throw new Error(SKINS[i].unlockWorld!==undefined?'Clear Space Islands to unlock this character':`Score ${SKINS[i].unlock} points in one run to unlock this character`);game.skin=i;progress.skin=i;renderSelection();saveProgress();return game.snapshot();}}
  ];
  for(const tool of definitions){try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}}
}
applySprites();renderSelection();updateSound();updateHud();updateOverlay();saveProgress();
try{
  const [atlas,environment,chapterAtlas,wallAtlas,...newWorldImages]=await Promise.all([loadImage('assets/sprites.webp'),loadImage('assets/environment.webp'),loadImage('assets/chapter2-sprites.webp'),loadImage('assets/chapter2-walls.webp'),...WORLDS.slice(4).map(w=>loadImage(`assets/world-${w.id}.webp`))]);
  const worldImages=[null,null,null,null,...newWorldImages];
  renderer=new MazeRenderer($('game'),{atlas,environment,chapterAtlas,wallAtlas,worldImages,createCanvas,scale:Math.min(window.devicePixelRatio||1,2),reducedMotion:matchMedia('(prefers-reduced-motion: reduce)').matches});
  assetsReady=true;updateOverlay();requestAnimationFrame(frame);registerAgentTools();
}catch(error){$('overlay-title').textContent='The jungle is waking…';$('overlay-text').textContent='Some artwork did not load. Check your connection and reload to play.';$('launch').disabled=false;$('launch-text').textContent='Reload game';$('launch').addEventListener('click',()=>location.reload(),{once:true});console.error(error);}
