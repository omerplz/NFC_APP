# NFC Çocuk Takip Uygulaması

Çocuklarınızın NFC kartlarını (taşıt kartı ve banka kartı) okuyarak harcamalarını ve yolculuklarını takip edebileceğiniz mobil uygulama.

## Özellikler

✅ **NFC Kart Okuma** - Telefonunuzu karta yaklaştırarak okuma yapın  
✅ **Çocuk Yönetimi** - Birden fazla çocuk ekleyin ve yönetin  
✅ **Harcama Takibi** - Alışveriş, para çekme ve diğer işlemleri kaydedin  
✅ **Yolculuk Takibi** - Otobüs, metro, tramvay yolculuklarını takip edin  
✅ **Detaylı Geçmiş** - Tüm işlemleri tarih ve konum bilgisiyle görüntüleyin  
✅ **Offline Çalışma** - İnternet bağlantısı gerektirmez  

## Gereksinimler

- **Android Cihaz**: NFC özelliği olan Android telefon (Android 5.0+)
- **NFC Desteği**: Cihazınızda NFC özelliği aktif olmalı
- **Node.js**: v18 veya üzeri
- **React Native CLI**: React Native geliştirme ortamı

## Kurulum

### 1. Bağımlılıkları Yükleyin

```bash
npm install
```

### 2. Android Bağımlılıklarını Yükleyin

```bash
cd android
./gradlew clean
cd ..
```

### 3. Uygulamayı Çalıştırın

Metro bundler'ı başlatın:
```bash
npm start
```

Başka bir terminalde Android uygulamasını çalıştırın:
```bash
npm run android
```

## Kullanım

### 1. Çocuk Ekleme

- Ana ekranda sağ üstteki **+** butonuna tıklayın
- Çocuğun adını girin
- Kart tipini seçin (Taşıt Kartı / Banka Kartı)
- Kaydet butonuna tıklayın

### 2. Kart Okuma

- Ana ekranda çocuğun kartındaki **NFC** ikonuna tıklayın
- "Taramaya Başla" butonuna tıklayın
- Kartı telefonun arkasına yaklaştırın
- Kart okunduğunda işlem ekleme ekranı açılır

### 3. İşlem Ekleme

Kart okuduktan sonra:
- **Harcama** sekmesinde:
  - İşlem tipini seçin (Alışveriş, Para Çekme, vb.)
  - Tutarı girin
  - Konumu belirtin
  - Açıklama ekleyin (opsiyonel)
  
- **Yolculuk** sekmesinde:
  - Araç tipini seçin (Otobüs, Metro, vb.)
  - Nereden-Nereye bilgilerini girin
  - Hat/Araç numarasını ekleyin (opsiyonel)

### 4. Geçmişi Görüntüleme

- Ana ekranda çocuğun kartına tıklayın
- **Harcamalar** ve **Yolculuklar** sekmeleri arasında geçiş yapın
- Tüm işlemleri tarih sırasıyla görüntüleyin

## NFC Hakkında Önemli Bilgiler

⚠️ **Kart Uyumluluğu**: 
- Türkiye'deki İstanbulkart, Ankarakart gibi taşıt kartları
- Temassız (contactless) banka kartları
- NFC özellikli kartlar

⚠️ **Veri Sınırlaması**:
- NFC kartlardan sadece kart numarası ve temel bilgiler okunabilir
- Detaylı işlem geçmişi (nerede ne alındı) için manuel giriş gerekir
- Uygulama, kartı tanımlar ve sizin girdiğiniz bilgileri kaydeder

⚠️ **NFC Ayarları**:
- Telefonunuzun NFC özelliği açık olmalı
- Ayarlar > Bağlantılar > NFC yolunu takip edin
- Bazı telefonlarda "Android Beam" de aktif olmalı

## Proje Yapısı

```
NFC_APP/
├── src/
│   ├── components/        # UI bileşenleri
│   │   ├── ChildCard.js
│   │   ├── TransactionCard.js
│   │   └── TravelCard.js
│   ├── screens/          # Ekranlar
│   │   ├── HomeScreen.js
│   │   ├── ScanCardScreen.js
│   │   ├── AddTransactionScreen.js
│   │   ├── AddChildScreen.js
│   │   └── ChildDetailScreen.js
│   ├── database/         # Veritabanı
│   │   └── db.js
│   ├── utils/           # Yardımcı fonksiyonlar
│   │   ├── nfcHelper.js
│   │   └── formatters.js
│   └── constants/       # Sabitler
│       └── theme.js
├── android/             # Android yapılandırması
├── App.js              # Ana uygulama
└── package.json        # Bağımlılıklar
```

## Veritabanı

Uygulama SQLite kullanarak tüm verileri cihazda saklar:

- **children**: Çocuk bilgileri
- **transactions**: Harcama kayıtları
- **travels**: Yolculuk kayıtları

Tüm veriler cihazınızda güvenli şekilde saklanır ve internet gerektirmez.

## Sorun Giderme

### NFC Çalışmıyor
1. Telefon ayarlarından NFC'nin açık olduğunu kontrol edin
2. Kartı telefonun tam arkasına yaklaştırın
3. Kart ve telefon arasında metal nesne olmadığından emin olun

### Uygulama Açılmıyor
1. `npm install` komutunu tekrar çalıştırın
2. Android klasöründe `./gradlew clean` yapın
3. Metro bundler'ı yeniden başlatın

### Kart Okunamıyor
1. Kartın NFC özellikli olduğundan emin olun
2. Kartı farklı açılarda deneyin
3. Telefon kılıfını çıkarıp tekrar deneyin

## Güvenlik ve Gizlilik

- Tüm veriler sadece cihazınızda saklanır
- İnternet bağlantısı gerektirmez
- Hiçbir veri dışarı gönderilmez
- Kart bilgileri şifreli olarak saklanır

## Destek

Sorularınız için:
- GitHub Issues kullanın
- Detaylı hata raporları paylaşın
- Ekran görüntüleri ekleyin

## Lisans

Bu proje kişisel kullanım içindir.

---

**Not**: Bu uygulama sadece kart okuma ve manuel kayıt tutma amaçlıdır. Gerçek zamanlı banka/ulaşım sistemi entegrasyonu içermez.
