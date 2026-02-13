import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { formatDateTime, formatRelativeTime } from '../utils/formatters';

/**
 * Yolculuk kartı bileşeni
 */
const TravelCard = ({ travel, onPress }) => {
    const getVehicleIcon = () => {
        switch (travel.vehicle_type) {
            case 'Otobüs':
                return 'bus';
            case 'Metro':
                return 'subway-variant';
            case 'Tramvay':
                return 'tram';
            case 'Metrobüs':
                return 'bus-articulated-front';
            default:
                return 'train';
        }
    };

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}>
            <View style={styles.iconContainer}>
                <Icon
                    name={getVehicleIcon()}
                    size={24}
                    color={COLORS.info}
                />
            </View>

            <View style={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.vehicleType}>{travel.vehicle_type}</Text>
                    {travel.vehicle_number && (
                        <View style={styles.vehicleNumberBadge}>
                            <Text style={styles.vehicleNumber}>{travel.vehicle_number}</Text>
                        </View>
                    )}
                </View>

                <View style={styles.route}>
                    <View style={styles.locationContainer}>
                        <Icon name="map-marker" size={14} color={COLORS.success} />
                        <Text style={styles.location} numberOfLines={1}>
                            {travel.from_location || 'Başlangıç'}
                        </Text>
                    </View>

                    <Icon name="arrow-right" size={16} color={COLORS.textLight} />

                    <View style={styles.locationContainer}>
                        <Icon name="map-marker" size={14} color={COLORS.error} />
                        <Text style={styles.location} numberOfLines={1}>
                            {travel.to_location || 'Varış'}
                        </Text>
                    </View>
                </View>

                <Text style={styles.date}>
                    {formatRelativeTime(travel.travel_date)}
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
        backgroundColor: COLORS.info + '20',
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
        marginBottom: SIZES.marginSmall,
    },
    vehicleType: {
        fontSize: SIZES.fontLarge,
        fontWeight: '600',
        color: COLORS.text,
    },
    vehicleNumberBadge: {
        backgroundColor: COLORS.primary,
        paddingHorizontal: SIZES.paddingSmall,
        paddingVertical: 4,
        borderRadius: SIZES.radiusSmall,
    },
    vehicleNumber: {
        fontSize: SIZES.fontSmall,
        fontWeight: 'bold',
        color: COLORS.surface,
    },
    route: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: SIZES.marginSmall,
    },
    locationContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    location: {
        fontSize: SIZES.fontSmall,
        color: COLORS.textSecondary,
        marginLeft: 4,
        flex: 1,
    },
    date: {
        fontSize: SIZES.fontSmall,
        color: COLORS.textLight,
    },
});

export default TravelCard;
