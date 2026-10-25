'use client';
import { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';
import { INVITE_QR_OPTIONS } from '@/lib/invite-qr.mjs';

export default function InviteQr({value,onError}:{value:string,onError:(message:string)=>void}) {
  const [src,setSrc]=useState(''),report=useRef(onError);report.current=onError;
  useEffect(()=>{let alive=true;setSrc('');QRCode.toDataURL(value,{...INVITE_QR_OPTIONS,errorCorrectionLevel:'M'}).then(data=>{if(alive)setSrc(data);}).catch(()=>{if(alive)report.current('QR kod hazırlanamadı. Davet bağlantısını kopyalayarak arkadaşlarını çağırabilirsin.');});return()=>{alive=false;};},[value]);
  return <div className="invite-qr">{src?<img src={src} width={180} height={180} alt="Telefon kameranla okutarak bu masaya katıl"/>:<div className="qr-loading" aria-label="QR kod hazırlanıyor"><span/><span/><span/><span/></div>}<p>Telefon kameranla okut,<br/><strong>aynı masaya hemen katıl.</strong></p></div>;
}
