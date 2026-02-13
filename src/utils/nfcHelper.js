import NfcManager, { NfcTech, Ndef, NfcAdapter } from 'react-native-nfc-manager';
import { Platform } from 'react-native';

/**
 * NFC Manager'ı başlat
 */
export const initNFC = async () => {
    try {
        const supported = await NfcManager.isSupported();
        if (supported) {
            await NfcManager.start();
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error initializing NFC:', error);
        return false;
    }
};

/**
 * Gelişmiş NFC okuma - Kart tipine göre veri çıkarma
 */
export const readNFCAdvanced = async () => {
    try {
        // Önce tag'i keşfet
        await NfcManager.requestTechnology(NfcTech.Ndef);
        const tag = await NfcManager.getTag();

        console.log('Tag detected:', tag);

        // Kart numarası
        const cardNumber = bytesToHexString(tag.id);
        const techTypes = tag.techTypes || [];

        let cardData = {
            success: true,
            cardNumber: cardNumber,
            techTypes: techTypes,
            transactions: [],
            balance: null,
            cardType: 'Unknown'
        };

        // MIFARE Classic/Ultralight kontrolü (Taşıt kartları - İstanbulkart)
        if (techTypes.includes('android.nfc.tech.MifareClassic') ||
            techTypes.includes('android.nfc.tech.MifareUltralight')) {
            console.log('MIFARE card detected');
            await NfcManager.cancelTechnologyRequest();
            const mifareData = await readMifareCard();
            cardData = { ...cardData, ...mifareData, cardType: 'Taşıt Kartı (İstanbulkart)' };
        }
        // ISO-DEP kontrolü (DESFire veya EMV kartlar)
        else if (techTypes.includes('android.nfc.tech.IsoDep')) {
            console.log('ISO-DEP card detected');
            await NfcManager.cancelTechnologyRequest();

            // Önce DESFire dene (Paracard, yemek kartları)
            const desfireData = await readDESFireCard();
            if (desfireData && desfireData.transactions && desfireData.transactions.length > 0) {
                cardData = { ...cardData, ...desfireData, cardType: 'Ön Ödemeli Kart (Paracard)' };
            } else {
                // DESFire değilse EMV dene (normal banka kartları)
                const emvData = await readEMVCard();
                cardData = { ...cardData, ...emvData, cardType: 'Banka Kartı' };
            }
        }
        // NDEF kontrolü
        else if (tag.ndefMessage && tag.ndefMessage.length > 0) {
            const ndefData = parseNdefMessage(tag.ndefMessage);
            cardData.ndefData = ndefData;
        }

        return cardData;
    } catch (error) {
        console.error('Error reading NFC:', error);
        return {
            success: false,
            error: error.message
        };
    } finally {
        try {
            await NfcManager.cancelTechnologyRequest();
        } catch (e) { }
    }
};

/**
 * MIFARE kartını oku (Taşıt kartları - İstanbulkart, Ankarakart vb.)
 */
const readMifareCard = async () => {
    try {
        if (Platform.OS !== 'android') {
            return { error: 'MIFARE okuma sadece Android\'de desteklenir' };
        }

        await NfcManager.requestTechnology(NfcTech.MifareClassic);
        const tag = await NfcManager.getTag();

        // MIFARE Classic için sektör okuma
        const MifareClassic = NfcManager.mifareClassicHandlerAndroid;

        let balance = null;
        let transactions = [];

        try {
            // Varsayılan anahtarlarla kimlik doğrulama
            const defaultKeyA = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF];
            const defaultKeyB = [0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF];

            // Sektör 1'i oku (genelde bakiye burada)
            let authenticated = await MifareClassic.mifareClassicAuthenticateA(1, defaultKeyA);

            if (authenticated) {
                // Blok 4'ü oku (bakiye bloğu)
                const block4 = await MifareClassic.mifareClassicReadBlock(4);
                if (block4) {
                    balance = parseMifareBalance(block4);
                }

                // Blok 5 ve 6'yı oku (işlem geçmişi)
                const block5 = await MifareClassic.mifareClassicReadBlock(5);
                const block6 = await MifareClassic.mifareClassicReadBlock(6);

                if (block5) {
                    const trans = parseMifareTransaction(block5);
                    if (trans) transactions.push(trans);
                }
                if (block6) {
                    const trans = parseMifareTransaction(block6);
                    if (trans) transactions.push(trans);
                }
            }

            // Sektör 2'yi oku (daha fazla işlem)
            authenticated = await MifareClassic.mifareClassicAuthenticateA(2, defaultKeyA);
            if (authenticated) {
                for (let i = 8; i <= 10; i++) {
                    const block = await MifareClassic.mifareClassicReadBlock(i);
                    if (block) {
                        const trans = parseMifareTransaction(block);
                        if (trans) transactions.push(trans);
                    }
                }
            }

        } catch (authError) {
            console.log('Authentication failed, trying alternative keys');
            // Alternatif anahtarlar deneyebiliriz
        }

        return {
            balance: balance,
            transactions: transactions.filter(t => t !== null),
            cardType: 'Taşıt Kartı'
        };

    } catch (error) {
        console.error('Error reading MIFARE card:', error);
        return {
            error: 'MIFARE kart okunamadı',
            transactions: [],
            balance: null
        };
    }
};

