// Public category metadata; the actual word corpus remains on the server.
export const CATEGORY_GROUPS = [
  {id:'food',name:'Yeme İçme',icon:'🍓',description:'Yemek, meyve, sebze, içecek ve tatlı',categories:['Ana yemekler','Meyveler','Sebze ve bakliyat','İçecekler','Tatlı ve atıştırmalık']},
  {id:'nature',name:'Doğa ve Canlılar',icon:'🌿',description:'Hayvanlar, bitkiler, hava, deniz ve doğa',categories:['Bitkiler ve bahçe','Doğa ve arazi','Evcil ve çiftlik hayvanları','Yaban hayvanları','Hava ve gökyüzü','Su ve kıyı']},
  {id:'daily',name:'Günlük Yaşam',icon:'🏡',description:'Ev, mutfak, giyim, bakım ve etkinlikler',categories:['Ev eşyaları','Mutfak gereçleri','Giyim','Aksesuar ve bakım','Sağlık ve beden','Günlük yaşam ve etkinlikler']},
  {id:'play',name:'Sanat, Oyun ve Spor',icon:'🎭',description:'Müzik, gösteri, oyunlar ve spor',categories:['Müzik','Sanat ve gösteri','Oyunlar ve oyuncaklar','Sporlar','Spor ekipmanları']},
  {id:'work',name:'Okul, İş ve Teknoloji',icon:'💡',description:'Meslekler, okul, aletler, cihazlar ve medya',categories:['Meslekler','Okul ve kırtasiye','Aletler ve el işleri','Teknoloji ve cihazlar','İletişim ve medya']},
  {id:'travel',name:'Gezi ve Ulaşım',icon:'🧳',description:'Mekânlar, araçlar, yolculuk, tatil ve kamp',categories:['Mekân ve yapılar','Ulaşım araçları','Yolculuk ve trafik','Tatil ve kamp']},
];
export function groupFor(category){return CATEGORY_GROUPS.find(g=>g.id===category||g.name===category||g.categories.includes(category))?.id||null;}
export function selectedCategories(options={}){
  if(Array.isArray(options.categories)&&options.categories.length)return CATEGORY_GROUPS.filter(g=>options.categories.includes(g.id)).map(g=>g.id);
  const old=options.category&&options.category!=='Hepsi'?groupFor(options.category):null;
  return old?[old]:[];
}
export function toggleCategory(selection,id){
  const selected=new Set(selection);selected.has(id)?selected.delete(id):selected.add(id);
  const next=CATEGORY_GROUPS.filter(g=>selected.has(g.id)).map(g=>g.id);
  return next.length===CATEGORY_GROUPS.length?[]:next;
}
export function categoryLabel(options={}){
  const selected=selectedCategories(options);
  return selected.length?CATEGORY_GROUPS.filter(g=>selected.includes(g.id)).map(g=>g.name).join(' + '):'Karışık';
}
export function matchesWord(pair,options){
  const groups=options.categories||[];
  const legacyGroup=CATEGORY_GROUPS.find(g=>g.id===options.category||g.name===options.category)?.id;
  const category=groups.length?groups.includes(groupFor(pair.category)):(!options.category||options.category==='Hepsi'||pair.category===options.category||(legacyGroup&&groupFor(pair.category)===legacyGroup));
  return category&&(options.difficulty==='Hepsi'||!options.difficulty||pair.difficulty===options.difficulty);
}
