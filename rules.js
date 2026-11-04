export const COLS='ABCDEFGH';
export const coord=(c,r)=>`${COLS[c]}${r}`;
export function tileType(c,r){
 if((r===1||r===6)&&c>=2&&c<=5)return 'gate';
 if((r===1||r===2||r===5||r===6)&&(c<=1||c>=6))return 'vault';
 if((r===3||r===4)&&(c===0||c===7))return 'utility';
 return 'field';
}
export const gateOwner=r=>r===1?1:r===6?2:null;
export const vaultOwner=r=>r<=2?1:r>=5?2:null;
export function utility(c,r){return c===0&&r===4?'P2 DISCARD':c===0&&r===3?'P2 DECK':c===7&&r===4?'P1 DECK':c===7&&r===3?'P1 DISCARD':''}
export function neighbors(pos,diagonal=false){const result=[];for(let dx=-1;dx<=1;dx++)for(let dy=-1;dy<=1;dy++){if(!dx&&!dy)continue;if(!diagonal&&Math.abs(dx)+Math.abs(dy)!==1)continue;const c=pos.c+dx,r=pos.r+dy;if(c>=0&&c<8&&r>=1&&r<=6&&['gate','field'].includes(tileType(c,r)))result.push({c,r});}return result}
export const same=(a,b)=>a&&b&&a.c===b.c&&a.r===b.r;
export const distance=(a,b)=>Math.abs(a.c-b.c)+Math.abs(a.r-b.r);

// Map each player's eight physical Backlot spaces to eight unique Vault slots.
// Outer home row: A/B/G/H -> 0/1/2/3; inner row: A/B/G/H -> 4/5/6/7.
export function vaultSlotIndex(c,r){
 if(tileType(c,r)!=='vault')return null;
 const outer=r===1||r===6;
 const columnIndex=c<=1?c:c-4;
 return (outer?0:4)+columnIndex;
}