/**
 * MIFARE DESFire kartını oku (Paracard, yemek kartları vb.)
 */
const readDESFireCard = async () => {
    try {
        if (Platform.OS !== 'android') {
            return { error: 'DESFire okuma sadece Android\'de desteklenir' };
        }

        await NfcManager.requestTechnology(NfcTech.IsoDep);
        const IsoDep = NfcManager.isoDepHandler;

        let balance = null;
        let transactions = [];

        try {
            // SELECT Master Application (AID: 000000)
            const selectMaster = [0x90, 0x5A, 0x00, 0x00, 0x03, 0x00, 0x00, 0x00, 0x00];
            let response = await IsoDep.transceive(selectMaster);
            console.log('DESFire Master Select:', bytesToHexString(response));

            // GET APPLICATION IDs
            const getAppIds = [0x90, 0x6A, 0x00, 0x00, 0x00];
            response = await IsoDep.transceive(getAppIds);
            console.log('DESFire App IDs:', bytesToHexString(response));

            if (response && response.length >= 3) {
                // İlk uygulamayı seç (genelde işlem geçmişi burada)
                const appId = [response[0], response[1], response[2]];
                const selectApp = [0x90, 0x5A, 0x00, 0x00, 0x03, ...appId, 0x00];
                response = await IsoDep.transceive(selectApp);
                console.log('DESFire App Select:', bytesToHexString(response));

                // GET FILE IDs
                const getFileIds = [0x90, 0x6F, 0x00, 0x00, 0x00];
                response = await IsoDep.transceive(getFileIds);
                console.log('DESFire File IDs:', bytesToHexString(response));

                if (response && response.length > 0) {
                    // Her dosyayı oku
                    for (let i = 0; i < response.length - 2; i++) {
                        const fileId = response[i];

                        try {
                            // GET FILE SETTINGS
                            const getSettings = [0x90, 0xF5, 0x00, 0x00, 0x01, fileId, 0x00];
                            const settings = await IsoDep.transceive(getSettings);
                            console.log(`File ${fileId} Settings:`, bytesToHexString(settings));

                            // Dosya tipini kontrol et
                            if (settings && settings.length > 1) {
                                const fileType = settings[0];

                                // 0x04 = Cyclic Record File (işlem geçmişi)
                                // 0x01 = Value File (bakiye)
                                if (fileType === 0x04) {
                                    // Cyclic Record File - İşlem geçmişi
                                    const recordSize = settings[4] | (settings[5] << 8) | (settings[6] << 16);
                                    const maxRecords = settings[7] | (settings[8] << 8) | (settings[9] << 16);

                                    console.log(`Cyclic File: ${maxRecords} records of ${recordSize} bytes`);

                                    // Tüm kayıtları oku
                                    for (let recordNum = 0; recordNum < maxRecords; recordNum++) {
                                        try {
                                            const readRecord = [0x90, 0xBB, 0x00, 0x00, 0x07,
                                                fileId, 0x00, 0x00, 0x00,
                                                recordNum, 0x00, 0x00, 0x00];
                                            const recordData = await IsoDep.transceive(readRecord);

                                            if (recordData && recordData.length >= recordSize) {
                                                const trans = parseDESFireTransaction(recordData, recordSize);
                                                if (trans) transactions.push(trans);
                                            }
                                        } catch (e) {
                                            // Bu kayıt okunamadı, devam et
                                            break;
                                        }
                                    }
                                } else if (fileType === 0x01) {
                                    // Value File - Bakiye
                                    try {
                                        const getValue = [0x90, 0x6C, 0x00, 0x00, 0x01, fileId, 0x00];
                                        const valueData = await IsoDep.transceive(getValue);

                                        if (valueData && valueData.length >= 4) {
                                            balance = parseDESFireBalance(valueData);
                                        }
                                    } catch (e) {
                                        console.log('Balance read failed');
                                    }
                                }
                            }
                        } catch (fileError) {
                            console.log(`File ${fileId} read error:`, fileError);
                        }
                    }
                }
            }

        } catch (error) {
            console.error('DESFire communication error:', error);
            // DESFire değil, null dön
            return null;
        }

        // Eğer işlem bulunduysa DESFire kartıdır
        if (transactions.length > 0 || balance !== null) {
            return {
                balance: balance,
                transactions: transactions.filter(t => t !== null),
                cardType: 'DESFire Kart'
            };
        }

        return null;

    } catch (error) {
        console.error('Error reading DESFire card:', error);
        return null;
    }
};

