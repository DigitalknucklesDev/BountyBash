import assert from 'node:assert/strict';
import {Game} from './src/engine.js';
function setup(a,d,defenseCard=false){
 const g=new Game();g.units=[];g.players[1].hand=[];g.players[2].hand=[];g.active=1;g.phase='action';g.players[1].actions=3;
 const att={id:'att',name:'Attacker',owner:1,type:'rider',attack:a,defense:1,pos:{c:3,r:3},tags:[],bounty:true,ko:false};
 const def={id:'def',name:'Defender',owner:2,type:'rider',attack:1,defense:d,pos:{c:4,r:3},tags:[],bounty:true,ko:false};
 g.units=[att,def];g.selected={source:'board',id:att.id};g.mode='attack';
 if(defenseCard)g.players[2].hand.push({id:'fix',type:'fix',defense:2,name:'Quick Fix'});
 return {g,att,def};
}
{
 const {g,def}=setup(1,3);g.attack(4,3);
 assert.ok(g.pendingAttack,'attack response required without Ammo');assert.equal(def.ko,false);
 g.resolveAttack(false);assert.ok(g.pendingDefense,'defense response required without Quick Fix');assert.equal(def.ko,false);
 g.resolveDefense(false);assert.equal(def.ko,false);assert.equal(g.lastDuel.success,false);
}
{
 const {g,def}=setup(3,2,true);g.attack(4,3);g.resolveAttack(false);
 assert.ok(g.pendingDefense);g.toggleDefenseCard('fix');g.resolveDefense(true);
 assert.equal(def.ko,false);assert.equal(g.lastDuel.defense,4);
}
{
 const {g,def}=setup(3,2);g.attack(4,3);g.resolveAttack(false);g.resolveDefense(false);
 assert.equal(def.ko,true);
}
console.log('PASS: adjacent attack opens both overlays; lower ATK fails; defense cards block; higher ATK KOs');
