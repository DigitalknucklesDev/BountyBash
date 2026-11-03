import assert from 'node:assert/strict';
import {Game} from './src/engine.js';
import {makeCard} from './src/cards.js';
function scenario({attack=1,defense=1,ammo=0,fix=0,applyAmmo=true,applyFix=false}={}){
 const g=new Game();g.units=[];g.players[1].hand=[];g.players[2].hand=[];g.players[1].vault=[];g.players[2].vault=[];g.active=1;g.phase='action';g.players[1].actions=3;
 const a=makeCard('joe',1),d=makeCard('splice',2);a.attack=attack;d.defense=defense;a.pos={c:3,r:3};d.pos={c:3,r:4};g.units=[a,d];
 for(let i=0;i<ammo;i++)g.players[1].hand.push(makeCard('ammo',1));
 for(let i=0;i<fix;i++)g.players[2].hand.push(makeCard('fix',2));
 g.selected={source:'board',id:a.id};g.mode='move';g.move(3,4);
 if(g.pendingAttack){if(applyAmmo)for(const id of g.pendingAttack.available)g.toggleAttackCard(id);g.resolveAttack(applyAmmo)}
 if(g.pendingDefense){if(applyFix)for(const id of g.pendingDefense.available)g.toggleDefenseCard(id);g.resolveDefense(applyFix)}
 assert.equal(g.pendingDefense,null);assert.equal(g.pendingAttack,null);assert.equal(g.players[1].actions,2);return {g,a,d};
}
{
 const {g,a,d}=scenario({attack:2,defense:1,fix:1});assert.equal(g.lastDuel.success,true,'defender pass must take hit');assert.equal(g.unitAt(3,4),a);assert.equal(g.players[1].vault.length,1);assert.equal(g.players[2].hand.length,1);
}
{
 const {g,a}=scenario({attack:1,defense:2,ammo:2,fix:1});assert.equal(g.lastDuel.atk,3);assert.equal(g.lastDuel.defense,2);assert.equal(g.lastDuel.success,true);assert.equal(g.unitAt(3,4),a);assert.equal(g.players[1].discard.length,2);
}
{
 const {g,a}=scenario({attack:1,defense:2,ammo:2,fix:1,applyFix:true});assert.equal(g.lastDuel.atk,3);assert.equal(g.lastDuel.defense,2);assert.equal(g.lastDuel.success,true,'insufficient defense cards must not prevent hit');assert.equal(g.players[2].discard.length,0);
}
{
 const {g,a,d}=scenario({attack:1,defense:2,ammo:2,fix:2,applyFix:true});assert.equal(g.lastDuel.atk,3);assert.equal(g.lastDuel.defense,4);assert.equal(g.lastDuel.success,false);assert.equal(g.unitAt(3,4),d);assert.deepEqual(a.pos,{c:3,r:3});
}
{
 const {g,a,d}=scenario({attack:1,defense:2,ammo:2,fix:1,applyAmmo:false});assert.equal(g.lastDuel.atk,1);assert.equal(g.lastDuel.success,false);assert.equal(g.players[1].discard.length,0);
}
console.log('PASS: defender pass resolves attacker hit; Ammo persists through pass; ties hit; sufficient defense blocks; attacker Ammo pass does not buff; action charged once.');
