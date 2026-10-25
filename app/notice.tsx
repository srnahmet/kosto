'use client';
import { useEffect, useRef } from 'react';
import { X, Check, Sprout } from 'lucide-react';
import { Mole } from './art';

export default function Notice({message,onClose}:{message:string,onClose:()=>void}) {
  const panel=useRef<HTMLElement>(null),button=useRef<HTMLButtonElement>(null),close=useRef(onClose);close.current=onClose;
  useEffect(()=>{
    const previous=document.activeElement as HTMLElement|null,overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';button.current?.focus();
    const onKey=(e:KeyboardEvent)=>{
      if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close.current();}
      if(e.key==='Tab'){
        const focusable=panel.current?.querySelectorAll<HTMLElement>('button:not([disabled]),a[href],input:not([disabled]),[tabindex="0"]');
        if(!focusable?.length)return;
        const first=focusable[0],last=focusable[focusable.length-1];
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
      }
    };
    document.addEventListener('keydown',onKey,true);
    return()=>{document.body.style.overflow=overflow;document.removeEventListener('keydown',onKey,true);if(previous?.isConnected)previous.focus();};
  },[message]);
  return <div className="notice-backdrop" onClick={e=>{if(e.target===e.currentTarget)onClose();}}><section ref={panel} className="notice-card error" role="alertdialog" aria-modal="true" aria-labelledby="notice-title" aria-describedby="notice-message">
    <button className="notice-close icon-button" onClick={onClose} aria-label="Bildirimi kapat"><X size={19}/></button>
    <div className="notice-portrait"><Mole kind="pink"/><span>?</span></div>
    <div className="eyebrow"><Sprout size={12}/> BAHÇEDEN KÜÇÜK BİR NOT</div>
    <h2 id="notice-title">Minik bir pürüz var.</h2>
    <p id="notice-message">{message}</p>
    <button ref={button} className="button primary full" onClick={onClose}>Tamamdır <Check size={17}/></button>
  </section></div>;
}
