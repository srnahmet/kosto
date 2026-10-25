// Cosmetic choices only. Never derive these from a player's hidden game role.
export const AVATAR_KEY = 'kosto.avatar.v1';
export const CHARACTERS = [{id:'classic',name:'Klasik'},{id:'fluffy',name:'Pofuduk'},{id:'tiny',name:'Minik'}];
export const HATS = [{id:'none',name:'Şapkasız'},{id:'straw',name:'Hasır'},{id:'beanie',name:'Bere'},{id:'sprout',name:'Filiz'}];
export const AVATAR_COLORS = {
  skin:[{id:'cream',name:'Krem',hex:'#efd3b3'},{id:'peach',name:'Şeftali',hex:'#dfad8e'},{id:'caramel',name:'Karamel',hex:'#b97b58'},{id:'cocoa',name:'Kakao',hex:'#855740'}],
  fur:[{id:'hazel',name:'Fındık',hex:'#b29177'},{id:'rose',name:'Gül',hex:'#be8d9f'},{id:'slate',name:'Duman',hex:'#8c9eac'},{id:'lavender',name:'Lavanta',hex:'#ab99be'}],
  outfit:[{id:'mint',name:'Nane',hex:'#64b6a1'},{id:'coral',name:'Mercan',hex:'#e49a82'},{id:'sky',name:'Gök',hex:'#84b6d6'},{id:'lilac',name:'Leylak',hex:'#ad94ce'}],
  hat:[{id:'honey',name:'Bal',hex:'#efd082'},{id:'sage',name:'Adaçayı',hex:'#86b59b'},{id:'berry',name:'Dut',hex:'#bd8aa0'},{id:'blue',name:'Mavi',hex:'#85acc6'}],
};
export const DEFAULT_AVATAR = Object.freeze({character:'classic',hat:'straw',skin:'cream',fur:'hazel',outfit:'mint',hatColor:'honey'});
export function normalizeAvatar(value) {
  const raw=value&&typeof value==='object'&&!Array.isArray(value)?value:{};
  const result={};
  for(const [key,choices] of Object.entries({character:CHARACTERS,hat:HATS,skin:AVATAR_COLORS.skin,fur:AVATAR_COLORS.fur,outfit:AVATAR_COLORS.outfit,hatColor:AVATAR_COLORS.hat})) {
    result[key]=choices.some(c=>c.id===raw[key])?raw[key]:DEFAULT_AVATAR[key];
  }
  return result;
}
export function readAvatar(storage) {
  try{return normalizeAvatar(JSON.parse(storage.getItem(AVATAR_KEY)||'null'));}catch{return normalizeAvatar(null);}
}
export function writeAvatar(storage,value) {
  try{storage.setItem(AVATAR_KEY,JSON.stringify(normalizeAvatar(value)));return true;}catch{return false;}
}
export function sameAvatar(a,b){return JSON.stringify(normalizeAvatar(a))===JSON.stringify(normalizeAvatar(b));}
export function avatarColor(part,id){return AVATAR_COLORS[part].find(c=>c.id===id)?.hex||AVATAR_COLORS[part][0].hex;}
