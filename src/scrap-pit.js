import {Game} from './engine.js';
import {makeDeck,makeCard,shuffle,drawWeighted,catalog} from './cards.js';

export const PIT_TILES=[{c:3,r:3},{c:4,r:3},{c:3,r:4},{c:4,r:4}];
const inPit=(c,r)=>c>=3&&c<=4&&r>=3&&r<=4;
const adjacent=(a,b)=>Math.abs(a.c-b.c)+Math.abs(a.r-b.r)===1;
// 64 cards: 32 Riders / 22 Ammo & Ultimates / 10 Quick Fix.
// Combat resources intentionally exceed the main game's four-edition cap;
// Scrap-Pit uses its own deck construction rule.
function pitDeck(owner){
 const riders=Object.keys(catalog).filter(k=>catalog[k].type==='rider' && !(catalog[k].tags||[]).includes('rcee-device'));
 const counts=new Map();const deck=[];
 while(deck.length<32){const available=riders.filter(k=>(counts.get(k)||0)<2);const k=available[Math.floor(Math.random()*available.length)];deck.push(makeCard(k,owner));counts.set(k,(counts.get(k)||0)+1)}
 for(let i=0;i<22;i++)deck.push(makeCard(i%4===0?['calldown','gamapool','tazer'][Math.floor(i/4)%3]:'ammo',owner));
 for(let i=0;i<10;i++)deck.push(makeCard('fix',owner));
 return shuffle(deck);
}
export class ScrapPitGame extends Game {
 reset(){super.reset();this.maxLife=20;this.life={1:20,2:20};this.units=[];this.drawEvents=[];
  for(const p of [1,2]){this.players[p].deck=pitDeck(p);this.players[p].hand=[];this.players[p].vault=[];this.players[p].discard=[];this.players[p].turns=0;for(let i=0;i<5;i++)this.draw(p,false)}
  this.log=[];this.message('SCRAP-PIT: Four combat tiles. Each player begins with 20 HP.');this.selected=null;this.mode='select';this.pendingAttack=null;this.pendingDefense=null;this.pendingHandDiscard=null;this.winner=null;this.active=1;this.phase='action';this.turn=1;this.startTurn(true);
 }
 validTargets(){const s=this.selectedCard();if(!s)return [];
  if(this.mode==='activate'&&this.selected?.source==='hand'&&s.type==='rider')return PIT_TILES.filter(t=>this.unitAt(t.c,t.r)?.owner!==this.active&&!this.unitAt(t.c,t.r)?.ko);
  if(this.selected?.source==='board'&&(this.mode==='move'||this.mode==='attack'))return PIT_TILES.filter(t=>adjacent(s.pos,t)&&((this.mode==='attack')?!!this.unitAt(t.c,t.r)&&this.unitAt(t.c,t.r).owner!==this.active&&!this.unitAt(t.c,t.r).ko:!this.unitAt(t.c,t.r)||this.unitAt(t.c,t.r).owner!==this.active||this.unitAt(t.c,t.r).ko));
  return [];
 }
 deploy(c,r){
  const card=this.selectedCard(),target=this.unitAt(c,r);
  if(!card||this.selected?.source!=='hand'||card.type!=='rider'||!inPit(c,r)||target?.owner===this.active||target?.ko){this.message('Choose an empty tile or an active enemy Rider to challenge.');return false}
  if(!this.pay())return false;
  this.me.hand=this.me.hand.filter(x=>x.id!==card.id);card.pos={c,r};card.ko=false;this.units.push(card);
  this.selected=null;this.mode='select';
  if(target){this.duel(card,target,'activation',{dest:{c,r}});if(this.pendingAttack){this.pendingAttack.maxCamActions=this.players[this.active].actions;this.pendingAttack.canBoost=true;}this.message(`${card.name} challenges ${target.name} on activation!`)}
  else this.message(`${card.name} activated at ${String.fromCharCode(65+c)}${r}.`);
  return true;
 }
 // Combat in Scrap-Pit: successful hits cause direct HP overage after defense;
 // a failed activation challenge discards the attacking Rider and costs its DEF.
 resolveDuel(att,def,kind,atk,defense,context=null){
  const success=atk>=defense,critical=success?Math.max(0,atk-defense):0;
  this.lastDuel={att:att.name,def:def.name,atk,defense,kind,success,critical};
  this.message(`${kind.toUpperCase()} ${atk} ATK vs ${defense} DEF: ${success?'HIT':'BLOCK'}${critical?` · CRITICAL ${critical}`:''}.`);
  if(critical){this.life[def.owner]=Math.max(0,this.life[def.owner]-critical);this.message(`Player ${def.owner} takes ${critical} direct critical HP (${this.life[def.owner]} left).`)}
  if(kind==='activation'){
   if(success){this.units=this.units.filter(u=>u.id!==def.id);this.capture(def);}
   else{this.units=this.units.filter(u=>u.id!==att.id);this.capture(att);this.message('Activation challenge failed: attacking Rider discarded.');}
  }else if(success){
   if(kind==='position'){this.units=this.units.filter(u=>u.id!==def.id);this.capture(def);if(context)att.pos=context.dest;}
   else{def.ko=true;def.hp=0;this.message(`${def.name} is KO. Move onto its tile to claim.`)}
  }else if(kind==='position'&&context){att.pos=context.old;}
  if(this.life[def.owner]===0&&!this.winner)this.declareWinner(att.owner,'Critical HP depleted');
 }
 beginDefense(att,def,kind,atk,defense,context=null){
  super.beginDefense(att,def,kind==='activation'?'position':kind,atk,defense,context);
  if(kind==='activation'&&this.pendingDefense)this.pendingDefense.kind='activation';
 }
 // Allow partial Quick Fix defense: each card reduces attack overage even when
 // there are insufficient cards to prevent the Rider from being defeated.
 toggleDefenseCard(id){const p=this.pendingDefense;if(!p||!p.available.includes(id))return false;p.chosen=p.chosen.includes(id)?p.chosen.filter(x=>x!==id):[...p.chosen,id];return true}
 resolveDefense(useCards=true){
  const p=this.pendingDefense;if(!p)return false;
  const att=this.combatUnit(p.attId),def=this.combatUnit(p.defId);
  if(!att||!def){this.pendingDefense=null;return false}
  const cards=useCards?this.players[def.owner].hand.filter(c=>p.chosen.includes(c.id)):[];
  const bonus=cards.reduce((n,c)=>n+(c.defense||0),0);
  cards.forEach(c=>this.consume(def.owner,c));this.pendingDefense=null;
  this.message(`Defense commits ${cards.length} Quick Fix card(s), +${bonus} DEF.`);
  this.resolveDuel(att,def,p.kind,p.atk,p.baseDefense+bonus,p.moveContext);return true;
 }
 checkGate(){}
 hasZapPerk(){return false}
 controllerActive(player){return this.units.some(u=>u.owner===player&&!u.ko&&(u.tags||[]).includes('rcee-source'))}
 capture(card){const owner=card.owner;this.players[owner].discard.push(card);this.life[owner]=Math.max(0,this.life[owner]-Math.max(0,card.defense||0));this.message(`${card.name} → Player ${owner} Scrap Pit. Player ${owner} loses ${card.defense||0} HP (${this.life[owner]} left).`);if(this.life[owner]===0)this.declareWinner(3-owner,'Opponent HP depleted');return true}
 claim(unit,other){if(!other.ko)return false;this.units=this.units.filter(x=>x.id!==other.id);if(other.owner===unit.owner){other.ko=false;other.hp=other.maxHp||1;delete other.pos;this.players[other.owner].hand.push(other);this.message(`${other.name} recovered from KO into Player ${other.owner} hand.`)}else{this.capture(other);this.message(`${other.name} claimed from KO.`)}return true}
 move(c,r){const unit=this.selectedCard();if(!unit||this.selected?.source!=='board'||unit.owner!==this.active||unit.ko||!inPit(c,r)||!adjacent(unit.pos,{c,r}))return false;const other=this.unitAt(c,r);if(other?.owner===this.active&&!other.ko)return false;if(!this.canOperate(unit)){this.message('RCee source required for this Rider.');return false}if(!this.pay())return false;
  const old={...unit.pos},dest={c,r};if(other){if(other.ko){this.claim(unit,other);unit.pos=dest;this.message(`${unit.name} moves to claimed tile.`)}else{this.duel(unit,other,'position',{old,dest});this.message('Duel for Position initiated.')}}else{unit.pos=dest;this.message(`${unit.name} moves to ${String.fromCharCode(65+c)}${r}.`)}this.selected={source:'board',id:unit.id};this.mode='move';return true}
 completeTurn(){this.phase='end';this.message(`Player ${this.active} ends their turn.`);if(!this.me.deck.length&&!this.me.hand.length&&!this.units.some(u=>u.owner===this.active&&!u.ko)){this.declareWinner(3-this.active,'Opponent ran out of playable cards');return}this.active=3-this.active;this.turn++;this.phase='action';this.startTurn();return true}
 selectHand(id){const c=this.me.hand.find(x=>x.id===id);if(!c)return;if(!['rider','ammo','ultimate','fix'].includes(c.type))return;super.selectHand(id)}
}
