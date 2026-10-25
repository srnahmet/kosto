# Kösto

**Kelimeler yakın. Kim biraz farklı?**

Vampir Köylü'nün masa kurma ve telefondan katılma alışkanlığını, ferah piksel bahçesinde bir gizli kelime oyununa taşıyan bağımsız web projesi. Türkçe arayüz, 3–16 oyuncu, dört tema ve 1.238 özgün kelime çifti.

## Oynamak

1. İsim yazıp masa kur. İstersen yalnızca masayı yönet; bu durumda oyuncu sayısına dahil olmazsın ve kelime/oy almazsın.
2. Arkadaşların bağlantı veya altı karakterli kod ile kendi cihazlarından katılsın. Hesap gerekmez. Herkes hazır olunca masa sahibi başlatsın.
3. Bahçıvanlar aynı kelimeyi, bir veya iki Kösto yakın ama farklı bir kelimeyi görür. Varsayılan herkes kendi rolünü bile bilmez. Çiftin yönü ve roller sunucuda bağımsız, kriptografik rastgelelikle seçilir.
4. Her oylama öncesi herkes sırasıyla **en az iki tam konuşma turu** yapar. Serbest konuşma aşaması yoktur. Oyuncu kendi sözünü erken bitirebilir. Elenenler izler.
5. Yaşayanlar kendileri dışında bir oyuncuya gizli oy verir. Kesinleşmiş oy değişmez. En çok oyu alan elenir; rolü oyun sonuna kadar açıklanmaz. Süresi dolan oylamada eksik oylar çekimserdir.
6. İlk eşitlikte yalnızca eşitlikteki oyuncular birer kısa konuşma yapar. Yaşayan herkes yalnızca bu adaylara yeniden oy verir. **Tekrar eşitlik olursa kimse elenmez ve yeni ana tur başlar.** Hiç oy yoksa da yeni ana tura geçilir.
7. Tüm Köstolar elenirse Bahçıvanlar kazanır. Yaşayan Kösto sayısı Bahçıvan sayısına ulaştığında Köstolar kazanır: tek Kösto ile **1–1**, iki Kösto hayattaysa **2–2**. Köstolardan biri elenirse kalan Kösto **1–1** eşiğine kadar devam eder.
8. Oyun sonunda roller ve iki kelime açıklanır. Masa sahibi aynı kodla rövanş açabilir; roller, kelimeler, oylar ve hazır durumu sıfırlanır. Yakın geçmişteki kelime çiftleri mümkün olduğunca tekrarlanmaz.

## Süreler ve seçenekler

- Varsayılan **2 konuşma turu**, kişi başı **60 sn toplam konuşma** → her söz **30 sn**.
- **Her söz öncesi 5 sn geçiş** vardır; ilk konuşmaya hazırlanma da buna dahildir.
- Ana tur konuşma ve geçiş bütçesi: `N × kişi başı konuşma + N × konuşma turu × 5 sn`.
- Örnek: 6 kişi, iki tur → `6 × 60 + 6 × 2 × 5 = 420 sn` (7 dakika). Kelimeye bakma (8 sn), oylama, eşitlik konuşması ve sonuç duyurusu ayrıca eklenir. Bu süre bütün oyunun üst sınırı değildir; her ana tur kalan oyuncularla yeniden hesaplanır.
- Konuşma sayısı 2–5; kişi başı konuşma 30–600 sn. Her söz en az 15 sn olduğundan alt sınır konuşma sayısına göre artar. Bölünmede saniyenin altı aşağı yuvarlanır.
- Oylama varsayılan 30 sn, ayar 15–90 sn. Herkes oy verirse en az 3 sn sonra çözülebilir. Eşitlik konuşması varsayılan 15 sn, ayar 10–30 sn. Sonuç duyurusu 7 sn.
- **2 Kösto** seçilebilir; başlamak için en az **6 gerçek oyuncu** gerekir. Köstoların birbirini tanıması ve kendi rolünü bilme ayrı ayarlardır; ikisi de varsayılan kapalıdır. Birbirini tanıma açılırsa kendi rolü de dolaylı olarak anlaşılır.
- Kelime kategorisi ve zorluk filtresi vardır. Dört cihaz-yerel tema: Turkuaz Bahçe, Şeftali Sabahı, Lavanta Düşü, Gökyüzü. Efekt sesleri varsayılan kapalıdır.

## Mikrofon

Masa kurulurken isteğe bağlı ve varsayılan kapalıdır. Herkes ayrıca sesli sohbete katılır. Bu işlem mikrofon izni istemez; mikrofon yalnızca kendi söz sırası sırasında düğmeye basınca açılır. Aşama/söz değişince, süre dolunca, kişi elenince, sesten ayrılınca veya sekme arka plana geçince yerel ses izleri durdurulur. Sonraki sözde kendiliğinden açılmaz. Alıcılar yalnızca o anki konuşmacının sesini dinler.

