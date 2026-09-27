// Original, locally synthesised focus scores. No streamed tracks or audio downloads.
const rests=null;
export const WORLD_MUSIC={
 jungle:{name:'Canopy Drift',bpm:88,voice:'wood',roots:[50,46,53,48],melody:[74,rests,69,72,rests,69,65,rests,70,rests,65,69,72,rests,65,rests,77,rests,72,74,rests,72,69,rests,72,rests,67,69,74,rests,67,rests]},
 volcano:{name:'Ember Pulse',bpm:94,voice:'warm',roots:[45,41,48,43],melody:[57,rests,64,rests,60,64,rests,67,rests,65,60,rests,57,rests,60,64,60,rests,67,rests,64,67,rests,72,rests,67,62,rests,59,62,rests,67]},
 ice:{name:'Crystal Stillness',bpm:68,voice:'bell',roots:[52,48,55,50],melody:[83,rests,rests,78,rests,rests,79,rests,76,rests,rests,83,rests,79,rests,rests,86,rests,rests,81,rests,83,rests,rests,78,rests,rests,74,rests,81,rests,rests]},
 space:{name:'Orbital Reverie',bpm:76,voice:'air',roots:[49,45,52,47],melody:[73,80,rests,85,80,rests,76,80,69,76,rests,80,76,rests,73,76,76,83,rests,88,83,rests,80,83,71,78,rests,83,78,rests,75,78]},
 sunken:{name:'Below the Blue',bpm:72,voice:'water',roots:[48,46,51,43],melody:[72,rests,79,74,rests,rests,75,rests,70,rests,77,72,rests,74,rests,rests,75,rests,82,77,rests,rests,79,rests,67,rests,74,70,rests,72,rests,rests]},
 amber:{name:'Sands of Time',bpm:84,voice:'pluck',roots:[50,46,43,45],melody:[74,77,rests,81,rests,77,76,rests,70,74,rests,77,rests,74,72,rests,67,70,rests,74,rests,70,69,rests,69,73,rests,76,rests,73,69,rests]},
 spore:{name:'Luminous Roots',bpm:82,voice:'soft',roots:[53,50,46,48],melody:[77,rests,81,84,rests,79,81,rests,74,rests,77,81,rests,76,77,rests,70,rests,74,77,rests,72,74,rests,72,rests,76,79,rests,74,76,rests]},
 storm:{name:'Above the Thunder',bpm:90,voice:'pulse',roots:[47,43,50,45],melody:[71,rests,78,rests,74,rests,78,81,67,rests,74,rests,71,rests,74,78,74,rests,81,rests,78,rests,81,85,69,rests,76,rests,73,rests,76,81]}
};
const hz=midi=>440*2**((midi-69)/12);
export class GameAudio{
 constructor({createContext,timers=globalThis}={}){this.enabled=true;this.ctx=null;this.playing=false;this.timer=null;this.note=0;this.lastChomp=0;this.world='jungle';this.voices=new Set();this.bus=null;this.timers=timers;this.createContext=createContext;}
 init(){
  if(!this.ctx){const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!this.createContext&&!Audio)return;try{this.ctx=this.createContext?this.createContext():new Audio();this.master=this.ctx.createGain();this.master.gain.value=this.enabled?.16:0;this.master.connect(this.ctx.destination);}catch{return;}}
  if(this.ctx.state==='suspended')this.ctx.resume().then(()=>this.startMusic()).catch(()=>{});
 }
 setEnabled(value){this.enabled=!!value;this.init();if(this.master)this.master.gain.setTargetAtTime(value?.16:0,this.ctx.currentTime,.04);if(value)this.startMusic();else this.stopTimer();}
 setWorld(world){const id=WORLD_MUSIC[world]?world:'jungle';if(this.world===id)return;this.stopTimer();this.world=id;this.note=0;this.startMusic();}
 tone(freq,duration=.12,type='sine',volume=.2,offset=0,end=null){
  if(!this.enabled||!this.ctx)return;const now=this.ctx.currentTime+offset,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(freq,now);if(end)o.frequency.exponentialRampToValueAtTime(end,now+duration);g.gain.setValueAtTime(.001,now);g.gain.linearRampToValueAtTime(volume,now+.012);g.gain.exponentialRampToValueAtTime(.001,now+duration);o.connect(g);g.connect(this.master);o.onended=()=>{o.disconnect();g.disconnect();};o.start(now);o.stop(now+duration+.02);
 }
 music(on,world=this.world){this.playing=!!on;this.setWorld(world);if(!on)this.stopTimer();else this.startMusic();}
 startMusic(){
  if(this.timer!==null||!this.playing||!this.enabled||this.ctx?.state!=='running')return;
  this.bus=this.ctx.createGain();this.bus.gain.setValueAtTime(0,this.ctx.currentTime);this.bus.gain.linearRampToValueAtTime(1,this.ctx.currentTime+.16);this.bus.connect(this.master);
  this.nextBeat=this.ctx.currentTime+.025;
  const schedule=()=>{if(!this.playing||!this.enabled||this.ctx.state!=='running')return;if(this.nextBeat<this.ctx.currentTime-.2)this.nextBeat=this.ctx.currentTime+.025;
   const theme=WORLD_MUSIC[this.world],step=60/theme.bpm/2;
   while(this.nextBeat<this.ctx.currentTime+.16){this.playStep(theme,this.note++,this.nextBeat,step);this.nextBeat+=step;}
  };
  schedule();this.timer=this.timers.setInterval(schedule,70);
 }
 musicTone(midi,at,duration,volume,type='sine',attack=.018){
  const o=this.ctx.createOscillator(),g=this.ctx.createGain(),voice={o,g};o.type=type;o.frequency.setValueAtTime(hz(midi),at);
  g.gain.setValueAtTime(.0001,at);g.gain.linearRampToValueAtTime(volume,at+Math.min(attack,duration*.3));g.gain.exponentialRampToValueAtTime(.0001,at+duration);
  o.connect(g);g.connect(this.bus);o.onended=()=>{this.voices.delete(voice);o.disconnect();g.disconnect();};this.voices.add(voice);o.start(at);o.stop(at+duration+.03);
 }
 playStep(theme,index,at,step){
  const position=index%64,n=position%32,root=theme.roots[Math.floor(n/8)],note=theme.melody[n],phrase=position>=32;
  if(n%8===0){this.musicTone(root-12,at,step*7.8,.16,'sine',.15);for(const interval of [0,7,14])this.musicTone(root+interval,at,step*8,.025,'sine',.4);}
  if(note!==null){
   const pitch=note+(phrase&&n%8===6?12:0);
   const voice={wood:['sine',.7,.10],warm:['triangle',1.05,.058],bell:['sine',2.7,.073],air:['sine',1.5,.07],water:['sine',2.3,.084],pluck:['triangle',.8,.065],soft:['sine',1.4,.089],pulse:['triangle',1.1,.06]}[theme.voice];
   this.musicTone(pitch,at,step*voice[1],voice[2],voice[0],theme.voice==='air'?.11:.012);
   if(['bell','water','wood'].includes(theme.voice))this.musicTone(pitch+12,at+.006,step*.65,.016,'sine');
   if(theme.voice==='air'||theme.voice==='water')this.musicTone(pitch,at+step*1.5,step*1.5,.015,'sine',.05);
  }
  if(['warm','pulse','wood'].includes(theme.voice)&&n%4===0)this.musicTone(root-12,at,.16,.085,'sine');
  if(theme.voice==='soft'&&n%4===3)this.musicTone(root+19,at,step*.8,.024,'sine');
 }
 stopTimer(){
  if(this.timer!==null){this.timers.clearInterval(this.timer);this.timer=null;}
  if(this.bus&&this.ctx){const bus=this.bus,now=this.ctx.currentTime;bus.gain.cancelScheduledValues(now);bus.gain.setTargetAtTime(0,now,.015);for(const voice of this.voices){try{voice.o.stop(now+.07);}catch{}}this.bus=null;}
 }
 chomp(){if(!this.ctx)return;const t=this.ctx.currentTime;if(t-this.lastChomp<.08)return;this.lastChomp=t;this.tone(480+(this.note%2)*80,.075,'sine',.15,0,190);}
 power(){[440,554.37,659.25,880].forEach((n,i)=>this.tone(n,.28,'triangle',.17,i*.065));}
 capture(){this.tone(330,.2,'triangle',.25,0,990);this.tone(880,.3,'sine',.15,.13);}
 hit(){this.tone(300,.55,'sawtooth',.13,0,50);this.tone(140,.7,'sine',.23);}
 win(){[293.66,349.23,440,587.33,698.46,880,1174.66].forEach((n,i)=>this.tone(n,.45,'triangle',.16,i*.11));}
 click(){this.tone(660,.06,'sine',.1);}
}
