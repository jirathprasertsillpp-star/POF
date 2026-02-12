import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, LogIn } from 'lucide-react';
import { useI18n } from '../i18n';
import { Tooltip } from '../components/Tooltip';

export function Login({ role, onLogin, onBack }) {
    const { t } = useI18n();
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        // Demo credentials: sa/sa
        if (username === 'sa' && password === 'sa') {
            onLogin({ username, role });
        } else {
            alert('Invalid credentials. Use demo credentials: sa/sa');
        }
    };

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                position: 'relative',
            }}
        >
            {/* Back Button */}
            <Tooltip content={t('login.back')} position="right">
                <motion.button
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={onBack}
                    className="btn btn-secondary"
                    style={{
                        position: 'absolute',
                        top: '24px',
                        left: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                    }}
                >
                    <ChevronLeft size={20} />
                    {t('login.back')}
                </motion.button>
            </Tooltip>

            {/* Login Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="glass-panel"
                style={{
                    maxWidth: '420px',
                    width: '100%',
                    padding: '48px',
                    background: 'var(--surface)',
                    border: '1px solid var(--glass-border)',
                }}
            >
                {/* Title */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <div style={{ fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                        {t('login.title')}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
                        {t(`role.${role.toLowerCase()}`)}
                    </div>
                </div>

                {/* Demo Credentials Notice */}
                <div
                    style={{
                        background: 'var(--accent)',
                        border: '1px solid var(--glass-border)',
                        borderRadius: '12px',
                        padding: '16px',
                        marginBottom: '24px',
                        fontSize: '13px',
                        color: 'var(--primary)',
                    }}
                >
                    <div style={{ fontWeight: 700, marginBottom: '8px' }}>{t('login.demo')}</div>
                    <div>Username: <strong>sa</strong></div>
                    <div>Password: <strong>sa</strong></div>
                </div>

                {/* Login Form */}
                <form onSubmit={handleSubmit}>
                    <div style={{ marginBottom: '20px' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '8px',
                                fontSize: '14px',
                                fontWeight: 600,
                                color: 'var(--text-primary)',
                            }}
                        >
                            {t('login.username')}
                        </label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Type your username..."
                            required
                            style={{
                                width: '100%',
                                padding: '14px 18px',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(var(--primary-rgb), 0.03)',
                                color: 'var(--text-primary)',
                                fontSize: '15px',
                                fontWeight: '500',
                                fontFamily: 'inherit',
                                outline: 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                            }}
                            onFocus={(e) => {
                                e.target.style.border = '1px solid var(--primary)';
                                e.target.style.background = 'rgba(var(--primary-rgb), 0.08)';
                                e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                            }}
                            onBlur={(e) => {
                                e.target.style.border = '1px solid var(--glass-border)';
                                e.target.style.background = 'rgba(var(--primary-rgb), 0.03)';
                                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                            }}
                        />
                    </div>

                    <div style={{ marginBottom: '32px' }}>
                        <label
                            style={{
                                display: 'block',
                                marginBottom: '10px',
                                fontSize: '13px',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                letterSpacing: '0.05em',
                                color: 'var(--text-secondary)',
                            }}
                        >
                            {t('login.password')}
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Type your password..."
                            required
                            style={{
                                width: '100%',
                                padding: '14px 18px',
                                borderRadius: '12px',
                                border: '1px solid var(--glass-border)',
                                background: 'rgba(var(--primary-rgb), 0.03)',
                                color: 'var(--text-primary)',
                                fontSize: '15px',
                                fontWeight: '500',
                                fontFamily: 'inherit',
                                outline: 'none',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.05)',
                            }}
                            onFocus={(e) => {
                                e.target.style.border = '1px solid var(--primary)';
                                e.target.style.background = 'rgba(var(--primary-rgb), 0.08)';
                                e.target.style.boxShadow = '0 0 0 4px rgba(79, 70, 229, 0.1), inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                            }}
                            onBlur={(e) => {
                                e.target.style.border = '1px solid var(--glass-border)';
                                e.target.style.background = 'rgba(var(--primary-rgb), 0.03)';
                                e.target.style.boxShadow = 'inset 0 2px 4px rgba(0, 0, 0, 0.05)';
                            }}
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '8px',
                            padding: '14px',
                        }}
                    >
                        <LogIn size={20} />
                        {t('login.submit')}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
