'use client';
import {useEffect,useRef,useState} from 'react';
import {Check,ChevronDown,Settings2,Shuffle,Timer,X} from 'lucide-react';
import {CATEGORY_GROUPS,selectedCategories,toggleCategory} from '@/lib/categories.mjs';
import type {Options,Room} from '@/lib/types';
import './settings.css';

function Toggle({checked,onChange,label,detail}:{checked:boolean,onChange:(v:boolean)=>void,label:string,detail?:string}) {
  return <label className="toggle-row"><span><strong>{label}</strong>{detail&&<small>{detail}</small>}</span><input type="checkbox" checked={checked} onChange={e=>onChange(e.target.checked)}/><span className="switch" aria-hidden="true"/></label>;
}
export function CategoryPicker({value,onChange}:{value:Options,onChange:(o:Options)=>void}){
  const selected=selectedCategories(value);
  const update=(categories:string[])=>onChange({...value,category:'Hepsi',categories});
  return <fieldset className="category-picker"><legend>Kelime kategorileri</legend><p>Birini seç veya birkaçını birlikte karıştır.</p>
    <button type="button" className="category-mixed" aria-pressed={!selected.length} onClick={()=>update([])}><Shuffle size={18}/><span><strong>Karışık</strong><small>Altı kategorinin tamamından</small></span>{!selected.length&&<Check size={18}/>}</button>
    <div className="category-grid">{CATEGORY_GROUPS.map(g=><label key={g.id} className={`category-choice ${selected.includes(g.id)?'selected':''}`}><input type="checkbox" checked={selected.includes(g.id)} onChange={()=>update(toggleCategory(selected,g.id))}/><span className="category-emoji" aria-hidden="true">{g.icon}</span><span><strong>{g.name}</strong><small>{g.description}</small></span><span className="category-tick" aria-hidden="true">{selected.includes(g.id)&&<Check size={13}/>}</span></label>)}</div>
    <small className="category-help">{selected.length?`${selected.length} kategori seçili. Kelimeler yalnızca bu kategorilerden gelir.`:'Varsayılan: Karışık. Her oyunda farklı bir dünyadan kelimeler.'}</small>
  </fieldset>;
}
export function GameSettings({value,onChange,quick=false}:{value:Options,onChange:(o:Options)=>void,quick?:boolean}){
  const set=<K extends keyof Options>(key:K,next:Options[K])=>onChange({...value,[key]:next});
  return <div className="game-settings-fields">
    {quick&&<div className="quick-options"><div><label>Kösto sayısı</label><div className="segmented">{[1,2].map(n=><button type="button" key={n} aria-pressed={value.moles===n} className={value.moles===n?'selected':''} onClick={()=>set('moles',n)}>{n} Kösto</button>)}</div><small>{value.moles===2?'Başlamak için en az 6 oyuncu.':'Başlamak için en az 3 oyuncu.'}</small></div><div><label>Konuşma turu</label><div className="segmented" role="group" aria-label="Konuşma turu sayısı">{[1,2,3,4,5].map(n=><button type="button" key={n} aria-pressed={value.circuits===n} className={value.circuits===n?'selected':''} onClick={()=>onChange({...value,circuits:n,secondsPerPlayer:Math.max(value.secondsPerPlayer,30,n*15)})}>{n}</button>)}</div><small>Her oylamadan önce.</small></div></div>}
    <CategoryPicker value={value} onChange={onChange}/>
    <details className="settings-extra" open={!quick}><summary><Settings2 size={16}/> Diğer oyun ayarları <ChevronDown size={15}/></summary><div>
      <Toggle checked={value.hostPlays} onChange={v=>set('hostPlays',v)} label="Ben de oynayacağım" detail="Kapatırsan sadece masayı yönetirsin."/>
      <Toggle checked={value.revealRole} onChange={v=>set('revealRole',v)} label="Herkes kendi rolünü bilsin" detail="Kapalıyken Kösto bile Kösto olduğunu bilmez."/>
      <Toggle checked={value.knowMoles} onChange={v=>set('knowMoles',v)} label="İki Kösto birbirini tanısın" detail="Açıksa Köstolar kendi rollerini de dolaylı olarak öğrenir."/>
      <Toggle checked={value.voice} onChange={v=>set('voice',v)} label="Masada mikrofon kullanılsın" detail="Mikrofon yalnızca söz sırası gelenin isteğiyle açılır."/>
      <div className="settings-fields"><label className="field">Kişi başı toplam konuşma (sn)<input type="number" min={Math.max(30,value.circuits*15)} max="600" step="1" value={value.secondsPerPlayer} onChange={e=>set('secondsPerPlayer',Number(e.target.value))}/></label><label className="field">Oylama süresi (sn)<input type="number" min="15" max="90" value={value.voteSeconds} onChange={e=>set('voteSeconds',Number(e.target.value))}/></label><label className="field">Eşitlikte kısa konuşma (sn)<input type="number" min="10" max="30" value={value.tieSeconds} onChange={e=>set('tieSeconds',Number(e.target.value))}/></label><label className="field">Yakınlık seviyesi<select value={value.difficulty} onChange={e=>set('difficulty',e.target.value)}><option value="Hepsi">Karışık</option><option value="kolay">Kolay</option><option value="orta">Orta</option><option value="zor">Zor</option></select></label></div>
    </div></details>
    <div className="timing-note"><Timer size={17}/><span>Her söz <strong>{Math.floor(value.secondsPerPlayer/value.circuits)} sn</strong>; her söz öncesi 5 sn geçiş. Oylama ve eşitlik süreleri ayrıca eklenir.</span></div>
  </div>;
}
export default function RoomSettingsEditor({room,busy,warningOpen,onSave,onClose}:{room:Room,busy:boolean,warningOpen:boolean,onSave:(next:Options,epoch:number)=>void,onClose:()=>void}){
  const [draft,setDraft]=useState<Options>(()=>({...room.settings,category:'Hepsi',categories:selectedCategories(room.settings)})),epoch=useRef(room.epoch),panel=useRef<HTMLElement>(null),button=useRef<HTMLButtonElement>(null),close=useRef(onClose),pending=useRef(busy);close.current=onClose;pending.current=busy;
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;document.body.style.overflow='hidden';button.current?.focus();
    const key=(e:KeyboardEvent)=>{
      if(!panel.current?.contains(document.activeElement))return;
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(!pending.current)close.current();}
      if(e.key==='Tab'){const nodes=panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled]),select:not([disabled]),summary');const visible=Array.from(nodes||[]).filter(n=>n.getClientRects().length);if(!visible.length)return;const first=visible[0],last=visible[visible.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}
    };
    document.addEventListener('keydown',key,true);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key,true);if(previous?.isConnected)previous.focus();};
  },[]);
  useEffect(()=>{if(!busy&&!warningOpen)button.current?.focus();},[busy,warningOpen]);
  return <div className="settings-backdrop" onClick={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}><section ref={panel} className="room-settings-editor" role="dialog" aria-modal="true" aria-labelledby="room-settings-title">
    <button ref={button} className="icon-button settings-close" disabled={busy} onClick={onClose} aria-label="Masa ayarlarını kapat"><X size={20}/></button>
    <div className="eyebrow"><Settings2 size={13}/> AYNI MASA, YENİ BİR OYUN</div><h2 id="room-settings-title">Bahçenin ayarları.</h2><p className="settings-intro">Kategorileri ve kuralları birlikte tazeleyelim.</p>
    <form noValidate onSubmit={e=>{e.preventDefault();if(!busy)onSave(draft,epoch.current);}}><fieldset className="settings-form-body" disabled={busy}><GameSettings value={draft} onChange={setDraft} quick/></fieldset><div className="settings-modal-footer"><p>Ayarlar değiştiğinde herkes yeniden hazır olmalı.</p><div><button type="button" className="button secondary" disabled={busy} onClick={onClose}>Vazgeç</button><button className="button primary" disabled={busy}>Ayarları kaydet <Check size={17}/></button></div></div></form>
  </section></div>;
}
