# Crayn AI — Site Kullanım Kılavuzu

Bu belge Crayn AI sitesini yönetecek kişi için yazıldı. Sitenin nasıl kurulduğunu, hangi içeriğin panelde nereden değiştirildiğini ve yayına girmeden önce tamamlanması gereken işleri anlatır.

Son güncelleme: 8 Ekim 2026 · Tema sürümü: 0.14.1

---

## 1. Kısaca

- Site **WordPress** üzerinde çalışıyor ve içerik **WPBakery Page Builder** ile düzenleniyor.
- Tasarım, önceden hazırlanan sitenin birebir aynısı: animasyonlar, 3D sahneler ve görünüm değişmedi. Tasarım "Crayn AI" adlı özel temanın içinde duruyor.
- Sitede görünen **bütün yazılar ve görseller panelden değiştirilebiliyor.** Kodun içinde sabit kalan içerik yok (istisnalar 7. bölümde).
- Panelde boş bırakılan her alan için sitede **onaylı içerik** görünür. Yani bir alanı silmek siteyi bozmaz; o alan eski haline döner.

| | |
|---|---|
| Site adresi | `https://creodive.work/craynai/` |
| Panel adresi | `https://creodive.work/craynai/wp-admin/` |
| Sunucu | Alastyr, cPanel hesabı `creones`, klasör `public_html/craynai` |
| WordPress | 7.1.2 (7.1.3 güncellemesi bekliyor) |
| Eklentiler | WPBakery Page Builder 9.0.1, FluentSMTP 2.4.1 |
| Temalar | Crayn AI (etkin), Twenty Twenty-Five (yedek, silinmemeli) |

Site şu an **arama motorlarına kapalı**; yayına girerken açılması gerekir (8. bölüm).

---

## 2. Ne nereden düzenlenir

| Sitedeki yer | Panelde nerede |
|---|---|
| Ana sayfanın 8 bölümü | **Sayfalar → Ana Sayfa** |
| Hakkımızda sayfası | **Sayfalar → Hakkımızda** |
| Talep formu (yazılar, seçenekler, ek sorular) | **Sayfalar → Talep** |
| Hizmet sayfaları ve ana sayfadaki hizmet kartları | **Hizmetler** |
| Blog yazıları | **Yazılar** |
| Logo, e-posta, telefon, adres, sosyal medya, footer yazıları | **Görünüm → Tema Ayarları** |
| Menü ve footer bağlantıları | **Görünüm → Menüler** |
| Sol alttaki "Demo planlayalım" kartı | **Görünüm → Görüşme Kartı** |
| Küçük yazılar (düğmeler, kart bağlantıları, 404) | **Görünüm → Site Metinleri** |
| Formlardan gelen başvurular | **Talepler** |

---

## 3. WPBakery ile düzenleme: temel kurallar

Sayfalar ve hizmetler WPBakery elemanlarından oluşur. Her eleman sitedeki bir bölümdür.

**Bir bölümü değiştirmek:**

1. Sayfayı aç (ör. Sayfalar → Ana Sayfa → Düzenle).
2. Değiştireceğin elemanın üstüne gel, **kalem** simgesine bas.
3. Alanı değiştir.
4. Pencerenin altındaki **Save changes** düğmesine bas.
5. Sayfanın sağ üstündeki **Güncelle** düğmesine bas.
6. Siteyi **Ctrl+F5** ile yenile.

**Dikkat edilecekler:**

- **İki kayıt şart.** Önce "Save changes", sonra "Güncelle". Yalnızca biri yapılırsa değişiklik siteye gitmez.
- **Sekmeli elemanlarda sekmeyi aç.** Talep formu elemanı sekmelere ayrılmıştır. WPBakery bir alanı yalnızca sekmesi açıldıysa kaydeder; değiştireceğin alanın sekmesine tıkla, alanı gör, sonra değiştir.
- **Satır kırmak için `|`.** Başlıklarda `|` işareti satır başı demektir: `Şirketlere Özel|Üretken Yapay Zeka|Yazılımları`.
- **Seçenekleri ayırmak için de `|`.** Talep formundaki listeler: `Hemen | 1-3 ay içinde | 3-6 ay içinde`.
- **Etiketler virgülle ayrılır:** `UI/UX, Tasarım, Landing Page`.
- **Listeler satır satırdır.** Kartlar, yorumlar, sorular gibi listelerde her satır bir öğedir. Satırın sağındaki simgelerle silinir, kopyalanır, sürüklenerek sıralanır; listenin altındaki **+** ile yeni satır eklenir.
- **Boş alan = onaylı içerik.** Bir alanı boşaltırsan sitede eski, onaylı metin görünür.
- **Görsel seçilmezse onaylı görsel kalır.** Bir kartta "Görsel" alanı boşsa o kartın onaylı fotoğrafı gösterilir.
- **Sayfa blok editörüyle açılırsa** üstteki **Backend Editor** düğmesine bas.
- **Yanlış bir şey kaydettiysen** sayfanın düzenleme ekranında sağdaki **Sürümler** kutusundan önceki haline dönebilirsin.

