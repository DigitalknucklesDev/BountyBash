export function abilityPriority(g,option){
 const c=option.card||option.unit;
 if(!c)return 0;
 const tags=c.tags||[];
 let n=0;
 if(tags.includes('rcee-source'))n+=g.controllerActive(g.active)?1:12;
 if(tags.includes('rcee-device'))n+=g.controllerActive(g.active)?9:-12;
 if(tags.includes('bounty-plow')&&option.kind==='move')n+=4;
 if(tags.includes('zap-factory')&&option.kind==='item')n+=7;
 if(tags.includes('gunrat-draw')&&option.kind==='gunrat')n+=g.me.hand.length<3?7:1;
 if(tags.includes('mascot'))n+=g.units.filter(u=>u.owner===g.active&&(u.tags||[]).includes('mascot')).length*2;
 if(option.kind==='attack')n+=(c.attack||0)*.3;
 return n;
}
