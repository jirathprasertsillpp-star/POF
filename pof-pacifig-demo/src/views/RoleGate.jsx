import React from 'react';
import { motion } from 'framer-motion';
import { Crown, Users, Wrench } from 'lucide-react';
import { useI18n } from '../i18n';
import { Tooltip } from '../components/Tooltip';

export function RoleGate({ onSelectRole }) {
    const { t, locale, toggleLocale } = useI18n();

    const roles = [
        {
            id: 'OWNER',
            icon: Crown,
            color: 'var(--warning)',
            gradient: 'linear-gradient(135deg, var(--warning) 0%, #D97706 100%)',
        },
        {
            id: 'MANAGER',
            icon: Users,
            color: 'var(--primary)',
            gradient: 'linear-gradient(135deg, var(--primary) 0%, #2d4373 100%)',
        },
        {
            id: 'OPERATOR',
            icon: Wrench,
            color: 'var(--success)',
            gradient: 'linear-gradient(135deg, var(--success) 0%, #059669 100%)',
        },
    ];

    return (
        <div
            style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '24px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Animated Background */}
            <div
                className="animate-flow-river"
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--bg-color)',
                    zIndex: 0,
                }}
            />



            {/* Logo & Title */}
            <motion.div
                initial={{ opacity: 0, y: -40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                style={{
                    textAlign: 'center',
                    marginBottom: '48px',
                    zIndex: 1,
                }}
            >
                <div style={{ fontSize: '48px', fontWeight: 800, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    POF <span style={{ color: 'var(--primary)' }}>PACIFIC</span>
                </div>
                <div style={{ fontSize: '24px', fontWeight: 300, color: 'var(--text-secondary)', letterSpacing: '2px' }}>
                    FACTORY OS
                </div>
                <div style={{ fontSize: '16px', color: 'var(--primary)', marginTop: '12px', fontWeight: 600 }}>
                    {t('role.select')}
                </div>
            </motion.div>

            {/* Role Cards */}
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                    gap: '24px',
                    maxWidth: '900px',
                    width: '100%',
                    zIndex: 1,
                }}
            >
                {roles.map((role, index) => {
                    const Icon = role.icon;
                    return (
                        <Tooltip key={role.id} content={t(`role.${role.id.toLowerCase()}.desc`)}>
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                whileHover={{ scale: 1.05, y: -8 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => onSelectRole(role.id)}
                                className="glass-panel"
                                style={{
                                    padding: '32px',
                                    cursor: 'pointer',
                                    textAlign: 'center',
                                    position: 'relative',
                                    overflow: 'hidden',
                                    border: `2px solid ${role.color}33`,
                                }}
                            >
                                {/* Background Glow */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        width: '120px',
                                        height: '120px',
                                        background: `radial-gradient(circle, ${role.color}33 0%, transparent 70%)`,
                                        pointerEvents: 'none',
                                    }}
                                />

                                {/* Icon */}
                                <div
                                    style={{
                                        width: '80px',
                                        height: '80px',
                                        margin: '0 auto 20px',
                                        borderRadius: '50%',
                                        background: role.gradient,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        boxShadow: 'var(--shadow-lg)',
                                    }}
                                >
                                    <Icon size={40} color="var(--white)" />
                                </div>

                                {/* Role Name */}
                                <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '8px' }}>
                                    {t(`role.${role.id.toLowerCase()}`)}
                                </div>

                                {/* Description */}
                                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                                    {t(`role.${role.id.toLowerCase()}.desc`)}
                                </div>
                            </motion.div>
                        </Tooltip>
                    );
                })}
            </div>
        </div>
    );
}
