import {ScrapPitGame,PIT_TILES} from './scrap-pit.js';
import {scrapAudio} from './audio.js';
import {choosePitAction} from './scrap-pit-tactics.js';
const root=document.querySelector('#pit-app'),SAVE='scraplords-scrap-pit-v2';
let g=new ScrapPitGame(),mode='pvp',difficulty='normal',series=1,wins={1:0,2:0},round=1,first=1,menu=true,finished=false,timer=null,sessionId='',lastLog='';
const rand=a=>a[Math.floor(Math.random()*a.length)];
let dockExpanded=false;
const cardImg=c=>`assets/${c.asset}`;
const tileName=(c,r)=>`${String.fromCharCode(65+c)}${r}`;
function scrapPile(player){
 const cards=player.discard||[];
 if(!cards.length)return '<span class="scrap-empty" aria-hidden="true"></span>';
 const visible=cards.slice(-3);
 return `<div class="scrap-stack" aria-hidden="true">${visible.map((card,i)=>`<img class="scrap-layer" style="--layer:${i};--tilt:${[-9,6,-4][i]}deg" src="${cardImg(card)}" alt="">`).join('')}</div>`;
}
function save(){try{sessionStorage.setItem(SAVE,JSON.stringify({mode,difficulty,series,wins,round,first,menu,finished,sessionId,game:g},(k,v)=>v instanceof Map?{__map:[...v]}:v))}catch(e){console.warn(e)}}
function restore(){try{const data=JSON.parse(sessionStorage.getItem(SAVE)||'null');if(!data)return;({mode,difficulty,series,wins,round,first,menu,finished,sessionId}=data);const game=JSON.parse(JSON.stringify(data.game),(k,v)=>v&&v.__map?new Map(v.__map):v);Object.assign(g,game);g.drawEvents=[]}catch(e){console.warn('Restore failed',e)}}
restore();
function audio(type){try{scrapAudio.play(type)}catch{}}
function music(resume=false){sessionId=resume&&sessionId?sessionId:`pit-${Date.now()}-${Math.random()}`;try{scrapAudio.startSession(sessionId,{resume})}catch(e){console.warn('Audio unavailable',e)}}
function newRound(){clearTimeout(timer);g.reset();g.active=first;g.players[1].actions=3;g.players[2].actions=3;g.message(`Player ${first} goes first.`);finished=false;save();render()}
function begin(){menu=false;wins={1:0,2:0};round=1;music();newRound()}
function nextRound(){round++;try{scrapAudio.startMusic(scrapAudio.currentTrack)}catch{}newRound()}
function isNpc(p){return mode==='cvc'||mode==='pvc'&&p===2}
function actor(){if(g.pendingAttack)return g.combatUnit(g.pendingAttack.attId)?.owner;if(g.pendingDefense)return g.combatUnit(g.pendingDefense.defId)?.owner;if(g.pendingHandDiscard)return g.pendingHandDiscard.player;return g.active}
function recordWin(){if(!g.winner||finished)return;finished=true;wins[g.winner]=(wins[g.winner]||0)+1;audio('round_win');if(wins[g.winner]>=Math.ceil(series/2))audio('victory')}
function render(){recordWin();save();const p=g.players[g.active],op=g.players[3-g.active],s=g.selectedCard();
 if(menu){root.innerHTML=`<div class="pit-menu"><div class="menu-panel"><div class="eyebrow">SCRAPLORDS · EXPRESS DUEL</div><h1>SCRAP<span>-PIT</span></h1><p>Four tiles. Two rivals. No gates. No mercy.</p><label>GAME MODE<select id="mode"><option value="pvp" ${mode==='pvp'?'selected':''}>Human vs Human</option><option value="pvc" ${mode==='pvc'?'selected':''}>Human vs Computer</option><option value="cvc" ${mode==='cvc'?'selected':''}>Computer vs Computer</option></select></label><label>NPC DIFFICULTY<select id="difficulty"><option ${difficulty==='easy'?'selected':''}>easy</option><option ${difficulty==='normal'?'selected':''}>normal</option><option ${difficulty==='hard'?'selected':''}>hard</option></select></label><label>FORMAT<select id="series"><option value="1" ${series===1?'selected':''}>Single Match</option><option value="3" ${series===3?'selected':''}>Best of 3</option></select></label><label>FIRST PLAYER<select id="first"><option value="1" ${first===1?'selected':''}>Player 1</option><option value="2" ${first===2?'selected':''}>Player 2</option><option value="0">Random</option></select></label><button id="start" class="primary">ENTER THE PIT</button><a href="./index.html">← BACK TO BOUNTY BASH</a></div></div>`;
  root.querySelector('#mode').onchange=e=>mode=e.target.value;root.querySelector('#difficulty').onchange=e=>difficulty=e.target.value;root.querySelector('#series').onchange=e=>series=+e.target.value;root.querySelector('#first').onchange=e=>first=+e.target.value||rand([1,2]);root.querySelector('#start').onclick=begin;return}
 const targets=g.validTargets(),legal=(c,r)=>targets.some(t=>t.c===c&&t.r===r);
 const tiles=[{c:2,r:3,utility:'P2 DECK',owner:2,kind:'deck'},{c:2,r:4,utility:'P2 SCRAP',owner:2,kind:'discard'},...PIT_TILES.map(t=>({...t,kind:'field'})),{c:5,r:3,utility:'P1 SCRAP',owner:1,kind:'discard'},{c:5,r:4,utility:'P1 DECK',owner:1,kind:'deck'}];
 const cells=Array.from({length:2},(_,ri)=>[2,3,4,5].map(c=>tiles.find(t=>t.c===c&&t.r===ri+3))).flat();
 const pending=g.pendingAttack||g.pendingDefense,attack=!!g.pendingAttack,defense=!!g.pendingDefense;
 root.innerHTML=`<div class="shell"><header><div><div class="eyebrow">SCRAPLORDS · EXPRESS DUEL</div><h1>SCRAP<span>-PIT</span></h1></div><div class="header-actions"><span>ROUND ${round} / ${series} · ${wins[1]}–${wins[2]}</span><button id="menu">MENU</button></div></header>
 <div class="health"><div class="health-card p2"><b>PLAYER 2 ${isNpc(2)?'· NPC':''}</b><strong>${g.life[2]} / ${g.maxLife} HP</strong><div class="meter"><i style="width:${100*g.life[2]/g.maxLife}%"></i></div><small>DECK ${g.players[2].deck.length} · SCRAP ${g.players[2].discard.length}</small></div><div class="turn-badge">${g.winner?'MATCH COMPLETE':`PLAYER ${g.active} TURN · ${g.me.actions} ACTIONS`}</div><div class="health-card p1"><b>PLAYER 1 ${isNpc(1)?'· NPC':''}</b><strong>${g.life[1]} / ${g.maxLife} HP</strong><div class="meter"><i style="width:${100*g.life[1]/g.maxLife}%"></i></div><small>DECK ${g.players[1].deck.length} · SCRAP ${g.players[1].discard.length}</small></div></div>
 <div class="arena"><div class="pit-board">${cells.map(t=>{const u=t.kind==='field'?g.unitAt(t.c,t.r):null,pl=g.players[t.owner];return `<button class="pit-tile ${t.kind} ${legal(t.c,t.r)?'legal':''} ${u?'occupied':''}" data-c="${t.c}" data-r="${t.r}" ${t.kind==='discard'?'disabled':''} title="${tileName(t.c,t.r)} ${t.utility||''}">${t.kind==='deck'?`<img class="back" src="assets/scraplords_backCard_600x825-TM.png"><em>${pl.deck.length}</em>`:t.kind==='discard'?`${scrapPile(pl)}<em>${pl.discard.length}</em>`:u?`<img class="unit-art ${u.ko?'knocked':''}" src="${cardImg(u)}"><span class="unit-stats">${u.ko?'KO':`ATK ${u.attack} · DEF ${u.defense}`}</span><span class="unit-owner">P${u.owner}</span>`:''}<small>${tileName(t.c,t.r)} ${t.utility||''}</small></button>`}).join('')}</div></div>
 <div class="controls"><div class="buttons"><button id="draw" ${g.winner||g.pendingHandDiscard?'disabled':''}>DRAW · 1 ACTION</button><button id="move" ${g.selected?.source!=='board'?'disabled':''}>MOVE / POSITION</button><button id="attack" ${g.selected?.source!=='board'?'disabled':''}>ATTACK</button><button id="end" ${g.winner?'disabled':''}>END TURN</button><button id="clear">CLEAR</button></div><div class="hint">${g.pendingHandDiscard?'End Phase: discard down to 7 cards.':g.mode==='activate'?'Choose an empty tile or enemy Rider to challenge on activation.':g.mode==='attack'?'Choose an adjacent enemy to attack.':g.mode==='move'?'Choose an adjacent tile to move or Duel for Position.':'Select a Rider from your hand or a friendly Rider on the field.'}</div></div>
 <div class="hand-dock ${dockExpanded?'expanded':''}" id="pit-hand-dock"><div class="hand-head"><button class="hand-toggle" id="pit-hand-toggle" aria-expanded="${dockExpanded}">PLAYER ${g.active} HAND · ${p.hand.length} CARDS <span class="hand-hint">${dockExpanded?'COLLAPSE':'EXPAND'} ▲</span></button><button class="hand-close" id="pit-hand-close" title="${dockExpanded?'Collapse hand':'Expand hand'}">${dockExpanded?'×':'⌃'}</button></div><div class="hand-cards">${p.hand.map((c,i)=>`<button class="hand-card ${g.selected?.id===c.id?'selected':''}" style="--fan:${i-(p.hand.length-1)/2}" data-card="${c.id}" title="${c.ability||''}"><img src="${cardImg(c)}" alt="${c.name}"><span>${c.name}</span></button>`).join('')}</div></div>
 <div class="log"><b>BATTLE LOG</b>${g.log.slice(0,5).map(x=>`<div>${escapeHtml(x)}</div>`).join('')}</div>
 ${pending?`<div class="veil"><div class="duel-panel"><div class="eyebrow">${attack?'ATTACK RESPONSE':'DEFENSE RESPONSE'}</div><h2>${attack?'DUEL FOR POSITION / ATTACK':'DEFEND OR PASS'}</h2><p>${attack?`BASE ATTACK ${pending.baseAttack} vs DEF ${pending.baseDefense}`:`ATTACK ${pending.atk} vs BASE DEF ${pending.baseDefense} · CRITICAL OVERAGE ${Math.max(0,pending.atk-pending.baseDefense)} (Quick Fix reduces damage)`}</p><div class="buffs">${pending.available.map(id=>{const owner=actor(),card=g.players[owner].hand.find(c=>c.id===id);return card?`<button class="buff ${pending.chosen.includes(id)?'chosen':''}" data-buff="${id}"><img src="${cardImg(card)}"><span>${card.name} +${attack?card.attack:card.defense}</span></button>`:''}).join('')||'<p>No buff cards available</p>'}</div>${attack&&pending.maxCamActions?`<label>CAM ACTIONS <input type="number" id="cam" min="0" max="${Math.min(pending.maxCamActions,g.players[actor()].actions)}" value="${pending.camActions}"></label>`:''}<div class="buttons"><button id="commit" class="primary">COMMIT SELECTED</button><button id="pass">PASS / NO BUFFS</button></div></div></div>`:''}
 ${g.pendingHandDiscard?`<div class="veil"><div class="duel-panel"><h2>END PHASE DISCARD</h2><p>Choose ${g.me.hand.length-7} card(s) to discard. No action cost.</p><div class="buffs">${g.me.hand.map(c=>`<button class="buff" data-discard="${c.id}"><img src="${cardImg(c)}"><span>${c.name}</span></button>`).join('')}</div></div></div>`:''}
 ${g.winner?`<div class="veil"><div class="duel-panel win"><h2>PLAYER ${g.winner} WINS!</h2><p>${g.winReason||'Scrap-Pit victory'} · SERIES ${wins[1]}–${wins[2]}</p><button class="primary" id="next">${wins[g.winner]>=Math.ceil(series/2)?'NEW SERIES':'NEXT ROUND'}</button><button id="winmenu">MAIN MENU</button></div></div>`:''}</div>`;
 root.querySelector('#pit-hand-toggle').onclick=()=>{dockExpanded=!dockExpanded;render()};
 root.querySelector('#pit-hand-close').onclick=()=>{dockExpanded=!dockExpanded;render()};
 root.querySelector('#menu').onclick=()=>{clearTimeout(timer);menu=true;try{scrapAudio.pauseMusic()}catch{}render()};
 root.querySelectorAll('.pit-tile').forEach(el=>el.onclick=()=>{if(g.winner||isNpc(actor())||g.pendingAttack||g.pendingDefense||g.pendingHandDiscard)return;const c=+el.dataset.c,r=+el.dataset.r;if(c===2&&r===3&&g.active===2||c===5&&r===4&&g.active===1){g.draw(g.active);audio('card_draw')}else if(c>=3&&c<=4){const u=g.unitAt(c,r);if(g.selected?.source==='hand'&&g.mode==='activate'){const wasOccupied=!!u;const ok=g.deploy(c,r);if(ok)audio(wasOccupied?'attack':'card_deploy')}else if(g.selected?.source==='board'&&g.mode==='attack'){g.attack(c,r);audio('attack')}else if(g.selected?.source==='board'&&g.mode==='move'){g.move(c,r);audio('move')}else if(u&&u.owner===g.active&&!u.ko){g.selectUnit(u.id)}}render()});
 root.querySelectorAll('[data-card]').forEach(el=>el.onclick=()=>{if(isNpc(actor())||g.pendingAttack||g.pendingDefense||g.pendingHandDiscard)return;g.selectHand(el.dataset.card);render()});
 root.querySelector('#draw').onclick=()=>{if(isNpc(actor()))return;g.draw(g.active);audio('card_draw');render()};root.querySelector('#move').onclick=()=>{if(isNpc(actor()))return;g.mode='move';render()};root.querySelector('#attack').onclick=()=>{if(isNpc(actor()))return;g.mode='attack';render()};root.querySelector('#end').onclick=()=>{if(isNpc(actor()))return;g.endTurn();audio('turn_end');render()};root.querySelector('#clear').onclick=()=>{if(isNpc(actor()))return;g.clearSelection();render()};
 root.querySelectorAll('[data-buff]').forEach(el=>el.onclick=()=>{if(isNpc(actor()))return;attack?g.toggleAttackCard(el.dataset.buff):g.toggleDefenseCard(el.dataset.buff);render()});
 if(root.querySelector('#cam'))root.querySelector('#cam').onchange=e=>{g.setCamActions(+e.target.value);render()};
 if(pending){root.querySelector('#commit').onclick=()=>{if(isNpc(actor()))return;attack?g.resolveAttack(true):g.resolveDefense(true);audio(attack?'ammo':'defense');render()};root.querySelector('#pass').onclick=()=>{if(isNpc(actor()))return;attack?g.resolveAttack(false):g.resolveDefense(false);render()}}
 root.querySelectorAll('[data-discard]').forEach(el=>el.onclick=()=>{if(isNpc(actor()))return;g.discardEndPhaseCard(el.dataset.discard);audio('card_discard');render()});
 if(g.winner){root.querySelector('#next').onclick=()=>wins[g.winner]>=Math.ceil(series/2)?begin():nextRound();root.querySelector('#winmenu').onclick=()=>{menu=true;render()}}
 scheduleNpc();
}
function escapeHtml(str){return String(str).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function scheduleNpc(){clearTimeout(timer);if(menu||g.winner||!isNpc(actor()))return;timer=setTimeout(npcTurn,Math.max(180,difficulty==='easy'?800:difficulty==='hard'?400:550))}
const npcBlocked=new Set();
let npcTurnKey='';
function npcTurn(){timer=null;if(menu||g.winner||!isNpc(actor()))return;try{
 if(g.pendingHandDiscard){const h=g.me.hand;const card=[...h].sort((a,b)=>(a.defense||0)+(a.attack||0)-(b.defense||0)-(b.attack||0))[0];if(card)g.discardEndPhaseCard(card.id);render();return}
 if(g.pendingAttack){const pending=g.pendingAttack;const owner=actor();const cards=g.players[owner].hand.filter(c=>pending.available.includes(c.id)).sort((a,b)=>b.attack-a.attack);const need=Math.max(0,pending.baseDefense-pending.baseAttack);let buff=0;for(const c of cards){if(buff>=need)break;g.toggleAttackCard(c.id);buff+=c.attack}if(buff<need&&pending.maxCamActions)g.setCamActions(Math.min(need-buff,g.players[owner].actions));g.resolveAttack(true);render();return}
 if(g.pendingDefense){const pending=g.pendingDefense,owner=actor();const cards=g.players[owner].hand.filter(c=>pending.available.includes(c.id)).sort((a,b)=>b.defense-a.defense);let buff=0;for(const c of cards){if(buff>=pending.required)break;g.toggleDefenseCard(c.id);buff+=c.defense}g.resolveDefense(buff>0);render();return}
 const key=`${g.turn}:${g.active}`;
 if(key!==npcTurnKey){npcTurnKey=key;npcBlocked.clear()}
 const action=choosePitAction(g,difficulty,npcBlocked);
 const actionKey=[action.type,action.unit?.id||action.card?.id||'',action.target?.c??'',action.target?.r??''].join(':');
 const beforeActions=g.me.actions;
 const beforePending=!!(g.pendingAttack||g.pendingDefense);
 const beforeTurn=g.turn;
 if(g.me.actions<=0){g.endTurn()}
 else if(action.type==='attack'){g.selectUnit(action.unit.id);g.attack(action.target.c,action.target.r);audio('attack')}
 else if(action.type==='position'){g.selectUnit(action.unit.id);g.move(action.target.c,action.target.r);audio('attack')}
 else if(action.type==='move'){g.selectUnit(action.unit.id);g.move(action.target.c,action.target.r);audio('move')}
 else if(action.type==='deploy'){g.selectHand(action.card.id);g.deploy(action.target.c,action.target.r);audio('card_deploy')}
 else if(action.type==='draw'){g.draw(g.active);audio('card_draw')}
 else g.endTurn();
 // Reject stale or illegal NPC choices rather than repeating forever.
 if(g.turn===beforeTurn && g.me.actions===beforeActions && !beforePending && !g.pendingAttack && !g.pendingDefense){
   npcBlocked.add(actionKey);
   if(npcBlocked.size>32){g.message('NPC ends turn: no legal tactical action available.');g.endTurn()}
 }
 }catch(e){console.error('Scrap-Pit NPC error',e);g.message(`NPC error: ${e.message}`);mode='pvp'}render()}
render();
