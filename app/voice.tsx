'use client';
import { useEffect, useRef, useState } from 'react';
import { Headphones, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import type { Room } from '@/lib/types';
type Link={pc:RTCPeerConnection,sender:RTCRtpSender,audio:HTMLAudioElement,ice:RTCIceCandidateInit[]};
export default function Voice({room,call}:{room:Room,call:(action:string,payload?:Record<string,any>,quiet?:boolean)=>Promise<Room>}) {
  const [mic,setMic]=useState(false),[muted,setMuted]=useState(false),[error,setError]=useState(''),[busy,setBusy]=useState(false);
  const links=useRef(new Map<string,Link>()),seen=useRef(new Set<string>()),stream=useRef<MediaStream|null>(null),latest=useRef(room),deaf=useRef(muted),queue=useRef(Promise.resolve()),alive=useRef(true),requestVersion=useRef(0);
  latest.current=room;deaf.current=muted;
  const joined=!!room.voice?.joined,canSpeak=room.phase==='speaking'&&room.speaker?.id===room.selfId&&!!room.me?.alive;
  const stop=()=>{requestVersion.current++;stream.current?.getTracks().forEach(t=>t.stop());stream.current=null;for(const l of links.current.values())void l.sender.replaceTrack(null);if(alive.current)setMic(false);};
  const closeAll=()=>{stop();for(const l of links.current.values()){l.pc.close();l.audio.pause();l.audio.srcObject=null;}links.current.clear();seen.current.clear();};
  const send=(to:string,data:any)=>call('signal',{to,data},true).catch(()=>{if(alive.current)setError('Ses bağlantısı aksıyor. Sesten çıkıp yeniden katılabilirsin.');});
  const link=(id:string)=>{
    const prior=links.current.get(id);if(prior)return prior;
    const pc=new RTCPeerConnection({iceServers:[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun.cloudflare.com:3478'}]});
    const sender=pc.addTransceiver('audio',{direction:'sendrecv'}).sender,audio=new Audio();audio.autoplay=true;
    const l:Link={pc,sender,audio,ice:[]};links.current.set(id,l);
    pc.onicecandidate=e=>{if(e.candidate)void send(id,{type:'ice',candidate:e.candidate.toJSON()});};
    pc.ontrack=e=>{audio.srcObject=e.streams[0]||new MediaStream([e.track]);audio.muted=deaf.current||latest.current.phase!=='speaking'||latest.current.speaker?.id!==id;void audio.play().catch(()=>{if(alive.current)setError('Sesi başlatmak için “Dinlemeyi aç” düğmesine dokun.');});};
    pc.onconnectionstatechange=()=>{if(pc.connectionState==='failed'&&alive.current)setError('Ses bağlantısı kurulamadı. Ağın ses aktarımını engelliyor olabilir. Sesten çıkıp yeniden katılabilirsin.');};
    if(stream.current)void sender.replaceTrack(stream.current.getAudioTracks()[0]);
    return l;
  };
  useEffect(()=>{alive.current=true;const hidden=()=>{if(document.hidden)stop();};document.addEventListener('visibilitychange',hidden);return()=>{alive.current=false;document.removeEventListener('visibilitychange',hidden);closeAll();};},[]);
  useEffect(()=>{stop();},[room.epoch,room.gameNo]);
  useEffect(()=>{if(!canSpeak){stop();return;}const timer=setTimeout(()=>{stop();for(const l of links.current.values())l.audio.muted=true;},Math.max(0,(room.deadline||0)-room.serverNow));return()=>clearTimeout(timer);},[canSpeak,room.deadline]);
  useEffect(()=>{for(const [id,l] of links.current)l.audio.muted=muted||room.phase!=='speaking'||room.speaker?.id!==id;},[muted,room.phase,room.speaker?.id]);
  useEffect(()=>{
    if(!joined){closeAll();return;}
    queue.current=queue.current.then(async()=>{
      if(!alive.current||!latest.current.voice?.joined)return;
      const peers=latest.current.voice?.peers||[];
      for(const [id,l] of links.current)if(!peers.some(p=>p.id===id)){l.pc.close();l.audio.pause();l.audio.srcObject=null;links.current.delete(id);}
      for(const p of peers){if(p.id===latest.current.selfId)continue;const existed=links.current.has(p.id),l=link(p.id);if(!existed&&latest.current.selfId<p.id){await l.pc.setLocalDescription(await l.pc.createOffer());await send(p.id,{type:'offer',sdp:l.pc.localDescription?.sdp});}}
      for(const s of latest.current.voice?.signals||[]){
        if(seen.current.has(s.id)||!peers.some(p=>p.id===s.from))continue;seen.current.add(s.id);const l=link(s.from),d=s.data;
        if(d.type==='offer'){await l.pc.setRemoteDescription({type:'offer',sdp:d.sdp});for(const i of l.ice.splice(0))await l.pc.addIceCandidate(i);await l.pc.setLocalDescription(await l.pc.createAnswer());await send(s.from,{type:'answer',sdp:l.pc.localDescription?.sdp});}
        else if(d.type==='answer'&&l.pc.signalingState==='have-local-offer'){await l.pc.setRemoteDescription({type:'answer',sdp:d.sdp});for(const i of l.ice.splice(0))await l.pc.addIceCandidate(i);}
        else if(d.type==='ice'&&d.candidate){if(l.pc.remoteDescription)await l.pc.addIceCandidate(d.candidate);else l.ice.push(d.candidate);}
      }
      if(seen.current.size>1000)seen.current=new Set((latest.current.voice?.signals||[]).map(s=>s.id));
    }).catch(()=>{if(alive.current)setError('Ses bağlantısı yenilenemedi. Sesten çıkıp tekrar katıl.');});
  },[joined,room.voice?.peers,room.voice?.signals]);
  async function toggleMic(){
    setError('');if(mic){stop();return;}if(!canSpeak||!joined)return;
    setBusy(true);const version=++requestVersion.current;
    try{
      if(!navigator.mediaDevices?.getUserMedia)throw new Error('Mikrofon için HTTPS ve destekleyen bir tarayıcı gerekiyor.');
      const media=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:true,noiseSuppression:true},video:false});
      const r=latest.current;
      if(version!==requestVersion.current||document.hidden||r.phase!=='speaking'||r.speaker?.id!==r.selfId||!r.me?.alive||!r.voice?.joined){media.getTracks().forEach(t=>t.stop());return;}
      stream.current=media;await Promise.all([...links.current.values()].map(l=>l.sender.replaceTrack(media.getAudioTracks()[0])));setMic(true);
    }catch(e){stop();setError((e as Error).name==='NotAllowedError'?'Mikrofon izni verilmedi. Tarayıcının site izinlerinden açabilirsin.':(e as Error).message);}finally{setBusy(false);}
  }
  return <div className="panel voice-panel"><h3><Headphones size={18}/> Bahçenin sesi</h3><p>{!joined?'Önce dinlemeye katıl. Sıra sana geldiğinde mikrofonunu kendin açarsın.':canSpeak?'Söz sende. İstersen mikrofonunu aç.':'Dinliyorsun. Mikrofon sadece kendi sıranda açılır.'}</p>
    {!joined?<button className="button secondary full" disabled={busy} onClick={async()=>{setBusy(true);setError('');try{await call('voice',{enabled:true},true);}catch(e){setError((e as Error).message);}finally{setBusy(false);}}}><Headphones size={16}/> Sesli sohbete katıl</button>:<><div className="voice-actions"><button className={`button ${mic?'primary':'secondary'} grow`} disabled={!canSpeak||busy} onClick={toggleMic}>{mic?<MicOff size={15}/>:<Mic size={15}/>} {mic?'Mikrofonu kapat':'Mikrofonu aç'}</button><button className="button secondary" aria-label={muted?'Dinlemeyi aç':'Sesi kapat'} onClick={()=>{setMuted(!muted);for(const l of links.current.values())void l.audio.play().catch(()=>{});}}>{muted?<VolumeX size={16}/>:<Volume2 size={16}/>}</button></div><div className="voice-peers">{room.voice?.peers.map(p=><span className={room.phase==='speaking'&&p.id===room.speaker?.id?'speaking':''} key={p.id}>{p.name}</span>)}</div><button className="text-button" onClick={()=>{closeAll();void call('voice',{enabled:false},true).catch(e=>setError(e.message));}}>Sesten ayrıl</button><button className="text-button" style={{marginLeft:15}} onClick={()=>{setMuted(false);setError('');for(const l of links.current.values()){l.audio.muted=latest.current.phase!=='speaking'||latest.current.speaker?.id!==[...links.current].find(([,v])=>v===l)?.[0];void l.audio.play().catch(()=>setError('Tarayıcı sesi başlatamadı.'));}}}>Dinlemeyi aç</button></>}
    {error&&<p className="voice-error" role="status">{error}</p>}<small className="muted" style={{fontSize:9,display:'block',marginTop:12}}>Kulaklık önerilir. Ses kaydedilmez. Bazı ağlar doğrudan ses bağlantısına izin vermeyebilir.</small>
  </div>;
}
