import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { formatCurrency, formatDateTime, formatRelativeTime } from '../utils/formatters';

/**
 * İşlem kartı bileşeni
 */
const TransactionCard = ({ transaction, onPress }) => {
    const getTransactionIcon = () => {
        switch (transaction.transaction_type) {
            case 'Alışveriş':
                return 'shopping';
            case 'Para Çekme':
                return 'cash';
            case 'Ulaşım':
                return 'bus';
            default:
                return 'credit-card';
        }
    };

    const getTransactionColor = () => {
        switch (transaction.transaction_type) {
            case 'Alışveriş':
                return COLORS.primary;
            case 'Para Çekme':
                return COLORS.warning;
            case 'Ulaşım':
                return COLORS.info;
            default:
                return COLORS.textSecondary;
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: getTransactionColor() + '20' }]}>
                <Icon
                    name={getTransactionIcon()}
                    size={24}
                    color={getTransactionColor()}
                />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.type}>{transaction.transaction_type}</Text>
                    {transaction.amount && (
                        <Text style={[styles.amount, { color: getTransactionColor() }]}>
                            {formatCurrency(transaction.amount)}
                        </Text>
                    )}
                </View>

                {transaction.location && (
                    <Text style={styles.location} numberOfLines={1}>
                        <Icon name="map-marker" size={12} color={COLORS.textSecondary} />
                        {' '}{transaction.location}
                    </Text>
                )}

                {transaction.description && (
                    <Text style={styles.description} numberOfLines={1}>
                        {transaction.description}
                    </Text>
                )}

                <Text style={styles.date}>
                    {formatRelativeTime(transaction.transaction_date)}
                </Text>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface,
        borderRadius: SIZES.radiusMedium,
        padding: SIZES.paddingMedium,
        marginBottom: SIZES.marginMedium,
        flexDirection: 'row',
        ...SHADOWS.small,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: SIZES.marginMedium,
    },
    content: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    type: {
        fontSize: SIZES.fontLarge,
        fontWeight: '600',
        color: COLORS.text,
    },
    amount: {
        fontSize: SIZES.fontLarge,
        fontWeight: 'bold',
    },
    location: {
        fontSize: SIZES.fontSmall,
        color: COLORS.textSecondary,
        marginBottom: 2,
    },
    description: {
        fontSize: SIZES.fontSmall,
        color: COLORS.textSecondary,
        marginBottom: 4,
    },
    date: {
        fontSize: SIZES.fontSmall,
        color: COLORS.textLight,
    },
});

export default TransactionCard;
