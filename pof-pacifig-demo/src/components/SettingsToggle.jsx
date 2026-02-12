import React from 'react';
import { Sun, Moon, Languages } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function SettingsToggle() {
    const { theme, toggleTheme, locale, toggleLocale } = useApp();

    return (
        <div style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            display: 'flex',
            gap: '12px',
            zIndex: 9999,
        }}>
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="glass-panel"
                style={{
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    background: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    borderRadius: '50%',
                    width: '48px',
                    height: '48px',
                    boxShadow: 'var(--shadow-lg)',
                }}
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            >
                {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {/* Language Toggle */}
            <button
                onClick={toggleLocale}
                className="glass-panel"
                style={{
                    padding: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer',
                    background: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                    color: 'var(--text-primary)',
                    borderRadius: '24px',
                    height: '48px',
                    minWidth: '80px',
                    fontWeight: 700,
                    fontSize: '14px',
                    boxShadow: 'var(--shadow-lg)',
                }}
                title="Switch Language"
            >
                <Languages size={18} />
                {locale.toUpperCase()}
            </button>
        </div>
    );
}
