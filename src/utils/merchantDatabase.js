/**
 * İşletme/Lokasyon Veritabanı
 * Kart üzerindeki lokasyon kodlarını işletme adlarına çevirir
 */

// Türkiye geneli işletme kodları (genişletilmiş veri)
const MERCHANT_DATABASE = {
    // İSTANBUL - Ulaşım (0000-0999)
    '0001': 'Taksim Metro İstasyonu',
    '0002': 'Kadıköy İskele',
    '0003': 'Beşiktaş Vapur İskelesi',
    '0004': 'Mecidiyeköy Metro',
    '0005': 'Levent Metro',
    '0006': 'Şişli-Mecidiyeköy Metro',
    '0007': 'Osmanbey Metro',
    '0008': 'Eminönü Vapur İskelesi',
    '0009': 'Üsküdar İskele',
    '0010': 'Kabataş Tramvay',
    '0011': 'Karaköy Metro',
    '0012': 'Şişhane Metro',
    '0013': 'Haliç Metro Köprüsü',
    '0014': 'Yenikapı Metro',
    '0015': 'Aksaray Tramvay',
    '0016': 'Fatih Tramvay',
    '0017': 'Sultanahmet Tramvay',
    '0018': 'Gülhane Tramvay',
    '0019': 'Sirkeci Tramvay',
    '0020': 'Ataköy-Şirinevler Metro',

    // İSTANBUL - Marketler (1000-1999)
    '1001': 'Migros Taksim',
    '1002': 'CarrefourSA Kadıköy',
    '1003': 'A101 Beşiktaş',
    '1004': 'BİM Şişli',
    '1005': 'ŞOK Bakırköy',
    '1006': 'Migros Nişantaşı',
    '1007': 'Migros Bağdat Caddesi',
    '1008': 'CarrefourSA Mecidiyeköy',
    '1009': 'Migros Ataköy',
    '1010': 'BİM Kadıköy',
    '1011': 'ŞOK Beşiktaş',
    '1012': 'A101 Üsküdar',
    '1013': 'Migros Ümraniye',
    '1014': 'CarrefourSA Maltepe',
    '1015': 'Macro Center Bayrampaşa',
    '1016': 'Metro Gross Market',
    '1017': 'Kipa AVM',
    '1018': 'Real Hipermarket',
    '1019': 'Carrefour Cevahir AVM',
    '1020': 'Migros Akmerkez',

    // İSTANBUL - Restoranlar & Kafeler (2000-2999)
    '2001': 'McDonald\'s Taksim',
    '2002': 'Burger King Kadıköy',
    '2003': 'KFC Mecidiyeköy',
    '2004': 'Starbucks Nişantaşı',
    '2005': 'Kahve Dünyası Beşiktaş',
    '2006': 'Popeyes Bağdat Caddesi',
    '2007': 'Domino\'s Pizza Şişli',
    '2008': 'Pizza Hut Kadıköy',
    '2009': 'Subway Taksim',
    '2010': 'Arby\'s Mecidiyeköy',
    '2011': 'Gloria Jean\'s Coffees',
    '2012': 'Tchibo Cafe',
    '2013': 'Mado Taksim',
    '2014': 'Simit Sarayı İstiklal',
    '2015': 'Kahve Dünyası Kadıköy',
    '2016': 'Starbucks Bağdat Caddesi',
    '2017': 'Burger King Mecidiyeköy',
    '2018': 'McDonald\'s Kadıköy',
    '2019': 'KFC Taksim',
    '2020': 'Popeyes Ataköy',

    // İSTANBUL - Okullar & Kantinler (3000-3999)
    '3001': 'İstanbul Lisesi Kantini',
    '3002': 'Galatasaray Lisesi Kantini',
    '3003': 'Kabataş Erkek Lisesi Kantini',
    '3004': 'Kadıköy Anadolu Lisesi',
    '3005': 'Beşiktaş Atatürk Anadolu Lisesi',
    '3006': 'Üsküdar Amerikan Lisesi',
    '3007': 'Robert Kolej',
    '3008': 'İstanbul Erkek Lisesi',
    '3009': 'Işık Lisesi Kantini',
    '3010': 'Özel Tevfik Fikret Okulları',

    // ANKARA - Ulaşım (4000-4999)
    '4001': 'Kızılay Metro',
    '4002': 'Ulus Metro',
    '4003': 'Keçiören Metro',
    '4004': 'Tandoğan Metro',
    '4005': 'Sıhhiye Metro',
    '4006': 'Kurtulus Metro',
    '4007': 'Batıkent Metro',
    '4008': 'Çayyolu Metro',
    '4009': 'Dikimevi Metro',
    '4010': 'Kolej Metro',

    // ANKARA - Marketler (5000-5999)
    '5001': 'Migros Kızılay',
    '5002': 'CarrefourSA Ulus',
    '5003': 'A101 Keçiören',
    '5004': 'BİM Çankaya',
    '5005': 'ŞOK Batıkent',
    '5006': 'Migros Tunalı Hilmi',
    '5007': 'CarrefourSA Armada AVM',
    '5008': 'Migros Ankamall',
    '5009': 'A101 Bahçelievler',
    '5010': 'BİM Kızılay',

    // İZMİR - Ulaşım (6000-6999)
    '6001': 'Konak Metro',
    '6002': 'Alsancak İskele',
    '6003': 'Karşıyaka Vapur',
    '6004': 'Bornova Metro',
    '6005': 'Üçyol Metro',
    '6006': 'Basmane Metro',
    '6007': 'Hilal Metro',
    '6008': 'Halkapınar Metro',
    '6009': 'Stadyum Metro',
    '6010': 'Fahrettin Altay Metro',

    // İZMİR - Marketler (7000-7999)
    '7001': 'Migros Alsancak',
    '7002': 'CarrefourSA Konak',
    '7003': 'A101 Karşıyaka',
    '7004': 'BİM Bornova',
    '7005': 'ŞOK Buca',
    '7006': 'Migros Bornova',
    '7007': 'CarrefourSA Mavibahçe AVM',
    '7008': 'Kipa Bornova',
    '7009': 'Tansaş Karşıyaka',
    '7010': 'Migros Karşıyaka',

    // GENEL - ATM'ler (8000-8999)
    '8001': 'Garanti BBVA ATM',
    '8002': 'İş Bankası ATM',
    '8003': 'Akbank ATM',
    '8004': 'Yapı Kredi ATM',
    '8005': 'Ziraat Bankası ATM',
    '8006': 'Halkbank ATM',
    '8007': 'Vakıfbank ATM',
    '8008': 'QNB Finansbank ATM',
    '8009': 'Denizbank ATM',
    '8010': 'TEB ATM',
    '8011': 'ING Bank ATM',
    '8012': 'HSBC ATM',
    '8013': 'Kuveyt Türk ATM',
    '8014': 'Albaraka Türk ATM',
    '8015': 'Türkiye Finans ATM',

    // GENEL - Benzin İstasyonları (9000-9999)
    '9001': 'Shell Benzin İstasyonu',
    '9002': 'BP Benzin İstasyonu',
    '9003': 'Opet Benzin İstasyonu',
    '9004': 'Total Benzin İstasyonu',
    '9005': 'Petrol Ofisi',
    '9006': 'Aytemiz Akaryakıt',
    '9007': 'Alpet Akaryakıt',
    '9008': 'Lukoil Akaryakıt',
    '9009': 'TP Petrol',
    '9010': 'Moil Akaryakıt',

    // AVM'ler & Alışveriş Merkezleri (A000-A999 hex: 40960-43007)
    'a001': 'Cevahir AVM İstanbul',
    'a002': 'Zorlu Center',
    'a003': 'İstinye Park',
    'a004': 'Kanyon AVM',
    'a005': 'Akmerkez',
    'a006': 'Capacity AVM',
    'a007': 'Marmara Forum',
    'a008': 'Palladium AVM',
    'a009': 'Carousel AVM',
    'a010': 'Watergarden İstanbul',
    'a011': 'Ankamall Ankara',
    'a012': 'Armada AVM Ankara',
    'a013': 'Mavibahçe AVM İzmir',
    'a014': 'Forum Bornova',
    'a015': 'Optimum Outlet',

    // Eczaneler (B000-B999 hex: 45056-49151)
    'b001': 'Eczane',
    'b002': 'Şifa Eczanesi',
    'b003': 'Sağlık Eczanesi',

    // Sinemalar (C000-C999 hex: 49152-53247)
    'c001': 'Cinemaximum',
    'c002': 'CinePink',
    'c003': 'Cinepol',
    'c004': 'Prestige Sinema',
    'c005': 'AFM Sinema',
};

