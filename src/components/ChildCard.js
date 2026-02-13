import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { formatCurrency, formatCardNumber } from '../utils/formatters';

/**
 * Çocuk kartı bileşeni
 */
const ChildCard = ({ child, onPress, onScan, recentTransaction }) => {
    const getCardTypeIcon = () => {
        if (child.card_type === 'Taşıt Kartı') {
            return 'bus';
        } else if (child.card_type === 'Banka Kartı') {
            return 'credit-card';
        }
        return 'card';
    };

    const getCardTypeColor = () => {
        if (child.card_type === 'Taşıt Kartı') {
            return COLORS.transportCard;
        } else if (child.card_type === 'Banka Kartı') {
            return COLORS.bankCard;
        }
        return COLORS.primary;
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}>
            <View style={styles.header}>
                <View style={styles.childInfo}>
                    {child.photo ? (
                        <Image source={{ uri: child.photo }} style={styles.avatar} />
                    ) : (
                        <View style={[styles.avatar, styles.avatarPlaceholder]}>
                            <Icon name="account" size={32} color={COLORS.textLight} />
                        </View>
                    )}
                    <View style={styles.nameContainer}>
                        <Text style={styles.name}>{child.name}</Text>
                        <View style={styles.cardInfo}>
                            <Icon
                                name={getCardTypeIcon()}
                                size={14}
                                color={getCardTypeColor()}
                            />
                            <Text style={styles.cardType}>{child.card_type}</Text>
                        </View>
                    </View>
                </View>

                <TouchableOpacity
                    style={[styles.scanButton, { backgroundColor: getCardTypeColor() }]}
                    onPress={onScan}>
                    <Icon name="nfc" size={24} color={COLORS.surface} />
                </TouchableOpacity>
            </View>

            {child.card_number && (
                <View style={styles.cardNumberContainer}>
                    <Text style={styles.cardNumberLabel}>Kart No:</Text>
                    <Text style={styles.cardNumber}>{formatCardNumber(child.card_number)}</Text>
                </View>
            )}

            {recentTransaction && (
                <View style={styles.recentTransaction}>
                    <View style={styles.transactionHeader}>
                        <Icon name="clock-outline" size={14} color={COLORS.textSecondary} />
                        <Text style={styles.recentLabel}>Son İşlem</Text>
                    </View>
                    <View style={styles.transactionDetails}>
                        <Text style={styles.transactionType}>{recentTransaction.transaction_type}</Text>
                        {recentTransaction.amount && (
                            <Text style={styles.transactionAmount}>
                                {formatCurrency(recentTransaction.amount)}
                            </Text>
                        )}
                    </View>
                    {recentTransaction.location && (
                        <Text style={styles.transactionLocation} numberOfLines={1}>
                            {recentTransaction.location}
                        </Text>
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radiusMedium,
        padding: SIZES.paddingMedium,
        marginBottom: SIZES.marginMedium,
        ...SHADOWS.medium,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SIZES.marginSmall,
    },
    childInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatar: {
        width: 56,
        height: 56,
        borderRadius: 28,
        marginRight: SIZES.marginMedium,
    },
    avatarPlaceholder: {
        backgroundColor: COLORS.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nameContainer: {
        flex: 1,
    },
    name: {
        fontSize: SIZES.fontXLarge,
        fontWeight: 'bold',
        color: COLORS.text,
        marginBottom: 4,
    },
    cardInfo: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    cardType: {
        fontSize: SIZES.fontSmall,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    scanButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        ...SHADOWS.small,
    },
    cardNumberContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: SIZES.paddingSmall,
        paddingHorizontal: SIZES.paddingMedium,
        backgroundColor: COLORS.background,
        borderRadius: SIZES.radiusSmall,
        marginBottom: SIZES.marginSmall,
    },
    cardNumberLabel: {
        fontSize: SIZES.fontSmall,
        color: COLORS.textSecondary,
        marginRight: SIZES.marginSmall,
    },
    cardNumber: {
        fontSize: SIZES.fontMedium,
        color: COLORS.text,
        fontWeight: '600',
    },
    recentTransaction: {
        borderTopWidth: 1,
        borderTopColor: COLORS.border,
        paddingTop: SIZES.paddingSmall,
        marginTop: SIZES.marginSmall,
    },
    transactionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    recentLabel: {
        fontSize: SIZES.fontSmall,
        color: COLORS.textSecondary,
        marginLeft: 4,
    },
    transactionDetails: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    transactionType: {
        fontSize: SIZES.fontMedium,
        color: COLORS.text,
        fontWeight: '500',
    },
    transactionAmount: {
        fontSize: SIZES.fontMedium,
        color: COLORS.primary,
        fontWeight: 'bold',
    },
    transactionLocation: {
        fontSize: SIZES.fontSmall,
        color: COLORS.textSecondary,
    },
});

export default ChildCard;
