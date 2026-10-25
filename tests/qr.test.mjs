import {test} from 'node:test';
import assert from 'node:assert/strict';
import QRCode from 'qrcode';
import jsQR from 'jsqr';
import {PNG} from 'pngjs';
import {INVITE_QR_OPTIONS} from '../lib/invite-qr.mjs';
import {invitationUrl} from '../lib/client-addresses.mjs';

for(const [origin,path] of [['https://srnahmet.github.io','/kosto/'],['https://kosto-bahce.srnahmet.chatgpt.site','/']]){
  test(`QR image decodes into the complete invitation on ${origin}`,async()=>{
    const expected=invitationUrl(origin,path,'ABC234');
    const buffer=await QRCode.toBuffer(expected,INVITE_QR_OPTIONS);
    const png=PNG.sync.read(buffer);
    const result=jsQR(new Uint8ClampedArray(png.data),png.width,png.height);
    assert.ok(result,'The actual QR image must be readable by an independent decoder.');
    assert.equal(result.data,expected);
    assert.equal(new URL(result.data).searchParams.get('masa'),'ABC234');
    assert.equal(new URL(result.data).pathname,path);
  });
}
