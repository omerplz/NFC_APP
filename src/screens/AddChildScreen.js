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
import { addChild, updateChild } from '../database/db';
import { COLORS, SIZES, SHADOWS, CARD_TYPES } from '../constants/theme';

/**
 * Çocuk Ekleme/Düzenleme Ekranı
 */
const AddChildScreen = ({ navigation, route }) => {
    const { child, cardNumber: initialCardNumber } = route.params || {};
    const isEdit = !!child;

    const [name, setName] = useState(child?.name || '');
    const [cardNumber, setCardNumber] = useState(child?.card_number || initialCardNumber || '');
    const [cardType, setCardType] = useState(child?.card_type || 'Taşıt Kartı');

    const cardTypes = ['Taşıt Kartı', 'Banka Kartı', 'Diğer'];

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Hata', 'Lütfen çocuğun adını girin.');
            return;
        }

        try {
            if (isEdit) {
                await updateChild(child.id, name, cardNumber, cardType, child.photo);
                Alert.alert('Başarılı', 'Çocuk bilgileri güncellendi.', [
                    { text: 'Tamam', onPress: () => navigation.goBack() },
                ]);
            } else {
                await addChild(name, cardNumber, cardType);
                Alert.alert('Başarılı', 'Çocuk eklendi.', [
                    { text: 'Tamam', onPress: () => navigation.navigate('Home') },
                ]);
            }
        } catch (error) {
            console.error('Error saving child:', error);
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
                <Text style={styles.headerTitle}>
                    {isEdit ? 'Çocuk Düzenle' : 'Çocuk Ekle'}
                </Text>
                <View style={styles.placeholder} />
            </View>

            <ScrollView style={styles.content}>
                <View style={styles.iconContainer}>
                    <Icon name="account-plus" size={80} color={COLORS.primary} />
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Çocuğun Adı *</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Örn: Ahmet"
                        value={name}
                        onChangeText={setName}
                    />

                    <Text style={styles.label}>Kart Tipi *</Text>
                    <View style={styles.typeContainer}>
                        {cardTypes.map((type) => (
                            <TouchableOpacity
                                key={type}
                                style={[
                                    styles.typeButton,
                                    cardType === type && styles.typeButtonActive
                                ]}
                                onPress={() => setCardType(type)}>
                                <Icon
                                    name={
                                        type === 'Taşıt Kartı' ? 'bus' :
                                            type === 'Banka Kartı' ? 'credit-card' : 'card'
                                    }
                                    size={20}
                                    color={cardType === type ? COLORS.surface : COLORS.primary}
                                />
                                <Text style={[
                                    styles.typeButtonText,
                                    cardType === type && styles.typeButtonTextActive
                                ]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    <Text style={styles.label}>Kart Numarası (Opsiyonel)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Kart tarayarak otomatik alınacak"
                        value={cardNumber}
                        onChangeText={setCardNumber}
                        editable={!initialCardNumber}
                    />

                    <View style={styles.infoBox}>
                        <Icon name="information" size={20} color={COLORS.info} />
                        <Text style={styles.infoText}>
                            Kart numarasını sonradan kart okuyarak da ekleyebilirsiniz.
                        </Text>
                    </View>
                </View>

                <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                    <Icon name="check" size={24} color={COLORS.surface} />
                    <Text style={styles.saveButtonText}>
                        {isEdit ? 'Güncelle' : 'Kaydet'}
                    </Text>
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
    iconContainer: {
        alignItems: 'center',
        marginVertical: SIZES.marginLarge,
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
    typeContainer: {
        marginBottom: SIZES.marginMedium,
    },
    typeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SIZES.paddingMedium,
        paddingVertical: SIZES.paddingMedium,
        borderRadius: SIZES.radiusSmall,
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginBottom: SIZES.marginSmall,
        backgroundColor: COLORS.surface,
    },
    typeButtonActive: {
        backgroundColor: COLORS.primary,
    },
    typeButtonText: {
        fontSize: SIZES.fontMedium,
        color: COLORS.primary,
        fontWeight: '600',
        marginLeft: SIZES.marginSmall,
    },
    typeButtonTextActive: {
        color: COLORS.surface,
    },
    infoBox: {
        flexDirection: 'row',
        backgroundColor: COLORS.info + '20',
        padding: SIZES.paddingMedium,
        borderRadius: SIZES.radiusSmall,
        marginTop: SIZES.marginMedium,
    },
    infoText: {
        fontSize: SIZES.fontSmall,
        color: COLORS.info,
        marginLeft: SIZES.marginSmall,
        flex: 1,
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

export default AddChildScreen;
