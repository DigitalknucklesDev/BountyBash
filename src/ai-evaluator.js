import {distance} from './rules.js';
export function evaluatePosition(g,actor){
 if(g.winner)return g.winner===actor?10000:-10000;
 function side(p){
  const x=g.players[p],enemy=3-p,units=g.units.filter(u=>u.owner===p&&!u.ko);
  let value=x.vault.length*48+x.vault.reduce((s,c)=>s+(c.bountyValue||1)*6,0);
  value+=x.hand.length*.7+x.deck.length*.06;
  value+=units.reduce((s,u)=>{
   const d=distance(u.pos,{c:u.pos.c,r:p===1?6:1});
   const threats=g.units.filter(v=>v.owner===enemy&&!v.ko&&distance(v.pos,u.pos)===1);
   const risk=threats.some(v=>(v.attack||0)>=(u.defense||0))?7:0;
   return s+4+(u.attack||0)*.9+(u.defense||0)*.65+(6-Math.min(6,d))*1.6-risk;
  },0);
  if(g.controllerActive(p))value+=units.filter(u=>(u.tags||[]).includes('rcee-device')).length*7+4;
  return value;
 }
 return side(actor)-side(3-actor);
}