---

## 4. Sayfa sayfa

### 4.1 Ana Sayfa (Sayfalar → Ana Sayfa)

Sekiz eleman alt alta durur. Sitedeki sıra paneldeki sıradır; bir elemanı sürükleyerek yerini değiştirebilir, silerek o bölümü siteden kaldırabilirsin.

| Eleman | Düzenlenebilenler |
|---|---|
| **Crayn — Hero** | Başlık (`\|` ile satırlara bölünür), kalın yazılacak kelimeler (virgülle), tanıtım metni, iki düğmenin yazısı ve adresi |
| **Crayn — Sistem Nerede Devreye Girer** | Başlık, açıklama, kartlar (etiket, başlık, metin, görsel) |
| **Crayn — Hizmetler** | Yalnızca bölümün başlığı ve açıklaması. **Kartlar buradan değil, "Hizmetler" bölümünden gelir** (4.4) |
| **Crayn — Neler Yapıyoruz** | Başlık, açıklama, kartlar (başlık, metin, görsel) |
| **Crayn — Referanslar** | Başlık, açıklama, koyu karttaki üç yazı, müşteri yorumları (yorum, ad soyad, görev/şirket, fotoğraf) |
| **Crayn — Hakkında** | Sırayla yazılan sloganlar, iki paragraf, üç kutu |
| **Crayn — İçerikler** | Başlık, açıklama, düğme. **Yazılar "Yazılar" bölümünden gelir**; en yeni üçü gösterilir |
| **Crayn — Sıkça Sorulan Sorular** | Başlık, yazılan satır, sorular ve cevaplar, alttaki satır |

### 4.2 Hakkımızda (Sayfalar → Hakkımızda)

Tek eleman: **Crayn — Hakkımızda sayfası**. İçinde dört kart var (Hakkımızda, Vizyon, Misyon, İletişim). Her kartta:

- **Başlık** ve **Metin** (her satır ayrı bir paragraf olur)
- **Görsel**
- **İletişim bilgileri eklensin mi:** "Evet" seçilirse metnin altına Tema Ayarları'ndaki e-posta, telefon ve adres eklenir
- **Bağlantı adresi / yazısı:** karttaki oku tıklanabilir yapar ve metnin altına bir bağlantı ekler

Kart eklenebilir, silinebilir, sıralanabilir.

### 4.3 Talep formu (Sayfalar → Talep)

Tek eleman: **Crayn — Talep formu**. Yedi sekmesi var:

| Sekme | İçinde |
|---|---|
| Genel | Üst yazı, sayfa başlığı, teşekkür ekranı, zorunlu alan uyarısı |
| 1. Adım | Hizmet seçenekleri, adım başlığı, soru |
| 2. Adım | Bütçe ve zamanlama seçenekleri, sorular, kutu ipuçları |
| 3. Adım | Sektör ve çalışan sayısı seçenekleri, sorular |
| 4. Adım | Ad, e-posta, telefon soruları ve onay kutusunun yazısı |
| Düğmeler | Geri, İleri, Gönder |
| Ek sorular | Forma eklenen yeni sorular |

**Seçenek listeleri** tek bir kutudur ve seçenekler `|` ile ayrılır. Yeni seçenek eklemek için araya yaz, kaldırmak için sil.

**Yeni soru eklemek:** "Ek sorular" sekmesinde satır ekle ve doldur:

| Alan | Açıklama |
|---|---|
| Soru | Formda görünen yazı |
| Hangi adımda sorulsun | 1–4 |
| Cevap türü | Kısa yazı, uzun yazı ya da seçim listesi |
| Seçenekler | Seçim listesi için, `\|` ile |
| Kutunun içindeki ipucu | Soluk yazı |
| Zorunlu mu | Evet seçilirse boş geçilemez |

