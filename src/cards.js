export const catalog={
 joe:{name:'Binge-er Joe',type:'rider',asset:'joe.png',attack:1,defense:1,bounty:true,bountyValue:1,ability:'Mascot: +1 Defense for each allied Mascot in play.',tags:['mascot']},
 splice:{name:'Splice’n Dice',type:'rider',asset:'splice.png',attack:1,defense:1,bounty:true,bountyValue:1,ability:'Mascot: +1 Defense for each allied Mascot in play.',tags:['mascot']},
 gent:{name:'G.E.N.T. Tech',type:'rider',asset:'gent.png',attack:1,defense:2,bounty:true,bountyValue:1,ability:'Rally: Share +1 Defense with an adjacent Ally. (Repair Rally Relay)',tags:['rally']},
 badger:{name:'Bullet Badger: Bash',type:'rider',asset:'badger.png',attack:1,defense:1,bounty:true,bountyValue:1,ability:'Quip: These new thumbs are freak’n me out!',tags:[]},
 reff:{name:'Battle Reff',type:'rider',asset:'reff.png',attack:0,defense:2,bounty:true,bountyValue:1,ability:'Can only be attacked for one action per turn.',tags:['battle-reff']},
 greynor:{name:'Greynor’s Keep',type:'rider',asset:'greynor.png',attack:0,defense:3,bounty:true,bountyValue:1,ability:'Repair Relay: Share up to +2 Defense with adjacent allies.',tags:['repair-relay-2']},
 guard:{name:'Guard-goyle',type:'rider',asset:'guard.png',attack:1,defense:1,bounty:true,bountyValue:1,ability:'Gate Keeper: +1 Attack / +1 Defense when played on an allied Gate.',tags:['gate-keeper']},
 kruger:{name:'Kruger Merc',type:'rider',asset:'kruger.png',attack:1,defense:2,bounty:true,bountyValue:1,ability:'Quip: Gee-Check!',tags:[]},
 punchy:{name:'Punchy Boxx',type:'rider',asset:'punchy.png',attack:1,defense:1,bounty:true,bountyValue:1,ability:'Mascot: +1 Defense for each allied Mascot in play.',tags:['mascot']},
 porko:{name:'Lord Porko',type:'rider',asset:'porko.png',attack:1,defense:3,bounty:true,bountyValue:1,ability:'Quip: FEED ME!',tags:[]},
 heap:{name:'Heap Geek',type:'rider',asset:'heap.png',attack:1,defense:2,bounty:true,bountyValue:2,ability:'RCee Hacker: Enables RCee Controller for allied Devices while on field or in Backlot.',tags:['rcee-source']},
 troll:{name:'Heap Troll',type:'rider',asset:'troll.png',attack:1,defense:2,bounty:true,bountyValue:1,ability:'Gate Keeper: Free Movement when played on an allied Gate.',tags:['gate-free-move']},
 chirp:{name:'Lucky Chirp',type:'item',asset:'chirp.png',attack:0,defense:0,bounty:true,bountyValue:1,ability:'When in your Backlot, allied units on Gate tiles gain +1 Defense.',tags:['gate-chirp']},
 yeti:{name:'Steel Yeti',type:'rider',asset:'yeti.png',attack:1,defense:3,bounty:true,bountyValue:2,ability:'Heavy Cover: Swap with an adjacent allied unit under attack.',tags:['heavy-cover']},
 twins:{name:'Twin Mechanics',type:'rider',asset:'twins.png',attack:1,defense:2,bounty:true,bountyValue:1,ability:'Precious Idols: +1 Defense per allied Victory Stance in play. Gains Repair Relay beside Greynor’s Keep.',tags:['twins']},
 controller:{name:'RCee Controller',type:'item',asset:'controller.png',attack:0,defense:0,bounty:true,bountyValue:1,ability:'Item: Enables control of allied RCee Devices while active in your Backlot. Activate for 1 action.',tags:['rcee-source']},
 death:{name:'Death Cap',type:'rider',asset:'death.png',attack:1,defense:2,bounty:true,bountyValue:1,ability:'Gate Keeper: Free Movement when played on an allied Gate.',tags:['gate-free-move']},
 warden:{name:'Field Warden',type:'rider',asset:'warden.png',attack:0,defense:2,bounty:true,bountyValue:2,ability:'Bounty Plow: With RCee Controller, send enemy bounty crossed in movement to your Backlot.',tags:['rcee-device','bounty-plow']},
 zap:{name:'Zap Factory',type:'perk',asset:'zap.png',attack:0,defense:0,bounty:true,bountyValue:1,ability:'Resource Perk: At the end of each of your turns, move one active allied unit one legal position for free. Activate in Backlot or deploy on an allied Gate.',tags:['resource-perk','zap-factory']},
 calldown:{name:'D.B. Calldown',type:'ultimate',asset:'calldown.png',attack:3,defense:0,bounty:false,ability:'Ultimate: +3 Attack when committed during a Duel for Position. Consumed to Scrap Pit.',tags:['ultimate']},
 ammo:{name:'Ammo +1',type:'ammo',asset:'ammo.png',attack:1,defense:0,bounty:false,ability:'Action-free +1 Attack during a duel.'},
 stance:{name:'Victory Stance',type:'stance',asset:'stance.png',move:0,attack:0,defense:2,bounty:true,bountyValue:1,ability:'Play directly into your Backlot action-free, or use as +2 Defense during a duel; score after use.'},
 fix:{name:'Quick Fix +1',type:'fix',asset:'fix.png',attack:0,defense:1,bounty:false,ability:'Action-free +1 Defense during a duel.'}
};
// Higher per-card weight = more likely to draw; composition and weights both matter.
// Mascots are rare/super rare. G.E.N.T. Tech is uncommon; Bullet Badger is common.
export const DRAW_WEIGHTS=Object.freeze({joe:1,splice:1,punchy:1,gent:6,badger:10,kruger:8,porko:5,guard:4,reff:3,greynor:2,ammo:4,fix:4,stance:1,heap:2,troll:5,chirp:2,yeti:2,twins:3,controller:3,death:5,warden:2,zap:2,calldown:2});
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
export function makeDeck(owner){const counts={joe:4,splice:4,punchy:4,gent:6,badger:5,kruger:6,porko:4,guard:4,reff:2,greynor:2,ammo:3,fix:3,stance:2,heap:2,troll:2,chirp:1,yeti:1,twins:2,controller:2,death:2,warden:1,zap:1,calldown:1};return Object.entries(counts).flatMap(([kind,n])=>Array.from({length:n},()=>makeCard(kind,owner)))}
export function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr}