/**
 * Lokasyon kodunu işletme adına çevir
 */
export const getMerchantName = (locationCode) => {
    if (!locationCode) return 'Bilinmeyen Lokasyon';

    // Hex kodu 4 haneli sayıya çevir
    const code = locationCode.substring(0, 4);

    // Veritabanında ara
    const merchantName = MERCHANT_DATABASE[code];

    if (merchantName) {
        return merchantName;
    }

    // Bulunamadıysa, kod tipine göre genel isim ver
    const firstDigit = code[0];

    switch (firstDigit) {
        case '0':
            return `Metro/Ulaşım İstasyonu (${code})`;
        case '1':
            return `Market (${code})`;
        case '2':
            return `Restoran/Kafe (${code})`;
        case '3':
            return `Okul/Kantin (${code})`;
        case '4':
        case '5':
        case '6':
        case '7':
            return `Mağaza (${code})`;
        case '8':
            return `ATM (${code})`;
        case '9':
            return `Benzin İstasyonu (${code})`;
        default:
            return `İşletme (${code})`;
    }
};

/**
 * Yeni işletme ekle (kullanıcı kendi veritabanını genişletebilir)
 */
export const addMerchant = (locationCode, merchantName) => {
    const code = locationCode.substring(0, 4);
    MERCHANT_DATABASE[code] = merchantName;
    // Gerçek uygulamada bu SQLite'a kaydedilmeli
};

/**
 * Tüm işletmeleri getir
 */
export const getAllMerchants = () => {
    return MERCHANT_DATABASE;
};

/**
 * İşletme ara
 */
export const searchMerchants = (query) => {
    const results = [];
    const lowerQuery = query.toLowerCase();

    for (const [code, name] of Object.entries(MERCHANT_DATABASE)) {
        if (name.toLowerCase().includes(lowerQuery) || code.includes(query)) {
            results.push({ code, name });
        }
    }

    return results;
};
