'use client';
import { useEffect, useRef, useState } from 'react';
import { Check, X, Sparkles } from 'lucide-react';
import { AVATAR_COLORS, CHARACTERS, HATS, avatarColor, normalizeAvatar } from '@/lib/avatar.mjs';
import type { Avatar } from '@/lib/types';
import './character.css';

export function Character({avatar,className=''}:{avatar?:Avatar,className?:string}) {
  const a=normalizeAvatar(avatar),fur=avatarColor('fur',a.fur),skin=avatarColor('skin',a.skin),clothes=avatarColor('outfit',a.outfit),hat=avatarColor('hat',a.hatColor);
  return <svg className={`mole character ${className}`} viewBox="0 0 64 64" fill="none" shapeRendering="crispEdges" aria-hidden="true">
    <ellipse cx="32" cy="60" rx="24" ry="2" fill="#254b4c" opacity=".1"/>
    <g transform={a.character==='tiny'?'translate(7 10) scale(.8)':undefined}>
      {a.character==='fluffy'&&<path d="M12 24H8v12H4v12h8v8h40v-8h8V32h-4v-8h-8V12H16v12Z" fill="#31575b"/>}
      <path d="M12 28h4V16h8v-4h20v4h8v12h4v24h-4v4H16v-4h-4Z" fill="#31575b"/>
      <path d="M16 30h4V20h8v-4h12v4h8v10h4v18h-4v4H20v-4h-4Z" fill={fur}/>
      {a.character==='fluffy'&&<path d="M12 32h8v16h-8zm32 0h8v16h-8zM20 16h4v8h-4zm20 0h4v8h-4z" fill={fur}/>}
      <path d="M24 34h16v4h8v8h-4v4H24v-4h-4v-8h4Z" fill={skin}/>
      <path d="M24 27h4v7h-4zm16 0h4v7h-4z" fill="#31575b"/>
      <path d="M28 36h12v4H28z" fill="#aa6977"/><path d="M32 42h4v4h-4z" fill="#67565c"/>
      <path d="M8 44h8v8H8zm44 0h8v8h-8z" fill={fur}/>
      <path d="M16 54h12v6H12v-4h4zm20 0h12v2h4v4H36z" fill="#31575b"/>
      <path d="M20 46h28v8H20zm4-4h4v8h-4zm16 0h4v8h-4z" fill={clothes}/>
      <path d="M30 48h8v4h-8z" fill="#fffef9" opacity=".65"/>
      {a.hat==='straw'&&<><path d="M12 16h44v8H12zm8-8h28v8H20z" fill={hat}/><path d="M20 16h28v4H20z" fill="#31575b" opacity=".35"/></>}
      {a.hat==='beanie'&&<><path d="M20 12h28v12H16v-8h4zm4-4h20v8H24zm4-4h12v4H28z" fill={hat}/><path d="M16 20h36v6H16z" fill={hat}/><path d="M24 12h4v8h-4zm12 0h4v8h-4z" fill="#fffef9" opacity=".35"/></>}
      {a.hat==='sprout'&&<><path d="M30 6h4v14h-4z" fill="#31575b"/><path d="M18 4h10v4h4v6h-8v-4h-6zm16-2h12v6h-4v4h-8z" fill={hat}/></>}
    </g>
  </svg>;
}

export default function CharacterEditor({avatar,onSave,onClose,busy}:{avatar:Avatar,onSave:(a:Avatar)=>void,onClose:()=>void,busy:boolean}) {
  const [draft,setDraft]=useState<Avatar>(()=>normalizeAvatar(avatar) as Avatar),panel=useRef<HTMLElement>(null),first=useRef<HTMLButtonElement>(null),close=useRef(onClose);close.current=onClose;
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';first.current?.focus();
    const key=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close.current();}
      if(e.key==='Tab'){
        const nodes=panel.current?.querySelectorAll<HTMLButtonElement>('button:not([disabled])');if(!nodes?.length)return;
        if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes[nodes.length-1].focus();}
        else if(!e.shiftKey&&document.activeElement===nodes[nodes.length-1]){e.preventDefault();nodes[0].focus();}
      }
    };
    document.addEventListener('keydown',key,true);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key,true);if(previous?.isConnected)previous.focus();};
  },[]);
  const set=(key:keyof Avatar,value:string)=>setDraft(a=>({...a,[key]:value}));
  const palettes=[['skin','Ten rengi',AVATAR_COLORS.skin],['fur','Karakter rengi',AVATAR_COLORS.fur],['outfit','Kıyafet rengi',AVATAR_COLORS.outfit],['hatColor','Şapka rengi',AVATAR_COLORS.hat]] as const;
  return <div className="character-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={panel} className="character-editor" role="dialog" aria-modal="true" aria-labelledby="character-title" aria-describedby="character-description">
    <button ref={first} className="icon-button character-close" onClick={onClose} aria-label="Karakter düzenlemeyi kapat"><X size={20}/></button>
    <div className="character-heading"><span className="eyebrow"><Sparkles size={13}/> BAHÇENİN TARZI SENSİN</span><h2 id="character-title">Küçük karakterin.</h2><p id="character-description">Biraz renk, bir şapka. Tam senlik olsun.</p></div>
    <div className="character-workshop"><div className="character-preview"><div className="character-preview-art"><Character avatar={draft}/><span aria-hidden="true">✦</span></div><strong>İşte sen!</strong><p>Seçimlerin bu cihazda hatırlanır.<br/>Görünümün herkese yansır.</p><small>Tarzın rolünden bağımsız.</small></div>
      <div className="character-options">
        <fieldset><legend>Karakter</legend><div className="character-shapes">{CHARACTERS.map(c=><button key={c.id} aria-pressed={draft.character===c.id} onClick={()=>set('character',c.id)}><Character avatar={{...draft,character:c.id} as Avatar}/><span>{c.name}</span></button>)}</div></fieldset>
        <fieldset><legend>Şapka</legend><div className="character-hats">{HATS.map(h=><button key={h.id} aria-pressed={draft.hat===h.id} onClick={()=>set('hat',h.id)}>{h.name}</button>)}</div></fieldset>
        <div className="character-palettes">{palettes.map(([key,label,colors])=><fieldset key={key} disabled={key==='hatColor'&&draft.hat==='none'}><legend>{label}{key==='hatColor'&&draft.hat==='none'&&<small> · Şapka seç</small>}</legend><div className="character-swatches">{colors.map(c=><button key={c.id} aria-label={`${label}: ${c.name}`} title={c.name} aria-pressed={draft[key]===c.id} onClick={()=>set(key,c.id)} style={{backgroundColor:c.hex}}>{draft[key]===c.id&&<Check size={17} strokeWidth={3}/>}</button>)}</div></fieldset>)}</div>
      </div></div>
    <div className="character-actions"><button className="button secondary" onClick={onClose}>Vazgeç</button><button className="button primary" disabled={busy} onClick={()=>onSave(draft)}>Görünümümü kaydet <Check size={17}/></button></div>
  </section></div>;
}
