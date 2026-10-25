# Kösto

**Kelimeler yakın. Kim biraz farklı?**

Vampir Köylü'nün masa kurma ve telefondan katılma alışkanlığını, ferah piksel bahçesinde bir gizli kelime oyununa taşıyan bağımsız web projesi. Türkçe arayüz, 3–16 oyuncu, dört tema ve 1.238 özgün kelime çifti.

## Oynamak

1. İsim yazıp masa kur. İstersen yalnızca masayı yönet; bu durumda oyuncu sayısına dahil olmazsın ve kelime/oy almazsın.
2. Arkadaşların bağlantı veya altı karakterli kod ile kendi cihazlarından katılsın. Hesap gerekmez. Herkes hazır olunca masa sahibi başlatsın.
3. Bahçıvanlar aynı kelimeyi, bir veya iki Kösto yakın ama farklı bir kelimeyi görür. Varsayılan herkes kendi rolünü bile bilmez. Çiftin yönü ve roller sunucuda bağımsız, kriptografik rastgelelikle seçilir.
4. Her oylama öncesi herkes sırasıyla **varsayılan bir tam konuşma turu** yapar. Bir tur, herkesin bir kez ipucu vermesidir; ardından oylama başlar. İstersen 2–5 tur seçerek oylamadan önce daha çok ipucu için yeniden söz alabilirsiniz. Serbest konuşma aşaması yoktur. Oyuncu kendi sözünü erken bitirebilir. Elenenler izler.
5. Yaşayanlar kendileri dışında bir oyuncuya gizli oy verir. Kesinleşmiş oy değişmez. En çok oyu alan elenir; rolü oyun sonuna kadar açıklanmaz. Süresi dolan oylamada eksik oylar çekimserdir.
6. İlk eşitlikte yalnızca eşitlikteki oyuncular birer kısa konuşma yapar. Yaşayan herkes yalnızca bu adaylara yeniden oy verir. **Tekrar eşitlik olursa kimse elenmez ve yeni ana tur başlar.** Hiç oy yoksa da yeni ana tura geçilir.
7. Tüm Köstolar elenirse Bahçıvanlar kazanır. Yaşayan Kösto sayısı Bahçıvan sayısına ulaştığında Köstolar kazanır: tek Kösto ile **1–1**, iki Kösto hayattaysa **2–2**. Köstolardan biri elenirse kalan Kösto **1–1** eşiğine kadar devam eder.
8. Oyun sonunda roller ve iki kelime açıklanır. Masa sahibi aynı kodla rövanş açabilir; roller, kelimeler, oylar ve hazır durumu sıfırlanır. Yakın geçmişteki kelime çiftleri mümkün olduğunca tekrarlanmaz.

## Süreler ve seçenekler

- Varsayılan **1 konuşma turu**, kişi başı **60 sn toplam konuşma** → tek söz **60 sn**. Daha fazla tur seçilirse bu toplam süre turlara bölünür; örneğin 2 turda her söz 30 sn olur.
- **Her söz öncesi 5 sn geçiş** vardır; ilk konuşmaya hazırlanma da buna dahildir.
- Ana tur konuşma ve geçiş bütçesi: `N × kişi başı konuşma + N × konuşma turu × 5 sn`.
- Örnek: 6 kişi, varsayılan bir tur → `6 × 60 + 6 × 1 × 5 = 390 sn` (6 dakika 30 saniye). Kelimeye bakma (8 sn), oylama, eşitlik konuşması ve sonuç duyurusu ayrıca eklenir. Bu süre bütün oyunun üst sınırı değildir; her ana tur kalan oyuncularla yeniden hesaplanır.
- Konuşma sayısı 1–5; kişi başı konuşma 30–600 sn. Her söz en az 15 sn olduğundan alt sınır konuşma sayısına göre artar. Bölünmede saniyenin altı aşağı yuvarlanır.
- Oylama varsayılan 30 sn, ayar 15–90 sn. Herkes oy verirse en az 3 sn sonra çözülebilir. Eşitlik konuşması varsayılan 15 sn, ayar 10–30 sn. Sonuç duyurusu 7 sn.
- **2 Kösto** seçilebilir; başlamak için en az **6 gerçek oyuncu** gerekir. Köstoların birbirini tanıması ve kendi rolünü bilme ayrı ayarlardır; ikisi de varsayılan kapalıdır. Birbirini tanıma açılırsa kendi rolü de dolaylı olarak anlaşılır.
- Kelime kategorisi ve zorluk filtresi vardır. Dört cihaz-yerel tema: Turkuaz Bahçe, Şeftali Sabahı, Lavanta Düşü, Gökyüzü. Efekt sesleri varsayılan kapalıdır.

## Karakterini özelleştir

