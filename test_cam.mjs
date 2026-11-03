import assert from 'node:assert/strict';
import {Game} from './src/engine.js';
const setup=({ammo=true,fix=false,actions=3}={})=>{
 const g=new Game();g.players[1].actions=actions;g.players[1].hand=[];g.players[2].hand=[];
 const att={id:'att',name:'Attacker',owner:1,type:'rider',pos:{c:3,r:3},attack:1,defense:1,hp:1,maxHp:1,bounty:true,bountyValue:1,tags:[]};
 const def={id:'def',name:'Defender',owner:2,type:'rider',pos:{c:4,r:3},attack:1,defense:4,hp:1,maxHp:1,bounty:true,bountyValue:1,tags:[]};
 g.units=[att,def];g.selected={source:'board',id:'att'};g.mode='move';
 if(ammo)g.players[1].hand.push({id:'ammo1',name:'Ammo',type:'ammo',attack:1});
 if(fix)g.players[2].hand.push({id:'fix1',name:'Quick Fix',type:'fix',defense:1});
 return g;
};
{
 const g=setup();g.move(4,3);assert.equal(g.players[1].actions,2);assert.ok(g.pendingAttack);assert.equal(g.pendingAttack.maxCamActions,2);g.setCamActions(2);g.toggleAttackCard('ammo1');g.resolveAttack(true);assert.equal(g.players[1].actions,0);assert.equal(g.lastDuel.atk,4);assert.equal(g.lastDuel.success,true);assert.equal(g.players[1].discard.length,1);assert.equal(g.players[1].vault.length,1);
}
{
 const g=setup({ammo:false,fix:true});g.move(4,3);assert.ok(g.pendingAttack,'CAM available even without Ammo');g.setCamActions(2);g.resolveAttack(true);assert.equal(g.pendingDefense.atk,3);g.resolveDefense(false);assert.equal(g.lastDuel.success,false);assert.equal(g.players[1].actions,0);
}
{
 const g=setup({actions:1,ammo:false});g.move(4,3);assert.equal(g.pendingAttack,null);assert.equal(g.lastDuel.atk,1);assert.equal(g.players[1].actions,0);
}
{
 const g=setup();g.move(4,3);g.setCamActions(2);g.toggleAttackCard('ammo1');g.resolveAttack(false);assert.equal(g.lastDuel.atk,1);assert.equal(g.players[1].actions,2);assert.equal(g.players[1].hand.length,1);
}
{
 const g=setup({ammo:false,fix:true});g.move(4,3);g.setCamActions(2);g.resolveAttack(true);assert.equal(g.pendingDefense.atk,3);assert.equal(g.pendingDefense.required,0);
}
console.log('CAM regression tests passed (5 cases)');