/**
 * DESFire bakiyesini parse et
 */
const parseDESFireBalance = (data) => {
    try {
        if (data && data.length >= 4) {
            // Little-endian 32-bit signed integer
            const balance = (data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24));
            // Kuruş cinsinden TL'ye çevir
            return balance / 100;
        }
    } catch (error) {
        console.error('Error parsing DESFire balance:', error);
    }
    return null;
};

/**
 * DESFire işlemini parse et (16 byte standart format)
 */
const parseDESFireTransaction = (data, recordSize) => {
    try {
        if (!data || data.length < 16) return null;

        // Boş kayıt kontrolü
        const isEmpty = data.slice(0, recordSize).every(byte => byte === 0x00 || byte === 0xFF);
        if (isEmpty) return null;

        // Standart DESFire işlem formatı:
        // Byte 0-3: Merchant/Location ID (4 bytes)
        const locationId = (data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24));
        const locationCode = locationId.toString(16).padStart(8, '0').toUpperCase();

        // Byte 4-11: Timestamp (8 bytes) - Unix timestamp veya özel format
        const timestamp = Number(
            BigInt(data[4]) |
            (BigInt(data[5]) << 8n) |
            (BigInt(data[6]) << 16n) |
            (BigInt(data[7]) << 24n) |
            (BigInt(data[8]) << 32n) |
            (BigInt(data[9]) << 40n) |
            (BigInt(data[10]) << 48n) |
            (BigInt(data[11]) << 56n)
        );

        // Timestamp'i tarihe çevir
        let date;
        if (timestamp > 1000000000 && timestamp < 9999999999) {
            // Unix timestamp (saniye)
            date = new Date(timestamp * 1000);
        } else if (timestamp > 1000000000000) {
            // Unix timestamp (milisaniye)
            date = new Date(Number(timestamp));
        } else {
            // Özel format - BCD veya başka
            // Basit yaklaşım: şimdiki zaman
            date = new Date();
        }

        // Byte 12-15: Amount (4 bytes) - Signed integer, kuruş cinsinden
        const amount = (data[12] | (data[13] << 8) | (data[14] << 16) | (data[15] << 24));
        const amountTL = Math.abs(amount) / 100;

        // İşlem tipi (pozitif = yükleme, negatif = harcama)
        const transactionType = amount < 0 ? 'Harcama' : 'Yükleme';

        return {
            type: transactionType,
            amount: amountTL,
            date: date.toISOString(),
            locationCode: locationCode.substring(0, 4), // İlk 4 hane
            timestamp: timestamp,
            rawData: bytesToHexString(data.slice(0, recordSize))
        };
    } catch (error) {
        console.error('Error parsing DESFire transaction:', error);
        return null;
    }
};

/**
 * EMV kartını oku (Banka kartları)
 */
