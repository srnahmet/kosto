// An isolated, browser-local demonstration using the same rules as live rooms.
// No live room state, full word corpus, user token or network request is used here.
import { member, createRoom, start, tick, command, view, active } from './game.mjs';

export const DEMO_SCENARIOS = [
  {id:'random',name:'Rastgele oyun',description:'Botlar geçerli hedeflere rastgele oy verir. Sonucu birlikte keşfet.'},
  {id:'garden-win',name:'Bahçıvanlar kazansın',description:'Oylar Köstolarda toplanır; bütün Köstolar bulunduğunda oyun biter.'},
  {id:'mole-win',name:'Kösto kazansın',description:'Bahçıvanlar elenir; Kösto 1’e 1 kaldığında kazanır.'},
  {id:'tie-resolve',name:'Eşitlik çözülsün',description:'İlk oylama eşit biter. Kısa konuşmadan sonra tek bir isimde uzlaşılır.'},
  {id:'double-tie',name:'İki kez eşitlik',description:'Ana oylama ve tekrar oylaması eşit biter; kimse elenmeden yeni ana tur açılır.'},
  {id:'two-moles',name:'İki Kösto kazansın',description:'En az 6 oyuncuyla iki Kösto oynar; 2’ye 2 eşiğinde kazanırlar.'},
  {id:'disconnect',name:'Bağlantısı kopan oyuncu',description:'Bir bot için 120 saniyelik kopma süresi uygulanır. Eleme ve sıra akışını izle.'},
];
const DEMO_PAIRS = [
  {id:'demo-water',a:'Deniz',b:'Havuz',category:'Demo',difficulty:'kolay'},
  {id:'demo-stage',a:'Tiyatro',b:'Sinema',category:'Demo',difficulty:'kolay'},
  {id:'demo-food',a:'Pizza',b:'Pide',category:'Demo',difficulty:'kolay'},
  {id:'demo-travel',a:'Tren',b:'Tramvay',category:'Demo',difficulty:'kolay'},
  {id:'demo-games',a:'Satranç',b:'Dama',category:'Demo',difficulty:'kolay'},
  {id:'demo-drink',a:'Çay',b:'Kahve',category:'Demo',difficulty:'kolay'},
  {id:'demo-light',a:'Mum',b:'Fener',category:'Demo',difficulty:'kolay'},
  {id:'demo-sweet',a:'Dondurma',b:'Sorbe',category:'Demo',difficulty:'kolay'},
];
const NAMES=['Ada','Bora','Cem','Defne','Ece','Fırat','Güneş','İpek','Kaan','Lale','Mert','Nil','Ozan','Pelin','Rüzgâr'];
export function seededRandom(seed) {
  let state=seed>>>0;
  return ()=>{state+=0x6D2B79F5;let t=state;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
}
export function votePlan(r,scenario,random=Math.random) {
  const ps=active(r),candidates=r.phase==='tieVoting'?ps.filter(p=>r.tieCandidates.includes(p.id)):ps;
  const tie=r.round===1 && ((scenario==='double-tie')||(scenario==='tie-resolve'&&r.phase==='voting'));
  const plan={};
  if(tie&&candidates.length>=2) {
    const [a,b]=candidates;plan[a.id]=b.id;plan[b.id]=a.id;
    const others=ps.filter(p=>p!==a&&p!==b);
    // An odd table needs one abstention for an exact tie between two candidates.
    if(ps.length%2)others.pop();
    others.forEach((p,i)=>plan[p.id]=i%2?a.id:b.id);
    return plan;
  }
  let target;
  if(['mole-win','two-moles'].includes(scenario))target=candidates.find(p=>p.role==='bahcivan');
  else if(scenario!=='random')target=candidates.find(p=>p.role==='kosto');
  if(scenario!=='random')target??=candidates[Math.floor(random()*candidates.length)];
  for(const p of ps){const legal=candidates.filter(c=>c.id!==p.id);if(!legal.length)continue;plan[p.id]=(target&&target.id!==p.id?target:legal[Math.floor(random()*legal.length)]).id;}
  return plan;
}

export class DemoController {
  constructor({scenario='random',players=6,circuits=1,speed=4,autoplay=true,seed=crypto.getRandomValues(new Uint32Array(1))[0],now=Date.now(),avatar={}}={}) {
    this.avatar=avatar;
    this.scenario=DEMO_SCENARIOS.some(s=>s.id===scenario)?scenario:'random';
    this.playerCount=Math.min(16,Math.max(this.scenario==='two-moles'?6:3,Math.floor(Number(players)||6)));
    this.circuits=Math.min(5,Math.max(1,Math.floor(Number(circuits)||1)));
    this.speed=[1,2,4,8].includes(speed)?speed:4;this.running=true;this.autoplay=autoplay;
    this.now=now;this.lastReal=now;this.random=seededRandom(seed);this.seed=seed;
    this.code='DM'+(seed>>>0).toString(36).toUpperCase().padStart(4,'A').slice(-4);
    this.log=[];this.disconnected=new Set();this.planEpoch=-1;this.plan={};this._reset();
  }
  _note(text){this.log.push(text);if(this.log.length>24)this.log.shift();}
  _reset(){
    const oldEpoch=this.room?.epoch||0,oldGame=this.room?.gameNo||0;
    const host=member('demo-owner','demo-owner-auth','Sen',true,this.now,this.avatar);
    this.room=createRoom(this.code,host,{circuits:this.circuits,secondsPerPlayer:Math.max(60,this.circuits*15),moles:this.scenario==='two-moles'?2:1,voice:false},this.now);
    this.room.epoch=oldEpoch;this.room.gameNo=oldGame;
    for(let i=0;i<this.playerCount-1;i++)this.room.members.push(member('demo-bot-'+i,'demo-bot-auth-'+i,'Bot '+NAMES[i],true,this.now,{character:['classic','fluffy','tiny'][i%3],hat:['sprout','beanie','none','straw'][i%4],fur:['rose','slate','lavender','hazel'][i%4],outfit:['coral','sky','lilac','mint'][i%4],hatColor:['sage','berry','blue','honey'][i%4]}));
    this.room.members.forEach(p=>p.ready=true);this.log=[];this.disconnected.clear();this.planEpoch=-1;
    start(this.room,this.now,DEMO_PAIRS,this.random);this._note(`${this.playerCount} oyunculuk yerel demo başladı.`);
  }
  _beat(){for(const p of this.room.members)if(!this.disconnected.has(p.id))p.lastSeen=this.now;}
  _phaseNote(before){
    const r=this.room;if(r.epoch===before)return;
    if(r.phase==='speaking')this._note(`${r.members.find(p=>p.id===r.order[r.cursor]?.id)?.name} ipucu veriyor.`);
    else if(r.phase==='voting')this._note(`${r.round}. ana turun oylaması açıldı.`);
    else if(r.phase==='tieVoting')this._note('Eşitlik konuşması bitti; tek tekrar oylaması açıldı.');
    else if(r.phase==='transition'&&r.speechKind==='tie')this._note('Eşitlik: yalnızca berabere kalanlar kısa konuşacak.');
    else if(r.phase==='transition'&&r.cursor===0)this._note(`${r.round}. ana tur başladı.`);
    else if(r.phase==='result')this._note(r.announcement?.kind==='tie'?'Tekrar eşitlik: kimse elenmeden yeni tura geçiliyor.':r.announcement?.id?`${r.members.find(p=>p.id===r.announcement.id)?.name} elendi.`:'Bu tur kimse elenmedi.');
    else if(r.phase==='ended')this._note(r.winner==='kosto'?'Köstolar kazandı.':'Bahçıvanlar kazandı.');
  }
  _votes(includeOwner=false){
    const r=this.room;if(!['voting','tieVoting'].includes(r.phase))return;
    if(this.planEpoch!==r.epoch){this.plan=votePlan(r,this.scenario,this.random);this.planEpoch=r.epoch;}
    const epoch=r.epoch;
    for(const p of active(r)){
      if(r.epoch!==epoch)break;
      if((p.id==='demo-owner'&&!this.autoplay&&!includeOwner)||r.votes[p.id]||!this.plan[p.id])continue;
      const target=this.plan[p.id],name=r.members.find(p=>p.id===target)?.name;
      command(r,p,'vote',{target,epoch},this.now,DEMO_PAIRS,this.random);this._note(`${p.name} → ${name}`);
    }
    this._phaseNote(epoch);
  }
  _settle(){
    const r=this.room;this._beat();let before=r.epoch;tick(r,this.now,this.random);this._phaseNote(before);
    if(this.scenario==='disconnect'&&r.phase==='speaking'&&!this.disconnected.size){
      const p=active(r).find(p=>p.id!=='demo-owner'&&p.role==='bahcivan');
      if(p){this.disconnected.add(p.id);p.lastSeen=this.now-121000;this._note(`${p.name}: 120 saniyelik bağlantı kaybı uygulandı.`);before=r.epoch;tick(r,this.now,this.random);this._phaseNote(before);}
    }
    if(r.phase==='speaking'&&this.now-r.phaseStarted>=3000){
      const p=r.members.find(p=>p.id===r.order[r.cursor]?.id);
      if(p&&(p.id!=='demo-owner'||this.autoplay)){before=r.epoch;command(r,p,'finishSpeech',{epoch:r.epoch},this.now,DEMO_PAIRS,this.random);this._phaseNote(before);}
    }
    if(['voting','tieVoting'].includes(r.phase)&&this.now-r.phaseStarted>=3500)this._votes();
  }
  advance(realNow=Date.now()){
    const elapsed=Math.max(0,Math.min(1000,realNow-this.lastReal));this.lastReal=realNow;
    if(this.running&&this.room.phase!=='ended'){this.now+=elapsed*this.speed;this._settle();}
    return this.snapshot();
  }
  dispatch(action,payload={},realNow=Date.now()){
    this.advance(realNow);const r=this.room,owner=r.members[0];
    if(action==='get'||action==='leave')return this.snapshot();
    if(action==='demoPause')this.running=!this.running;
    else if(action==='demoSpeed'){if(![1,2,4,8].includes(payload.speed))throw new Error('Geçersiz demo hızı.');this.speed=payload.speed;}
    else if(action==='demoAutoplay')this.autoplay=payload.enabled===true;
    else if(action==='demoStep'){
      this.running=false;this._beat();const before=r.epoch;
      if(r.phase==='speaking')command(r,r.members.find(p=>p.id===r.order[r.cursor].id),'finishSpeech',{epoch:r.epoch},this.now,DEMO_PAIRS,this.random);
      else if(['voting','tieVoting'].includes(r.phase)){this.now=Math.max(this.now,r.phaseStarted+3500);this._beat();this._votes(true);if(r.epoch===before&&r.deadline!==null){this.now=r.deadline;this._beat();tick(r,this.now,this.random);}}
      else if(r.deadline!==null){this.now=r.deadline;this._beat();tick(r,this.now,this.random);}
      this._phaseNote(before);
    }
    else if(action==='profile'){command(r,owner,action,payload,this.now,DEMO_PAIRS,this.random);this.avatar=owner.avatar;}
    else if(action==='rematch'){this.running=true;this._reset();}
    else {const before=r.epoch;command(r,owner,action,payload,this.now,DEMO_PAIRS,this.random);this._phaseNote(before);}
    return this.snapshot();
  }
  snapshot(){
    const r=this.room,base=view(r,r.members[0],this.now);
    return {...base,demo:{scenario:this.scenario,name:DEMO_SCENARIOS.find(s=>s.id===this.scenario).name,running:this.running,speed:this.speed,autoplay:this.autoplay,players:this.playerCount,circuits:this.circuits,log:[...this.log].reverse().slice(0,12),suggestedVote:this.planEpoch===r.epoch?this.plan['demo-owner']||null:null,roles:r.members.map(p=>({id:p.id,name:p.name,role:p.role,word:p.word,alive:p.alive}))}};
  }
}