Eklenen soru o adımın sonunda çıkar; cevabı Talepler'de sorunun kendi adıyla görünür. Listede WPBakery'nin kendiliğinden eklediği boş bir satır olabilir; sitede görünmez, zararsızdır.

### 4.4 Hizmetler

Altı hizmetin her biri ayrı bir kayıttır. Bir kayıt hem **hizmetin kendi sayfasını** hem de **ana sayfadaki kartını** besler.

- **Başlık** (en üstteki kutu): hizmetin adı. Ana sayfa kartında, hizmet sayfasında, tarayıcı sekmesinde ve görüşme kartındaki hizmet seçeneklerinde kullanılır.
- **Sıralama** (sağdaki "Yazı öznitelikleri" kutusu): hizmetlerin sitedeki sırası.

Her hizmette üç eleman vardır:

| Eleman | Düzenlenebilenler |
|---|---|
| **Crayn — Hizmet** | Etiket, tanıtım metni, etiketler, düğme yazısı, **ana sayfa kartının görseli ve rengi**, sekmeler (sekme adı, simge, alt satır, panel başlığı, maddeler, görsel) |
| **Crayn — Hizmet: Süreç** | "Nasıl ilerliyoruz?" başlığı, açıklama, adımlar |
| **Crayn — Hizmet: Diğer hizmetler** | Alttaki başlık ve açıklama |

Sekmelerde **Maddeler** alanına her satıra bir madde yazılır.

**Yeni hizmet eklemek:** Hizmetler → Yeni hizmet ekle → başlığı yaz → **Backend Editor** → üç elemanı ekle ("Crayn AI" kategorisinde) → doldur → Yayınla. Yeni hizmet ana sayfaya, Hizmetler listesine ve görüşme kartına kendiliğinden girer. En kolay yol, mevcut bir hizmeti açıp içeriğine bakarak aynısını kurmaktır.

### 4.5 Yazılar

Blog yazıları WordPress'in kendi **Yazılar** bölümünden yönetilir.

| Sitede | Panelde |
|---|---|
| Başlık | Yazının başlığı |
| Metin | Yazının içeriği (başlık, paragraf, liste kullanılabilir) |
| Kategori | Sağdaki "Kategoriler"; ilk kategori gösterilir |
| Tarih | Yayın tarihi |
| Özet | "Özet" alanı; boşsa metnin başından alınır |
| Görsel | "Öne çıkan görsel". Seçilmezse yan kutudaki "Görsel adresi"; o da boşsa onaylı yazılarda temadaki fotoğraf |
| Okuma süresi | Yan kutudaki "Okuma süresi"; boşsa metnin uzunluğundan hesaplanır |

Yeni yazı ana sayfadaki "İçerikler" bölümüne ve `/icerikler` sayfasına kendiliğinden girer.

### 4.6 Tema Ayarları (Görünüm → Tema Ayarları)

| Alan | Nerede görünür |
|---|---|
| Ana sayfa sekme başlığı | Tarayıcı sekmesi ve arama sonuçları |
| Arama motoru açıklaması | Arama sonuçları ve bağlantı paylaşımı |
| **Logo: simge** | Menü, footer, görüşme kartı, dönen düğme, açılış ekranı ve tarayıcı sekmesi. Kare, saydam zeminli PNG olmalı |
| **Logo: yazı** | Menü ve footer. **Saydam zemin üzerine beyaz** olmalı; açık renkli bölümlerde site onu kendisi siyaha çevirir |
| E-posta, Telefon, Adres | Footer, menü, Hakkımızda, SSS'nin altı |
| Taleplerin bildirileceği e-posta | Başvuru bildirimlerinin gideceği adres |
| Instagram, X, LinkedIn | Sosyal medya düğmeleri |
| Footer metinleri, menü alt satırı | Footer ve tam ekran menü |

Sayfanın üstünde "Son hata" kutusu çıkarsa temanın karşılaştığı son sorunu gösterir; geliştiriciye iletilmelidir.

### 4.7 Menüler (Görünüm → Menüler)

Dört menü hazır gelir:

| Menü | Konum |
|---|---|
| Ana Menü | Tam ekran menü |
| Crayn AI | Footer 1. sütun |
| Keşfet | Footer 2. sütun |
| İletişim | Footer 3. sütun |

