import { useApp } from './contexts/AppContext';
import { translations as dataTranslations } from './data/translations';

// Export translations for backward compatibility (component usage)
export const translations = dataTranslations;

// Re-export useApp hook parts as useI18n to maintain compatibility
export function useI18n() {
    const { t, locale, toggleLocale } = useApp();
    return { t, locale, toggleLocale };
}

// Helper function for non-hook contexts
// Note: This won't be reactive to context changes
export function translate(key, locale = 'en') {
    return translations[key]?.[locale] || key;
}