Masaya girdikten sonra üstteki **Karakterim** düğmesinden, lobide ayrıca kendi karakterine dokunarak görünümünü değiştirebilirsin. Üç karakter tipi (Klasik, Pofuduk, Minik), şapkasız görünüm dahil dört şapka seçeneği ve ten/karakter/kıyafet/şapka için dörder renk vardır. Canlı önizleme, kaydetme ve vazgeçme desteklenir.

Seçimler `kosto.avatar.v1` anahtarıyla bu siteye ait localStorage içinde saklanır; yenilemede, demoda ve yeni masalarda hatırlanır. Aynı cihazda aynı tarayıcı profili ve alan adı gerekir; tarayıcı verisi silinirse sıfırlanır. Masa üyelerine yalnızca izin verilen kozmetik kimlikler gönderilir. Her üye yalnızca kendi görünümünü güncelleyebilir; rol, oy, süre ve hazır durumu bundan etkilenmez. Eski masalarda görünüm verisi yoksa varsayılan karakter gösterilir.

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

Geliştirme sunucusu çıktısındaki Local adresini açın. Aynı migration'ı mevcut yerel veritabanına yeniden uygulamayın. Oyun API'si Sites üzerindeki Worker/D1 ile çalışır; `.openai/hosting.json` proje kimliği ve D1 bağını taşır.

## GitHub Pages yayını

Arayüz `https://srnahmet.github.io/kosto/` adresine yayınlanacak şekilde hazırlanmıştır. GitHub Pages HTML/CSS/JavaScript dosyalarını sunar; gizli roller, kelime çekilişi, masa kayıtları ve ses sinyalleşmesi `https://kosto-bahce.srnahmet.chatgpt.site/api/room` üzerindeki mevcut sunucuda kalır. İstemciye yalnızca kelime sayısı ve kategoriler eklenir; kelime çiftleri eklenmez.

```sh
npm run build:pages
node scripts/check-pages.mjs
npm run preview:pages
```

Üretim dosyaları `dist-pages/` altındadır. `vite.pages.config.ts` `/kosto/` taban yolunu belirler. Ana sayfa, davet bağlantıları ve sayfa yenileme bu yolu korur. API yalnızca kendi alan adından ve `https://srnahmet.github.io` üzerinden gelen tarayıcı isteklerini kabul eder; genel CORS izni verilmez. Yeni oturumlar her alan adının kendi tarayıcı depolamasında saklanır.

GitHub'da Settings → Pages → Source: **GitHub Actions** seçilir. `main` dalına her gönderimde oyun/veri ve HTTP testleri, TypeScript kontrolü, Worker ve Pages derlemeleri tamamlanır; başarılı paket GitHub Pages'e yayınlanır. API kodu değiştiğinde Worker ayrıca Sites yayın akışıyla güncellenmelidir. API çalışır durumda kalmalıdır; GitHub Pages oyun sunucusu çalıştırmaz.

HTTP testleri için çalışan yerel sunucu üzerinde `TEST_BASE_URL=http://127.0.0.1:5174` ortam değişkeniyle `node --test tests/api.test.mjs` çalıştırın. Testler kendi masalarını oluşturur; üretimde çalıştırmak yerine yerel veritabanını kullanın.

`npm run test:http` ise derlenmiş Worker'ı ayrı bir geçici yerel D1 veritabanıyla açar, üç HTTP senaryosunu çalıştırır ve test sunucusunu kapatır. CI bu komutu da çalıştırır.

## Demo Masası ve davetler

Üstteki **Demo Masası** butonu herkes için görünür; hesap veya yönetici girişi gerekmez. Tek tıklamada senin ve beş botun yer aldığı, bu cihazda çalışan bir örnek oyun açılır. Rastgele oyun, Bahçıvan zaferi, Kösto zaferi, çözülen eşitlik, iki kez eşitlik, iki Kösto ve bağlantı kaybı senaryoları vardır.

Demo aynı oyun kurallarını ayrı örnek kelimelerle kullanır. Botlar sırayla konuşmayı bitirir ve senaryoya uygun, kendilerine verilemeyen geçerli oylar kullanır. Oyuncu ve tur sayısı değiştirilebilir; akış 1×/2×/4×/8× hızda izlenebilir, duraklatılabilir veya birer aşama ilerletilebilir. “Benim hamlelerim de otomatik” kapatılırsa kendi sıranda ve oylamada sen oynarsın. Roller ve bot hamleleri isteğe bağlı ayrıntılarda incelenebilir.

Demo canlı masa açmaz, sunucuya bot kaydetmez ve diğer oyuncuların oyunlarını etkilemez. Normal bir masadayken demo ayrı sekmede açılır. Demo bağlantıları `?demo=...` kullanır; yenilemek yeni bir örnek oyun başlatır. Demo, gerçek telefon, internet veya mikrofon bağlantısını doğrulayan bir cihaz testi değildir.

Normal bekleme odasında davet koduna ek olarak **QR kod** gösterilir. Kod, aynı masanın tam davet bağlantısını içerir ve tarayıcıda üretilir; harici QR servisine bilgi gönderilmez. QR görselleri bağımsız bir okuyucuyla çözülerek doğru alan adı, `/kosto/` yolu ve masa kodu için kontrol edilir.