- Footer'da **sütun başlığı, menünün adıdır.** Başlığı değiştirmek için menünün adını değiştir.
- "İletişim" menüsündeki **E-posta** ve **Telefon** maddelerinin adresi `#eposta` ve `#telefon`'dur. Site bunları Tema Ayarları'ndaki e-posta ve telefonla değiştirir. Bu iki maddeyi silme; telefon değişince yalnızca Tema Ayarları'nı güncellemen yeter.
- Sayfa içi bölümlere bağlantı: `/#services`, `/#solutions`, `/#cta` gibi.

### 4.8 Görüşme Kartı (Görünüm → Görüşme Kartı)

Her sayfanın sol altındaki "Demo planlayalım" kutusudur; tıklanınca üç adımlı kısa bir forma dönüşür. Sayfa, karttaki yazıları kartta göründükleri sırayla listeler. Soldaki yazı şu anki metindir; karşısındaki kutuya yazılan onun yerine geçer.

- Şıkların (E-ticaret, Ajans, 1 kişi, 2–10…) **yazısı** değiştirilebilir; şık eklenip çıkarılamaz.
- "Hangi hizmetle ilgileniyorsunuz?" seçenekleri buraya yazılmaz, **Hizmetler**'den gelir.
- En üstteki iki satır ("Küçült", "Görüşme planlayın") ekranda görünmez; ekran okuyucular içindir.

### 4.9 Site Metinleri (Görünüm → Site Metinleri)

Belirli bir sayfaya ait olmayan küçük yazılar:

| Grup | İçinde |
|---|---|
| Kartlar | "Devamını Oku →", "Detayları gör", "Görüşelim", "Adım" |
| Sağ alttaki dönen düğme | Düğmenin çevresindeki yazı |
| Menü | "Bize Ulaşın", "Menü", "Kapat", "İletişim Kurun", "Merkez" |
| Hizmet / İçerik sayfaları | Sayfa yolu etiketleri, liste başlıkları |
| 404 sayfası | "Aradığınız sayfa bulunamadı.", "Ana sayfaya dön" |

### 4.10 Talepler

Sitedeki iki formdan (talep formu ve görüşme kartı) gelen her başvuru burada ayrı bir kayıttır. Kaydı açınca cevaplar tablo halinde görünür: kaynak, gönderildiği sayfa, ad, e-posta, telefon, şirket, seçimler, ek soruların cevapları ve bildirim e-postasının gidip gitmediği.

Formların koruması: geçersiz e-postalı başvuru alınmaz; sayfa açıldıktan sonraki 3 saniye içinde gelen başvuru bot sayılır ve kaydedilmez; 10 dakikada en fazla 30 başvuru kabul edilir.

---

## 5. Sık yapılan işler

| Yapmak istediğin | Yol |
|---|---|
| Telefonu değiştirmek | Görünüm → Tema Ayarları → Telefon |
| Logoyu değiştirmek | Görünüm → Tema Ayarları → Logo → Görsel seç |
| Ana sayfa başlığını değiştirmek | Sayfalar → Ana Sayfa → Crayn — Hero |
| Müşteri yorumu eklemek | Sayfalar → Ana Sayfa → Crayn — Referanslar → Yorumlar → + |
| Soru-cevap eklemek | Sayfalar → Ana Sayfa → Crayn — Sıkça Sorulan Sorular → Sorular → + |
| Forma bütçe seçeneği eklemek | Sayfalar → Talep → 2. Adım sekmesi → Bütçe seçenekleri |
| Forma yeni soru eklemek | Sayfalar → Talep → Ek sorular sekmesi |
| Yeni blog yazısı | Yazılar → Yeni ekle |
| Yeni hizmet | Hizmetler → Yeni hizmet ekle (4.4) |
| Menüye madde eklemek | Görünüm → Menüler |
| Gelen başvuruları görmek | Talepler |

---

## 6. Yapılan işlerin özeti

