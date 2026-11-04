// Local deterministic-rule NPC. Uses Game public actions, never mutates decks or board directly.
import {distance,tileType,gateOwner} from './rules.js';
const rand=xs=>xs[Math.floor(Math.random()*xs.length)];
const choose=(xs,score,difficulty)=>{if(!xs.length)return null;if(difficulty==='easy'&&Math.random()<.55)return rand(xs);return xs.map(x=>({x,s:score(x)+(difficulty==='hard'?Math.random()*.15:Math.random()*2)})).sort((a,b)=>b.s-a.s)[0].x};
const enemyGate=(u)=>u.owner===1?6:1;
export function actionOptions(g,difficulty){
 const p=g.active,me=g.me,units=g.units.filter(u=>u.owner===p&&!u.ko&&g.canOperate(u));
 const options=[];
 const enemies=g.units.filter(u=>u.owner!==p&&!u.ko);
 for(const u of units){
  for(const t of g.units.length>=0?gNeighbors(u,g):[]){
   const other=g.unitAt(t.c,t.r);
   if(other?.owner===p&&!other.ko)continue;
   let score=3+Math.max(0,5-distance(t,{c:u.pos.c,r:enemyGate(u)}))*.4;
   if(tileType(t.c,t.r)==='gate'&&gateOwner(t.r)!==p)score+=16;
   if(other){if(other.ko)score+=other.owner===p?8:14;else if((u.tags||[]).includes('bounty-plow')&&other.bounty&&g.controllerActive(p))score+=13;else score+=(u.attack>=other.defense?5:-4)}
   options.push({kind:'move',unit:u,t,score});
  }
  for(const e of enemies.filter(e=>distance(u.pos,e.pos)===1))options.push({kind:'attack',unit:u,t:e.pos,score:u.attack>=e.defense?7:1});
 }
 for(const card of me.hand){
  if((card.tags||[]).includes('gunrat-draw')&&me.deck.length>=2&&me.hand.length<4)options.push({kind:'gunrat',card,score:10});
  if(card.type==='stance'&&me.vault.length<8)options.push({kind:'stance',card,score:12});
  if(['item','perk'].includes(card.type)&&me.vault.length<8)options.push({kind:'item',card,score:(card.tags||[]).includes('rcee-source')?12:(card.tags||[]).includes('zap-factory')?11:5});
  if(['rider','perk'].includes(card.type))for(let c=2;c<=5;c++){
   const r=p===1?1:6;
   if(!g.unitAt(c,r))options.push({kind:'deploy',card,t:{c,r},score:7+(card.attack||0)+(card.defense||0)*.3});
  }
 }
 if(me.deck.length&&me.hand.length<5)options.push({kind:'draw',score:me.hand.length<2?13:6});
 return options;
}
function gNeighbors(u,g){return [{c:u.pos.c+1,r:u.pos.r},{c:u.pos.c-1,r:u.pos.r},{c:u.pos.c,r:u.pos.r+1},{c:u.pos.c,r:u.pos.r-1}].filter(t=>t.c>=0&&t.c<8&&t.r>=1&&t.r<=6&&tileType(t.c,t.r)!=='vault'&&tileType(t.c,t.r)!=='utility');}
export function aiStep(g,difficulty='normal'){
 if(g.winner)return false;
 if(g.pendingBacklot&&!g.pendingAttack&&!g.pendingDefense){const keeper=g.players[g.pendingBacklot.opponent].vault.find(c=>g.pendingBacklot.keepers.includes(c.id));if(keeper)g.chooseBacklotDefense(keeper.id);return true}
 if(g.pendingGateClaim?.chewyGuard&&difficulty!=='hard'){g.passGateBounty();return true}
 if(g.pendingGateClaim){const x=choose(g.players[g.pendingGateClaim.opponent].vault.filter(c=>g.pendingGateClaim.options.includes(c.id)),c=>c.bountyValue||1,difficulty);if(x)g.chooseGateBounty(x.id);return true}
 if(g.pendingAttack){const p=g.pendingAttack,att=g.combatUnit(p.attId);if(!att)return false;const cards=g.players[att.owner].hand.filter(c=>p.available.includes(c.id)).sort((a,b)=>a.attack-b.attack);let need=Math.max(0,p.baseDefense-p.baseAttack);for(const c of cards){if(need<=0)break;g.toggleAttackCard(c.id);need-=c.attack}g.setCamActions(Math.min(Math.max(0,need),p.maxCamActions));g.resolveAttack(true);return true}
 if(g.pendingDefense){const p=g.pendingDefense,def=g.combatUnit(p.defId);if(!def)return false;let need=p.required;const cards=g.players[def.owner].hand.filter(c=>p.available.includes(c.id)).sort((a,b)=>a.defense-b.defense);if(p.canDefend){for(const c of cards){if(need<=0)break;g.toggleDefenseCard(c.id);need-=c.defense}}g.resolveDefense(need<=0);return true}
 if(g.pendingPerk){const units=g.units.filter(u=>u.owner===g.pendingPerk.player&&!u.ko&&g.canOperate(u)&&gNeighbors(u,g).some(t=>!g.unitAt(t.c,t.r)));const u=choose(units,u=>-distance(u.pos,{c:u.pos.c,r:enemyGate(u)}),difficulty);if(!u){g.skipPerk();return true}g.selectPerkUnit(u.id);const ts=g.perkDestinations();const t=choose(ts,t=>tileType(t.c,t.r)==='gate'&&gateOwner(t.r)!==u.owner?20:-distance(t,{c:t.c,r:enemyGate(u)}),difficulty);if(t)g.resolvePerkMove(t.c,t.r);else g.skipPerk();return true}
 if(g.me.actions<=0){g.endTurn();return true}
 const options=actionOptions(g,difficulty);
 const pick=choose(options,o=>o.score,difficulty);
 if(!pick){g.endTurn();return true}
 const before=g.me.actions;
 executeOption(g,pick);
 if(g.me.actions===before&&!g.pendingAttack&&!g.pendingDefense&&!g.pendingGateClaim&&pick.kind!=='stance'&&pick.kind!=='gunrat'){g.endTurn()}
 return true;
}
export function executeOption(g,pick){
 const before=g.me.actions,turn=g.turn;
 if(pick.kind==='gunrat')g.activateGunRat(pick.card.id);
 else if(pick.kind==='draw')g.draw(g.active);
 else if(pick.kind==='item')g.playItem(pick.card.id);
 else if(pick.kind==='stance')g.playStance(pick.card.id);
 else if(pick.kind==='deploy'){g.selectHand(pick.card.id);g.deploy(pick.t.c,pick.t.r)}
 else {g.selectUnit(pick.unit.id);if(pick.kind==='attack')g.attack(pick.t.c,pick.t.r);else g.move(pick.t.c,pick.t.r)}
 return g.me.actions!==before||g.turn!==turn||!!g.pendingAttack||!!g.pendingDefense||!!g.pendingGateClaim||pick.kind==='stance'||pick.kind==='gunrat';
}
