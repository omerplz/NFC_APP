export const COLORS = {
    // Ana renkler
    primary: '#6366F1', // Indigo
    primaryDark: '#4F46E5',
    primaryLight: '#818CF8',

    // İkincil renkler
    secondary: '#EC4899', // Pink
    secondaryDark: '#DB2777',
    secondaryLight: '#F472B6',

    // Arka plan
    background: '#F9FAFB',
    backgroundDark: '#111827',
    surface: '#FFFFFF',
    surfaceDark: '#1F2937',

    // Metin
    text: '#111827',
    textSecondary: '#6B7280',
    textLight: '#9CA3AF',
    textDark: '#FFFFFF',

    // Durum renkleri
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#3B82F6',

    // Kart tipleri
    transportCard: '#3B82F6', // Mavi - Taşıt kartı
    bankCard: '#10B981', // Yeşil - Banka kartı

    // Diğer
    border: '#E5E7EB',
    shadow: '#00000020',
};

export const SIZES = {
    // Padding
    paddingSmall: 8,
    paddingMedium: 16,
    paddingLarge: 24,

    // Margin
    marginSmall: 8,
    marginMedium: 16,
    marginLarge: 24,

    // Border radius
    radiusSmall: 8,
    radiusMedium: 12,
    radiusLarge: 16,
    radiusXLarge: 24,

    // Font sizes
    fontSmall: 12,
    fontMedium: 14,
    fontLarge: 16,
    fontXLarge: 20,
    fontXXLarge: 24,
    fontTitle: 28,
};

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    light: 'System',
};

export const SHADOWS = {
    small: {
        shadowColor: COLORS.shadow,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    medium: {
        shadowColor: COLORS.shadow,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
    },
    large: {
        shadowColor: COLORS.shadow,
        shadowOffset: {
            width: 0,
            height: 8,
        },
        shadowOpacity: 0.2,
        shadowRadius: 12,
        elevation: 8,
    },
};

export const TRANSACTION_TYPES = {
    PURCHASE: 'Alışveriş',
    WITHDRAWAL: 'Para Çekme',
    TRANSPORT: 'Ulaşım',
    OTHER: 'Diğer',
};

export const CARD_TYPES = {
    TRANSPORT: 'Taşıt Kartı',
    BANK: 'Banka Kartı',
    OTHER: 'Diğer',
};