1. **Kurulum.** WordPress `public_html/craynai` klasörüne elle kuruldu, veritabanı oluşturuldu, WPBakery etkinleştirildi.
2. **Tema.** Hazır tasarım, görünümü değiştirilmeden WordPress temasına çevrildi.
3. **Dinamikleştirme.** Ana sayfanın sekiz bölümü, Hakkımızda, talep formu, altı hizmet sayfası ve blog yazıları panelden yönetilir hale getirildi. İletişim bilgileri, logo, menüler ve küçük yazılar için ayar sayfaları eklendi.
4. **Formlar.** İki form gerçek gönderime bağlandı; başvurular panelde saklanıyor ve e-postayla bildiriliyor. Forma panelden soru eklenebiliyor.
5. **Görseller.** Sitedeki 40 fotoğraf dış kaynaktan alınıp temanın içine taşındı; site hiçbir görseli dışarıdan çekmiyor.
6. **Arama motorları (SEO).** Her sayfanın kendi sekme başlığı ve açıklaması var; bağlantı paylaşıldığında başlık, açıklama ve görsel çıkıyor; olmayan adresler "bulunamadı" kodu döndürüyor; sayfaların metni arama motorlarının okuyabileceği şekilde sayfa kaynağında da yer alıyor.
7. **Hız.** Her sayfa yalnızca kendi kodunu indiriyor (ana kod 670 KB'tan 265 KB'a indi); dosyalar tarayıcıda önbelleğe alınıyor.
8. **Sunucu temizliği.** Gereksiz dosyalar kaldırıldı, klasörlerin dışarıdan listelenmesi kapatıldı, yedek tema kuruldu.
9. **Test.** Paneldeki her düzenleme yeri canlı sitede tek tek denendi (deneme değeri yazıldı, sitede görüldü, eski haline döndürüldü). Form gönderimi tarayıcıdan test edildi.

---

## 7. Neler dinamik, neler sabit

**Panelden değişenler:** sitedeki bütün başlıklar, metinler, düğme yazıları, kartlar, yorumlar, sorular, form soruları ve seçenekleri, görseller, logo, menüler, iletişim bilgileri, hizmetler, yazılar.

**Bilerek sabit bırakılanlar:**

| Ne | Neden |
|---|---|
| Tasarım: renkler, yazı tipi, boşluklar, animasyonlar, 3D sahneler | Tasarımın kendisi; değişmesi için tema güncellenir |
| "Neler Yapıyoruz" kartlarının rengi | Tasarımın parçası |
| Hizmet sekmelerindeki simge listesi (18 simge) | Panelden hangisinin kullanılacağı seçilir; listeye yeni simge eklenemez |
| Görüşme kartındaki şık sayısı | Yazıları değişir, şık eklenip çıkarılamaz |
| Tarayıcı sekmesindeki sayfa adları ("Hizmetler \| Crayn AI", "Talep Formu \| Crayn AI") | Temada yazılı |
| Ekran okuyucu etiketleri ("Önceki yorum", "Yükleniyor"…) | Ekranda görünmez |

---

## 8. Tamamlanmayı bekleyen işler

Bunlar bilerek siteyi yönetecek kişiye bırakıldı.

### 8.1 Form e-postası kurulmalı (önemli)

FluentSMTP eklentisi yüklü ama içinde **e-posta bağlantısı yok.** Bu yüzden başvurular panelde Talepler'e düşüyor, **bildirim e-postası gitmiyor.** Sunucuda PHP'nin kendi e-posta gönderimi kapalı olduğu için bir SMTP hesabı bağlanması şart.

1. **Ayarlar → FluentSMTP** → bağlantı türü **Other SMTP**.
2. Gönderen e-posta, SMTP sunucusu, port, kullanıcı adı ve şifreyi gir. Hostingdeki bir hesap için: sunucu `mail.creodive.work`, port `465`, şifreleme SSL.
3. **E-posta Testi** sekmesinden deneme gönder.
4. **Görünüm → Tema Ayarları → "Taleplerin bildirileceği e-posta"** alanına bildirimlerin gideceği adresi yaz. (Şu an bir test adresi yazılı.)

Bağlantı kurulduktan sonra bir deneme başvurusu gönderip Talepler'deki kayıtta "Bildirim e-postası: Gönderildi" yazdığını kontrol et.

### 8.2 Gizlilik / KVKK metni yok

"Gizlilik Politikası" sayfası yayınlanmamış bir taslak; içinde yalnızca WordPress'in hazır şablonu var. Gerçek bir metin yazılmadı.

Talep formunun son adımındaki onay kutusunda "aydınlatma metnini okudum ve onaylıyorum" yazıyor, ama sitede böyle bir metin yok ve yazı bir yere bağlanmıyor. Metin eklenince bu cümlenin ona bağlanması gerekir (tema güncellemesi ister).