const readEMVCard = async () => {
    try {
        if (Platform.OS !== 'android') {
            return { error: 'EMV okuma sadece Android\'de desteklenir' };
        }

        await NfcManager.requestTechnology(NfcTech.IsoDep);
        const tag = await NfcManager.getTag();

        const IsoDep = NfcManager.isoDepHandler;
        const transactions = [];
        let balance = null;

        try {
            // SELECT PPSE (Proximity Payment System Environment)
            const selectPPSE = [0x00, 0xA4, 0x04, 0x00, 0x0E,
                0x32, 0x50, 0x41, 0x59, 0x2E, 0x53, 0x59, 0x53, 0x2E, 0x44, 0x44, 0x46, 0x30, 0x31, 0x00];

            const ppseResponse = await IsoDep.transceive(selectPPSE);
            console.log('PPSE Response:', bytesToHexString(ppseResponse));

            // SELECT AID (Application Identifier)
            // Visa: A0000000031010
            // Mastercard: A0000000041010
            const selectAID = [0x00, 0xA4, 0x04, 0x00, 0x07, 0xA0, 0x00, 0x00, 0x00, 0x03, 0x10, 0x10, 0x00];
            const aidResponse = await IsoDep.transceive(selectAID);
            console.log('AID Response:', bytesToHexString(aidResponse));

            // GET PROCESSING OPTIONS
            const gpo = [0x80, 0xA8, 0x00, 0x00, 0x02, 0x83, 0x00, 0x00];
            const gpoResponse = await IsoDep.transceive(gpo);
            console.log('GPO Response:', bytesToHexString(gpoResponse));

            // READ RECORD - Son işlemler
            for (let sfi = 1; sfi <= 5; sfi++) {
                for (let record = 1; record <= 10; record++) {
                    try {
                        const readRecord = [0x00, 0xB2, record, (sfi << 3) | 0x04, 0x00];
                        const recordData = await IsoDep.transceive(readRecord);

                        if (recordData && recordData.length > 2) {
                            const trans = parseEMVTransaction(recordData);
                            if (trans) transactions.push(trans);
                        }
                    } catch (e) {
                        // Bu kayıt yok, devam et
                        break;
                    }
                }
            }

            // GET DATA - Bakiye
            try {
                const getBalance = [0x80, 0xCA, 0x9F, 0x79, 0x00];
                const balanceData = await IsoDep.transceive(getBalance);
                if (balanceData) {
                    balance = parseEMVBalance(balanceData);
                }
            } catch (e) {
                console.log('Balance not available');
            }

        } catch (error) {
            console.error('EMV communication error:', error);
        }

        return {
            balance: balance,
            transactions: transactions.filter(t => t !== null),
            cardType: 'Banka Kartı'
        };

    } catch (error) {
        console.error('Error reading EMV card:', error);
        return {
            error: 'EMV kart okunamadı',
            transactions: [],
            balance: null
        };
    }
};

/**
 * MIFARE bakiyesini parse et
 */
const parseMifareBalance = (data) => {
    try {
        // Bakiye genelde 4 byte little-endian formatında
        if (data && data.length >= 4) {
            const balance = (data[0] | (data[1] << 8) | (data[2] << 16) | (data[3] << 24));
            // Kuruş cinsinden, TL'ye çevir
            return balance / 100;
        }
    } catch (error) {
        console.error('Error parsing MIFARE balance:', error);
    }
    return null;
};

/**
 * MIFARE işlemini parse et
 */
const parseMifareTransaction = (data) => {
    try {
        if (!data || data.length < 16) return null;

        // Boş blok kontrolü
        const isEmpty = data.every(byte => byte === 0x00 || byte === 0xFF);
        if (isEmpty) return null;

        // İşlem tipi (byte 0)
        const transType = data[0];
        let transactionType = 'Ulaşım';

        if (transType === 0x01) transactionType = 'Biniş';
        else if (transType === 0x02) transactionType = 'İniş';
        else if (transType === 0x03) transactionType = 'Transfer';

        // Tutar (byte 1-4)
        const amount = (data[1] | (data[2] << 8) | (data[3] << 16) | (data[4] << 24)) / 100;

        // Tarih (byte 5-8) - Unix timestamp veya özel format
        const timestamp = data[5] | (data[6] << 8) | (data[7] << 16) | (data[8] << 24);
        const date = timestamp > 0 ? new Date(timestamp * 1000) : new Date();

        // Lokasyon kodu (byte 9-12)
        const locationCode = bytesToHexString(data.slice(9, 13));

        return {
            type: transactionType,
            amount: amount > 0 ? amount : null,
            date: date.toISOString(),
            locationCode: locationCode,
            rawData: bytesToHexString(data)
        };
    } catch (error) {
        console.error('Error parsing MIFARE transaction:', error);
        return null;
    }
};

