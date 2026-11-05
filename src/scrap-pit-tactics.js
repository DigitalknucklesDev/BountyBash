// Scrap-Pit field-combat tactics. Pure decision planner; the game engine remains authoritative.
import {PIT_TILES} from './scrap-pit.js';
const dist=(a,b)=>Math.abs(a.c-b.c)+Math.abs(a.r-b.r);
const rand=(n)=>Math.random()*n;
const best=(options,noise=0)=>options.sort((a,b)=>(b.score+rand(noise))-(a.score+rand(noise)))[0];
export function choosePitAction(g,difficulty='normal',blocked=new Set()){
 const me=g.active, enemy=3-me,hand=g.players[me].hand;
 const friends=g.units.filter(u=>u.owner===me&&!u.ko&&g.canOperate(u));
 const foes=g.units.filter(u=>u.owner===enemy&&!u.ko);
 const ko=g.units.filter(u=>u.ko);
 const riders=hand.filter(c=>c.type==='rider');
 const options=[];
 const noisy=difficulty==='easy'?12:difficulty==='normal'?3:0.7;
 const maxBuff=hand.filter(c=>c.type==='ammo'||c.type==='ultimate').reduce((n,c)=>n+Math.max(0,c.attack||0),0);
 const defBuff=g.players[enemy].hand.filter(c=>c.type==='fix').reduce((n,c)=>n+Math.max(0,c.defense||0),0);
 const offense=(a,d)=>Math.max(0,(a.attack||0)+1-(d.defense||0));
 const damageValue=(a,d)=>{
   const margin=offense(a,d);
   const winChance=margin>=0 ? 1 : (maxBuff>=-margin ? .58 : .16);
   const crit=Math.max(0,margin);
   return winChance*(Math.max(1,d.defense||0)*1.8+Math.max(0,crit-defBuff*.3)*1.3) - (1-winChance)*(a.defense||0)*.85;
 };
 for(const u of friends){
   for(const v of foes){
     if(dist(u.pos,v.pos)===1){
       const value=damageValue(u,v);
       if(!((v.tags||[]).includes('battle-reff') && g.attackAttempts?.has(v.id))) options.push({type:'attack',unit:u,target:v.pos,score:19+value});
       // Duel for Position can immediately discard the target, but risks the attacker.
       options.push({type:'position',unit:u,target:v.pos,score:12+value+(v.defense||0)*.35});
     }
   }
   for(const t of PIT_TILES){
     if(dist(u.pos,t)!==1)continue;
     const occupant=g.unitAt(t.c,t.r);
     if(occupant){
       if(occupant.ko){options.push({type:'move',unit:u,target:t,score:occupant.owner!==me?35+(occupant.defense||0)*2:11});}
       continue;
     }
     const before=foes.length?Math.min(...foes.map(e=>dist(u.pos,e.pos))):4;
     const after=foes.length?Math.min(...foes.map(e=>dist(t,e.pos))):4;
     // Strongly prefer closing distance; avoid aimless back-and-forth.
     const adjacentEnemy=foes.filter(e=>dist(t,e.pos)===1);
     const threat=adjacentEnemy.reduce((n,e)=>n+Math.max(0,(e.attack||0)-(u.defense||0)),0);
     const friendlySupport=friends.filter(f=>f.id!==u.id&&dist(t,f.pos)===1).length;
     let score=3+(before-after)*12+Math.min(5,friendlySupport*2)-threat*(difficulty==='hard'?.9:.3);
     if(after>=before&&foes.length)score-=14;
     if(!foes.length)score-=20;
     options.push({type:'move',unit:u,target:t,score});
   }
 }
 for(const r of riders){
   for(const t of PIT_TILES){
     const occupant=g.unitAt(t.c,t.r);
     if(occupant?.owner===me||occupant?.ko)continue;
     if(occupant){
       const value=damageValue(r,occupant);
       options.push({type:'deploy',card:r,target:t,score:8+value+(difficulty==='hard'&&r.attack+1<occupant.defense&&maxBuff<occupant.defense-r.attack-1?-15:0)});
     }else{
       const adjacentEnemy=foes.filter(e=>dist(t,e.pos)===1);
       const distance=foes.length?Math.min(...foes.map(e=>dist(t,e.pos))):2;
       const pressure=adjacentEnemy.length?Math.max(...adjacentEnemy.map(e=>damageValue(r,e))):0;
       options.push({type:'deploy',card:r,target:t,score:foes.length?10+pressure*.3+(distance===1?7:0):13});
     }
   }
 }
 // Draw only when the hand needs resources or no worthwhile field action exists.
 if(g.me.deck.length){
   const resourceCount=hand.filter(c=>['ammo','ultimate','fix'].includes(c.type)).length;
   options.push({type:'draw',score:hand.length<3?23:hand.length<5?13:resourceCount===0?8:0});
 }
 const eligible=options.filter(a=>!blocked.has([a.type,a.unit?.id||a.card?.id||'',a.target?.c??'',a.target?.r??''].join(':')));
 const selected=best(eligible,noisy);
 if(!selected||selected.score<1)return {type:'end'};
 return selected;
}
