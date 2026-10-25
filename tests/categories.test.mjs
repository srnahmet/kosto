import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {CATEGORY_GROUPS,groupFor,matchesWord,selectedCategories,toggleCategory,categoryLabel} from '../lib/categories.mjs';
import {DEFAULTS,settings,member,createRoom,start,command,view,players} from '../lib/game.mjs';
const words=JSON.parse(readFileSync(new URL('../data/words.json',import.meta.url))),now=1000000;
function room(n=6,opts={}){const r=createRoom('ABC234',member('a','auth','Ada',opts.hostPlays!==false,now),opts,now);for(let i=1;i<n;i++)r.members.push(member('p'+i,'auth'+i,'Kişi '+i,true,now));return r;}
function act(r,action,next,actor=r.members[0],epoch=r.epoch){command(r,actor,action,{settings:next,epoch},now,words,()=>.3);}
test('all 1238 pairs belong to exactly one of six groups with the agreed totals',()=>{
  assert.equal(CATEGORY_GROUPS.length,6);assert.equal(words.length,1238);
  const counts=CATEGORY_GROUPS.map(g=>words.filter(p=>g.categories.includes(p.category)).length);
  assert.deepEqual(counts,[200,239,240,200,200,159]);
  for(const p of words){assert.equal(CATEGORY_GROUPS.filter(g=>g.categories.includes(p.category)).length,1);assert.ok(groupFor(p.category));}
});
test('mixed is the default; category selections are allowlisted, canonical and deduplicated',()=>{
  assert.deepEqual(DEFAULTS.categories,[]);assert.deepEqual(settings().categories,[]);
  assert.deepEqual(settings({categories:['travel','food','food']}).categories,['food','travel']);
  assert.deepEqual(settings({categories:CATEGORY_GROUPS.map(g=>g.id)}).categories,[]);
  for(const categories of ['food',null,{},['unknown'],['food',3],Array(7).fill('food')])assert.throws(()=>settings({categories}));
});
test('single and multiple group filters include exactly their own words and honor difficulty',()=>{
  for(const groups of [['food'],['nature','travel']]){
    const s=settings({categories:groups,difficulty:'orta'}),filtered=words.filter(p=>matchesWord(p,s));
    assert.ok(filtered.length>0);assert.ok(filtered.every(p=>groups.includes(groupFor(p.category))&&p.difficulty==='orta'));
    assert.equal(filtered.length,words.filter(p=>groups.includes(groupFor(p.category))&&p.difficulty==='orta').length);
  }
});
test('legacy narrow filters retain their exact behavior; group labels are backward compatible',()=>{
  const narrow={category:'Meyveler',difficulty:'Hepsi'};assert.equal(words.filter(p=>matchesWord(p,narrow)).length,40);
  assert.equal(words.filter(p=>matchesWord(p,{category:'Yeme İçme',difficulty:'Hepsi'})).length,200);
  assert.deepEqual(selectedCategories(narrow),['food']);assert.equal(categoryLabel(narrow),'Yeme İçme');
});
test('picker supports several categories and returns to mixed when all or none are selected',()=>{
  assert.deepEqual(toggleCategory([],'food'),['food']);assert.deepEqual(toggleCategory(['food'],'nature'),['food','nature']);assert.deepEqual(toggleCategory(['food'],'food'),[]);
  assert.deepEqual(toggleCategory(CATEGORY_GROUPS.slice(0,5).map(g=>g.id),'travel'),[]);
  assert.equal(categoryLabel({categories:['food','travel']}),'Yeme İçme + Gezi ve Ulaşım');
});
test('only the host may edit settings and no active game can be changed',()=>{
  const r=room();assert.throws(()=>act(r,'settings',{categories:['food']},r.members[1]));
  r.members.forEach(p=>p.ready=true);start(r,now,words,()=>.3);const before=structuredClone(r);
  assert.throws(()=>act(r,'settings',{categories:['food']}));assert.deepEqual(r,before);
});
test('changing rules resets readiness and voice, preserves table membership and increments the epoch',()=>{
  const r=room();r.members.forEach(p=>{p.ready=true;p.voice=true;});const ids=r.members.map(p=>p.id),epoch=r.epoch;
  act(r,'settings',{...r.settings,categories:['work','travel'],circuits:3,secondsPerPlayer:90,moles:2,voice:true});
  assert.equal(r.epoch,epoch+1);assert.equal(r.phase,'lobby');assert.equal(r.code,'ABC234');assert.equal(r.gameNo,0);assert.deepEqual(r.members.map(p=>p.id),ids);assert.ok(r.members.every(p=>!p.ready&&!p.voice));assert.deepEqual(r.settings.categories,['work','travel']);
  assert.throws(()=>act(r,'ready',undefined,r.members[1],epoch));assert.throws(()=>act(r,'settings',{},r.members[0],epoch));
  assert.deepEqual(view(r,r.members[1],now).settings.categories,['work','travel']);assert.throws(()=>start(r,now,words));
});
test('saving unchanged rules preserves readiness and epoch',()=>{
  const r=room();r.members[1].ready=true;const before=structuredClone(r);act(r,'settings',{...r.settings});assert.deepEqual(r,before);
});
test('invalid or empty category combinations fail before any state is changed',()=>{
  const r=room(),before=structuredClone(r);assert.throws(()=>act(r,'settings',{category:'Yok'}));assert.deepEqual(r,before);
  assert.throws(()=>act(r,'settings',{circuits:5,secondsPerPlayer:30}));assert.deepEqual(r,before);
});
test('host may switch between spectator and player, respecting the 16-player capacity',()=>{
  const r=room();act(r,'settings',{hostPlays:false});assert.equal(r.members[0].playing,false);assert.equal(players(r).length,5);assert.equal(view(r,r.members[0],now).me,null);
  act(r,'settings',{hostPlays:true});assert.equal(players(r).length,6);assert.equal(r.members[0].alive,true);
  const full=room(17,{hostPlays:false}),before=structuredClone(full);assert.throws(()=>act(full,'settings',{hostPlays:true}));assert.deepEqual(full,before);
});
test('rematch accepts new settings and deals only from the newly selected group',()=>{
  const r=room(6,{categories:['food']});r.members.forEach(p=>p.ready=true);start(r,now,words,()=>.2);assert.equal(groupFor(r.pair.category),'food');
  r.phase='ended';act(r,'rematch');const gameNo=r.gameNo;
  act(r,'settings',{...r.settings,categories:['travel'],circuits:2,secondsPerPlayer:120,revealRole:true});
  r.members.forEach(p=>p.ready=true);start(r,now,words,()=>.7);
  assert.equal(r.gameNo,gameNo+1);assert.equal(groupFor(r.pair.category),'travel');assert.equal(r.settings.circuits,2);assert.equal(r.settings.secondsPerPlayer,120);assert.ok(view(r,r.members[0],now).me.role);
});
