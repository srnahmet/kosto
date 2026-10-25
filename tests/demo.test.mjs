import {test} from 'node:test';
import assert from 'node:assert/strict';
import {DemoController,DEMO_SCENARIOS,votePlan,seededRandom} from '../lib/demo.mjs';

function run(scenario,{players=6,seed=42,circuits=1}={}){
  const d=new DemoController({scenario,players,seed,circuits,now:1000000}),phases=new Set(),kinds=new Set();let real=1000000;
  for(let i=0;i<5000;i++){
    const v=d.advance(real+=250);phases.add(v.phase);for(const h of v.history)kinds.add(h.kind);
    if(v.phase==='ended')return {d,v,phases,kinds};
  }
  assert.fail(`Scenario ${scenario} did not finish`);
}
test('demo starts immediately with owner and ready bots, without a login or server',()=>{
  const d=new DemoController({seed:12,now:1000000}),v=d.snapshot();
  assert.equal(v.phase,'reveal');assert.equal(v.members.length,6);assert.equal(v.selfId,'demo-owner');
  assert.ok(v.members.slice(1).every(p=>p.name.startsWith('Bot ')));assert.equal(v.settings.voice,false);
  assert.equal(v.demo.autoplay,true);assert.equal(v.demo.scenario,'random');assert.equal(v.me.role,null);
  assert.equal(v.pair,null);assert.ok(v.members.every(p=>!('role'in p)&&!('word'in p)));
});
test('garden victory scenario finds every mole using the actual game rules',()=>{
  for(const players of [3,6,8,16]){const {v}=run('garden-win',{players});assert.equal(v.winner,'bahcivan');assert.ok(v.pair);}
});
test('mole victory scenarios reach 1:1 and 2:2 thresholds',()=>{
  const single=run('mole-win').v,two=run('two-moles').v;
  assert.equal(single.winner,'kosto');assert.equal(single.members.filter(p=>p.alive).length,2);
  assert.equal(two.winner,'kosto');assert.equal(two.settings.moles,2);assert.equal(two.members.filter(p=>p.alive).length,4);
  assert.equal(two.members.filter(p=>p.alive&&p.role==='kosto').length,2);
});
test('ties create one special speaking circuit and a single revote',()=>{
  for(const players of [3,5,6,8]){const r=run('tie-resolve',{players});assert.ok(r.phases.has('tieVoting'));assert.equal(r.v.winner,'bahcivan');}
});
test('double tie advances to a new main round without eliminating a candidate',()=>{
  for(const players of [3,5,6,8]){const r=run('double-tie',{players});assert.ok(r.kinds.has('tie'));assert.ok(r.v.round>=2);assert.equal(r.v.winner,'bahcivan');}
});
test('scenario votes never target the voter and revotes stay within tied candidates',()=>{
  for(let n=3;n<=16;n++){
    const d=new DemoController({players:n,seed:n,now:1000000}),r=d.room;r.phase='voting';r.round=1;
    for(const scenario of DEMO_SCENARIOS){const plan=votePlan(r,scenario.id,seededRandom(8));for(const [from,to] of Object.entries(plan)){assert.notEqual(from,to);assert.ok(r.members.some(p=>p.id===to));}}
    r.phase='tieVoting';r.tieCandidates=r.members.slice(0,2).map(p=>p.id);
    for(const scenario of DEMO_SCENARIOS){const plan=votePlan(r,scenario.id,seededRandom(8));for(const [from,to] of Object.entries(plan)){assert.notEqual(from,to);assert.ok(r.tieCandidates.includes(to));}}
  }
});
test('pause freezes the game clock; stepping advances exactly one phase',()=>{
  const d=new DemoController({now:1000000,seed:1});d.dispatch('demoPause',{},1000000);
  const before=d.snapshot();d.advance(1010000);assert.equal(d.snapshot().serverNow,before.serverNow);assert.equal(d.snapshot().epoch,before.epoch);
  let v=d.dispatch('demoStep',{},1010000);assert.equal(v.phase,'transition');assert.equal(v.demo.running,false);
  v=d.dispatch('demoStep',{},1010000);assert.equal(v.phase,'speaking');
  v=d.dispatch('demoStep',{},1010000);assert.equal(v.phase,'transition');
});
test('owner may play manually while bots continue taking their own turns',()=>{
  const d=new DemoController({now:1000000,seed:2,autoplay:false});let real=1000000,v;
  for(let i=0;i<300;i++){v=d.advance(real+=250);if(v.phase==='speaking'&&v.speaker.id===v.selfId)break;}
  assert.equal(v.speaker.id,v.selfId);const epoch=v.epoch;d.advance(real+=500);assert.equal(d.snapshot().epoch,epoch);
  v=d.dispatch('finishSpeech',{epoch},real);assert.equal(v.phase,'transition');
});
test('disconnect scenario applies the real timeout elimination and skips the player',()=>{
  const {v,kinds}=run('disconnect');assert.ok(kinds.has('disconnected'));assert.equal(v.winner,'bahcivan');
  assert.ok(v.members.some(p=>!p.connected&&!p.alive));
});
test('restarts create fresh words and game state; controllers remain isolated',()=>{
  const a=new DemoController({seed:123,now:1000000}),b=new DemoController({seed:123,now:1000000});
  const untouched=JSON.stringify(b.snapshot());a.dispatch('demoStep',{},1000000);assert.equal(JSON.stringify(b.snapshot()),untouched);
  const game=a.snapshot().gameNo;a.dispatch('rematch',{},1000000);assert.equal(a.snapshot().phase,'reveal');assert.equal(a.snapshot().gameNo,game+1);assert.equal(a.snapshot().castVotes,0);
});
test('random scenario is repeatable for regression testing and respects two speaking laps',()=>{
  const a=run('random',{seed:9,circuits:2}),b=run('random',{seed:9,circuits:2});assert.equal(a.v.winner,b.v.winner);assert.equal(a.v.round,b.v.round);assert.equal(a.v.settings.circuits,2);assert.deepEqual(a.v.history,b.v.history);
});
