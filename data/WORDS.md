# Kösto kelime havuzu

Bu sürümde **1.238 benzersiz çift**, **31 kategori** ve **2.281 farklı terim** bulunur. Çiftler Kösto için tek tek yazıldı; iki kelime listesinin bütün kombinasyonları alınarak veya aynı kalıba sıfatlar eklenerek üretilmedi. Harici bir kelime veritabanı kopyalanmadı.

## Kullanım

`words.json` kökünde bir dizi bulunur. Kayıt biçimi:

```json
{
  "id": "kosto-0001",
  "a": "Deniz",
  "b": "Havuz",
  "category": "Su ve kıyı",
  "difficulty": "kolay"
}
```

**`a` ve `b` rol belirtmez.** Sunucu her yeni oyunda ayrı bir rastgele seçimle hangi tarafın Bahçıvanlara, hangi tarafın Köstolara verileceğini belirlemelidir. Veri sırası da bir öncelik veya önerilen oyun sırası değildir. Aktif oyunun tüm çifti veya verinin kimliği istemciye gönderilmemelidir; oyuncu yalnızca kendi kelimesini görmelidir.

## Editoryal seçim ölçütleri

- Aynı üst başlık, kullanım, ortam, biçim veya deneyim üzerinden ortak ipucu verilebilmesi amaçlandı: Deniz–Havuz, Tiyatro–Sinema, Satranç–Dama, Kahvaltı–Brunch.
- Kelimelerin ayırt edilebilir nesne, etkinlik veya kavramlar olması tercih edildi. Aynı sözcüğün yazım varyantı ve doğrudan çevirisi olan adaylar ayıklandı; örneğin Şablon–Stencil gibi bir çift kullanılmadı.
- Kimi çiftler yakın türleri veya araçların farklı biçimlerini karşılaştırır: Cappuccino–Latte, Çello–Kontrbas, Kupa–Fincan. Bu yakınlık oyunun ipucu ve şüphe oluşturma mekanizması için bilinçlidir.
- Yemek, doğa, hayvan, ev, giyim, teknoloji, sanat, spor, okul, yolculuk ve günlük yaşam arasında dağılım sağlandı. Konu sayısını artırmak için rastgele ilişkisiz kelimeler eşleştirilmedi.
- Özel hayat, siyasi görüş, din veya cinsel içerik gerektiren çiftler kullanılmadı. Bazı ürün ve oyun adları gündelik tanınırlıkları nedeniyle geçer.
- Her kelime tek sözcük olmak zorunda değildir: “Deniz feneri”, “Sıcak hava balonu” ve “Diş fırçası” gibi yerleşik adlar da bulunur.

## Zorluk

| Etiket | Çift | Amaç |
| --- | ---: | --- |
| kolay | 370 | Gündelik ve yaygın kavramlar, hızlı başlangıç |
| orta | 620 | Daha yakın alt türler veya biraz daha özel bağlamlar |
| zor | 248 | İnce ayrımlar, teknik ya da daha az tanınan terimler |

Zorluk etiketleri editoryal başlangıç değerlendirmesidir; oyuncularla ölçülmüş başarı oranı değildir. Özellikle bazı müzik, doğa, spor ve içecek terimleri gruba göre zorlaşabilir. Tanışma oyunlarında kolay veya kolay–orta filtreleri uygundur. Üç kişilik masalarda kelimeyi doğrudan söylemek yerine ortak özelliklerden ipucu vermek gerekir.

## Kategori dağılımı

| Kategori | Çift |
| --- | ---: |
| Su ve kıyı | 40 |
| Doğa ve arazi | 40 |
| Hava ve gökyüzü | 40 |
| Meyveler | 40 |
| Sebze ve bakliyat | 40 |
| Ana yemekler | 40 |
| Tatlı ve atıştırmalık | 40 |
| İçecekler | 40 |
| Mutfak gereçleri | 40 |
| Ev eşyaları | 40 |
| Mekân ve yapılar | 40 |
| Giyim | 40 |
| Aksesuar ve bakım | 40 |
| Evcil ve çiftlik hayvanları | 40 |
| Yaban hayvanları | 40 |
| Bitkiler ve bahçe | 39 |
| Ulaşım araçları | 40 |
| Yolculuk ve trafik | 40 |
| Sporlar | 40 |
| Spor ekipmanları | 40 |
| Oyunlar ve oyuncaklar | 40 |
| Sanat ve gösteri | 40 |
| Müzik | 40 |
| Okul ve kırtasiye | 40 |
| Meslekler | 40 |
| Teknoloji ve cihazlar | 40 |
| İletişim ve medya | 40 |
| Sağlık ve beden | 40 |
| Tatil ve kamp | 39 |
| Aletler ve el işleri | 40 |
| Günlük yaşam ve etkinlikler | 40 |

## Doğrulama

İlk taslakta 1.240 çift vardı. Unicode NFKC, Türkçe küçük harfe çevirme ve boşluk normalleştirmesiyle, iki tarafın sırasından bağımsız olarak iki tekrar çıkarıldı: Saksı–Vazo ve Çadır–Karavan. Son çıktı 1.238 çifttir.

Otomatik kontrolde boş/aynı taraflar, tekrar eden kimlikler, ters sırayla tekrar eden çiftler, geçersiz zorluklar, bozuk Unicode yer tutucuları ve yanlışlıkla Latin yerine yazılmış Kiril harfleri bulunmadı. İkinci editoryal geçişte yazım hataları, doğrudan eş anlamlı adaylar ve anlaşılması gereksiz derecede güç ifade biçimleri değiştirildi.

Bu denetimler veri yapısını ve başlangıç niteliğini doğrular. Her grubun aynı ipuçlarını üreteceği veya her çiftin eşit derecede dengeli olacağı iddia edilmez; sonraki oyun geri bildirimleriyle çift bazında iyileştirme yapılabilir.