QR veya davet bağlantısıyla yeni gelen kişiye yalnızca oyuncu adını soran bir popup açılır. Adını onayladığında doğrudan davet edilen masaya katılır; ana sayfadaki katılma formunu ayrıca kullanmaz. Aynı cihazdaki mevcut masa oturumu otomatik olarak geri yüklenir. Geçersiz davet, kullanılmış isim, dolu masa ve bağlantı sorunları uyarı popup'ıyla gösterilir.

Yalnızca hata ve uyarılar piksel karakterli popup'larda gösterilir. Kopyalama başarılı olduğunda düğmede kısa süreli bir onay görünür; bilgi popup'ı açılmaz. Kopyalama başarısızsa elle kopyalama için uyarı gösterilir. Popup kapatılana kadar okunabilir; Escape, kapatma veya “Tamamdır” düğmesiyle kapanır ve klavye odağı geri döner. Aynı arka plan bağlantı hatası sürekli yeniden açılmaz. Formlar, tarayıcının yerleşik balonları yerine bu ortak bildirimi kullanır.

GISM 🤝 SPTLS ortak yapımı yazısı, her ekranda demo düğmesinin yanında yer alır.

## Mimari ve gizlilik

- React + TypeScript, Vinext/Vite, Cloudflare Worker ve D1. Supabase hesabı veya Vampir Köylü veritabanı kullanılmaz.
- `lib/game.mjs`: saat ve rastgelelik enjekte edilebilen sunucu oyun motoru. `lib/store.ts`: D1 saklama, üyelik ve sürüm koşullu yazma. Aynı sürüm üzerinde yarışan hamleler tekrar okunur; aynı oylama iki kez çözülmez.
- Saatler sunucudadır. 1,5 saniyelik durum sorguları kurucunun cihazına ihtiyaç duymadan akışı ilerletir. Kimse bağlı değilken zaman aşımı ilk sonraki istekte hesaplanır.
- Her üyeye tahmin edilemeyen oturum belirteci verilir. Belirteç tarayıcıda bu siteye ait yerel depolamada; SHA-256 özeti sunucu durumunda tutulur. Kod üyelik kimliği değildir. Aynı cihazdan dönülür; tarayıcı verisi silinirse kimlik geri alınamaz.
- Canlı oyunda istemciye aktif çiftin tamamı, çift kimliği, diğerlerinin kelimeleri veya gizli rolleri gönderilmez. Canlı oyun verisi sunucu tarafındadır; `data/words.json` halka açık statik klasörde değildir. Demo için sekiz ayrı örnek çift ve yerel oyun kuralları tarayıcıya eklenir; bunlar canlı masanın kelimesini veya rollerini içermez. Yerel efektler ve fontlar paketle gelir.
- 25 sn haber alınmayan kişi bağlantısız görünür. 120 sn sonunda aktif oyundan elenir; geç dönüş canlandırmaz. Lobide boşalan yere kapasite varsa yeniden katılabilir. Kurucu açıkça ayrılırsa yönetim başka bir oyuncuya geçer.
- Masalar 24 saat sonra kapanır; sonraki masa açılışlarında süresi dolmuş kayıtlar temizlenir. İsim dışında profil bilgisi istenmez; üyelik belirteci, hazır/bağlantı durumu ve oyun hamleleri saklanır. Arkadaş grupları için hazırlanmıştır; hesap/IP yasağı veya geniş ölçekli kötüye kullanım koruması içermez.

## Doğrulama

53 oyun/veri/demo/QR/karakter/yayın testi ve üç bağımsız HTTP senaryosu: GitHub Pages için tarayıcı izinleri ve üyelik; üç oyunculu oyunun varsayılan tek konuşma turu, oylama, sonuç ve rövanşı; altı oyunculu iki Kösto, izleyici kurucu, eşzamanlı katılım, sinyal gizliliği ve çıkarılan kişinin erişimi. Demo senaryoları, duraklatma, aşama ilerletme, elle oynama ve bağımsız QR çözümlemesi de kapsanır. Canlı masalarda demo komutları reddedilir. Karakter kontrolleri yerel kaydı, bozuk/engelli depolamayı, eski masaları, yalnızca kendi görünümünü değiştirme yetkisini ve rövanşta korumayı kapsar; bağımsız HTTP istemcileri de karakter paylaşımını ve yetkisiz değişikliklerin reddedilmesini doğrular. Ayrıca TypeScript kontrolü ve Worker/Pages üretim derlemeleri çalıştırılır. Pages paketinin `/kosto/` yolları, fontları ve canlı sunucu verilerini içermemesi ayrıca denetlenir.

Kelime havuzunun seçim ölçütleri, kategori dağılımı ve editoryal sınırları: [data/WORDS.md](data/WORDS.md).
