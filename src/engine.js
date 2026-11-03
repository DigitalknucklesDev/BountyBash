import {makeDeck,shuffle,drawWeighted} from './cards.js';
import {tileType,gateOwner,vaultOwner,neighbors,same,distance,coord} from './rules.js';
export class Game {
 constructor(){this.reset()}
 reset(){this.players={1:{deck:shuffle(makeDeck(1)),hand:[],vault:[],discard:[],actions:3,turns:0},2:{deck:shuffle(makeDeck(2)),hand:[],vault:[],discard:[],actions:3,turns:0}};this.units=[];this.active=1;this.selected=null;this.mode='select';this.phase='setup';this.turn=0;this.log=[];this.winner=null;this.movesInRow=0;this.bonusUsed=false;this.trapEnabled=false;this.lastDuel=null;this.pendingGateClaim=null;this.pendingDefense=null;this.pendingAttack=null;this.pendingPerk=null;this.winReason=null;this.drawnThisTurn=0;this.drawEvents=[];this.attackAttempts=new Map();this.freeMoves=new Map();this.message('Shuffle complete. Each player draws five.');for(let p of [1,2])for(let i=0;i<5;i++)this.draw(p,false);this.phase='action';this.turn=1;this.startTurn(true)}
 get me(){return this.players[this.active]}
 message(s){this.log.unshift(`[P${this.active}] ${s}`);this.log=this.log.slice(0,90)}
 draw(p,cost=true){
  const player=this.players[p];
  if(!player.deck.length){this.message(`Player ${p} has an empty deck.`);return false}
  if(cost){
    if(p!==this.active){this.message('Only the active player can spend actions to draw.');return false}
    if(!this.pay())return false;
    this.drawnThisTurn++;
  }
  const card=drawWeighted(player.deck);
  player.hand.push(card);
  this.drawEvents.push({player:p,id:card.id,asset:card.asset});
  this.message(`Player ${p} drew a card.`);
  return true;
 }
 pay(){if(this.pendingGateClaim||this.pendingDefense||this.pendingAttack||this.pendingPerk){this.message('Resolve the pending interaction before continuing.');return false}if(this.phase!=='action'||this.winner||this.me.actions<1){this.message('No actions remaining. End your turn.');return false}this.me.actions--;return true}
 startTurn(initial=false){this.attackAttempts.clear();this.freeMoves.clear();this.me.actions=3;this.movesInRow=0;this.bonusUsed=false;this.drawnThisTurn=initial?0:1;this.selected=null;this.mode='select';this.me.turns++;if(!initial)this.draw(this.active,false);this.message(`Player ${this.active}: action phase — 3 actions.`)}
 endTurn(){if(this.winner||this.pendingGateClaim||this.pendingDefense||this.pendingAttack||this.pendingPerk){if(this.pendingGateClaim||this.pendingDefense||this.pendingAttack||this.pendingPerk)this.message('Resolve the pending selection first.');return;}// Resource Perks resolve before the turn passes to the opponent.
  if(this.hasZapPerk(this.active)&&this.units.some(u=>u.owner===this.active&&!u.ko&&this.canOperate(u)&&neighbors(u.pos).some(t=>!this.unitAt(t.c,t.r)))){
   this.pendingPerk={player:this.active,unitId:null};this.message(`Player ${this.active}: Zap Factory end-turn movement available. Choose an ally, then a vacant adjacent tile, or skip.`);return;
  }
  this.finishTurn();
 }
 hasZapPerk(player){return this.players[player].vault.some(c=>(c.tags||[]).includes('zap-factory'))}
 perkDestinations(){const u=this.units.find(u=>u.id===this.pendingPerk?.unitId);return u?neighbors(u.pos).filter(t=>!this.unitAt(t.c,t.r)):[]}
 selectPerkUnit(id){const p=this.pendingPerk;if(!p)return false;const u=this.units.find(u=>u.id===id&&u.owner===p.player&&!u.ko&&this.canOperate(u));if(!u||!neighbors(u.pos).some(t=>!this.unitAt(t.c,t.r)))return false;p.unitId=id;return true}
 resolvePerkMove(c,r){const p=this.pendingPerk;if(!p||!p.unitId)return false;const u=this.units.find(u=>u.id===p.unitId);if(!u||u.owner!==p.player||!neighbors(u.pos).some(t=>t.c===c&&t.r===r)||this.unitAt(c,r))return false;u.pos={c,r};this.message(`ZAP FACTORY: ${u.name} moves to ${coord(c,r)} for free.`);this.pendingPerk=null;this.checkGate(u);if(!this.winner&&!this.pendingGateClaim)this.finishTurn();else if(this.pendingGateClaim)this.pendingGateClaim.endTurnAfter=true;return true}
 skipPerk(){if(!this.pendingPerk)return false;this.message('Zap Factory movement skipped.');this.pendingPerk=null;this.finishTurn();return true}
 finishTurn(){this.phase='end';this.message(`Player ${this.active} ends their turn with ${this.me.vault.length}/8 bounties.`);if(this.me.vault.length>=8){this.declareWinner(this.active,'Eight bounties secured');return}if(!this.me.deck.length&&!this.me.hand.length&&!this.units.some(u=>u.owner===this.active&&!u.ko)){this.winner=3-this.active;this.message(`Player ${this.active} forfeits: no remaining playable resources.`);return}this.active=3-this.active;this.turn++;this.phase='action';this.startTurn()}

