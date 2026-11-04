import assert from 'node:assert/strict';
import {Game} from './src/engine.js';
for(const owner of [1,2]){
 const g=new Game();g.units=[];g.active=1;g.phase='action';g.players[1].actions=3;
 const att={id:'a',name:'Collector',owner:1,type:'rider',attack:1,defense:1,pos:{c:3,r:3},tags:[],bounty:true,ko:false};
 const ko={id:'k',name:'KO',owner,type:'rider',attack:1,defense:1,pos:{c:4,r:3},tags:[],bounty:true,ko:true};
 g.units=[att,ko];g.selected={source:'board',id:'a'};g.mode='move';
 assert(g.validTargets().some(t=>t.c===4&&t.r===3));g.move(4,3);
 assert(!g.units.includes(ko));assert.equal(att.pos.c,4);assert.equal(g.players[1].actions,2);
 if(owner===1){assert(g.players[1].hand.some(c=>c.id==='k'));assert.equal(ko.ko,false);assert.equal(ko.pos,undefined);assert(!g.players[1].vault.some(c=>c.id==='k'));}
 else{assert(g.players[1].vault.some(c=>c.id==='k'));assert(!g.players[2].hand.some(c=>c.id==='k'));}
}
console.log('KO recovery and enemy capture tests passed.');
