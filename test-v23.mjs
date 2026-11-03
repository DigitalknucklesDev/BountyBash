import assert from 'node:assert/strict';
import {Game} from './src/engine.js';
import {makeCard,makeDeck,DRAW_WEIGHTS} from './src/cards.js';
assert.equal(makeDeck(1).length,64);
assert.equal(makeDeck(2).length,64);
assert.equal(DRAW_WEIGHTS.zap,2);
const g=new Game();
const zap=makeCard('zap',1),ultimate=makeCard('calldown',1);
g.players[1].hand.push(zap,ultimate);
assert.equal(g.playItem(zap.id),true);
assert.equal(g.players[1].vault.includes(zap),true);
const ally=makeCard('badger',1);ally.pos={c:2,r:1};g.units.push(ally);
g.endTurn();assert.ok(g.pendingPerk);
assert.equal(g.selectPerkUnit(ally.id),true);
assert.ok(g.perkDestinations().some(p=>p.c===2&&p.r===2));
assert.equal(g.resolvePerkMove(2,2),true);assert.equal(g.active,2);
// Adjacent attack Ultimate prompt and +3, consumed to scrap.
const g2=new Game();const att=makeCard('badger',1),def=makeCard('porko',2),ult=makeCard('calldown',1);
att.pos={c:2,r:2};def.pos={c:3,r:2};g2.units.push(att,def);g2.players[1].hand.push(ult);g2.selected={source:'board',id:att.id};g2.mode='attack';g2.attack(3,2);assert.ok(g2.pendingAttack);g2.toggleAttackCard(ult.id);g2.resolveAttack();assert.equal(g2.lastDuel.atk,4);assert.equal(def.ko,true);assert.ok(g2.players[1].discard.includes(ult));
// Resource perk can also be field-deployed and duel as zero-stat unit.
const g3=new Game();const z=makeCard('zap',1);g3.players[1].hand.push(z);g3.selectHand(z.id);g3.deploy(2,1);assert.ok(g3.units.includes(z));assert.equal(z.attack,0);
console.log('V2.3 regression tests passed');
