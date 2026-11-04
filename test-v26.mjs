import {makeDeck} from './src/cards.js';
import {Game} from './src/engine.js';
import assert from 'node:assert/strict';
for(const p of [1,2]){const deck=makeDeck(p);assert.equal(deck.length,64);const counts={};for(const c of deck)counts[c.kind]=(counts[c.kind]||0)+1;assert.ok(Object.values(counts).every(n=>n<=4));}
const g=new Game();assert.equal(g.players[1].hand.length,5);assert.equal(g.players[2].hand.length,5);
console.log('V2.6 deck cap and initial hand tests passed');
