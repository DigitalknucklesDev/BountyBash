import assert from 'node:assert/strict';
import {Game} from './src/engine.js';
import {makeCard} from './src/cards.js';
function setup(ammoCount=2,fixCount=2){const g=new Game();g.players[1].hand=Array.from({length:ammoCount},()=>makeCard('ammo',1));g.players[2].hand=Array.from({length:fixCount},()=>makeCard('fix',2));const a=makeCard('joe',1),d=makeCard('splice',2);a.pos={c:2,r:3};d.pos={c:3,r:3};d.defense=3;g.units=[a,d];g.selected={source:'board',id:a.id};g.mode='move';return {g,a,d}}
{
 const {g,a,d}=setup();g.move(3,3);assert.equal(g.me.actions,2);assert.ok(g.pendingAttack);assert.equal(g.pendingAttack.needed,2);g.toggleAttackCard(g.pendingAttack.available[0]);g.toggleAttackCard(g.pendingAttack.available[1]);g.resolveAttack();assert.equal(g.players[1].hand.length,0);assert.ok(g.pendingDefense);assert.equal(g.pendingDefense.atk,3);assert.equal(g.pendingDefense.required,1);g.toggleDefenseCard(g.pendingDefense.available[0]);g.resolveDefense();assert.equal(g.lastDuel.success,false);assert.deepEqual(a.pos,{c:2,r:3});assert.equal(g.players[2].hand.length,1);
}
{
 const {g,a,d}=setup(1,0);g.move(3,3);assert.equal(g.pendingAttack.canBoost,false);g.resolveAttack(false);assert.equal(g.lastDuel.success,false);assert.equal(g.players[1].hand.length,1);
}
{
 const {g,a,d}=setup(2,0);g.move(3,3);g.toggleAttackCard(g.pendingAttack.available[0]);g.toggleAttackCard(g.pendingAttack.available[1]);g.resolveAttack();assert.equal(g.lastDuel.success,true);assert.deepEqual(a.pos,{c:3,r:3});assert.equal(g.players[1].vault.length,1);
}
console.log('V1.3 duel tests passed: action cost, attacker selection, defense response, failed duel, successful capture.');
