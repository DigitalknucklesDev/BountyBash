import assert from 'node:assert/strict';
import {Game} from './src/engine.js';
import {makeCard} from './src/cards.js';
function setup(){const g=new Game();g.units=[];for(const p of [1,2]){g.players[p].vault=[];g.players[p].hand=[]}const att=makeCard('badger',1);att.pos={c:2,r:6};const def=makeCard('chewy',2);g.units=[att];g.players[2].vault=[def];g.active=1;g.checkGate(att);return {g,att,def}}
{
 const {g,att}=setup();assert.ok(g.pendingGateClaim?.chewyGuard);assert.equal(g.pendingBacklot,null);assert.equal(g.players[1].vault.length,0);assert.equal(g.passGateBounty(),true);assert.equal(g.players[1].vault.length,1);assert.equal(g.players[2].vault.length,1);assert.equal(g.pendingAttack,null);assert.equal(g.units.includes(att),false);
}
{
 const {g,att,def}=setup();assert.equal(g.chooseGateBounty(def.id),true);assert.ok(g.pendingAttack);assert.equal(g.pendingAttack.defId,def.id);g.resolveAttack(false);assert.ok(g.pendingDefense);g.resolveDefense(false);assert.equal(g.players[1].vault.length,0);assert.equal(g.players[2].vault.length,2);assert.equal(g.units.includes(att),false);
}
{
 const {g,att,def}=setup();g.players[1].hand=[makeCard('gamapool',1)];assert.equal(g.chooseGateBounty(def.id),true);g.toggleAttackCard(g.players[1].hand[0].id);g.resolveAttack(true);g.resolveDefense(false);assert.equal(g.players[1].vault.length,2);assert.equal(g.players[2].vault.length,0);
}
{
 const {g,att,def}=setup();const other=makeCard('guard',2);g.players[2].vault.push(other);g.pendingGateClaim.options.push(other.id);assert.equal(g.chooseGateBounty(other.id),true);assert.equal(g.pendingAttack.defId,def.id);g.resolveAttack(false);g.resolveDefense(false);assert.equal(g.players[2].vault.length,3);
}
console.log('V2.7.6: scorer pass, automatic challenge, loss, win, and alternate bounty challenge passed');
