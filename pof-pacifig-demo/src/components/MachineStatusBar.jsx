import React from 'react';
import { motion } from 'framer-motion';

// Animated Machine Status Bar with diagonal moving lines
export function MachineStatusBar({ status, progress = 0, label = '' }) {
    const getStatusConfig = () => {
        switch (status) {
            case 'RUNNING':
                return {
                    bg: 'var(--success)',
                    color: 'var(--success)',
                    animate: true,
                };
            case 'IDLE':
                return {
                    bg: 'var(--glass-bg)',
                    color: 'var(--text-secondary)',
                    animate: false,
                };
            case 'BLOCKED':
            case 'DOWN':
                return {
                    bg: 'var(--danger)',
                    color: 'var(--danger)',
                    animate: false,
                };
            case 'SETUP':
                return {
                    bg: 'var(--warning)',
                    color: 'var(--warning)',
                    animate: true,
                };
            default:
                return {
                    bg: 'var(--glass-bg)',
                    color: 'var(--text-secondary)',
                    animate: false,
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div style={{ width: '100%' }}>
            {label && (
                <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>
                    {label}
                </div>
            )}

            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '32px',
                    background: 'var(--glass-bg)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: `1px solid var(--glass-border)`,
                }}
            >
                {/* Progress Bar */}
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: 'easeOut' }}
                    style={{
                        position: 'absolute',
                        height: '100%',
                        background: config.bg,
                        borderRadius: '8px',
                    }}
                >
                    {/* Diagonal Stripes (only when animating) */}
                    {config.animate && (
                        <div
                            className="animate-diagonal-stripes"
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                background: `repeating-linear-gradient(
                  45deg,
                  transparent,
                  transparent 10px,
                  rgba(255, 255, 255, 0.1) 10px,
                  rgba(255, 255, 255, 0.1) 20px
                )`,
                                backgroundSize: '40px 40px',
                            }}
                        />
                    )}
                </motion.div>

                {/* Status Text */}
                <div
                    style={{
                        position: 'absolute',
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: 'var(--white)',
                        textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                        zIndex: 1,
                    }}
                >
                    {status} {progress > 0 && `${Math.round(progress)}%`}
                </div>
            </div>
        </div>
    );
}

// Horizontal Machine Status (for machine detail view)
export function MachineUtilizationBar({ utilization, planned, actual }) {
    const variance = actual - planned;
    const isLate = variance > 0;

    return (
        <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Utilization</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>
                    {utilization}%
                </span>
            </div>

            <div
                style={{
                    position: 'relative',
                    width: '100%',
                    height: '24px',
                    background: 'var(--glass-bg)',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid var(--glass-border)',
                }}
            >
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${utilization}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    style={{
                        height: '100%',
                        background: utilization > 85 ?
                            'var(--success)' :
                            utilization > 60 ?
                                'var(--warning)' :
                                'var(--danger)',
                        borderRadius: '8px',
                    }}
                />
            </div>

            {/* Variance Display */}
            {planned && actual && (
                <div style={{ marginTop: '8px', display: 'flex', gap: '16px', fontSize: '12px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>
                        Planned: <strong style={{ color: 'var(--text-primary)' }}>{planned} min</strong>
                    </span>
                    <span style={{ color: 'var(--text-secondary)' }}>
                        Actual: <strong style={{ color: 'var(--text-primary)' }}>{actual} min</strong>
                    </span>
                    <span
                        style={{
                            color: isLate ? 'var(--danger)' : 'var(--success)',
                            fontWeight: 700,
                        }}
                    >
                        {isLate ? '+' : ''}{variance} min
                    </span>
                </div>
            )}
        </div>
    );
}
