import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
    Alert,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { addTransaction, addTravel } from '../database/db';
import { COLORS, SIZES, SHADOWS, TRANSACTION_TYPES } from '../constants/theme';

/**
 * İşlem Ekleme Ekranı
 */
const AddTransactionScreen = ({ navigation, route }) => {
    const { child, cardData } = route.params;

    const [transactionType, setTransactionType] = useState('Alışveriş');
    const [amount, setAmount] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    // Yolculuk bilgileri
    const [isTravel, setIsTravel] = useState(false);
    const [fromLocation, setFromLocation] = useState('');
    const [toLocation, setToLocation] = useState('');
    const [vehicleType, setVehicleType] = useState('Otobüs');
    const [vehicleNumber, setVehicleNumber] = useState('');

    const transactionTypes = ['Alışveriş', 'Para Çekme', 'Ulaşım', 'Diğer'];
    const vehicleTypes = ['Otobüs', 'Metro', 'Tramvay', 'Metrobüs', 'Diğer'];

    // İşlemi kaydet
    const handleSave = async () => {
        try {
            if (isTravel) {
                // Yolculuk kaydet
                await addTravel(
                    child.id,
                    fromLocation || 'Bilinmiyor',
                    toLocation || 'Bilinmiyor',
                    vehicleType,
                    vehicleNumber
                );
            } else {
                // İşlem kaydet
                const amountValue = amount ? parseFloat(amount.replace(',', '.')) : null;
                await addTransaction(
                    child.id,
                    transactionType,
                    amountValue,
                    location,
                    description,
                    cardData?.cardNumber
                );
            }

            Alert.alert(
                'Başarılı',
                isTravel ? 'Yolculuk kaydedildi' : 'İşlem kaydedildi',
                [
                    {
                        text: 'Tamam',
                        onPress: () => navigation.navigate('Home'),
                    },
                ]
            );
        } catch (error) {
            console.error('Error saving transaction:', error);
            Alert.alert('Hata', 'Kayıt sırasında bir hata oluştu.');
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.surface} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>İşlem Ekle</Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.childInfo}>
                    <Icon name="account-circle" size={48} color={COLORS.primary} />
                    <View style={styles.childDetails}>
                        <Text style={styles.childName}>{child.name}</Text>
                        <Text style={styles.childCardType}>{child.card_type}</Text>
                    </View>
                </View>

                {/* Tip seçimi */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity
                        style={[styles.toggleButton, !isTravel && styles.toggleButtonActive]}
                        onPress={() => setIsTravel(false)}>
                        <Icon
                            name="shopping"
                            size={20}
                            color={!isTravel ? COLORS.surface : COLORS.primary}
                        />
                        <Text style={[styles.toggleText, !isTravel && styles.toggleTextActive]}>
                            Harcama
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.toggleButton, isTravel && styles.toggleButtonActive]}
                        onPress={() => setIsTravel(true)}>
                        <Icon
                            name="bus"
                            size={20}
                            color={isTravel ? COLORS.surface : COLORS.primary}
                        />
                        <Text style={[styles.toggleText, isTravel && styles.toggleTextActive]}>
                            Yolculuk
                        </Text>
                    </TouchableOpacity>
                </View>

                {!isTravel ? (
                    // Harcama formu
                    <View style={styles.form}>
                        <Text style={styles.label}>İşlem Tipi</Text>
                        <View style={styles.typeContainer}>
                            {transactionTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeButton,
                                        transactionType === type && styles.typeButtonActive
                                    ]}
                                    onPress={() => setTransactionType(type)}>
                                    <Text style={[
                                        styles.typeButtonText,
                                        transactionType === type && styles.typeButtonTextActive
                                    ]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Tutar (₺)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="0,00"
                            value={amount}
                            onChangeText={setAmount}
                            keyboardType="decimal-pad"
                        />

                        <Text style={styles.label}>Konum</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: Migros, Bakkal, ATM"
                            value={location}
                            onChangeText={setLocation}
                        />

                        <Text style={styles.label}>Açıklama (Opsiyonel)</Text>
                        <TextInput
                            style={[styles.input, styles.textArea]}
                            placeholder="Detaylar..."
                            value={description}
                            onChangeText={setDescription}
                            multiline
                            numberOfLines={3}
                        />
                    </View>
                ) : (
                    // Yolculuk formu
                    <View style={styles.form}>
                        <Text style={styles.label}>Araç Tipi</Text>
                        <View style={styles.typeContainer}>
                            {vehicleTypes.map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeButton,
                                        vehicleType === type && styles.typeButtonActive
                                    ]}
                                    onPress={() => setVehicleType(type)}>
                                    <Text style={[
                                        styles.typeButtonText,
                                        vehicleType === type && styles.typeButtonTextActive
                                    ]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        <Text style={styles.label}>Nereden</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Başlangıç noktası"
                            value={fromLocation}
                            onChangeText={setFromLocation}
                        />

                        <Text style={styles.label}>Nereye</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Varış noktası"
                            value={toLocation}
                            onChangeText={setToLocation}
                        />

                        <Text style={styles.label}>Hat/Araç Numarası (Opsiyonel)</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Örn: 34A, M1"
                            value={vehicleNumber}
                            onChangeText={setVehicleNumber}
                        />
                    </View>
                )}

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Icon name="check" size={24} color={COLORS.surface} />
                    <Text style={styles.saveButtonText}>Kaydet</Text>
                </TouchableOpacity>
            </ScrollView>
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
        paddingHorizontal: SIZES.paddingLarge,
    },
    childInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.surface,
        padding: SIZES.paddingMedium,
        borderRadius: SIZES.radiusMedium,
        marginVertical: SIZES.marginMedium,
        ...SHADOWS.small,
    },
    childDetails: {
        marginLeft: SIZES.marginMedium,
    },
    childName: {
        fontSize: SIZES.fontXLarge,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    childCardType: {
        fontSize: SIZES.fontMedium,
        color: COLORS.textSecondary,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radiusMedium,
        padding: 4,
        marginBottom: SIZES.marginLarge,
        ...SHADOWS.small,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SIZES.paddingMedium,
        borderRadius: SIZES.radiusSmall,
    },
    toggleButtonActive: {
        backgroundColor: COLORS.primary,
    },
    toggleText: {
        fontSize: SIZES.fontMedium,
        fontWeight: '600',
        color: COLORS.primary,
        marginLeft: SIZES.marginSmall,
    },
    toggleTextActive: {
        color: COLORS.surface,
    },
    form: {
        marginBottom: SIZES.marginLarge,
    },
    label: {
        fontSize: SIZES.fontMedium,
        fontWeight: '600',
        color: COLORS.text,
        marginBottom: SIZES.marginSmall,
        marginTop: SIZES.marginMedium,
    },
    input: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radiusSmall,
        padding: SIZES.paddingMedium,
        fontSize: SIZES.fontMedium,
        color: COLORS.text,
        borderWidth: 1,
        borderColor: COLORS.border,
    },
    textArea: {
        height: 80,
        textAlignVertical: 'top',
    },
    typeContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: SIZES.marginSmall,
    },
    typeButton: {
        paddingHorizontal: SIZES.paddingMedium,
        paddingVertical: SIZES.paddingSmall,
        borderRadius: SIZES.radiusLarge,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginRight: SIZES.marginSmall,
        marginBottom: SIZES.marginSmall,
    },
    typeButtonActive: {
        backgroundColor: COLORS.primary,
    },
    typeButtonText: {
        fontSize: SIZES.fontSmall,
        color: COLORS.primary,
        fontWeight: '600',
    },
    typeButtonTextActive: {
        color: COLORS.surface,
    },
    saveButton: {
        backgroundColor: COLORS.success,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SIZES.paddingMedium,
        borderRadius: SIZES.radiusMedium,
        marginVertical: SIZES.marginLarge,
        ...SHADOWS.medium,
    },
    saveButtonText: {
        fontSize: SIZES.fontLarge,
        fontWeight: 'bold',
        color: COLORS.surface,
        marginLeft: SIZES.marginSmall,
    },
});

export default AddTransactionScreen;