WebRTC sesi cihazlar arasında taşır. Sunucu yalnızca masadaki katılmış üyeler arasında kısa ömürlü sinyal mesajları iletir; üçüncü üye diğer ikisinin mesajını alamaz. Ses kaydedilmez. STUN vardır; **TURN aktarım hizmeti henüz yoktur**, bu nedenle bazı okul/iş/mobil ağlarında ses kurulamayabilir. HTTPS veya localhost ve tarayıcı izni gerekir. Gerçek ses kalitesi ve farklı ağlar üzerinde iki cihaz testi bu sürümün otomatik kontrolleri kapsamında değildir.

## Kurulum

Node.js 22.13+ ve npm:

```sh
npm ci
npm test
npm run typecheck
npm run build
```

D1 yerel veritabanını ilk kez hazırlamak için derlemeden sonra:

```sh
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_sturdy_wendell_vaughn.sql
npm run dev
```

Geliştirme sunucusu çıktısındaki Local adresini açın. Aynı migration'ı mevcut yerel veritabanına yeniden uygulamayın. Üretim yayını Sites üzerinden yapılır; `.openai/hosting.json` proje kimliği ve D1 bağını taşır. Kaynak GitHub'da ayrıca saklanır. Bu uygulama sunucu işlemleri kullandığından **yalnızca GitHub Pages'e yüklenerek çok oyunculu çalışmaz**.

HTTP testleri için çalışan yerel sunucu üzerinde `TEST_BASE_URL=http://127.0.0.1:5174` ortam değişkeniyle `node --test tests/api.test.mjs` çalıştırın. Testler kendi masalarını oluşturur; üretimde çalıştırmak yerine yerel veritabanını kullanın.

`npm run test:http` ise derlenmiş Worker'ı ayrı bir geçici yerel D1 veritabanıyla açar, iki HTTP senaryosunu çalıştırır ve test sunucusunu kapatır. CI bu komutu da çalıştırır.

## Mimari ve gizlilik

- React + TypeScript, Vinext/Vite, Cloudflare Worker ve D1. Supabase hesabı veya Vampir Köylü veritabanı kullanılmaz.
- `lib/game.mjs`: saat ve rastgelelik enjekte edilebilen sunucu oyun motoru. `lib/store.ts`: D1 saklama, üyelik ve sürüm koşullu yazma. Aynı sürüm üzerinde yarışan hamleler tekrar okunur; aynı oylama iki kez çözülmez.
- Saatler sunucudadır. 1,5 saniyelik durum sorguları kurucunun cihazına ihtiyaç duymadan akışı ilerletir. Kimse bağlı değilken zaman aşımı ilk sonraki istekte hesaplanır.
- Her üyeye tahmin edilemeyen oturum belirteci verilir. Belirteç tarayıcıda bu siteye ait yerel depolamada; SHA-256 özeti sunucu durumunda tutulur. Kod üyelik kimliği değildir. Aynı cihazdan dönülür; tarayıcı verisi silinirse kimlik geri alınamaz.
- İstemciye aktif çiftin tamamı, çift kimliği, diğerlerinin kelimeleri veya gizli rolleri gönderilmez. Oyun verisi sunucu tarafındadır; `data/words.json` halka açık statik klasörde değildir. Yerel efektler ve fontlar paketle gelir.
- 25 sn haber alınmayan kişi bağlantısız görünür. 120 sn sonunda aktif oyundan elenir; geç dönüş canlandırmaz. Lobide boşalan yere kapasite varsa yeniden katılabilir. Kurucu açıkça ayrılırsa yönetim başka bir oyuncuya geçer.
- Masalar 24 saat sonra kapanır; sonraki masa açılışlarında süresi dolmuş kayıtlar temizlenir. İsim dışında profil bilgisi istenmez; üyelik belirteci, hazır/bağlantı durumu ve oyun hamleleri saklanır. Arkadaş grupları için hazırlanmıştır; hesap/IP yasağı veya geniş ölçekli kötüye kullanım koruması içermez.

## Doğrulama

27 oyun/veri testi ve iki bağımsız HTTP senaryosu: üç oyunculu oyunun iki tam konuşma turu, oylama, sonuç ve rövanşı; altı oyunculu iki Kösto, izleyici kurucu, eşzamanlı katılım, sinyal gizliliği ve çıkarılan kişinin erişimi. Ayrıca TypeScript kontrolü, üretim derlemesi ve yerel tarayıcıda masa kurma/hazır olma/tema değiştirme kontrol edildi.

Kelime havuzunun seçim ölçütleri, kategori dağılımı ve editoryal sınırları: [data/WORDS.md](data/WORDS.md).
