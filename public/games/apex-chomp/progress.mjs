import {SKINS,WORLDS} from './engine.mjs';
// Keep the original storage key and preserve existing Chapter 01 progress.
export function normalizeProgress(d){
 const value=d&&typeof d==='object'?d:{};
 return {best:Number.isFinite(value.best)?Math.max(0,Math.floor(value.best)):0,
  completed:Array.isArray(value.completed)?[...new Set(value.completed.filter(n=>Number.isInteger(n)&&n>=0&&n<WORLDS.length))]:[],
  skin:Number.isInteger(value.skin)?Math.max(0,Math.min(SKINS.length-1,value.skin)):0,
  world:Number.isInteger(value.world)?Math.max(0,Math.min(WORLDS.length-1,value.world)):0,sound:value.sound!==false};
}
export const canPlayWorld=(progress,i)=>Number.isInteger(i)&&i>=0&&i<WORLDS.length&&(i===0||progress.completed.includes(i-1));
export const canUseSkin=(progress,i)=>!!SKINS[i]&&(SKINS[i].unlockWorld!==undefined?progress.completed.includes(SKINS[i].unlockWorld):progress.best>=SKINS[i].unlock);
