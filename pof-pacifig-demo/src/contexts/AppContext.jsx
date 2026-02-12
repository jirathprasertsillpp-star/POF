import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../data/translations';

const AppContext = createContext();

export function AppProvider({ children }) {
    // --- Theme State ---
    const [theme, setTheme] = useState(
        localStorage.getItem('pof_theme') || 'light'
    );

    // --- Locale State ---
    const [locale, setLocale] = useState(
        localStorage.getItem('pof_locale') || 'en'
    );

    // --- Theme Effect ---
    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('pof_theme', theme);
    }, [theme]);

    // --- Locale Effect ---
    useEffect(() => {
        localStorage.setItem('pof_locale', locale);
    }, [locale]);

    // --- Actions ---
    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
    };

    const toggleLocale = () => {
        setLocale(prev => prev === 'en' ? 'th' : 'en');
    };

    // --- Translation Helper ---
    const t = (key) => {
        return translations[key]?.[locale] || key;
    };

    const value = {
        theme,
        toggleTheme,
        locale,
        toggleLocale,
        t
    };

    return (
        <AppContext.Provider value={value}>
            {children}
        </AppContext.Provider>
    );
}

// Hook to use the app context
export function useApp() {
    const context = useContext(AppContext);
    if (!context) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
}
