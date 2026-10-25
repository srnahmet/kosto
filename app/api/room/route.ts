import { operate } from '@/lib/store';
import { GameError } from '@/lib/game.mjs';
import { roomHeaders } from '@/lib/room-http.mjs';
export const dynamic='force-dynamic';
export function OPTIONS(request:Request) {
  const headers=roomHeaders(request);
  return new Response(null,{status:headers?204:403,headers:headers||{'Cache-Control':'no-store','Vary':'Origin'}});
}
export async function POST(request:Request) {
  const allowedHeaders=roomHeaders(request);
  const headers=allowedHeaders||{'Cache-Control':'no-store','Vary':'Origin'};
  try {
    // Consume rejected bodies too so the connection can safely be reused.
    const raw=await request.text();
    if(!allowedHeaders) return Response.json({error:'Geçersiz istek kaynağı.'},{status:403,headers});
    if(raw.length>20000) return Response.json({error:'İstek çok büyük.'},{status:413,headers});
    let body;try{body=JSON.parse(raw);}catch{throw new GameError('Geçersiz istek.');}
    if(!body||typeof body!=='object'||typeof body.action!=='string') throw new GameError('Geçersiz işlem.');
    const token=(request.headers.get('authorization')||'').replace(/^Bearer /,'');
    return Response.json(await operate(body,token),{headers});
  } catch(error) {
    if(error instanceof GameError) return Response.json({error:error.message},{status:error.status,headers});
    console.error('Room operation failed',error instanceof Error?error.message:'unknown');
    return Response.json({error:'Masa servisine ulaşılamadı. Birazdan yeniden dene.'},{status:503,headers});
  }
}
