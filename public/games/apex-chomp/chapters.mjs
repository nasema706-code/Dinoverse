// Chapter 02 uses four deliberately different, repeatable maze structures.
export const CHAPTERS=[{name:'The First Bite',subtitle:'The original expedition'},{name:'Lost Realms',subtitle:'Four new worlds. A new appetite.'}];
export const NEW_SKINS=[
  {id:'triceratops',name:'Triceratops',color:'#69e8d3',unlockWorld:3,sprite:16,note:'Three horns. One fearless explorer.'},
  {id:'stegosaurus',name:'Stegosaurus',color:'#ffc36d',unlockWorld:3,sprite:17,note:'Golden plates. A mighty appetite.'},
  {id:'raptor',name:'Velociraptor',color:'#ef85e9',unlockWorld:3,sprite:18,note:'Feathered, fearless and ready to race.'},
  {id:'ankylosaurus',name:'Ankylosaurus',color:'#8bdcff',unlockWorld:3,sprite:19,note:'Armoured up for the wildest worlds.'}
];
export const NEW_WORLDS=[
  {id:'sunken',name:'Sunken Temple',short:'the temple',color:'#55e5d9',stone:'#205454',floor:'#062c38',accent:'#f99d86',sprite:14,speed:3.65,texture:'hue-rotate(325deg) saturate(1.4)',maze:'Tidal rings',rule:'Follow the current arrows for a speed boost. The tide reverses every 12 seconds.',special:'shield'},
  {id:'amber',name:'Amber Dunes',short:'the dunes',color:'#ffc777',stone:'#695038',floor:'#291b13',accent:'#ffb23f',sprite:13,speed:3.75,texture:'hue-rotate(22deg) saturate(.65)',maze:'Desert switchbacks',rule:'Step into a glowing portal to jump to its matching colour across the maze.',special:'freeze'},
  {id:'spore',name:'Glowspore Grove',short:'the grove',color:'#ec8fe8',stone:'#473450',floor:'#190d27',accent:'#b2f071',sprite:12,speed:3.85,texture:'hue-rotate(210deg) saturate(1.3)',maze:'Root labyrinth',rule:'Glowing spore patches slow spirits and double small-orb points while blooming.',special:'phase'},
  {id:'storm',name:'Storm Citadel',short:'the citadel',color:'#93cfff',stone:'#384862',floor:'#101a30',accent:'#a3a8ff',sprite:14,speed:3.9,texture:'hue-rotate(30deg) saturate(.65)',maze:'Skybridge spokes',rule:'Spirits surge during four-second storms. Save a power-up for the next storm.',special:'stomp'}
];
export const POWER_INFO={
  bite:{name:'SUPER BITE',id:8,color:'#ffcf61',short:'Chomp spirits',description:'Golden orbs let you chomp spirits for 8 seconds. Chain captures for bigger scores.'},
  speed:{name:'SPEED BOOST',id:9,color:'#a9e96d',short:'Move faster',description:'Collect a fern to move faster for 7 seconds.'},
  mega:{name:'MEGA SCORE',id:10,color:'#d48aff',short:'Double points',description:'Collect a purple crystal to double all points for 10 seconds.'},
  magnet:{name:'MAGNET',id:11,color:'#73d9ff',short:'Pull in orbs',description:'Pull in nearby small orbs for 10 seconds.'},
  shield:{name:'TIDE SHIELD',id:20,color:'#6df1dd',short:'Block one hit',description:'A water shield blocks one spirit collision within 10 seconds.'},
  freeze:{name:'TIME FREEZE',id:21,color:'#ffd38a',short:'Freeze spirits',description:'Freeze spirits in place for 8 seconds. Frozen spirits still hurt on contact.'},
  phase:{name:'PHASE VEIL',id:22,color:'#f394e9',short:'Slip past spirits',description:'Pass safely through spirits for 8 seconds. Maze walls stay solid.'},
  stomp:{name:'THUNDER STOMP',id:23,color:'#9cd9ff',short:'Send spirits home',description:'Send every spirit back to its starting point and stun it for 4 seconds.'}
};
const W=21,H=23;
export function chapterMaze(index){
  const map=Array.from({length:H},()=>Array(W).fill('#'));
  const open=(x,y)=>{if(x>0&&x<W-1&&y>0&&y<H-1)map[y][x]='.';};
  const line=(x1,y1,x2,y2)=>{for(let y=Math.min(y1,y2);y<=Math.max(y1,y2);y++)for(let x=Math.min(x1,x2);x<=Math.max(x1,x2);x++)open(x,y);};
  const ring=(l,t,r,b)=>{line(l,t,r,t);line(l,b,r,b);line(l,t,l,b);line(r,t,r,b);};
  if(index===4){
    // Nested tidal channels with staggered bridges, generous looping routes.
    ring(1,1,19,21);ring(3,3,17,19);ring(5,5,15,17);ring(7,7,13,15);
    for(const y of [5,17])line(1,y,19,y);
    line(9,1,9,7);line(11,15,11,21);line(3,11,7,11);line(13,11,17,11);
    line(9,7,9,9);line(9,9,11,9);line(11,9,11,7);line(9,15,11,15);
  }else if(index===5){
    // Long serpentine desert avenues linked by alternating crossovers.
    for(let y=1;y<=21;y+=2)line(1,y,19,y);
    for(let y=1;y<21;y+=2){const x=(y%4===1)?19:1;line(x,y,x,y+2);}
    for(const [x,y] of [[5,1],[13,3],[9,5],[15,7],[3,9],[17,11],[7,13],[11,15],[5,17],[15,19]])line(x,y,x,y+2);
  }else if(index===6){
    // Seeded root maze: branching passages with a few loops, identical on replay.
    let seed=2066;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
    const stack=[[1,1]];open(1,1);
    while(stack.length){const [x,y]=stack[stack.length-1];const options=[[0,-2],[2,0],[0,2],[-2,0]].filter(([dx,dy])=>x+dx>0&&x+dx<20&&y+dy>0&&y+dy<22&&map[y+dy][x+dx]==='#');
      if(!options.length){stack.pop();continue;}const [dx,dy]=options[Math.floor(random()*options.length)];open(x+dx/2,y+dy/2);open(x+dx,y+dy);stack.push([x+dx,y+dy]);}
    for(let y=3;y<21;y+=4)for(let x=3;x<19;x+=4){open(x,y);open(x+1,y);open(x,y+1);}
    line(1,21,19,21);
  }else{
    // Skybridge grid: long spokes, nested platforms and offset connecting lanes.
    ring(1,1,19,21);ring(5,5,15,17);ring(7,7,13,15);
    for(const x of [3,9,11,17])line(x,1,x,21);
    for(const y of [3,9,13,19])line(1,y,19,y);
    line(1,11,7,11);line(13,11,19,11);line(1,21,19,21);
  }
  // The heart is an island, never an obstructed passage. Reconnect around it.
  ring(8,10,12,13);
  for(let y=11;y<=12;y++)for(let x=9;x<=11;x++)map[y][x]='C';
  line(7,9,13,9);line(9,13,9,15);line(11,13,11,15);
  line(9,19,9,21);line(9,21,11,21);
  // Join any island created by the heart to the main walkable component.
  const reachable=()=>{const seen=new Set(['10,21']),queue=[[10,21]];for(let i=0;i<queue.length;i++){const [x,y]=queue[i];for(const [dx,dy]of [[0,1],[1,0],[0,-1],[-1,0]]){const nx=x+dx,ny=y+dy,key=`${nx},${ny}`;if(map[ny]?.[nx]==='.'&&!seen.has(key)){seen.add(key);queue.push([nx,ny]);}}}return seen;};
  let seen=reachable();
  while(true){let bridge=null;for(let y=1;y<22&&!bridge;y++)for(let x=1;x<20&&!bridge;x++)if(map[y][x]==='#'){
    const neighbours=[[x-1,y],[x+1,y],[x,y-1],[x,y+1]].filter(([a,b])=>map[b]?.[a]==='.');
    if(neighbours.some(([a,b])=>seen.has(`${a},${b}`))&&neighbours.some(([a,b])=>!seen.has(`${a},${b}`)))bridge=[x,y];
  }if(!bridge)break;open(...bridge);seen=reachable();}
  return map;
}

// Exact pickup anchors vary by world; blocked anchors are moved to the nearest
// free corridor once, deterministically, without overlaps or lost pickups.
export const PICKUP_ANCHORS=[
  [[1,1],[19,1],[1,21],[19,21],[5,5],[15,5],[5,15],[15,17],[10,3],[10,17]],
  [[5,1],[15,3],[3,19],[17,21],[3,7],[17,7],[7,13],[13,15],[9,1],[11,19]],
  [[3,3],[17,3],[5,21],[15,19],[1,9],[19,9],[5,13],[15,13],[9,5],[11,17]],
  [[1,5],[19,5],[7,19],[13,21],[7,3],[13,3],[3,13],[17,13],[9,9],[11,15]],
  [[3,3],[15,5],[3,19],[17,17],[7,5],[13,17],[3,11],[17,11],[9,3],[11,19]],
  [[7,1],[17,7],[3,15],[13,21],[3,5],[17,17],[9,7],[11,15],[13,3],[7,19]],
  [[1,7],[19,3],[5,19],[19,19],[5,3],[15,7],[1,13],[17,15],[7,9],[13,19]],
  [[9,1],[19,9],[1,13],[11,21],[3,3],[17,19],[5,9],[15,13],[11,3],[9,19]]
];
