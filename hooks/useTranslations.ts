
import { useCallback } from 'react';
import { useGuardian } from '../contexts/GuardianContext';
import { translations, statusTranslations } from '../utils/translations';
import { AttendanceStatus } from '../types';

export const useTranslations = () => {
    const { language } = useGuardian();

    const t = useCallback((key: string, params?: Record<string, string | number>) => {
        const value = translations[language][key] || translations['en'][key];
        if (typeof value === 'function') {
            return value(params || {});
        }
        return value;
    }, [language]);

    const tStatus = useCallback((status: AttendanceStatus) => {
        return statusTranslations[language][status] || statusTranslations['en'][status];
    }, [language]);

    return { t, tStatus };
};
