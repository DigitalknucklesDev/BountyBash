import {makeDeck,shuffle} from './cards.js';
import {tileType,gateOwner,vaultOwner,neighbors,same,distance,coord} from './rules.js';
export class Game {
 constructor(){this.reset()}
 reset(){this.players={1:{deck:shuffle(makeDeck(1)),hand:[],vault:[],discard:[],actions:3,turns:0},2:{deck:shuffle(makeDeck(2)),hand:[],vault:[],discard:[],actions:3,turns:0}};this.units=[];this.active=1;this.selected=null;this.mode='select';this.phase='setup';this.turn=0;this.log=[];this.winner=null;this.movesInRow=0;this.bonusUsed=false;this.trapEnabled=false;this.lastDuel=null;this.pendingGateClaim=null;this.pendingDefense=null;this.pendingAttack=null;this.drawnThisTurn=0;this.message('Shuffle complete. Each player draws five.');for(let p of [1,2])for(let i=0;i<5;i++)this.draw(p,false);this.phase='action';this.turn=1;this.startTurn(true)}
 get me(){return this.players[this.active]}
 message(s){this.log.unshift(`[P${this.active}] ${s}`);this.log=this.log.slice(0,90)}
 draw(p,cost=true){let player=this.players[p];if(cost){if(!this.pay())return false;if(this.drawnThisTurn>=4){player.actions++;this.message('Maximum four draws per turn.');return false}this.drawnThisTurn++}if(!player.deck.length){this.message(`Player ${p} has an empty deck.`);return false}player.hand.push(player.deck.pop());this.message(`Player ${p} drew a card.`);return true}
 pay(){if(this.pendingGateClaim||this.pendingDefense||this.pendingAttack){this.message('Resolve the pending interaction before continuing.');return false}if(this.phase!=='action'||this.winner||this.me.actions<1){this.message('No actions remaining. End your turn.');return false}this.me.actions--;return true}
 startTurn(initial=false){this.me.actions=3;this.movesInRow=0;this.bonusUsed=false;this.drawnThisTurn=0;this.selected=null;this.mode='select';this.me.turns++;if(!initial)this.draw(this.active,false);this.message(`Player ${this.active}: action phase — 3 actions.`)}
 endTurn(){if(this.winner||this.pendingGateClaim||this.pendingDefense||this.pendingAttack){if(this.pendingGateClaim||this.pendingDefense||this.pendingAttack)this.message('Resolve the pending selection first.');return;}this.phase='end';this.message(`Player ${this.active} ends their turn with ${this.me.vault.length}/8 bounties.`);if(this.me.vault.length>=8){this.winner=this.active;this.message(`PLAYER ${this.active} WINS!`);return}if(!this.me.deck.length&&!this.me.hand.length&&!this.units.some(u=>u.owner===this.active&&!u.ko)){this.winner=3-this.active;this.message(`Player ${this.active} forfeits: no remaining playable resources.`);return}this.active=3-this.active;this.turn++;this.phase='action';this.startTurn()}
 unitAt(c,r){return this.units.find(u=>u.pos.c===c&&u.pos.r===r)}
 selectUnit(id){let u=this.units.find(x=>x.id===id);if(u&&u.owner===this.active&&!u.ko){this.selected={source:'board',id};this.mode='move';this.message(`Selected ${u.name}. Choose a highlighted tile to move or duel.`)}else this.message('Select an active allied unit.')}
 selectHand(id){let card=this.me.hand.find(x=>x.id===id);if(!card)return;this.selected={source:'hand',id};this.mode=card.type==='rider'?'activate':card.type==='ammo'?'ammo':'fix';this.message(`${card.name} selected.`)}
 selectedCard(){return this.selected?.source==='hand'?this.me.hand.find(x=>x.id===this.selected.id):this.units.find(x=>x.id===this.selected?.id)}
 validTargets(){let s=this.selectedCard();if(!s)return [];if(this.mode==='activate')return Array.from({length:4},(_,i)=>({c:i+2,r:this.active===1?1:6})).filter(p=>!this.unitAt(p.c,p.r));if(this.mode==='move'&&this.selected.source==='board'){return neighbors(s.pos).filter(p=>!this.unitAt(p.c,p.r)||this.unitAt(p.c,p.r).owner!==this.active)}if(this.mode==='attack'&&this.selected.source==='board'){return neighbors(s.pos).filter(p=>{let u=this.unitAt(p.c,p.r);return u&&u.owner!==this.active&&!u.ko})}return []}
 deploy(c,r){let card=this.selectedCard();if(!card||this.selected.source!=='hand'||card.type!=='rider'||tileType(c,r)!=='gate'||gateOwner(r)!==this.active||this.unitAt(c,r)){this.message('Activation requires an empty allied Gate.');return}if(!this.pay())return;this.me.hand=this.me.hand.filter(x=>x.id!==card.id);card.pos={c,r};this.units.push(card);this.movesInRow=0;this.message(`${card.name} activated at ${coord(c,r)}.`);this.selected=null;this.mode='select'}
 move(c,r){let unit=this.selectedCard();if(!unit||this.selected.source!=='board'||unit.owner!==this.active||unit.ko)return;let dest={c,r};if(!neighbors(unit.pos).some(x=>same(x,dest))){this.message('Move one orthogonally adjacent field/Gate tile.');return}if(!this.pay())return;const other=this.unitAt(c,r);const old={...unit.pos};this.movesInRow++;
 if(other){if(other.owner===this.active){this.me.actions++;this.message('Friendly tile occupied.');return}if(other.ko){this.claim(unit,other);unit.pos=dest;this.message(`${unit.name} claims KO at ${coord(c,r)}.`)}else{this.duel(unit,other,'position',{old,dest});}}
 else{unit.pos=dest;this.message(`${unit.name} moves to ${coord(c,r)}.`)}
 if(this.movesInRow>=2&&!this.bonusUsed&&this.movementPerk){this.bonusUsed=true;this.bonusMove=unit.id;this.message('Movement perk: one bonus tile available!')}if(!this.pendingDefense&&!this.pendingAttack&&this.units.includes(unit))this.checkGate(unit);this.selected=this.units.includes(unit)?{source:'board',id:unit.id}:null;this.mode=this.selected?'move':'select'}
 claim(unit,other){if(other.owner===this.active){this.players[other.owner].hand.push(other);this.message(`${other.name} recovered to hand.`)}else this.capture(other,this.active);this.units=this.units.filter(x=>x.id!==other.id)}
 capture(other,by){let target=this.players[by];if(other.bounty){if(target.vault.length<8){target.vault.push(other);this.message(`${other.name} captured! ${target.vault.length}/8 bounties.`)}else{this.players[other.owner].discard.push(other);this.message('Vault full: captured card discarded (prototype fallback).')}}else{this.players[other.owner].discard.push(other);this.message('Non-bounty card sent to Scrap Pit.')}}
 duel(att,def,kind,moveContext=null){
  const support=this.units.filter(u=>u.owner===att.owner&&u.id!==att.id&&!u.ko&&distance(u.pos,def.pos)===1).reduce((sum,u)=>sum+u.attack,0);
  const baseAttack=att.attack+support;
  const baseDefense=def.defense+this.units.filter(u=>u.owner===def.owner&&u.id!==def.id&&!u.ko&&u.ability.includes('Mascot')).length;
  const ammo=this.players[att.owner].hand.filter(c=>c.type==='ammo');
  if(kind==='position'&&ammo.length){
   const needed=Math.max(0,baseDefense-baseAttack);
   this.pendingAttack={attId:att.id,defId:def.id,kind,moveContext,baseAttack,baseDefense,needed,available:ammo.map(c=>c.id),chosen:[],canBoost:ammo.reduce((n,c)=>n+c.attack,0)>=needed};
   this.message(`Player ${att.owner}: choose Ammo before the defender responds (${needed} ATK needed to meet DEF).`);
   return;
  }
  this.beginDefense(att,def,kind,baseAttack,baseDefense,moveContext);
 }
 toggleAttackCard(id){
  const p=this.pendingAttack;if(!p||!p.available.includes(id))return;
  p.chosen=p.chosen.includes(id)?p.chosen.filter(x=>x!==id):[...p.chosen,id];
 }
 resolveAttack(useCards=true){
  const p=this.pendingAttack;if(!p)return;
  const att=this.units.find(u=>u.id===p.attId),def=this.units.find(u=>u.id===p.defId);
  if(!att||!def){this.pendingAttack=null;return}
  const cards=this.players[att.owner].hand.filter(c=>p.chosen.includes(c.id));
  const bonus=useCards?cards.reduce((n,c)=>n+c.attack,0):0;
  if(useCards&&p.needed>0&&p.canBoost&&bonus<p.needed){this.message('Select sufficient Ammo to meet target Defense, or attack without Ammo.');return}
  if(useCards)cards.forEach(c=>this.consume(att.owner,c));
  this.pendingAttack=null;
  this.beginDefense(att,def,p.kind,p.baseAttack+bonus,p.baseDefense,p.moveContext);
 }
 beginDefense(att,def,kind,atk,defense,moveContext=null){
  const required=Math.max(0,atk-defense+1); // Defense must EXCEED attack; ties are hits.
  const fixes=this.players[def.owner].hand.filter(c=>c.type==='fix');
  if(kind==='position'&&fixes.length){
   this.pendingDefense={attId:att.id,defId:def.id,kind,moveContext,atk,baseDefense:defense,required,available:fixes.map(c=>c.id),chosen:[],canDefend:fixes.reduce((n,c)=>n+c.defense,0)>=required};
   this.message(`Player ${def.owner}: Quick Fix response requested (+${required} defense needed).`);
   return;
  }
  this.resolveDuel(att,def,kind,atk,defense,moveContext);
 }
 toggleDefenseCard(id){
  const pending=this.pendingDefense;if(!pending||!pending.canDefend||!pending.available.includes(id))return;
  pending.chosen=pending.chosen.includes(id)?pending.chosen.filter(x=>x!==id):[...pending.chosen,id];
 }
 resolveDefense(useCards=true){
  const pending=this.pendingDefense;if(!pending)return;
  const att=this.units.find(u=>u.id===pending.attId),def=this.units.find(u=>u.id===pending.defId);
  if(!att||!def){this.pendingDefense=null;return}
  const cards=this.players[def.owner].hand.filter(c=>pending.chosen.includes(c.id));
  const bonus=useCards?cards.reduce((n,c)=>n+c.defense,0):0;
  if(useCards&&pending.canDefend&&bonus<pending.required){this.message('Select enough Quick Fix cards to block the attack.');return}
  if(useCards&&pending.canDefend)cards.forEach(c=>this.consume(def.owner,c));
  this.pendingDefense=null;
  this.resolveDuel(att,def,pending.kind,pending.atk,pending.baseDefense+bonus,pending.moveContext);
 }
 resolveDuel(att,def,kind,atk,defense,moveContext=null){
  const success=atk>=defense;
  this.lastDuel={att:att.name,def:def.name,atk,defense,kind,success};
  this.message(`${kind==='position'?'POSITION DUEL':'ATTACK'}: ${att.name} ${atk} ATK vs ${def.name} ${defense} DEF — ${success?'HIT':'DEFENDED'}.`);
  if(success){def.hp=0;if(kind==='position'){this.capture(def,att.owner);this.units=this.units.filter(u=>u.id!==def.id);if(moveContext)att.pos=moveContext.dest;this.checkGate(att)}else{def.ko=true;this.message(`${def.name} is KNOCKED OUT. Move onto its tile to claim.`)}}
  else if(kind==='position'&&moveContext){att.pos=moveContext.old;this.message('Duel for Position defended; attacker remains at previous tile.')}
 }
 consume(p,card){this.players[p].hand=this.players[p].hand.filter(c=>c.id!==card.id);this.players[p].discard.push(card)}
 attack(c,r){let u=this.selectedCard(),target=this.unitAt(c,r);if(!u||!target||target.owner===this.active||target.ko||distance(u.pos,target.pos)!==1)return;if(!this.pay())return;this.duel(u,target,'adjacent');this.movesInRow=0;this.mode='move'}
 checkGate(unit){
  if(!unit||!this.units.includes(unit)||tileType(unit.pos.c,unit.pos.r)!=='gate'||gateOwner(unit.pos.r)===unit.owner)return;
  const scorer=unit.owner, opponent=3-scorer;
  // A unit that reaches an opposing Gate is automatically scored in its owner's Vault.
  // The existing eight-slot limit is respected. Printed bounty value is tracked separately.
  if(!unit.bounty){this.message('Non-bounty unit reached enemy Gate: cannot enter Bounty Vault.');return}
  if(this.players[scorer].vault.length>=8){this.message('Own Bounty Vault is full: Gate scoring cannot place this unit.');return}
  this.units=this.units.filter(u=>u.id!==unit.id);
  this.players[scorer].vault.push(unit);
  this.message(`GATE SCORE: ${unit.name} enters Player ${scorer}'s Vault (${this.players[scorer].vault.length}/8 bounties).`);
  const available=this.players[opponent].vault.filter(c=>c.bounty);
  if(available.length && this.players[scorer].vault.length<8){
    this.pendingGateClaim={scorer,opponent,options:available.map(c=>c.id)};
    this.message(`Gate bonus: Player ${scorer}, select one bounty from Player ${opponent}'s Vault.`);
  }else if(available.length){this.message('Gate bonus unavailable: own Vault is full.');}
 }
 chooseGateBounty(cardId){
  const pending=this.pendingGateClaim;
  if(!pending)return;
  const source=this.players[pending.opponent].vault;
  const idx=source.findIndex(c=>c.id===cardId&&c.bounty&&pending.options.includes(c.id));
  if(idx<0){this.message('Select an available bounty from the opposing Vault.');return}
  if(this.players[pending.scorer].vault.length>=8){this.message('Own Vault is full.');this.pendingGateClaim=null;return}
  const [card]=source.splice(idx,1);
  this.players[pending.scorer].vault.push(card);
  this.pendingGateClaim=null;
  this.message(`GATE BONUS: ${card.name} claimed from Player ${pending.opponent}'s Vault. Player ${pending.scorer}: ${this.players[pending.scorer].vault.length}/8.`);
 }
 bountyPoints(p){return this.players[p].vault.reduce((sum,c)=>sum+(c.bountyValue??(c.bounty?1:0)),0)}

 recall(){let card=this.selectedCard();if(!card||this.selected.source!=='board'||card.owner!==this.active||card.ko)return;if(!this.pay())return;this.units=this.units.filter(u=>u.id!==card.id);this.me.hand.push(card);this.selected=null;this.mode='select';this.movesInRow=0;this.message(`${card.name} recalled to hand.`)}
 clickTile(c,r){if(this.phase!=='action'||this.winner||this.pendingGateClaim||this.pendingDefense||this.pendingAttack)return;let unit=this.unitAt(c,r);if(this.mode==='activate')return this.deploy(c,r);if(this.mode==='move'&&this.selected?.source==='board'){if(unit?.owner===this.active&&!unit.ko)return this.selectUnit(unit.id);return this.move(c,r)}if(this.mode==='attack')return this.attack(c,r);if(unit)return this.selectUnit(unit.id);this.message(`Tile ${coord(c,r)} selected.`)}
}
