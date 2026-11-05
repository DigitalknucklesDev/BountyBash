// Scraplords Mascot Director — V2.8.7
// Add assets/mascots/mascot4.png, etc. and increase mascotCount.
export class MascotDirector {
 constructor({mascotCount=3,cooldown=12000,duration=3300}={}) {
  this.mascotCount=mascotCount; this.cooldown=cooldown; this.duration=duration;
  this.assignments={}; this.lastLog=null; this.lastWinner=null; this.lastShown=0;
  this.lastLine={}; this.timer=null; this.root=null; this.session=null;
 }
 begin(sessionId,{resume=false}={}) {
  if(resume&&this.session===sessionId)return;
  this.session=sessionId;
  const key='scraplords-mascots-'+sessionId;
  let stored=null;
  if(resume)try{stored=JSON.parse(sessionStorage.getItem(key)||'null')}catch{}
  if(stored&&stored[1]&&stored[2])this.assignments=stored;
  else {
   const a=1+Math.floor(Math.random()*this.mascotCount);
   const others=Array.from({length:this.mascotCount},(_,i)=>i+1).filter(n=>n!==a);
   const b=others.length?others[Math.floor(Math.random()*others.length)]:a;
   this.assignments={1:a,2:b};
   try{sessionStorage.setItem(key,JSON.stringify(this.assignments))}catch{}
  }
  this.lastLog=null;this.lastWinner=null;this.lastShown=0;this.hide();
 }
 resetRound(){this.lastLog=null;this.lastWinner=null;this.lastShown=0;this.hide()}
 lines={
  gate_score:['That’s a gate-crasher!','Straight to the vault!','Clean score!'],
  gate_steal:['Bonus scrap!','Double trouble!','That one’s ours!'],
  bounty_capture:['Bagged and tagged!','Another bounty!','That’s payday!'],
  ko:['Down for the count!','Scrap metal!','That hit landed!'],
  attack:['Bring the noise!','Hit ’em hard!','Make it count!'],
  defense:['Still standing!','Not today!','Nice block!'],
  round_win:['Round in the bag!','That’s our round!','Keep the streak!'],
  series_win:['SCRAPYARD CHAMPIONS!','WE OWN THIS YARD!','BOUNTY BASH LEGENDS!']
 };
 category(msg){
  if(/GATE BONUS/i.test(msg))return 'gate_steal';
  if(/GATE SCORE/i.test(msg))return 'gate_score';
  if(/captured|claimed from Player/i.test(msg))return 'bounty_capture';
  if(/KNOCKED OUT/i.test(msg))return 'ko';
  if(/DEFENDED|Defender commits|Defender passes/i.test(msg))return 'defense';
  // Attacks intentionally excluded from default triggers to avoid UI overload.
  return null;
 }
 owner(msg,game,kind){
  const tag=msg.match(/^\[P([12])\]/i);if(tag)return Number(tag[1]);
  const player=msg.match(/Player\s+([12])/i);if(player)return Number(player[1]);
  return game.active;
 }
 observe(game,{seriesFinished=false,disabled=false}={}){
  const messages=game.log||[];
  const index=this.lastLog===null?-1:messages.indexOf(this.lastLog);
  if(!disabled&&this.lastLog!==null){
   const fresh=index>=0?messages.slice(0,index):messages.slice(0,Math.min(5,messages.length));
   // Priority: gate scoring > capture > KO > defense; one reaction per render.
   const priority=['gate_steal','gate_score','bounty_capture','ko','defense'];
   const candidates=fresh.map(msg=>({msg,kind:this.category(msg)})).filter(x=>x.kind);
   candidates.sort((a,b)=>priority.indexOf(a.kind)-priority.indexOf(b.kind));
   if(candidates[0])this.show(this.owner(candidates[0].msg,game,candidates[0].kind),candidates[0].kind);
  }
  if(!disabled&&game.winner&&!this.lastWinner)this.show(game.winner,seriesFinished?'series_win':'round_win',true);
  this.lastLog=messages[0]??null;this.lastWinner=game.winner;
 }
 ensureRoot(){
  if(this.root?.isConnected)return this.root;
  const root=document.createElement('div');root.id='scrap-mascot-stage';root.setAttribute('aria-live','off');
  document.body.append(root);this.root=root;return root;
 }
 show(player,kind,force=false){
  if(![1,2].includes(player)||!this.lines[kind])return;
  if(!force&&Date.now()-this.lastShown<this.cooldown)return;
  this.lastShown=Date.now();
  const lines=this.lines[kind],prev=this.lastLine[kind];
  const options=lines.filter(x=>x!==prev);
  const line=options[Math.floor(Math.random()*options.length)]||lines[0];this.lastLine[kind]=line;
  const root=this.ensureRoot();root.replaceChildren();
  const el=document.createElement('div');el.className=`scrap-mascot scrap-mascot-p${player}`;
  const pic=document.createElement('img');pic.src=`assets/mascots/mascot${this.assignments[player]||1}.png`;pic.alt=`Player ${player} mascot`;
  pic.onerror=()=>{pic.onerror=null;pic.src='assets/mascots/mascot1.png'};
  const speech=document.createElement('div');speech.className='scrap-mascot-quip';speech.textContent=line;
  const name=document.createElement('span');name.className='scrap-mascot-player';name.textContent=`P${player}`;
  el.append(pic,speech,name);root.append(el);
  clearTimeout(this.timer);this.timer=setTimeout(()=>this.hide(),this.duration);
 }
 hide(){clearTimeout(this.timer);if(this.root)this.root.replaceChildren()}
}
export const mascots=new MascotDirector();
