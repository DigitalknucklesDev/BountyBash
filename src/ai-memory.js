// Public-observation memory only. Never records an opponent's hidden hand.
export class OpponentMemory {
 constructor(){this.reset()}
 reset(){this.seen=new Set();this.turns=0;this.aggressive=0;this.scores=0}
 observe(g,actor){
  for(const u of g.units)if(u.owner!==actor)this.seen.add(u.id);
  for(const c of g.players[3-actor].vault)this.seen.add(c.id);
  for(const c of g.players[3-actor].discard)this.seen.add(c.id);
  this.turns=g.turn;
  return {knownCards:this.seen.size,observedTurn:this.turns};
 }
}
