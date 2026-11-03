export const catalog={
 joe:{name:'Binge-er Joe',type:'rider',asset:'joe.png',attack:1,defense:1,bounty:true,bountyValue:1,ability:'Mascot: +1 Defense for each allied Mascot in play.',tags:['mascot']},
 splice:{name:'Splice’n Dice',type:'rider',asset:'splice.png',attack:1,defense:1,bounty:true,bountyValue:1,ability:'Mascot: +1 Defense for each allied Mascot in play.',tags:['mascot']},
 gent:{name:'G.E.N.T. Tech',type:'rider',asset:'gent.png',attack:1,defense:2,bounty:true,bountyValue:1,ability:'Rally: Share +1 Defense with an adjacent Ally. (Repair Rally Relay)',tags:['rally']},
 badger:{name:'Bullet Badger: Bash',type:'rider',asset:'badger.png',attack:1,defense:1,bounty:true,bountyValue:1,ability:'Quip: These new thumbs are freak’n me out!',tags:[]},
 ammo:{name:'Ammo +1',type:'ammo',asset:'ammo.png',attack:1,defense:0,bounty:false,ability:'Action-free +1 Attack during a duel.'},
 stance:{name:'Victory Stance',type:'stance',asset:'stance.png',move:0,attack:0,defense:2,bounty:true,bountyValue:1,ability:'Play directly into your Backlot action-free, or use as +2 Defense during a duel; score after use.'},
 fix:{name:'Quick Fix +1',type:'fix',asset:'fix.png',attack:0,defense:1,bounty:false,ability:'Action-free +1 Defense during a duel.'}
};
// Higher per-card weight = more likely to draw; composition and weights both matter.
// Mascots are rare/super rare. G.E.N.T. Tech is uncommon; Bullet Badger is common.
export const DRAW_WEIGHTS=Object.freeze({joe:1,splice:1,gent:2,badger:10,ammo:5,fix:5,stance:1});
export function drawWeighted(deck,random=Math.random){
 if(!deck.length)return null;
 const weights=deck.map(c=>Math.max(0,DRAW_WEIGHTS[c.kind]??1));
 const total=weights.reduce((a,b)=>a+b,0);
 if(total<=0)return deck.pop();
 let roll=Math.min(Math.max(random(),0),1-Number.EPSILON)*total;
 for(let i=0;i<deck.length;i++){roll-=weights[i];if(roll<0)return deck.splice(i,1)[0]}
 return deck.pop();
}
let id=0;
export function makeCard(kind,owner){return {...catalog[kind],kind,owner,id:`card-${++id}`,ko:false,hp:1,maxHp:1};}
export function makeDeck(owner){const counts={joe:6,splice:6,gent:18,badger:18,ammo:6,fix:6,stance:4};return Object.entries(counts).flatMap(([kind,n])=>Array.from({length:n},()=>makeCard(kind,owner)))}
export function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr}
