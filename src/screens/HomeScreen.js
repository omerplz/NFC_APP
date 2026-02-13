import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    StatusBar,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useFocusEffect } from '@react-navigation/native';
import ChildCard from '../components/ChildCard';
import { getAllChildren, getRecentTransactions } from '../database/db';
import { initNFC, isNFCEnabled } from '../utils/nfcHelper';
import { COLORS, SIZES } from '../constants/theme';

/**
 * Ana ekran - Çocukların listesi
 */
const HomeScreen = ({ navigation }) => {
    const [children, setChildren] = useState([]);
    const [childrenWithTransactions, setChildrenWithTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nfcSupported, setNfcSupported] = useState(false);

    // NFC'yi başlat
    useEffect(() => {
        const setupNFC = async () => {
            const supported = await initNFC();
            setNfcSupported(supported);

            if (!supported) {
                Alert.alert(
                    'NFC Desteklenmiyor',
                    'Bu cihaz NFC özelliğini desteklemiyor.',
                    [{ text: 'Tamam' }]
                );
            } else {
                const enabled = await isNFCEnabled();
                if (!enabled) {
                    Alert.alert(
                        'NFC Kapalı',
                        'NFC özelliği kapalı. Lütfen ayarlardan açın.',
                        [{ text: 'Tamam' }]
                    );
                }
            }
        };

        setupNFC();
    }, []);

    // Çocukları yükle
    const loadChildren = async () => {
        try {
            setLoading(true);
            const childrenData = await getAllChildren();
            setChildren(childrenData);

            // Her çocuk için son işlemi al
            const childrenWithTrans = await Promise.all(
                childrenData.map(async (child) => {
                    const transactions = await getRecentTransactions(child.id, 1);
                    return {
                        ...child,
                        recentTransaction: transactions[0] || null,
                    };
                })
            );

            setChildrenWithTransactions(childrenWithTrans);
        } catch (error) {
            console.error('Error loading children:', error);
            Alert.alert('Hata', 'Çocuklar yüklenirken bir hata oluştu.');
        } finally {
            setLoading(false);
        }
    };

    // Ekran odaklandığında yenile
    useFocusEffect(
        useCallback(() => {
            loadChildren();
        }, [])
    );

    // Çocuk kartına tıklandığında
    const handleChildPress = (child) => {
        navigation.navigate('ChildDetail', { child });
    };

    // Kart tara butonuna tıklandığında
    const handleScanPress = (child) => {
        navigation.navigate('ScanCard', { child });
    };

    // Yeni çocuk ekle
    const handleAddChild = () => {
        navigation.navigate('AddChild');
    };

    const renderEmptyList = () => (
        <View style={styles.emptyContainer}>
            <Icon name="account-multiple-plus" size={80} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>Henüz çocuk eklemediniz</Text>
            <Text style={styles.emptyText}>
                Başlamak için aşağıdaki + butonuna tıklayın
            </Text>
        </View>
    );

    const renderChild = ({ item }) => (
        <ChildCard
            child={item}
            onPress={() => handleChildPress(item)}
            onScan={() => handleScanPress(item)}
            recentTransaction={item.recentTransaction}
        />
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Çocuk Takip</Text>
                    <Text style={styles.headerSubtitle}>
                        {children.length} çocuk kayıtlı
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={handleAddChild}>
                    <Icon name="plus" size={28} color={COLORS.surface} />
                </TouchableOpacity>
            </View>

            <FlatList
                data={childrenWithTransactions}
                renderItem={renderChild}
                keyExtractor={(item) => item.id.toString()}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={renderEmptyList}
                refreshControl={
                    <RefreshControl
                        refreshing={loading}
                        onRefresh={loadChildren}
                        colors={[COLORS.primary]}
                    />
                }
            />
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
        paddingHorizontal: SIZES.paddingLarge,
        paddingTop: SIZES.paddingLarge,
        paddingBottom: SIZES.paddingMedium,
        backgroundColor: COLORS.background,
    },
    headerTitle: {
        fontSize: SIZES.fontTitle,
        fontWeight: 'bold',
        color: COLORS.text,
    },
    headerSubtitle: {
        fontSize: SIZES.fontMedium,
        color: COLORS.textSecondary,
        marginTop: 4,
    },
    addButton: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: COLORS.primary,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
    },
    listContent: {
        paddingHorizontal: SIZES.paddingLarge,
        paddingBottom: SIZES.paddingLarge,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: SIZES.fontXLarge,
        fontWeight: 'bold',
        color: COLORS.text,
        marginTop: SIZES.marginLarge,
        marginBottom: SIZES.marginSmall,
    },
    emptyText: {
        fontSize: SIZES.fontMedium,
        color: COLORS.textSecondary,
        textAlign: 'center',
        paddingHorizontal: SIZES.paddingLarge,
    },
});

export default HomeScreen;
