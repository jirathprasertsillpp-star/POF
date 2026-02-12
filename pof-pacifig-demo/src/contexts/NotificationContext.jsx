import React, { createContext, useContext, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

const NotificationContext = createContext();

export function NotificationProvider({ children }) {
    const [notifications, setNotifications] = useState([]);

    const addNotification = (notification) => {
        const id = Math.random().toString(36).substr(2, 9);
        const newNotification = {
            id,
            type: 'info', // success, warning, info, error
            title: 'System Alert',
            message: '',
            timestamp: new Date(),
            ...notification
        };
        setNotifications(prev => [newNotification, ...prev]);

        // Auto remove after 5 seconds
        setTimeout(() => {
            removeNotification(id);
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const clearAll = () => {
        setNotifications([]);
    };

    return (
        <NotificationContext.Provider value={{ notifications, addNotification, removeNotification, clearAll }}>
            {children}

            {/* Notification Toast Container */}
            <div style={{
                position: 'fixed',
                top: '24px',
                right: '24px',
                zIndex: 9999,
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'none'
            }}>
                <AnimatePresence>
                    {notifications.slice(0, 5).map((n) => (
                        <NotificationToast key={n.id} notification={n} onRemove={() => removeNotification(n.id)} />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
}

function NotificationToast({ notification, onRemove }) {
    const icons = {
        success: <CheckCircle size={20} color="var(--success)" />,
        warning: <AlertTriangle size={20} color="var(--warning)" />,
        info: <Info size={20} color="var(--primary)" />,
        error: <X size={20} color="var(--danger)" />
    };

    return (
        <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
            style={{
                pointerEvents: 'auto',
                minWidth: '320px',
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(10px)',
                border: '1px solid var(--glass-border)',
                borderRadius: '16px',
                padding: '16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                display: 'flex',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden'
            }}
        >
            {/* Progress Bar */}
            <motion.div
                initial={{ width: '100%' }}
                animate={{ width: 0 }}
                transition={{ duration: 5, ease: "linear" }}
                style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '3px',
                    background: notification.type === 'success' ? 'var(--success)' : 'var(--primary)',
                    opacity: 0.5
                }}
            />

            <div style={{ flexShrink: 0, marginTop: '2px' }}>
                {icons[notification.type] || icons.info}
            </div>

            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '14px', marginBottom: '2px' }}>
                    {notification.title}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                    {notification.message}
                </div>
            </div>

            <button
                onClick={onRemove}
                style={{
                    flexShrink: 0,
                    background: 'none',
                    border: 'none',
                    padding: '4px',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    opacity: 0.5,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                <X size={14} />
            </button>
        </motion.div>
    );
}

export function useNotification() {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}