/**
 * EMV işlemini parse et
 */
const parseEMVTransaction = (data) => {
    try {
        if (!data || data.length < 10) return null;

        // TLV formatında veri parse et
        let amount = null;
        let date = null;
        let currency = 'TRY';

        // Tag 9F02: Amount
        const amountTag = findTLVTag(data, [0x9F, 0x02]);
        if (amountTag) {
            amount = parseInt(bytesToHexString(amountTag), 10) / 100;
        }

        // Tag 9A: Transaction Date (YYMMDD)
        const dateTag = findTLVTag(data, [0x9A]);
        if (dateTag && dateTag.length === 3) {
            const year = 2000 + dateTag[0];
            const month = dateTag[1] - 1;
            const day = dateTag[2];
            date = new Date(year, month, day).toISOString();
        }

        // Tag 9F21: Transaction Time (HHMMSS)
        const timeTag = findTLVTag(data, [0x9F, 0x21]);
        if (timeTag && date) {
            const hours = timeTag[0];
            const minutes = timeTag[1];
            const seconds = timeTag[2];
            const dateObj = new Date(date);
            dateObj.setHours(hours, minutes, seconds);
            date = dateObj.toISOString();
        }

        if (!amount && !date) return null;

        return {
            type: 'Kart İşlemi',
            amount: amount,
            date: date || new Date().toISOString(),
            currency: currency,
            rawData: bytesToHexString(data)
        };
    } catch (error) {
        console.error('Error parsing EMV transaction:', error);
        return null;
    }
};

/**
 * EMV bakiyesini parse et
 */
const parseEMVBalance = (data) => {
    try {
        if (data && data.length >= 6) {
            const balance = parseInt(bytesToHexString(data.slice(0, 6)), 10) / 100;
            return balance;
        }
    } catch (error) {
        console.error('Error parsing EMV balance:', error);
    }
    return null;
};

/**
 * TLV tag bul
 */
const findTLVTag = (data, tag) => {
    try {
        for (let i = 0; i < data.length - 1; i++) {
            let match = true;
            for (let j = 0; j < tag.length; j++) {
                if (data[i + j] !== tag[j]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                const length = data[i + tag.length];
                return data.slice(i + tag.length + 1, i + tag.length + 1 + length);
            }
        }
    } catch (error) {
        console.error('Error finding TLV tag:', error);
    }
    return null;
};

/**
 * NFC okumayı iptal et
 */
export const cancelNFC = async () => {
    try {
        await NfcManager.cancelTechnologyRequest();
    } catch (error) {
        console.error('Error canceling NFC:', error);
    }
};

/**
 * Byte dizisini hex string'e çevir
 */
const bytesToHexString = (bytes) => {
    if (!bytes) return '';
    if (typeof bytes === 'string') return bytes;
    return Array.from(bytes).map(byte => {
        return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('').toUpperCase();
};

/**
 * NDEF mesajını parse et
 */
const parseNdefMessage = (ndefMessage) => {
    try {
        const records = [];

        for (let record of ndefMessage) {
            const payload = Ndef.text.decodePayload(record.payload);
            records.push({
                type: record.type,
                payload: payload
            });
        }

        return records;
    } catch (error) {
        console.error('Error parsing NDEF message:', error);
        return null;
    }
};

/**
 * NFC etkin mi kontrol et
 */
export const isNFCEnabled = async () => {
    try {
        const enabled = await NfcManager.isEnabled();
        return enabled;
    } catch (error) {
        console.error('Error checking NFC status:', error);
        return false;
    }
};

/**
 * NFC ayarlarını aç
 */
export const openNFCSettings = async () => {
    try {
        await NfcManager.goToNfcSetting();
    } catch (error) {
        console.error('Error opening NFC settings:', error);
    }
};

// Geriye uyumluluk için eski fonksiyon
export const readNFC = readNFCAdvanced;
