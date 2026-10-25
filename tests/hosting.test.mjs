import {test} from 'node:test';
import assert from 'node:assert/strict';
import {roomHeaders,PAGES_ORIGIN} from '../lib/room-http.mjs';
import {invitationUrl,invitationEntry} from '../lib/client-addresses.mjs';
const endpoint='https://kosto-bahce.srnahmet.chatgpt.site/api/room';
test('Pages and same-origin callers may use the API; other origins are rejected',()=>{
  for(const origin of [PAGES_ORIGIN,new URL(endpoint).origin]){
    const h=roomHeaders(new Request(endpoint,{headers:{Origin:origin}}));
    assert.equal(h['Access-Control-Allow-Origin'],origin);
    assert.equal(h.Vary,'Origin');
    assert.match(h['Access-Control-Allow-Headers'],/Authorization/);
    assert.equal(h['Access-Control-Allow-Credentials'],undefined);
  }
  for(const origin of ['https://other.github.io','https://srnahmet.github.io.attacker.test','null'])assert.equal(roomHeaders(new Request(endpoint,{headers:{Origin:origin}})),null);
  assert.ok(roomHeaders(new Request(endpoint)));
});
test('invitations preserve the GitHub project path and the original hosted path',()=>{
  assert.equal(invitationUrl('https://srnahmet.github.io','/kosto/','ABC234'),'https://srnahmet.github.io/kosto/?masa=ABC234');
  assert.equal(invitationUrl('https://kosto-bahce.srnahmet.chatgpt.site','/','ABC234'),'https://kosto-bahce.srnahmet.chatgpt.site/?masa=ABC234');
});
test('new invitees only need a name; an existing room session resumes directly',()=>{
  assert.deepEqual(invitationEntry('?masa=ABC234'),{kind:'name',code:'ABC234'});
  assert.deepEqual(invitationEntry('?masa=ABC234',{ABC234:'existing-session'}),{kind:'resume',code:'ABC234'});
  assert.deepEqual(invitationEntry('?masa=ABC234',{XYZ789:'unrelated-session'}),{kind:'name',code:'ABC234'});
  assert.deepEqual(invitationEntry('?masa=ABC234',{ABC234:''}),{kind:'name',code:'ABC234'});
});
test('invitation entry normalizes valid codes and rejects incomplete or malformed links',()=>{
  assert.deepEqual(invitationEntry('?masa=%20abc234%20'),{kind:'name',code:'ABC234'});
  for(const search of ['?masa=ABC','?masa=','?masa=ABC2345','?masa=%3Cscript%3E','?masa=ABC101'])assert.equal(invitationEntry(search).kind,'invalid');
  assert.deepEqual(invitationEntry(''),{kind:'none',code:''});
  assert.deepEqual(invitationEntry('?demo=random&masa=ABC234'),{kind:'none',code:''});
});
