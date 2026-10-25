import { env } from 'cloudflare:workers';
import pairs from '../data/words.json';
import { GameError, createRoom, member, settings, tick, command, view, players } from './game.mjs';
const random = () => crypto.getRandomValues(new Uint32Array(1))[0] / 4294967296;
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const code = () => Array.from(crypto.getRandomValues(new Uint8Array(6)), v => alphabet[v % alphabet.length]).join('');
const hash = async (token: string) => Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token))),b=>b.toString(16).padStart(2,'0')).join('');
export const wordStats = { count:pairs.length, categories:[...new Set(pairs.map(p=>p.category))].sort((a,b)=>a.localeCompare(b,'tr')) };
export async function operate(body: Record<string, any>, token: string) {
  if(!env.DB) throw new GameError('Masa servisi şu anda kullanılamıyor.',503);
  const db=env.DB.withSession('first-primary');
  if(body.action==='create') {
    const s=settings(body.settings), now=Date.now(), secret=crypto.randomUUID()+crypto.randomUUID();
    const host=member(crypto.randomUUID(),await hash(secret),s.hostPlays?body.name:'Masa sahibi',s.hostPlays,now,body.avatar);
    for(let i=0;i<5;i++) {
      const c=code(), r=createRoom(c,host,s,now);
      const insert=await db.prepare('INSERT OR IGNORE INTO kosto_rooms(code,state,version,expires_at) VALUES(?,?,0,?)').bind(c,JSON.stringify(r),r.expiresAt).run();
      if(insert.meta.changes) {
        await db.prepare('DELETE FROM kosto_rooms WHERE expires_at < ?').bind(now).run();
        return {room:view(r,host,now),token:secret};
      }
    }
    throw new GameError('Masa açılamadı. Yeniden dene.',503);
  }
  const c=String(body.code||'').toUpperCase();
  if(!/^[A-Z2-9]{6}$/.test(c)) throw new GameError('6 karakterlik masa kodunu kontrol et.');
  const digest=token?await hash(token):'';
  for(let attempt=0;attempt<12;attempt++) {
    const row=await db.prepare('SELECT state,version,expires_at FROM kosto_rooms WHERE code=?').bind(c).first<{state:string,version:number,expires_at:number}>();
    if(!row||row.expires_at<Date.now()) throw new GameError('Masa bulunamadı veya süresi doldu.',404);
    const r=JSON.parse(row.state), now=Date.now();
    let actor=r.members.find((p:any)=>p.auth===digest), secret:string|undefined;
    tick(r,now,random);
    if(body.action==='join') {
      if(actor?.kicked) throw new GameError('Bu masadan çıkarıldın.',403);
      if(!actor) {
        if(r.phase!=='lobby') throw new GameError('Bu masada oyun başladı. Sonraki oyun için bekle.');
        if(players(r).length>=16) throw new GameError('Masa dolu. En fazla 16 oyuncu katılabilir.');
        if(r.members.length>=40) throw new GameError('Bu masa katılım sınırına ulaştı.');
        if(r.members.some((p:any)=>p.playing&&!p.kicked&&p.name.toLocaleLowerCase('tr')===String(body.name).trim().toLocaleLowerCase('tr'))) throw new GameError('Bu isim masada kullanılıyor. Başka bir isim seç.');
        secret=crypto.randomUUID()+crypto.randomUUID();actor=member(crypto.randomUUID(),await hash(secret),body.name,true,now,body.avatar);r.members.push(actor);
      } else if(r.phase==='lobby'&&!actor.playing&&actor.id!==r.hostId) { if(players(r).length>=16) throw new GameError('Masa dolu.');actor.playing=true;actor.alive=true; }
    }
    if(!actor||actor.kicked) throw new GameError('Bu masaya yeniden katılmalısın.',403);
    if(now-actor.lastSeen>10000 || body.action!=='get') actor.lastSeen=now;
    if(!['get','join'].includes(body.action)) command(r,actor,body.action,body,now,pairs,random);
    const state=JSON.stringify(r);
    if(state!==row.state) {
      const update=await db.prepare('UPDATE kosto_rooms SET state=?,version=version+1 WHERE code=? AND version=?').bind(state,c,row.version).run();
      if(!update.meta.changes) continue;
    }
    return {room:view(r,actor,now),...(secret?{token:secret}:{})};
  }
  throw new GameError('Masa çok hareketli. Hamleni yeniden dene.',409);
}
