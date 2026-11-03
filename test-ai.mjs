import {Game} from './src/engine.js';
import {aiStep} from './src/ai.js';
for(const mode of ['easy','normal','hard']){
 const g=new Game();let steps=0;
 while(!g.winner&&steps++<300){aiStep(g,mode);if(g.pendingDefense||g.pendingAttack||g.pendingGateClaim||g.pendingPerk)continue;if(g.me.actions<0)throw Error('negative actions')}
 if(steps<20)throw Error('premature stop');
 console.log(mode,steps,'turn',g.turn,'winner',g.winner||'none');
}
