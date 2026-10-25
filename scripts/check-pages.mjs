import {readFile,readdir,stat} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import assert from 'node:assert/strict';
const root=resolve('dist-pages'),html=await readFile(join(root,'index.html'),'utf8');
assert.match(html,/<html lang="tr">/);
assert.match(html,/\/kosto\/assets\//);
for(const match of html.matchAll(/(?:src|href)="(\/kosto\/[^"?]+)"/g))await stat(join(root,match[1].slice('/kosto/'.length)));
let scripts='';
for(const name of await readdir(join(root,'assets'))){
  const text=await readFile(join(root,'assets',name),'utf8');
  if(name.endsWith('.js'))scripts+=text;
  if(name.endsWith('.css'))for(const match of text.matchAll(/url\(["']?(\/kosto\/[^)"']+)["']?\)/g))await stat(join(root,match[1].slice('/kosto/'.length)));
}
assert.ok(scripts.includes('https://kosto-bahce.srnahmet.chatgpt.site/api/room'));
assert.ok(!scripts.includes('kosto-0001'),'Word corpus must stay on the server.');
assert.ok(!scripts.includes('INSERT OR IGNORE INTO kosto_rooms'),'Database code must stay on the server.');
assert.equal((await readdir(root)).includes('data'),false);
console.log('Pages artifact verified: project paths, fonts, API endpoint and server-only data.');