### 8.3 Alan adı

Site şu an `creodive.work/craynai` adresinde. `craynai.com` kullanılacaksa:

1. Alan adı alınır ve hostinge yönlendirilir.
2. cPanel'de alan adı eklenir; klasör olarak `public_html/craynai` gösterilir.
3. SSL sertifikası kurulur.
4. WordPress'in adresi yeni alan adına taşınır (veritabanındaki bağlantılarla birlikte). Menülerdeki bağlantılar tam adres içerdiği için bu adımda onlar da güncellenmelidir.
5. Eski `crayn.ai` adresi yenisine yönlendirilir.

### 8.4 Arama motorlarına açmak

Yayın günü: **Ayarlar → Okuma → "Arama motorlarının bu siteyi dizinlemesine engel ol"** kutusunun işaretini kaldır.

### 8.5 Diğer

- **WPBakery lisansı** etkin değil; eklenti çalışıyor ama otomatik güncelleme almıyor.
- **WordPress 7.1.3** güncellemesi bekliyor (Başlangıç → Güncellemeler).
- **Çöp kutuları:** Sayfalar ve Talepler'in çöpünde deneme kayıtları duruyor; istenirse boşaltılabilir.
- **Sosyal medya adresleri** girilmedi; düğmeler şimdilik bir yere gitmiyor (Tema Ayarları).

---

## 9. Teknik notlar

Geliştirici için.

- **Yapı.** Tema, derlenmiş bir React uygulamasını (`app/` klasörü) sayfaya yükler ve panelden girilen içeriği `window.CRAYN` adıyla ona verir. WPBakery elemanları sayfaya kendileri bir şey basmaz; doldurulan alanlar okunur ve bölümü uygulama çizer. Onaylı içerik `veri/` klasöründeki JSON dosyalarındadır.
- **Kaynak kod.** Proje klasöründe: `src/` uygulama, `tema/craynai/` tema, `src/data/*.json` onaylı içerik.
- **Tema dosyaları (`tema/craynai/inc/`):**

| Dosya | İşi |
|---|---|
| `elemanlar.php` | WPBakery elemanlarının tanımları (yeni alan buraya eklenir) |
| `bolumler.php` | Elemanların panele bağlanması ve okunması |
| `sayfalar.php` | İlk kurulumda sayfaların ve menülerin oluşturulması |
| `icerik.php`, `aktarim.php` | Hizmetler ve yazılar; onaylı içeriğin ilk aktarımı |
| `talep-formu.php`, `talepler.php` | Talep formu elemanı; başvuruların kaydı ve e-postası |
| `tema-ayarlari.php`, `metinler.php` | Ayar sayfaları |
| `seo.php` | Sayfa başlıkları, paylaşım etiketleri, 404 kodu, düz metin kopyası |
| `uygulama.php`, `rotalar.php` | Uygulamanın yüklenmesi; `/talep`, `/hizmetler/…` gibi adresler |

- **Temayı güncellemek.** `tema/craynai/style.css` içindeki `Version` artırılır → proje klasöründe `npm run build:wp` → `tema/craynai` klasörü, içinde `craynai/` klasörü olacak şekilde zip'lenir → Görünüm → Temalar → Yeni tema ekle → Tema yükle → "Etkin olanı yüklenenle değiştir". Panelde girilen içerik veritabanında durduğu için tema güncellemesinden etkilenmez.
- **Yedek tema.** Twenty Twenty-Five kurulu durmalı. Crayn AI teması bir hata verirse WordPress ona düşer; site kapanmaz.
- **Tema hata verirse.** Görünüm → Temalar'dan Twenty Twenty-Five etkinleştirilir; panele girilemiyorsa cPanel'de `wp-content/themes/craynai` klasörünün adı geçici olarak değiştirilir.
- **Sunucu.** `.htaccess` dosyasının başındaki `Options -Indexes` satırı klasörlerin dışarıdan listelenmesini engeller. `app/assets/.htaccess` tarayıcı önbelleğini ayarlar. Sunucu hızlı ardışık isteklerde adresi geçici olarak kısıtlayabilir.
- **E-posta.** Sunucuda PHP `mail()` kapalıdır; tema e-posta gönderemese de başvuruyu kaydeder ve ziyaretçiye hata göstermez.
