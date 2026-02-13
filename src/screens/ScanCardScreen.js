import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    Animated,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { readNFC, cancelNFC } from '../utils/nfcHelper';
import { getChildByCardNumber, addTransaction, addTravel } from '../database/db';
import { getMerchantName } from '../utils/merchantDatabase';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

/**
 * NFC Kart Okuma Ekranı
 */
const ScanCardScreen = ({ navigation, route }) => {
    const { child } = route.params || {};
    const [scanning, setScanning] = useState(false);
    const [scaleAnim] = useState(new Animated.Value(1));

    // Animasyon başlat
    const startPulseAnimation = () => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(scaleAnim, {
                    toValue: 1.2,
                    duration: 1000,
                    useNativeDriver: true,
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 1000,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    };

    // Kart okumayı başlat
    const handleScan = async () => {
        try {
            setScanning(true);
            startPulseAnimation();

            const result = await readNFC();

            if (result.success) {
                // Kartı okunan çocuğu bul
                let scannedChild = child;

                if (!scannedChild) {
                    scannedChild = await getChildByCardNumber(result.cardNumber);
                }

                if (!scannedChild) {
                    // Kart tanımlı değil
                    Alert.alert(
                        'Kart Tanımlı Değil',
                        'Bu kart henüz bir çocuğa tanımlanmamış. Önce çocuk ekleyin.',
                        [
                            {
                                text: 'Çocuk Ekle',
                                onPress: () => navigation.navigate('AddChild', { cardNumber: result.cardNumber }),
                            },
                            { text: 'İptal', style: 'cancel' },
                        ]
                    );
                    return;
                }

                // Karttan okunan verileri kaydet
                let savedCount = 0;

                // Bakiye varsa göster
                if (result.balance !== null && result.balance !== undefined) {
                    Alert.alert(
                        'Bakiye',
                        `Kart Bakiyesi: ${result.balance.toFixed(2)} ₺`,
                        [{ text: 'Tamam' }]
                    );
                }

                // İşlemleri kaydet
                if (result.transactions && result.transactions.length > 0) {
                    for (const trans of result.transactions) {
                        try {
                            // Lokasyon kodunu işletme adına çevir
                            const merchantName = trans.locationCode ? getMerchantName(trans.locationCode) : 'Bilinmiyor';

                            // İşlem tipine göre kaydet
                            if (trans.type && (trans.type.includes('Ulaşım') || trans.type.includes('Biniş') || trans.type.includes('İniş'))) {
                                // Yolculuk olarak kaydet
                                await addTravel(
                                    scannedChild.id,
                                    merchantName,
                                    'Varış',
                                    trans.type,
                                    trans.locationCode || ''
                                );
                            } else {
                                // Harcama olarak kaydet
                                await addTransaction(
                                    scannedChild.id,
                                    trans.type || 'Kart İşlemi',
                                    trans.amount || 0,
                                    merchantName, // İşletme adı
                                    trans.date ? `Tarih: ${new Date(trans.date).toLocaleString('tr-TR')}` : '',
                                    result.cardNumber
                                );
                            }
                            savedCount++;
                        } catch (error) {
                            console.error('Error saving transaction:', error);
                        }
                    }
                }
                // Sonuç mesajı
                if (savedCount > 0) {
                    Alert.alert(
                        'Başarılı!',
                        `${scannedChild.name} için ${savedCount} işlem kaydedildi.\n\n` +
                        `Kart Tipi: ${result.cardType}\n` +
                        (result.balance ? `Bakiye: ${result.balance.toFixed(2)} ₺` : ''),
                        [
                            {
                                text: 'Detayları Gör',
                                onPress: () => navigation.navigate('ChildDetail', { child: scannedChild }),
                            },
                            {
                                text: 'Ana Sayfa',
                                onPress: () => navigation.navigate('Home'),
                            },
                        ]
                    );
                } else {
                    // İşlem bulunamadı, manuel ekleme seçeneği sun
                    Alert.alert(
                        'Kart Okundu',
                        `${scannedChild.name} kartı tanındı.\n\n` +
                        `Kart Tipi: ${result.cardType}\n` +
                        (result.balance ? `Bakiye: ${result.balance.toFixed(2)} ₺\n\n` : '') +
                        'Karttan işlem geçmişi okunamadı. Manuel olarak eklemek ister misiniz?',
                        [
                            {
                                text: 'Manuel Ekle',
                                onPress: () => navigation.navigate('AddTransaction', {
                                    child: scannedChild,
                                    cardData: result,
                                }),
                            },
                            {
                                text: 'Ana Sayfa',
                                onPress: () => navigation.navigate('Home'),
                            },
                        ]
                    );
                }
            } else {
                Alert.alert('Hata', 'Kart okunamadı. Lütfen tekrar deneyin.\n\n' + (result.error || ''));
            }
        } catch (error) {
            console.error('Error scanning card:', error);
            Alert.alert('Hata', 'Kart okuma sırasında bir hata oluştu.');
        } finally {
            setScanning(false);
            scaleAnim.setValue(1);
        }
    };

    // Geri dön
    const handleBack = async () => {
        if (scanning) {
            await cancelNFC();
        }
        navigation.goBack();
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <View style={styles.header}>
                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.surface} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Kart Tara</Text>
                <View style={styles.placeholder} />
            </View>

            <View style={styles.content}>
                {child && (
                    <View style={styles.childInfo}>
                        <Icon name="account" size={40} color={COLORS.primary} />
                        <Text style={styles.childName}>{child.name}</Text>
                        <Text style={styles.childCardType}>{child.card_type}</Text>
                    </View>
                )}

                <Animated.View
                    style={[
                        styles.scanArea,
                        { transform: [{ scale: scaleAnim }] }
                    ]}>
                    <Icon
                        name="nfc"
                        size={120}
                        color={scanning ? COLORS.primary : COLORS.textLight}
                    />
                </Animated.View>

                <Text style={styles.instruction}>
                    {scanning
                        ? 'Kartı telefonun arkasına yaklaştırın...'
                        : 'Taramaya başlamak için butona tıklayın'}
                </Text>

                <TouchableOpacity
                    style={[
                        styles.scanButton,
                        scanning && styles.scanButtonActive
                    ]}
                    onPress={handleScan}
                    disabled={scanning}>
                    {scanning ? (
                        <ActivityIndicator size="large" color={COLORS.surface} />
                    ) : (
                        <>
                            <Icon name="nfc-search-variant" size={32} color={COLORS.surface} />
                            <Text style={styles.scanButtonText}>Taramaya Başla</Text>
                        </>
                    )}
                </TouchableOpacity>

                <View style={styles.tips}>
                    <Text style={styles.tipsTitle}>İpuçları:</Text>
                    <View style={styles.tip}>
                        <Icon name="information" size={16} color={COLORS.info} />
                        <Text style={styles.tipText}>
                            Kartı telefonun arka tarafına yaklaştırın
                        </Text>
                    </View>
                    <View style={styles.tip}>
                        <Icon name="information" size={16} color={COLORS.info} />
                        <Text style={styles.tipText}>
                            Kart okununca titreşim hissedeceksiniz
                        </Text>
                    </View>
                    <View style={styles.tip}>
                        <Icon name="information" size={16} color={COLORS.info} />
                        <Text style={styles.tipText}>
                            NFC özelliğinin açık olduğundan emin olun
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: SIZES.paddingMedium,
        paddingVertical: SIZES.paddingMedium,
        backgroundColor: COLORS.primary,
    },
    backButton: {
        padding: SIZES.paddingSmall,
    },
    headerTitle: {
        fontSize: SIZES.fontXLarge,
        fontWeight: 'bold',
        color: COLORS.surface,
    },
    placeholder: {
        width: 40,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        paddingHorizontal: SIZES.paddingLarge,
        paddingTop: SIZES.paddingLarge,
    },
    childInfo: {
        alignItems: 'center',
        marginBottom: SIZES.marginLarge,
    },
    childName: {
        fontSize: SIZES.fontXXLarge,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SIZES.marginSmall,
    },
    childCardType: {
        fontSize: SIZES.fontMedium,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    scanArea: {
        width: 200,
        height: 200,
        borderRadius: 100,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginVertical: SIZES.marginLarge,
        ...SHADOWS.large,
    },
    instruction: {
        fontSize: SIZES.fontLarge,
        color: COLORS.textSecondary,
        textAlign: 'center',
        marginBottom: SIZES.marginLarge,
    },
    scanButton: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.paddingLarge * 2,
        paddingVertical: SIZES.paddingMedium,
        borderRadius: SIZES.radiusLarge,
        flexDirection: 'row',
        alignItems: 'center',
        ...SHADOWS.medium,
    },
    scanButtonActive: {
        backgroundColor: COLORS.primaryDark,
    },
    scanButtonText: {
        fontSize: SIZES.fontLarge,
        fontWeight: 'bold',
        color: COLORS.surface,
        marginLeft: SIZES.marginSmall,
    },
    tips: {
        marginTop: SIZES.marginLarge * 2,
        width: '100%',
    },
    tipsTitle: {
        fontSize: SIZES.fontLarge,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: SIZES.marginSmall,
    },
    tip: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.marginSmall,
    },
    tipText: {
        fontSize: SIZES.fontMedium,
        color: COLORS.textSecondary,
        marginLeft: SIZES.marginSmall,
        flex: 1,
    },
});

export default ScanCardScreen;
