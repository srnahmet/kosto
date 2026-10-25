'use client';
import { FlaskConical, Pause, Play, SkipForward, RotateCcw } from 'lucide-react';
import { DEMO_SCENARIOS } from '@/lib/demo.mjs';
import type { Room } from '@/lib/types';

export default function DemoControls({room,busy,onCall,onStart}:{room:Room,busy:boolean,onCall:(action:string,payload?:Record<string,any>)=>unknown,onStart:(scenario:string,options:{players:number,circuits:number})=>void}) {
  const d=room.demo;if(!d)return null;
  const restart=(scenario=d.scenario,players=d.players,circuits=d.circuits)=>onStart(scenario,{players,circuits});
  const scenario=DEMO_SCENARIOS.find(s=>s.id===d.scenario);
  return <section className="demo-controls" aria-label="Demo masası kontrolleri">
    <div className="demo-heading"><span className="pill"><FlaskConical size={14}/> DEMO MASASI</span><strong>{d.name}</strong><small>{d.running?'Akış açık':'Duraklatıldı'} · {d.speed}× hız</small></div>
    <p className="demo-description">{scenario?.description}</p>
    <div className="demo-settings">
      <label className="field">Senaryo<select value={d.scenario} onChange={e=>restart(e.target.value)}>{DEMO_SCENARIOS.map(s=><option key={s.id} value={s.id}>{s.name}</option>)}</select></label>
      <label className="field">Oyuncu<select value={d.players} onChange={e=>restart(d.scenario,Number(e.target.value))}>{[3,6,8,12,16].map(n=><option value={n} key={n} disabled={d.scenario==='two-moles'&&n<6}>{n} kişi</option>)}</select></label>
      <label className="field">Konuşma turu<select value={d.circuits} onChange={e=>restart(d.scenario,d.players,Number(e.target.value))}>{[1,2,3,4,5].map(n=><option value={n} key={n}>{n} tur</option>)}</select></label>
      <label className="field">Akış hızı<select value={d.speed} onChange={e=>onCall('demoSpeed',{speed:Number(e.target.value)})}>{[1,2,4,8].map(n=><option value={n} key={n}>{n}×</option>)}</select></label>
    </div>
    <div className="demo-actions"><button className="button secondary" disabled={busy||room.phase==='ended'} onClick={()=>onCall('demoPause')}>{d.running?<Pause size={15}/>:<Play size={15}/>} {d.running?'Duraklat':'Devam et'}</button><button className="button secondary" disabled={busy||room.phase==='ended'} onClick={()=>onCall('demoStep')}><SkipForward size={15}/> Bir aşama ilerle</button><button className="text-button" disabled={busy} onClick={()=>restart()}><RotateCcw size={14}/> Yeniden başlat</button>
      <label className="demo-autoplay"><input type="checkbox" checked={d.autoplay} onChange={e=>onCall('demoAutoplay',{enabled:e.target.checked})}/> Benim hamlelerim de otomatik</label>
    </div>
    {!d.autoplay&&d.suggestedVote&&['voting','tieVoting'].includes(room.phase)&&<p className="demo-hint">Senaryoyu izlemek için önerilen oyun: <strong>{room.members.find(p=>p.id===d.suggestedVote)?.name}</strong>. İstersen başka bir seçim de yapabilirsin.</p>}
    <div className="demo-details"><details><summary>Botların son hamleleri</summary><ol className="demo-log">{d.log.map((line,i)=><li key={`${i}-${line}`}>{line}</li>)}</ol></details><details><summary>Bu demonun rollerini incele</summary><div className="demo-roles">{d.roles.map(p=><div key={p.id}><strong>{p.name}</strong><span>{p.role==='kosto'?'Kösto':'Bahçıvan'} · {p.word}{!p.alive?' · Elendi':''}</span></div>)}</div></details></div>
    <p className="demo-footnote">Bu örnek masa yalnızca bu cihazda çalışır. Botlarla oyun akışını denersin; telefon, internet ve mikrofon bağlantılarını test etmez. Senaryo, oyuncu veya tur seçimini değiştirmek yeni bir demo başlatır.</p>
  </section>;
}
