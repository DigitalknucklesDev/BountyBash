// Short-horizon, information-set Monte Carlo rollouts. No network or model API.
import {Game} from './engine.js';
import {aiStep, actionOptions, executeOption} from './ai.js';
import {distance} from './rules.js';
const sample=arr=>arr[Math.floor(Math.random()*arr.length)];
function cloneForSimulation(game,viewer){
 const copy=Object.assign(Object.create(Game.prototype),structuredClone(Object.fromEntries(Object.entries(game).filter(([k])=>k!=='drawEvents'))));
 copy.drawEvents=[];
 // Randomize hidden opposing cards across hand and deck; preserve observed public state.
 const enemy=copy.players[3-viewer];
 const hidden=[...enemy.hand,...enemy.deck];
 for(let i=hidden.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[hidden[i],hidden[j]]=[hidden[j],hidden[i]]}
 enemy.hand=hidden.slice(0,enemy.hand.length);enemy.deck=hidden.slice(enemy.hand.length);
 return copy;
}
function value(g,p){
 if(g.winner)return g.winner===p?1500:-1500;
 const mine=g.players[p],foe=g.players[3-p];
 const score=(player)=>{
  const vault=player.vault.length*32+player.vault.reduce((n,c)=>n+(c.bountyValue||1),0)*6;
  const units=g.units.filter(u=>u.owner===player.id&&!u.ko);
  const field=units.reduce((n,u)=>n+3+(u.attack||0)*.6+(u.defense||0)*.5+Math.max(0,6-distance(u.pos,{c:u.pos.c,r:u.owner===1?6:1}))*1.5,0);
  return vault+field+player.hand.length*.55;
 };
 return score({...mine,id:p})-score({...foe,id:3-p});
}
export function planNpcAction(g,difficulty='hard'){
 const actor=g.active;
 const opts=actionOptions(g,difficulty).filter(o=>o.kind!=='attack'||g.me.actions>0);
 if(!opts.length)return null;
 const limit=difficulty==='hard'?8:5, trials=difficulty==='hard'?8:4, horizon=difficulty==='hard'?5:3;
 const candidates=opts.sort((a,b)=>b.score-a.score).slice(0,limit);
 let best=null;
 for(const option of candidates){
  let total=0,completed=0;
  for(let trial=0;trial<trials;trial++){
   const sim=cloneForSimulation(g,actor);
   const before=sim.turn;
   try{
    if(!executeOption(sim,option))continue;
    for(let i=0;i<horizon&&!sim.winner;i++){
     // Respond to combat, finish the turn and sample a short opponent continuation.
     if(sim.turn>before+1)break;
     if(!aiStep(sim,'normal'))break;
    }
    total+=value(sim,actor);completed++;
   }catch(_){/* Discard an invalid simulated branch, not the real turn. */}
  }
  if(!completed)continue;
  const estimate=total/completed + option.score*.12;
  if(!best||estimate>best.estimate)best={option,estimate,rollouts:completed,candidates:candidates.length,description:describe(option)};
 }
 return best;
}
function describe(o){
 const label=o.card?.name||o.unit?.name||'Resource';
 switch(o.kind){
  case 'deploy':return `Deploy ${label} to ${String.fromCharCode(65+o.t.c)}${o.t.r}`;
  case 'move':return `Advance ${label} to ${String.fromCharCode(65+o.t.c)}${o.t.r}`;
  case 'attack':return `Challenge with ${label}`;
  case 'draw':return 'Draw a tactical resource';
  case 'item':return `Activate ${label} in Backlot`;
  case 'stance':return `Score ${label}`;
  case 'gunrat':return `Trade ${label} for two draws`;
  default:return `Use ${label}`;
 }
}
