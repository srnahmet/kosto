import { operate } from '@/lib/store';
import { GameError } from '@/lib/game.mjs';
export const dynamic='force-dynamic';
export async function POST(request:Request) {
  const headers={'Cache-Control':'no-store, private','Content-Type':'application/json'};
  try {
    const origin=request.headers.get('origin');
    if(origin && origin!==new URL(request.url).origin) return Response.json({error:'Geçersiz istek kaynağı.'},{status:403,headers});
    const raw=await request.text();
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
