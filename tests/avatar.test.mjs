import {test} from 'node:test';
import assert from 'node:assert/strict';
import {AVATAR_KEY,DEFAULT_AVATAR,normalizeAvatar,readAvatar,writeAvatar,sameAvatar} from '../lib/avatar.mjs';
import {member,createRoom,command,view,start} from '../lib/game.mjs';
import {DemoController} from '../lib/demo.mjs';
const custom={character:'fluffy',hat:'beanie',skin:'cocoa',fur:'lavender',outfit:'coral',hatColor:'berry'};
const pair=[{id:'one',a:'Deniz',b:'Havuz',category:'Su',difficulty:'kolay'}],now=1000000;
function room(){const r=createRoom('ABC234',member('a','auth-a','Ada',true,now,custom),{},now);r.members.push(member('b','auth-b','Bora',true,now),member('c','auth-c','Cem',true,now));return r;}
test('avatar values are a fixed allowlist; unknown fields and external colors never survive',()=>{
  assert.deepEqual(normalizeAvatar({...custom,role:'kosto',url:'https://evil.example/track',fur:'#ff00ff',outfit:{id:'mint'}}),{...custom,fur:'hazel',outfit:'mint'});
  for(const value of [null,[],false,'abc',42])assert.deepEqual(normalizeAvatar(value),DEFAULT_AVATAR);
});
test('saved character restores exactly on the same device and remains separate from sessions',()=>{
  const map=new Map([['kosto.sessions','private session']]);const storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v)};
  assert.equal(writeAvatar(storage,custom),true);assert.deepEqual(readAvatar(storage),custom);assert.equal(map.get('kosto.sessions'),'private session');assert.equal(map.size,2);assert.ok(map.has(AVATAR_KEY));
});
test('broken, older or unavailable local storage falls back safely',()=>{
  assert.deepEqual(readAvatar({getItem:()=>'{bad'}),DEFAULT_AVATAR);
  assert.deepEqual(readAvatar({getItem:()=>{throw Error('blocked');}}),DEFAULT_AVATAR);
  assert.equal(writeAvatar({setItem:()=>{throw Error('quota');}},custom),false);
  assert.deepEqual(normalizeAvatar({hat:'none',skin:'caramel'}),{...DEFAULT_AVATAR,hat:'none',skin:'caramel'});
});
test('room views share cosmetic data and normalize legacy members without revealing roles',()=>{
  const r=room();delete r.members[1].avatar;for(const p of r.members)p.ready=true;start(r,now,pair,()=>.4);
  for(const actor of r.members){const v=view(r,actor,now);assert.deepEqual(v.members[0].avatar,custom);assert.deepEqual(v.members[1].avatar,DEFAULT_AVATAR);assert.ok(v.members.every(p=>!('role'in p)&&!('word'in p)&&!('auth'in p)));}
});
test('profile edits affect only the authenticated actor at any phase, never the clock or game state',()=>{
  const r=room();for(const p of r.members)p.ready=true;start(r,now,pair,()=>.4);const before=structuredClone(r),next={...custom,hat:'sprout'};
  command(r,r.members[1],'profile',{avatar:next,target:'a',epoch:-100},now,pair);
  assert.deepEqual(r.members[1].avatar,next);assert.deepEqual(r.members[0],before.members[0]);
  delete r.members[1].avatar;delete before.members[1].avatar;assert.deepEqual(r,before);
});
test('spectators may change their own appearance; kicked members cannot',()=>{
  const r=room(),actor=r.members[0];actor.playing=false;
  command(r,actor,'profile',{avatar:custom},now,pair);assert.deepEqual(view(r,actor,now).members[0].avatar,custom);assert.equal(view(r,actor,now).me,null);
  actor.kicked=true;assert.throws(()=>command(r,actor,'profile',{avatar:{}},now,pair));
});
test('rematches preserve each member appearance while clearing secret game state',()=>{
  const r=room();r.phase='ended';command(r,r.members[0],'rematch',{},now,pair);
  assert.deepEqual(r.members[0].avatar,custom);assert.equal(r.phase,'lobby');assert.equal(r.pair,null);assert.equal(sameAvatar({},DEFAULT_AVATAR),true);
});
test('demo character changes and restarts use the same cosmetic rules',()=>{
  const d=new DemoController({avatar:custom,seed:12,now});assert.deepEqual(d.snapshot().members[0].avatar,custom);
  const changed={...custom,hat:'none'};d.dispatch('profile',{avatar:changed},now);d.dispatch('rematch',{},now);
  assert.deepEqual(d.snapshot().members[0].avatar,changed);assert.ok(d.snapshot().members.slice(1).some(p=>p.avatar.character==='tiny'));
});
