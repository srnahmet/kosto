// Shared clock-injected rules: live rooms run on the server; local demos use isolated example data.
export const DEFAULTS = Object.freeze({ moles: 1, revealRole: false, knowMoles: false, circuits: 1, secondsPerPlayer: 60, transitionSeconds: 5, voteSeconds: 30, tieSeconds: 15, voice: false, hostPlays: true, category: 'Hepsi', difficulty: 'Hepsi' });
export class GameError extends Error { constructor(message, status = 400) { super(message); this.status = status; } }
const must = (ok, message) => { if (!ok) throw new GameError(message); };
export const active = r => r.members.filter(p => p.playing && p.alive && !p.kicked);
export const players = r => r.members.filter(p => p.playing && !p.kicked);
export function settings(raw = {}) {
  const s = { ...DEFAULTS, ...raw };
  for (const [k, lo, hi] of [['moles',1,2], ['circuits',1,5], ['secondsPerPlayer',30,600], ['transitionSeconds',5,5], ['voteSeconds',15,90], ['tieSeconds',10,30]]) must(Number.isInteger(s[k]) && s[k]>=lo && s[k]<=hi, 'Geçersiz süre veya oyuncu ayarı.');
  must(s.secondsPerPlayer >= s.circuits * 15, 'Her konuşma için en az 15 saniye ayırmalısın.');
  for(const k of ['revealRole','knowMoles','voice','hostPlays']) must(typeof s[k] === 'boolean', 'Geçersiz masa ayarı.');
  must(typeof s.category === 'string' && s.category.length<=50 && ['Hepsi','kolay','orta','zor'].includes(s.difficulty), 'Geçersiz kelime filtresi.');
  return s;
}
export function shuffled(list, random = Math.random) {
  const a = [...list]; for(let i=a.length-1;i>0;i--) { const j = Math.floor(random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a;
}
export function member(id, auth, name, playing, now) {
  must(typeof name==='string' && name.trim().length>=2 && name.trim().length<=20,'İsim 2–20 karakter olmalı.');
  return { id, auth, name:name.trim(), playing, alive:playing, ready:false, lastSeen:now, kicked:false, role:null, word:null, voice:false };
}
export function createRoom(code, host, raw, now) {
  return { code, hostId:host.id, settings:settings(raw), members:[host], phase:'lobby', epoch:0, gameNo:0, round:0, deadline:null, phaseStarted:now, createdAt:now, expiresAt:now+86400000, winner:null, pair:null, usedPairs:[], order:[], cursor:0, speechKind:'main', tieCandidates:[], votes:{}, history:[], announcement:null, signals:[] };
}
function phase(r, next, now, seconds) { r.phase=next; r.phaseStarted=now; r.deadline=seconds == null ? null : now+seconds*1000; r.epoch++; }
function win(r,now) {
  const alive=active(r), m=alive.filter(p=>p.role==='kosto').length, b=alive.length-m;
  if(!m || m>=b) { r.winner=m ? 'kosto':'bahcivan'; r.announcement=null; r.members.forEach(p=>p.voice=false); r.signals=[]; phase(r,'ended',now,null); return true; } return false;
}
function beginRound(r, now, random) {
  if(win(r,now)) return;
  r.round++; r.speechKind='main'; r.tieCandidates=[]; r.votes={};
  const order=shuffled(active(r).map(p=>p.id),random); r.order=[];
  for(let i=0;i<r.settings.circuits;i++) for(const id of order) r.order.push({id,lap:i+1});
  r.cursor=0; r.speechSeconds=Math.floor(r.settings.secondsPerPlayer/r.settings.circuits);
  phase(r,'transition',now,r.settings.transitionSeconds);
}
function nextSpeaker(r,now) {
  r.cursor++; while(r.cursor<r.order.length && !active(r).some(p=>p.id===r.order[r.cursor].id)) r.cursor++;
  if(r.cursor>=r.order.length) { r.votes={}; phase(r,r.speechKind==='tie'?'tieVoting':'voting',now,r.settings.voteSeconds); }
  else phase(r,'transition',now,r.settings.transitionSeconds);
}
function result(r,now,kind,id=null) {
  r.announcement={kind,id}; r.history.push({round:r.round,kind,id,at:now});
  if(id) { const p=r.members.find(p=>p.id===id); if(p) {p.alive=false;p.voice=false;} }
  if(!win(r,now)) phase(r,'result',now,7);
}
function tally(r,now) {
  const counts={}; for(const id of Object.values(r.votes)) if(active(r).some(p=>p.id===id)) counts[id]=(counts[id]||0)+1;
  const max=Math.max(0,...Object.values(counts)), tied=Object.keys(counts).filter(id=>counts[id]===max);
  r.lastTally=counts;
  if(!max) return result(r,now,'noVotes');
  if(tied.length===1) return result(r,now,'eliminated',tied[0]);
  if(r.phase==='tieVoting') return result(r,now,'tie');
  r.tieCandidates=tied; r.order=tied.map(id=>({id,lap:1})); r.cursor=0; r.speechKind='tie'; r.votes={};
  phase(r,'transition',now,r.settings.transitionSeconds);
}
export function start(r,now,pairs,random=Math.random) {
  must(r.phase==='lobby','Oyun zaten başladı.'); const ps=players(r);
  must(ps.length >= (r.settings.moles===2 ? 6:3),'Bir kösto için en az 3, iki kösto için en az 6 oyuncu gerekir.');
  must(ps.every(p=>p.ready && now-p.lastSeen<25000),'Herkes hazır ve bağlı olmalı.');
  const pool=pairs.filter(p=>(r.settings.category==='Hepsi'||p.category===r.settings.category)&&(r.settings.difficulty==='Hepsi'||p.difficulty===r.settings.difficulty));
  must(pool.length>0,'Bu filtrede kelime çifti bulunamadı.');
  const fresh=pool.filter(p=>!r.usedPairs.includes(p.id)); const source=fresh.length?fresh:pool;
  const pair=source[Math.floor(random()*source.length)], flip=random()<.5;
  r.pair={id:pair.id,category:pair.category,normal:flip?pair.a:pair.b,mole:flip?pair.b:pair.a};
  r.usedPairs=[...r.usedPairs,pair.id].slice(-500); const moles=new Set(shuffled(ps.map(p=>p.id),random).slice(0,r.settings.moles));
  for(const p of ps) { p.alive=true;p.role=moles.has(p.id)?'kosto':'bahcivan';p.word=p.role==='kosto'?r.pair.mole:r.pair.normal; }
  r.gameNo++;r.round=0;r.winner=null;r.history=[];r.lastTally={};r.signals=[];r.announcement=null;
  phase(r,'reveal',now,8);
}
export function tick(r,now,random=Math.random) {
  if(r.phase!=='ended') {
    const expired=players(r).filter(p=>now-p.lastSeen>120000 && (r.phase==='lobby'||p.alive));
    for(const p of expired) { p.alive=false;p.voice=false;p.ready=false; if(r.phase==='lobby')p.playing=false; else r.history.push({round:r.round,kind:'disconnected',id:p.id,at:now}); }
    if(expired.length && r.phase!=='lobby' && r.phase!=='reveal' && win(r,now)) return;
    if(expired.length && r.phase==='reveal' && win(r,now)) return;
    if(['speaking','transition'].includes(r.phase) && !active(r).some(p=>p.id===r.order[r.cursor]?.id)) nextSpeaker(r,now);
    for(const id of Object.keys(r.votes)) if(!active(r).some(p=>p.id===id))delete r.votes[id];
    for(const id of Object.keys(r.votes)) if(!active(r).some(p=>p.id===r.votes[id]))delete r.votes[id];
  }
  // Absolute deadlines avoid restarting clocks when clients refresh or return.
  for(let i=0;i<256 && r.deadline!==null && now>=r.deadline && r.phase!=='ended';i++) {
    const at=r.deadline;
    if(r.phase==='reveal'||r.phase==='result') beginRound(r,at,random);
    else if(r.phase==='transition') phase(r,'speaking',at,r.speechKind==='tie'?r.settings.tieSeconds:r.speechSeconds);
    else if(r.phase==='speaking') nextSpeaker(r,at);
    else if(r.phase==='voting'||r.phase==='tieVoting') tally(r,at);
    else break;
  }
  r.signals=r.signals.filter(s=>s.at>now-30000);
  if(['voting','tieVoting'].includes(r.phase) && Object.keys(r.votes).length===active(r).length && now-r.phaseStarted>=3000) tally(r,now);
}
export function command(r,actor,action,payload,now,pairs,random=Math.random) {
  must(actor && !actor.kicked,'Bu masaya erişimin yok.');
  if(!['ready','start','rematch','kick','leave','voice','signal'].includes(action)) must(payload.epoch===r.epoch,'Aşama değişti. Ekranını güncelledik; yeniden dene.');
  if(action==='ready') { must(r.phase==='lobby'&&actor.playing,'Şu anda hazır olamazsın.');actor.ready=!actor.ready; }
  else if(action==='start') { must(actor.id===r.hostId,'Oyunu masa sahibi başlatır.');start(r,now,pairs,random); }
  else if(action==='finishSpeech') { must(r.phase==='speaking'&&r.order[r.cursor]?.id===actor.id&&actor.alive,'Şu anda söz sende değil.');actor.voice=false;nextSpeaker(r,now); }
  else if(action==='vote') {
    must(['voting','tieVoting'].includes(r.phase)&&actor.playing&&actor.alive,'Şu anda oy kullanamazsın.');
    must(!r.votes[actor.id],'Oyun zaten kaydedildi.');
    must(payload.target!==actor.id && active(r).some(p=>p.id===payload.target),'Geçerli başka bir oyuncu seç.');
    must(r.phase!=='tieVoting'||r.tieCandidates.includes(payload.target),'Yalnızca eşitlikteki oyunculara oy verilebilir.');
    r.votes[actor.id]=payload.target;
    // Allow the last vote to settle, but never advance on a partial tally.
    if(Object.keys(r.votes).length===active(r).length && now-r.phaseStarted>=3000) tally(r,now);
  }
  else if(action==='rematch') {
    must(actor.id===r.hostId&&r.phase==='ended','Rövanşı oyun sonunda masa sahibi açar.');
    for(const p of players(r)) {p.alive=true;p.ready=false;p.role=null;p.word=null;p.voice=false;}
    r.pair=null;r.winner=null;r.round=0;r.order=[];r.votes={};r.history=[];r.signals=[];r.announcement=null;r.lastTally={};phase(r,'lobby',now,null);
  }
  else if(action==='kick'||action==='leave') {
    must(action==='leave'||actor.id===r.hostId,'Oyuncuyu yalnızca masa sahibi çıkarabilir.');
    const target=action==='leave'?actor:r.members.find(p=>p.id===payload.target);
    must(target && (action==='leave'||target.id!==actor.id),'Oyuncu bulunamadı.');
    target.alive=false;target.playing=false;target.voice=false;target.ready=false;
    if(action==='kick')target.kicked=true;
    delete r.votes[target.id];for(const id of Object.keys(r.votes))if(r.votes[id]===target.id)delete r.votes[id];
    if(action==='leave'&&actor.id===r.hostId)r.hostId=r.members.find(p=>p.id!==actor.id&&p.playing&&!p.kicked)?.id||r.hostId;
    if(r.phase!=='lobby'&&r.phase!=='ended') { r.history.push({round:r.round,kind:action==='kick'?'removed':'left',id:target.id,at:now}); if(!win(r,now)&&r.order[r.cursor]?.id===target.id)nextSpeaker(r,now); }
  }
  else if(action==='voice') { must(r.settings.voice,'Sesli sohbet bu masada kapalı.');actor.voice=payload.enabled===true; }
  else if(action==='signal') {
    must(r.settings.voice&&actor.voice,'Önce sesli sohbete katıl.');
    must(r.members.some(p=>p.id===payload.to&&p.voice&&!p.kicked),'Ses alıcısı bulunamadı.');
    must(payload.to!==actor.id&&payload.data&&['offer','answer','ice'].includes(payload.data.type)&&JSON.stringify(payload.data).length<16000,'Geçersiz ses mesajı.');
    must(r.signals.filter(s=>s.from===actor.id).length<100,'Çok fazla bağlantı isteği.');
    r.signals.push({id:crypto.randomUUID(),from:actor.id,to:payload.to,data:payload.data,at:now});
  } else throw new GameError('Bilinmeyen işlem.');
}
export function view(r,actor,now) {
  const ended=r.phase==='ended', speaker=['speaking','transition'].includes(r.phase)?r.order[r.cursor]:null;
  const me=actor.playing?{id:actor.id,alive:actor.alive,ready:actor.ready,word:actor.word,role:(r.settings.revealRole||ended)?actor.role:null,vote:r.votes[actor.id]||null,teammates:r.settings.knowMoles&&actor.role==='kosto'?active(r).filter(p=>p.role==='kosto'&&p.id!==actor.id).map(p=>p.id):[]}:null;
  return {code:r.code,phase:r.phase,epoch:r.epoch,gameNo:r.gameNo,round:r.round,deadline:r.deadline,serverNow:now,settings:r.settings,hostId:r.hostId,selfId:actor.id,me,winner:r.winner,announcement:r.announcement,history:r.history.slice(-12),speaker,turnOrder:[...new Set(r.order.map(p=>p.id))].filter(id=>active(r).some(p=>p.id===id)),speechKind:r.speechKind,speechSeconds:r.speechSeconds,tieCandidates:r.tieCandidates,castVotes:Object.keys(r.votes).length,eligibleVotes:active(r).length,
    members:r.members.filter(p=>!p.kicked).map(p=>({id:p.id,name:p.name,playing:p.playing,alive:p.alive,ready:p.ready,connected:now-p.lastSeen<25000,voice:p.voice&&now-p.lastSeen<25000,...(ended?{role:p.role,word:p.word}:{})})),
    pair:ended?r.pair:null,lastTally:['result','ended'].includes(r.phase)?r.lastTally:null,
    voice:r.settings.voice?{joined:actor.voice,peers:r.members.filter(p=>p.voice&&!p.kicked&&now-p.lastSeen<25000).map(p=>({id:p.id,name:p.name})),signals:actor.voice?r.signals.filter(s=>s.to===actor.id):[]}:null};
}
