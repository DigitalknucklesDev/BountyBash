// Information-set Monte Carlo beam rollouts: actions are executed through Game's public methods.
import {Game} from './engine.js';
import {aiStep,actionOptions,executeOption} from './ai.js';
import {evaluatePosition} from './ai-evaluator.js';
import {abilityPriority} from './ai-abilities.js';
const randomIndex=n=>Math.floor(Math.random()*n);
export function cloneForSimulation(game,viewer){
 const state=structuredClone(Object.fromEntries(Object.entries(game).filter(([k])=>k!=='drawEvents')));
 const copy=Object.assign(Object.create(Game.prototype),state);
 copy.drawEvents=[];
 // The opponent's hand/deck partition is hidden. Shuffle those unknown cards per rollout.
 const opponent=copy.players[3-viewer],handCount=opponent.hand.length;
 const hidden=[...opponent.hand,...opponent.deck];
 for(let i=hidden.length-1;i>0;i--){const j=randomIndex(i+1);[hidden[i],hidden[j]]=[hidden[j],hidden[i]]}
 opponent.hand=hidden.slice(0,handCount);opponent.deck=hidden.slice(handCount);
 return copy;
}
function key(o){return [o.kind,o.card?.id||o.unit?.id||'',o.t?.c??'',o.t?.r??''].join(':')}
function candidates(g,beam){
 const seen=new Set();
 return actionOptions(g,'hard').map(o=>({...o,priority:o.score+abilityPriority(g,o)}))
 .sort((a,b)=>b.priority-a.priority).filter(o=>{const k=key(o);if(seen.has(k))return false;seen.add(k);return true}).slice(0,beam);
}
function settlePending(sim,cap=12){
 for(let j=0;j<cap;j++){
  if(!sim.pendingAttack&&!sim.pendingDefense&&!sim.pendingGateClaim&&!sim.pendingBacklot&&!sim.pendingPerk)break;
  const previous=JSON.stringify([sim.pendingAttack,sim.pendingDefense,sim.pendingGateClaim,sim.pendingBacklot,sim.pendingPerk,sim.turn]);
  if(!aiStep(sim,'normal'))break;
  if(previous===JSON.stringify([sim.pendingAttack,sim.pendingDefense,sim.pendingGateClaim,sim.pendingBacklot,sim.pendingPerk,sim.turn]))break;
 }
}
function rollout(sim,actor,depth){
 settlePending(sim);
 // Explore a short sequence of our remaining actions before sampling opponent replies.
 for(let step=0;step<depth&&!sim.winner&&sim.active===actor;step++){
  if(sim.me.actions<=0)break;
  const opts=candidates(sim,4);
  if(!opts.length)break;
  const top=opts.slice(0,Math.min(3,opts.length));
  const choice=top[Math.floor(Math.pow(Math.random(),1.6)*top.length)];
  if(!executeOption(sim,choice))break;
  settlePending(sim);
 }
 if(!sim.winner&&sim.active===actor&&!sim.pendingAttack&&!sim.pendingDefense&&!sim.pendingGateClaim&&!sim.pendingBacklot){
  // Sample a reply from the opponent (including any Zap Factory end-turn decision).
  const turn=sim.turn;sim.endTurn();settlePending(sim);
  for(let j=0;j<Math.min(6,depth+2)&&!sim.winner&&sim.active!==actor;j++){
   const prev=sim.turn,actions=sim.me.actions,log=sim.log[0];
   if(!aiStep(sim,'normal'))break;
   settlePending(sim);
   if(prev===sim.turn&&actions===sim.me.actions&&log===sim.log[0])break;
  }
 }
 return evaluatePosition(sim,actor);
}
export function planNpcAction(g,difficulty='hard'){
 const actor=g.active;
 const hard=difficulty==='hard';
 const beam=hard?9:5,trials=hard?12:4,depth=hard?3:2;
 const opts=candidates(g,beam);
 if(!opts.length)return null;
 let best=null;
 for(const option of opts){
  let total=0,completed=0;
  for(let k=0;k<trials;k++){
   try{
    const sim=cloneForSimulation(g,actor);
    if(!executeOption(sim,option))continue;
    const score=rollout(sim,actor,depth);
    if(Number.isFinite(score)){total+=score;completed++}
   }catch(e){/* Invalid branches are discarded; never modify live state. */}
  }
  if(!completed)continue;
  const estimate=total/completed+option.priority*.18;
  if(!best||estimate>best.estimate)best={option,estimate,rollouts:completed,candidates:opts.length,description:describe(option)};
 }
 return best;
}
function describe(o){
 const name=o.card?.name||o.unit?.name||'Resource';
 const dest=o.t?` at ${String.fromCharCode(65+o.t.c)}${o.t.r}`:'';
 return ({deploy:`Deploy ${name}${dest}`,move:`Move ${name}${dest}`,attack:`Attack with ${name}${dest}`,draw:'Draw tactical resource',item:`Activate ${name}`,stance:`Score ${name}`,gunrat:`Trade ${name} for two draws`})[o.kind]||`Play ${name}`;
}
