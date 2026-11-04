import assert from 'node:assert/strict';
import {Game} from './src/engine.js';
import {makeCard,makeDeck,DRAW_WEIGHTS} from './src/cards.js';
assert.equal(DRAW_WEIGHTS.badger,7);assert.equal(DRAW_WEIGHTS.fix,5);
for(const k of ['fetch','darkgestal','crab','gamapool','chewy'])assert.ok(makeCard(k,1).name);
const deck=makeDeck(1);assert.ok(deck.length>64);const cnt={};for(const c of deck)cnt[c.kind]=(cnt[c.kind]||0)+1;assert.ok(Math.max(...Object.values(cnt))<=4);
function setup(){const g=new Game();g.units=[];g.players[1].vault=[];g.players[2].vault=[];g.players[1].hand=[];g.players[2].hand=[];const att=makeCard('badger',1);att.pos={c:2,r:1};const def=makeCard('chewy',2);g.units=[att];g.players[2].vault=[def];g.active=1;return {g,att,def}}
{const {g,att}=setup();att.pos={c:2,r:6};g.checkGate(att);assert.ok(g.pendingBacklot);g.chooseBacklotDefense(null);assert.equal(g.players[1].vault.length,1);assert.equal(g.pendingGateClaim,null);assert.equal(g.pendingBacklot,null)}
{const {g,att,def}=setup();att.pos={c:2,r:6};g.checkGate(att);g.chooseBacklotDefense(def.id);assert.ok(g.pendingAttack);g.resolveAttack(false);assert.ok(g.pendingDefense);g.resolveDefense(false);assert.equal(g.players[2].vault.length,2);assert.equal(g.players[1].vault.length,0);assert.equal(g.units.length,0)}
{const {g,att,def}=setup();att.pos={c:2,r:6};g.players[1].hand=[makeCard('gamapool',1)];g.checkGate(att);g.chooseBacklotDefense(def.id);g.toggleAttackCard(g.players[1].hand[0].id);g.resolveAttack(true);g.resolveDefense(false);assert.equal(g.players[1].vault.length,2);assert.equal(g.players[2].vault.length,0)}
console.log('V2.7.5 weights, copy limits, Backlot pass, defend, and attack victory passed');
