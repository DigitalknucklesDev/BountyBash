import assert from 'node:assert/strict';
import {Game} from './src/engine.js';
import {makeCard} from './src/cards.js';
function setup({controller=true,gate=false}={}){
 const g=new Game();g.players[1].hand=[];g.players[2].hand=[];
 const w=makeCard('warden',1),enemy=makeCard('badger',2);
 w.pos=gate?{c:2,r:5}:{c:2,r:3};enemy.pos=gate?{c:2,r:6}:{c:2,r:4};g.units.push(w,enemy);
 if(controller)g.players[1].vault.push(makeCard('controller',1));
 g.selected={source:'board',id:w.id};g.mode='move';return {g,w,enemy};
}
{
 const {g,w,enemy}=setup();g.move(2,4);
 assert.equal(g.units.includes(enemy),false);assert.equal(g.players[1].vault.includes(enemy),true);
 assert.deepEqual(w.pos,{c:2,r:4});assert.equal(g.players[1].actions,2);
}
{
 const {g,w,enemy}=setup({gate:true});g.move(2,6);
 assert.equal(g.units.includes(enemy),false);assert.equal(g.units.includes(w),false);
 assert.equal(g.players[1].vault.includes(enemy),true);
 assert.equal(g.players[1].vault.includes(w),true);
 assert.ok(g.log.some(x=>x.includes('GATE SCORE')));
}
{
 const {g,w,enemy}=setup({controller:false});g.move(2,4);
 assert.equal(g.units.includes(enemy),true);assert.deepEqual(w.pos,{c:2,r:3});
 assert.equal(g.players[1].actions,3);
 assert.ok(g.log.some(x=>x.includes('RCee Controller required')));
}
{
 const {g,w,enemy}=setup();enemy.bounty=false;g.move(2,4);
 assert.equal(g.players[1].vault.includes(enemy),false);
 assert.ok(g.pendingAttack || g.pendingDefense || g.lastDuel);
}
console.log('Field Warden capture, Gate score, RCee lock and non-bounty fallback: PASS');
