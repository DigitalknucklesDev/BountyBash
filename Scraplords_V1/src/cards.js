export const catalog={
 joe:{name:'Binge-er Joe',type:'rider',asset:'joe.png',attack:1,defense:1,bounty:true,bountyValue:1,ability:'Mascot: +1 Defense for each allied Mascot in play.'},
 splice:{name:"Splice’n Dice",type:'rider',asset:'splice.png',attack:1,defense:1,bounty:true,bountyValue:1,ability:'Mascot: +1 Defense for each allied Mascot in play.'},
 ammo:{name:'Ammo +1',type:'ammo',asset:'ammo.png',attack:1,defense:0,bounty:false,ability:'Action-free +1 Attack during a duel.'},
 fix:{name:'Quick Fix +1',type:'fix',asset:'fix.png',attack:0,defense:1,bounty:false,ability:'Action-free +1 Defense during a duel.'}
};
let id=0;
export function makeCard(kind,owner){return {...catalog[kind],kind,owner,id:`card-${++id}`,ko:false,hp:1,maxHp:1};}
export function makeDeck(owner){const kinds=[...Array.from({length:24},(_,i)=>i%2?'splice':'joe'),...Array(8).fill('ammo'),...Array(8).fill('fix'),...Array.from({length:24},(_,i)=>i%2?'joe':'splice')];return kinds.map(k=>makeCard(k,owner))}
export function shuffle(arr){for(let i=arr.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arr[i],arr[j]]=[arr[j],arr[i]];}return arr}
