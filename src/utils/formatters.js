import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

/**
 * Tarihi formatla
 */
export const formatDate = (date, formatStr = 'dd MMMM yyyy') => {
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return format(dateObj, formatStr, { locale: tr });
    } catch (error) {
        console.error('Error formatting date:', error);
        return '';
    }
};

/**
 * Tarih ve saati formatla
 */
export const formatDateTime = (date) => {
    return formatDate(date, 'dd MMMM yyyy HH:mm');
};

/**
 * Kısa tarih formatı
 */
export const formatShortDate = (date) => {
    return formatDate(date, 'dd.MM.yyyy');
};

/**
 * Sadece saat
 */
export const formatTime = (date) => {
    return formatDate(date, 'HH:mm');
};

/**
 * Göreceli zaman (örn: "2 saat önce")
 */
export const formatRelativeTime = (date) => {
    try {
        const dateObj = typeof date === 'string' ? parseISO(date) : date;
        return formatDistanceToNow(dateObj, { addSuffix: true, locale: tr });
    } catch (error) {
        console.error('Error formatting relative time:', error);
        return '';
    }
};

/**
 * Para formatla
 */
export const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '0,00 ₺';
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(amount);
};

/**
 * Kart numarasını formatla (son 4 hane)
 */
export const formatCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\s/g, '');
    if (cleaned.length <= 4) return cleaned;
    return '**** ' + cleaned.slice(-4);
};

/**
 * Kart numarasını tam formatla
 */
export const formatFullCardNumber = (cardNumber) => {
    if (!cardNumber) return '';
    const cleaned = cardNumber.replace(/\s/g, '');
    return cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
};
