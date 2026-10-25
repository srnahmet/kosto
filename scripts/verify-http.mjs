// Start a built Worker with an isolated disposable D1, then test real clients.
import {spawn} from 'node:child_process';
import {mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
const root=process.cwd(),state=resolve(root,'work','http-'+Date.now());
await mkdir(state,{recursive:true});
const runner=['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js'];
function run(args,env={}){return new Promise((ok,fail)=>{const child=spawn(process.execPath,args,{cwd:root,env:{...process.env,...env},stdio:'inherit',windowsHide:true});child.on('error',fail);child.on('exit',code=>code===0?ok():fail(new Error('Command failed: '+code)));});}
await run([...runner,'d1','execute','DB','--local','--config','dist/server/wrangler.json','--persist-to',state,'--file','drizzle/0000_sturdy_wendell_vaughn.sql']);
const port=process.env.TEST_PORT||'5175',base='http://127.0.0.1:'+port;
const server=spawn(process.execPath,[...runner,'dev','--config','dist/server/wrangler.json','--local','--persist-to',state,'--ip','127.0.0.1','--port',port,'--inspector-port','0'],{cwd:root,env:process.env,stdio:['ignore','pipe','pipe'],windowsHide:true});
let logs='';for(const pipe of [server.stdout,server.stderr])pipe.on('data',chunk=>{logs=(logs+chunk.toString()).slice(-8000);});
try{
  let ready=false;for(let i=0;i<80;i++){try{if((await fetch(base,{signal:AbortSignal.timeout(1000)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,500));}
  if(!ready)throw new Error('Built Worker did not start:\n'+logs);
  console.log('Built Worker ready. Running isolated multiplayer tests.');
  await run(['--test','tests/api.test.mjs'],{TEST_BASE_URL:base});
}finally{server.kill();}