 // Control is evaluated from CURRENT ownership of the field unit or Backlot card.
 // Capturing a source transfers its control to the captor; original card.owner remains historical.
 controllerActive(player){return this.units.some(u=>u.owner===player&&!u.ko&&(u.tags||[]).includes('rcee-source'))||this.players[player].vault.some(c=>(c.tags||[]).includes('rcee-source'));}
 canOperate(unit){return !(unit.tags||[]).includes('rcee-device')||this.controllerActive(unit.owner);}
 playItem(id){
  if(this.pendingAttack||this.pendingDefense||this.pendingGateClaim||this.pendingPerk||this.winner)return false;
  const card=this.me.hand.find(c=>c.id===id&&(c.type==='item'||c.type==='perk'));if(!card)return false;
  if(this.me.vault.length>=8){this.message('Backlot full.');return false}
  if(!this.pay())return false;
  this.me.hand=this.me.hand.filter(c=>c.id!==id);
  this.scoreBounty(this.active,card,'ITEM ACTIVATED IN BACKLOT');this.selected=null;this.mode='select';return true;
 }
 currentOwner(card){for(const p of [1,2])if(this.players[p].vault.some(c=>c.id===card.id))return p;return card.owner;}
 unitAt(c,r){return this.units.find(u=>u.pos.c===c&&u.pos.r===r)}
 selectUnit(id){let u=this.units.find(x=>x.id===id);if(u&&u.owner===this.active&&!u.ko){this.selected={source:'board',id};this.mode='move';this.message(`Selected ${u.name}. Choose a highlighted tile to move or duel.`)}else this.message('Select an active allied unit.')}
 declareWinner(player,reason='Eight bounties secured'){if(this.winner)return;this.winner=player;this.winReason=reason;this.phase='finished';this.pendingGateClaim=null;this.pendingAttack=null;this.pendingDefense=null;this.pendingPerk=null;this.message(`VICTORY! Player ${player} wins — ${reason}.`)}
 scoreBounty(player,card,reason){if(this.players[player].vault.length>=8){this.message('Backlot full: cannot score another bounty.');return false}this.players[player].vault.push(card);card.controller=player;this.message(`${reason}: ${card.name} scored for Player ${player} (+${card.bountyValue??1} point).`);if(this.players[player].vault.length>=8)this.declareWinner(player);return true}
 playStance(id){if(this.winner||this.phase!=='action'||this.pendingAttack||this.pendingDefense||this.pendingGateClaim||this.pendingPerk)return false;const card=this.me.hand.find(c=>c.id===id&&c.type==='stance');if(!card)return false;if(this.me.vault.length>=8){this.message('Backlot is full.');return false}this.me.hand=this.me.hand.filter(c=>c.id!==id);this.scoreBounty(this.active,card,'INSTANT BOUNTY');this.selected=null;this.mode='select';return true}
 selectHand(id){let card=this.me.hand.find(x=>x.id===id);if(!card)return;this.selected={source:'hand',id};this.mode=(card.type==='rider'||card.type==='perk')?'activate':card.type==='item'?'item':card.type==='ammo'?'ammo':card.type==='stance'?'stance':'fix';this.message(`${card.name} selected.`)}
 selectedCard(){return this.selected?.source==='hand'?this.me.hand.find(x=>x.id===this.selected.id):this.units.find(x=>x.id===this.selected?.id)}
 validTargets(){let s=this.selectedCard();if(!s)return [];if(this.mode==='activate')return Array.from({length:4},(_,i)=>({c:i+2,r:this.active===1?1:6})).filter(p=>!this.unitAt(p.c,p.r));if(this.mode==='move'&&this.selected.source==='board'){return neighbors(s.pos).filter(p=>!this.unitAt(p.c,p.r)||this.unitAt(p.c,p.r).owner!==this.active)}if(this.mode==='attack'&&this.selected.source==='board'){return neighbors(s.pos).filter(p=>{let u=this.unitAt(p.c,p.r);return u&&u.owner!==this.active&&!u.ko})}return []}
 deploy(c,r){let card=this.selectedCard();if(!card||this.selected.source!=='hand'||!['rider','perk'].includes(card.type)||tileType(c,r)!=='gate'||gateOwner(r)!==this.active||this.unitAt(c,r)){this.message('Activation requires an empty allied Gate.');return}if(!this.pay())return;this.me.hand=this.me.hand.filter(x=>x.id!==card.id);card.pos={c,r};card.gateFreeMove=(card.tags||[]).includes('gate-free-move');this.units.push(card);this.movesInRow=0;this.message(`${card.name} activated at ${coord(c,r)}.`);this.selected=null;this.mode='select'}
 move(c,r){let unit=this.selectedCard();if(!unit||this.selected.source!=='board'||unit.owner!==this.active||unit.ko)return;let dest={c,r};if(!neighbors(unit.pos).some(x=>same(x,dest))){this.message('Move one orthogonally adjacent field/Gate tile.');return}const other=this.unitAt(c,r);if(other?.owner===this.active){this.message('Friendly tile occupied.');return}if(!this.canOperate(unit)){this.message('RCee Controller required: activate Heap Geek or score an RCee Controller source in your Backlot.');return}const free=(unit.tags||[]).includes('gate-free-move')&&unit.gateFreeMove&&!(this.freeMoves.get(unit.id));if(!free&&!this.pay())return;if(free){this.freeMoves.set(unit.id,true);this.message(`${unit.name} uses free Gate Keeper movement.`)}const old={...unit.pos};this.movesInRow++;
 if(other){if(other.owner===this.active){return}if(other.ko){this.claim(unit,other);unit.pos=dest;this.message(`${unit.name} claims KO at ${coord(c,r)}.`)}else if((unit.tags||[]).includes('bounty-plow')&&other.bounty&&this.controllerActive(unit.owner)){this.capture(other,unit.owner);this.units=this.units.filter(x=>x.id!==other.id);unit.pos=dest;this.message(`${unit.name} BOUNTY PLOW claims ${other.name}.`)}else{this.duel(unit,other,'position',{old,dest});}}
 else{unit.pos=dest;this.message(`${unit.name} moves to ${coord(c,r)}.`)}
 if(this.movesInRow>=2&&!this.bonusUsed&&this.movementPerk){this.bonusUsed=true;this.bonusMove=unit.id;this.message('Movement perk: one bonus tile available!')}
 // Check the board AFTER movement/capture. Bounty Plow removes its target, so
 // testing the old `other` reference incorrectly skipped enemy-Gate scoring.
 if(!this.pendingDefense&&!this.pendingAttack&&!this.winner&&this.units.includes(unit)&&same(unit.pos,dest)&&!this.unitAt(c,r)?.ko)this.checkGate(unit);this.selected=this.units.includes(unit)?{source:'board',id:unit.id}:null;this.mode=this.selected?'move':'select'}
 claim(unit,other){if(other.owner===this.active){this.players[other.owner].hand.push(other);this.message(`${other.name} recovered to hand.`)}else this.capture(other,this.active);this.units=this.units.filter(x=>x.id!==other.id)}
 capture(other,by){let target=this.players[by];if(other.bounty){if(target.vault.length<8){this.scoreBounty(by,other,'CAPTURE')}else{this.players[other.owner].discard.push(other);this.message('Vault full: captured card discarded (prototype fallback).')}}else{this.players[other.owner].discard.push(other);this.message('Non-bounty card sent to Scrap Pit.')}}
 duel(att,def,kind,moveContext=null){
  if((def.tags||[]).includes('battle-reff'))this.attackAttempts.set(def.id,true);
  const support=this.units.filter(u=>u.owner===att.owner&&u.id!==att.id&&!u.ko&&distance(u.pos,def.pos)===1).reduce((sum,u)=>sum+u.attack,0);
  const gateAttackBonus=(att.tags||[]).includes('gate-keeper')&&tileType(att.pos.c,att.pos.r)==='gate'&&gateOwner(att.pos.r)===att.owner?1:0;
  const baseAttack=att.attack+support+gateAttackBonus;
  const mascotBonus=(def.tags||[]).includes('mascot')?this.units.filter(u=>u.owner===def.owner&&u.id!==def.id&&!u.ko&&(u.tags||[]).includes('mascot')).length:0;
  const rallyBonus=this.units.filter(u=>u.owner===def.owner&&u.id!==def.id&&!u.ko&&distance(u.pos,def.pos)===1).reduce((n,u)=>n+((u.tags||[]).includes('repair-relay-2')?2:(u.tags||[]).includes('rally')?1:0),0);
  const gateDefenseBonus=(def.tags||[]).includes('gate-keeper')&&tileType(def.pos.c,def.pos.r)==='gate'&&gateOwner(def.pos.r)===def.owner?1:0;
  const chirpBonus=tileType(def.pos.c,def.pos.r)==='gate'&&this.players[def.owner].vault.some(c=>(c.tags||[]).includes('gate-chirp'))?1:0;
  const stanceBonus=(def.tags||[]).includes('twins')?this.players[def.owner].vault.filter(c=>c.type==='stance').length:0;
  const twinsRelay=this.units.filter(u=>u.owner===def.owner&&u.id!==def.id&&!u.ko&&distance(u.pos,def.pos)===1&&(u.tags||[]).includes('twins')&&this.units.some(k=>k.owner===def.owner&&!k.ko&&(k.tags||[]).includes('repair-relay-2')&&distance(k.pos,u.pos)===1)).length;
  const baseDefense=def.defense+mascotBonus+rallyBonus+gateDefenseBonus+chirpBonus+stanceBonus+twinsRelay;
  const ammo=this.players[att.owner].hand.filter(c=>c.type==='ammo'||c.type==='ultimate');
  if((kind==='position'&&(ammo.length||this.players[att.owner].actions>0))||(kind==='adjacent'&&ammo.length)){
   const needed=Math.max(0,baseDefense-baseAttack);
   this.pendingAttack={attId:att.id,defId:def.id,kind,moveContext,baseAttack,baseDefense,needed,camActions:0,maxCamActions:kind==='position'?this.players[att.owner].actions:0,available:ammo.map(c=>c.id),chosen:[],canBoost:ammo.reduce((n,c)=>n+c.attack,0)+(kind==='position'?this.players[att.owner].actions:0)>=needed};
   this.message(`Player ${att.owner}: choose Ammo / Ultimates and/or commit remaining actions as CAM (+1 ATK each).`);
   return;
  }
  this.beginDefense(att,def,kind,baseAttack,baseDefense,moveContext);
 }
 setCamActions(count){
  const p=this.pendingAttack;if(!p)return false;
  const max=Math.min(p.maxCamActions,this.players[this.active].actions);
  const value=Number(count);
  if(!Number.isInteger(value)||value<0||value>max)return false;
  p.camActions=value;
  return true;
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
  const ammoBonus=useCards?cards.reduce((n,c)=>n+c.attack,0):0;
  const cam=useCards?p.camActions:0;
  if(cam>this.players[att.owner].actions){this.message('Not enough remaining actions for CAM.');return}
  // The initial Move was paid before the duel. CAM spends only actions still available.
  this.players[att.owner].actions-=cam;
  if(useCards)cards.forEach(c=>this.consume(att.owner,c));
  this.message(`Attacker commits ${cards.length*(useCards?1:0)} attack buff card(s) (+${ammoBonus} ATK) and ${cam} CAM action(s) (+${cam} ATK). ${this.players[att.owner].actions} action(s) remain.`);
  this.pendingAttack=null;
  this.beginDefense(att,def,p.kind,p.baseAttack+ammoBonus+cam,p.baseDefense,p.moveContext);
 }
 beginDefense(att,def,kind,atk,defense,moveContext=null){
  const required=Math.max(0,atk-defense+1); // Defense must EXCEED attack; ties are hits.
  const fixes=this.players[def.owner].hand.filter(c=>c.type==='fix'||c.type==='stance');
  if(kind==='position'&&fixes.length){
   this.pendingDefense={attId:att.id,defId:def.id,kind,moveContext,atk,baseDefense:defense,required,available:fixes.map(c=>c.id),chosen:[],canDefend:fixes.reduce((n,c)=>n+c.defense,0)>=required};
   this.message(`Player ${def.owner}: Defense response requested (+${required} defense needed).`);
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
  this.message(useCards?`Defender commits ${cards.length} defense Item(s) (+${bonus} DEF).`:'Defender passes: no defensive Items played; resolve against existing Defense.');
  if(useCards&&pending.canDefend&&bonus<pending.required){this.message('Select enough Quick Fix cards to block the attack.');return}
  if(useCards&&pending.canDefend)cards.forEach(c=>{if(c.type==='stance'){this.players[def.owner].hand=this.players[def.owner].hand.filter(x=>x.id!==c.id);if(!this.scoreBounty(def.owner,c,'VICTORY STANCE DEFENSE'))this.players[def.owner].hand.push(c)}else this.consume(def.owner,c)});
  this.pendingDefense=null;
  // Passing must never cancel the duel or discard the attacker's already committed Ammo.
  // Resolve using the attack total snapshotted at the end of the attack response.
  this.resolveDuel(att,def,pending.kind,pending.atk,pending.baseDefense+bonus,pending.moveContext);
 }
 resolveDuel(att,def,kind,atk,defense,moveContext=null){
  const success=atk>=defense; // A tie is an attacker hit; defender must exceed Attack to block.
  this.lastDuel={att:att.name,def:def.name,atk,defense,kind,success};
  this.message(`${kind==='position'?'POSITION DUEL':'ATTACK'}: ${att.name} ${atk} ATK vs ${def.name} ${defense} DEF — ${success?'HIT':'DEFENDED'}.`);
  if(success){def.hp=0;if(kind==='position'){this.capture(def,att.owner);this.units=this.units.filter(u=>u.id!==def.id);if(moveContext)att.pos=moveContext.dest;this.checkGate(att)}else{def.ko=true;this.message(`${def.name} is KNOCKED OUT. Move onto its tile to claim.`)}}
  else if(kind==='position'&&moveContext){att.pos=moveContext.old;this.message('Duel for Position defended; attacker remains at previous tile.')}
 }
 consume(p,card){const player=this.players[p];if(!player.hand.some(c=>c.id===card.id))return;player.hand=player.hand.filter(c=>c.id!==card.id);player.discard.push(card);this.message(`${card.name} used by Player ${p} → Scrap Pit.`)}
 attack(c,r){let u=this.selectedCard(),target=this.unitAt(c,r);if(!u||!target||target.owner===this.active||target.ko||distance(u.pos,target.pos)!==1)return;if((target.tags||[]).includes('battle-reff')&&this.attackAttempts.has(target.id)){this.message('Battle Reff may only be attacked once per turn.');return}if(!this.canOperate(u)){this.message('RCee Controller required to operate this Device.');return}if(!this.pay())return;this.duel(u,target,'adjacent');this.movesInRow=0;this.mode='move'}
 checkGate(unit){
  if(!unit||!this.units.includes(unit)||tileType(unit.pos.c,unit.pos.r)!=='gate'||gateOwner(unit.pos.r)===unit.owner)return;
  const scorer=unit.owner, opponent=3-scorer;
  // A unit that reaches an opposing Gate is automatically scored in its owner's Vault.
  // The existing eight-slot limit is respected. Printed bounty value is tracked separately.
  if(!unit.bounty){this.message('Non-bounty unit reached enemy Gate: cannot enter Bounty Vault.');return}
  if(this.players[scorer].vault.length>=8){this.message('Own Bounty Vault is full: Gate scoring cannot place this unit.');return}
  this.units=this.units.filter(u=>u.id!==unit.id);
  this.scoreBounty(scorer,unit,'GATE SCORE');
  if(this.winner)return;
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
  const [card]=source.splice(idx,1);card.controller=pending.scorer;
  this.pendingGateClaim=null;
  this.scoreBounty(pending.scorer,card,'GATE BONUS');
  this.message(`GATE BONUS: ${card.name} claimed from Player ${pending.opponent}'s Vault. Player ${pending.scorer}: ${this.players[pending.scorer].vault.length}/8.`);if(pending.endTurnAfter&&!this.winner)this.finishTurn();
 }
 bountyPoints(p){return this.players[p].vault.reduce((sum,c)=>sum+(c.bountyValue??(c.bounty?1:0)),0)}

 recall(){let card=this.selectedCard();if(!card||this.selected.source!=='board'||card.owner!==this.active||card.ko)return;if(!this.canOperate(card)){this.message('RCee Controller required to recall this Device.');return}if(!this.pay())return;this.units=this.units.filter(u=>u.id!==card.id);this.me.hand.push(card);this.selected=null;this.mode='select';this.movesInRow=0;this.message(`${card.name} recalled to hand.`)}
 clickTile(c,r){if(this.phase!=='action'||this.winner||this.pendingGateClaim||this.pendingDefense||this.pendingAttack||this.pendingPerk)return;let unit=this.unitAt(c,r);if(this.mode==='activate')return this.deploy(c,r);if(this.mode==='move'&&this.selected?.source==='board'){if(unit?.owner===this.active&&!unit.ko)return this.selectUnit(unit.id);return this.move(c,r)}if(this.mode==='attack')return this.attack(c,r);if(unit)return this.selectUnit(unit.id);this.message(`Tile ${coord(c,r)} selected.`)}
}
