'use client';
import {useEffect,useRef} from 'react';
import {ArrowRight,LoaderCircle,Sprout,X} from 'lucide-react';
import {Character} from './character';
import type {Avatar} from '@/lib/types';

export default function InviteName({name,code,avatar,busy,warningOpen,onName,onSubmit,onClose}:{name:string,code:string,avatar:Avatar,busy:boolean,warningOpen:boolean,onName:(value:string)=>void,onSubmit:()=>void,onClose:()=>void}) {
  const panel=useRef<HTMLElement>(null),input=useRef<HTMLInputElement>(null),close=useRef(onClose),pending=useRef(busy);close.current=onClose;pending.current=busy;
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';input.current?.focus();input.current?.select();
    const key=(e:KeyboardEvent)=>{
      if(!panel.current?.contains(document.activeElement))return;
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();if(!pending.current)close.current();}
      if(e.key==='Tab'){
        const nodes=panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),input:not([disabled])');if(!nodes?.length)return;
        const first=nodes[0],last=nodes[nodes.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',key,true);return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',key,true);if(previous?.isConnected)previous.focus();};
  },[]);
  useEffect(()=>{if(!busy&&!warningOpen)input.current?.focus();},[busy,warningOpen]);
  return <div className="invite-name-backdrop" onClick={e=>{if(e.target===e.currentTarget&&!busy)onClose();}}><section ref={panel} className="notice-card invite-name-card" role="dialog" aria-modal="true" aria-labelledby="invite-name-title" aria-describedby="invite-name-description">
    <button className="notice-close icon-button" disabled={busy} onClick={onClose} aria-label="Davetten vazgeç"><X size={19}/></button>
    <div className="notice-portrait"><Character avatar={avatar}/></div>
    <div className="eyebrow"><Sprout size={12}/> BAHÇEYE DAVETLİSİN</div>
    <h2 id="invite-name-title">Sana ne diyelim?</h2>
    <p id="invite-name-description">Adını yaz, arkadaşlarının yanına geç.<br/>Doğrudan <strong>{code}</strong> masasına katılacaksın.</p>
    <form noValidate onSubmit={e=>{e.preventDefault();if(!busy)onSubmit();}}><label className="field">Oyuncu adın<input ref={input} value={name} onChange={e=>onName(e.target.value)} disabled={busy} autoComplete="nickname" enterKeyHint="go" placeholder="Bahçedeki adın" minLength={2} maxLength={20}/></label><button className="button primary full" disabled={busy}>{busy?<><LoaderCircle size={18} className="spin"/> Bahçeye giriliyor…</>:<>Devam et <ArrowRight size={18}/></>}</button></form>
  </section></div>;
}
