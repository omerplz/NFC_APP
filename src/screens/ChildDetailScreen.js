import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    StatusBar,
    RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import TransactionCard from '../components/TransactionCard';
import TravelCard from '../components/TravelCard';
import { getTransactionsByChild, getTravelsByChild } from '../database/db';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';

/**
 * Çocuk Detay Ekranı
 */
const ChildDetailScreen = ({ navigation, route }) => {
    const { child } = route.params;

    const [activeTab, setActiveTab] = useState('transactions');
    const [transactions, setTransactions] = useState([]);
    const [travels, setTravels] = useState([]);
    const [loading, setLoading] = useState(false);

    // Verileri yükle
    const loadData = async () => {
        try {
            setLoading(true);
            const [transactionsData, travelsData] = await Promise.all([
                getTransactionsByChild(child.id),
                getTravelsByChild(child.id),
            ]);
            setTransactions(transactionsData);
            setTravels(travelsData);
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [child.id])
    );

    const renderTransaction = ({ item }) => (
        <TransactionCard transaction={item} onPress={() => { }} />
    );

    const renderTravel = ({ item }) => (
        <TravelCard travel={item} onPress={() => { }} />
    );

    const renderEmptyTransactions = () => (
        <View style={styles.emptyContainer}>
            <Icon name="shopping-outline" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Henüz işlem kaydı yok</Text>
        </View>
    );

    const renderEmptyTravels = () => (
        <View style={styles.emptyContainer}>
            <Icon name="bus-clock" size={60} color={COLORS.textLight} />
            <Text style={styles.emptyText}>Henüz yolculuk kaydı yok</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

            <View style={styles.header}>
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    style={styles.backButton}>
                    <Icon name="arrow-left" size={24} color={COLORS.surface} />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>{child.name}</Text>
                    <Text style={styles.headerSubtitle}>{child.card_type}</Text>
                </View>
                <TouchableOpacity
                    onPress={() => navigation.navigate('AddChild', { child })}
                    style={styles.editButton}>
                    <Icon name="pencil" size={20} color={COLORS.surface} />
                </TouchableOpacity>
            </View>

            <View style={styles.tabs}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'transactions' && styles.tabActive]}
                    onPress={() => setActiveTab('transactions')}>
                    <Icon
                        name="credit-card-outline"
                        size={20}
                        color={activeTab === 'transactions' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[
                        styles.tabText,
                        activeTab === 'transactions' && styles.tabTextActive
                    ]}>
                        Harcamalar ({transactions.length})
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'travels' && styles.tabActive]}
                    onPress={() => setActiveTab('travels')}>
                    <Icon
                        name="bus"
                        size={20}
                        color={activeTab === 'travels' ? COLORS.primary : COLORS.textSecondary}
                    />
                    <Text style={[
                        styles.tabText,
                        activeTab === 'travels' && styles.tabTextActive
                    ]}>
                        Yolculuklar ({travels.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'transactions' ? (
                <FlatList
                    data={transactions}
                    renderItem={renderTransaction}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyTransactions}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={loadData}
                            colors={[COLORS.primary]}
                        />
                    }
                />
            ) : (
                <FlatList
                    data={travels}
                    renderItem={renderTravel}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={renderEmptyTravels}
                    refreshControl={
                        <RefreshControl
                            refreshing={loading}
                            onRefresh={loadData}
                            colors={[COLORS.primary]}
                        />
                    }
                />
            )}

            <TouchableOpacity
                style={styles.fab}
                onPress={() => navigation.navigate('ScanCard', { child })}>
                <Icon name="nfc" size={28} color={COLORS.surface} />
            </TouchableOpacity>
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
        alignItems: 'center',
        paddingHorizontal: SIZES.paddingMedium,
        paddingVertical: SIZES.paddingMedium,
        backgroundColor: COLORS.primary,
    },
    backButton: {
        padding: SIZES.paddingSmall,
    },
    headerContent: {
        flex: 1,
        marginLeft: SIZES.marginSmall,
    },
    headerTitle: {
        fontSize: SIZES.fontXLarge,
        fontWeight: 'bold',
        color: COLORS.surface,
    },
    headerSubtitle: {
        fontSize: SIZES.fontSmall,
        color: COLORS.surface + 'CC',
        marginTop: 2,
    },
    editButton: {
        padding: SIZES.paddingSmall,
    },
    tabs: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        ...SHADOWS.small,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: SIZES.paddingMedium,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabActive: {
        borderBottomColor: COLORS.primary,
    },
    tabText: {
        fontSize: SIZES.fontMedium,
        color: COLORS.textSecondary,
        marginLeft: SIZES.marginSmall,
        fontWeight: '600',
    },
    tabTextActive: {
        color: COLORS.primary,
    },
    listContent: {
        paddingHorizontal: SIZES.paddingLarge,
        paddingTop: SIZES.paddingMedium,
        paddingBottom: 80,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        fontSize: SIZES.fontMedium,
        color: COLORS.textSecondary,
        marginTop: SIZES.marginMedium,
    },
    fab: {
        position: 'absolute',
        right: SIZES.paddingLarge,
        bottom: SIZES.paddingLarge,
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.large,
    },
});

export default ChildDetailScreen;
