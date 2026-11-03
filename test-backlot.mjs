import assert from 'node:assert/strict';
import {Game} from './src/engine.js';
import {tileType,vaultOwner,vaultSlotIndex} from './src/rules.js';
import {makeCard} from './src/cards.js';
for (const owner of [1,2]) {
 const locations=[];
 for(let r=1;r<=6;r++)for(let c=0;c<8;c++)if(tileType(c,r)==='vault'&&vaultOwner(r)===owner)locations.push({c,r,index:vaultSlotIndex(c,r)});
 assert.equal(locations.length,8);
 assert.deepEqual(locations.map(x=>x.index).sort((a,b)=>a-b),[0,1,2,3,4,5,6,7]);
 const g=new Game();
 for(let i=0;i<8;i++)g.players[owner].vault.push(makeCard('joe',owner));
 assert.equal(new Set(locations.map(x=>g.players[owner].vault[x.index].id)).size,8);
}
{
 const g=new Game();
 assert.equal(g.players[1].vault.length,0);
 assert.equal(g.players[2].vault.length,0);
 g.endTurn();
 assert.equal(g.players[1].vault.length,0);
 assert.equal(g.players[2].vault.length,0);
}
console.log('Backlot tests passed: unique physical slots, no duplicate rendering, no turn-change scoring.');
