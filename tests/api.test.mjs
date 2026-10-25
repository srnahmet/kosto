import {test} from 'node:test';
import assert from 'node:assert/strict';
const base=process.env.TEST_BASE_URL;
async function api(action,payload={},token=''){
  const response=await fetch(base+'/api/room',{method:'POST',headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},body:JSON.stringify({action,...payload})});
  const data=await response.json();return {status:response.status,...data};
}
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
test('HTTP: independent clients complete real three-player game', {skip:!base,timeout:90000},async()=>{
  const created=await api('create',{name:'Ada',settings:{}});assert.equal(created.status,200);const code=created.room.code;
  const [b,c]=await Promise.all(['Bora','Cem'].map(name=>api('join',{code,name})));assert.equal(b.status,200);assert.equal(c.status,200);
  const clients=[created,b,c],tokens=clients.map(c=>c.token);
  const forbidden=await api('get',{code},'fake');assert.equal(forbidden.status,403);
  const nonhost=await api('start',{code},b.token);assert.equal(nonhost.status,400);
  await Promise.all(tokens.map(token=>api('ready',{code},token)));
  let state=await api('start',{code},created.token);assert.equal(state.room.phase,'reveal');
  const views=await Promise.all(tokens.map(token=>api('get',{code},token)));
  assert.equal(new Set(views.map(v=>v.room.me.word)).size,2);
  for(const v of views){assert.equal(v.room.me.role,null);assert.equal(v.room.pair,null);assert.ok(v.room.members.every(p=>!('word'in p)&&!('role'in p)&&!('auth'in p)));}
  let turnCount=0;
  while(!['voting','ended'].includes(state.room.phase)){
    if(state.room.phase==='speaking'){
      const i=clients.findIndex(c=>c.room.selfId===state.room.speaker.id);
      const other=await api('finishSpeech',{code,epoch:state.room.epoch},tokens[(i+1)%3]);assert.equal(other.status,400);
      const beforeEpoch=state.room.epoch;
      state=await api('finishSpeech',{code,epoch:beforeEpoch},tokens[i]);assert.equal(state.status,200);turnCount++;
      const stale=await api('finishSpeech',{code,epoch:beforeEpoch},tokens[i]);assert.equal(stale.status,400);
    }else {await sleep(Math.max(100,Math.min(1500,state.room.deadline-state.room.serverNow+50)));const snapshots=await Promise.all(tokens.map(t=>api('get',{code},t)));state=snapshots[0];}
  }
  assert.equal(turnCount,6);assert.equal(state.room.phase,'voting');
  const epoch=state.room.epoch,ids=clients.map(c=>c.room.selfId);
  const self=await api('vote',{code,epoch,target:ids[0]},tokens[0]);assert.equal(self.status,400);
  const votes=await Promise.all(tokens.map((t,i)=>api('vote',{code,epoch,target:i===1?ids[0]:ids[1]},t)));assert.ok(votes.every(v=>v.status===200));
  await sleep(3200);state=await api('get',{code},tokens[0]);assert.equal(state.room.phase,'ended');assert.ok(['kosto','bahcivan'].includes(state.room.winner));assert.ok(state.room.pair);assert.ok(state.room.members.every(p=>p.role&&p.word));
  const denied=await api('rematch',{code},tokens[1]);assert.equal(denied.status,400);
  state=await api('rematch',{code},tokens[0]);assert.equal(state.room.phase,'lobby');assert.equal(state.room.pair,null);assert.ok(state.room.members.every(p=>!p.ready&&!('role'in p)));
});
test('HTTP: spectator host, simultaneous joins, two moles and private signaling', {skip:!base,timeout:15000},async()=>{
  const host=await api('create',{settings:{hostPlays:false,moles:2,revealRole:true,knowMoles:true,voice:true}});assert.equal(host.status,200);assert.equal(host.room.me,null);const code=host.room.code;
  const ps=await Promise.all(Array.from({length:6},(_,i)=>api('join',{code,name:'Testçi '+i})));assert.ok(ps.every(p=>p.status===200));
  const duplicate=await api('join',{code,name:'Testçi 0'});assert.equal(duplicate.status,400);
  await Promise.all(ps.map(p=>api('ready',{code},p.token)));
  const started=await api('start',{code},host.token);assert.equal(started.status,200);assert.equal(started.room.members.filter(p=>p.playing).length,6);assert.equal(started.room.me,null);
  const views=await Promise.all(ps.map(p=>api('get',{code},p.token))),ms=views.filter(v=>v.room.me.role==='kosto');assert.equal(ms.length,2);assert.ok(ms.every(v=>v.room.me.teammates.length===1));assert.equal(ms[0].room.me.word,ms[1].room.me.word);
  await Promise.all(ps.slice(0,2).map(p=>api('voice',{code,enabled:true},p.token)));
  const signal=await api('signal',{code,to:ps[1].room.selfId,data:{type:'offer',sdp:'test-sdp'}},ps[0].token);assert.equal(signal.status,200);
  const receiver=await api('get',{code},ps[1].token);assert.equal(receiver.room.voice.signals.length,1);
  const outsider=await api('get',{code},ps[2].token);assert.equal(outsider.room.voice.signals.length,0);
  const kick=await api('kick',{code,target:ps[5].room.selfId},host.token);assert.equal(kick.status,200);
  const blocked=await api('get',{code},ps[5].token);assert.equal(blocked.status,403);
});
