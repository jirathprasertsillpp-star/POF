import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft } from 'lucide-react';
import { Tooltip } from './Tooltip';

// Drawer Component with stacking support
export function Drawer({ isOpen, onClose, title, children, width = '600px', onBack }) {
    React.useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        onClick={onClose}
                        style={{
                            position: 'fixed',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(8px)',
                            zIndex: 1000,
                        }}
                    />

                    {/* Drawer Panel */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                        style={{
                            position: 'fixed',
                            top: 0,
                            right: 0,
                            bottom: 0,
                            width,
                            maxWidth: '90vw',
                            background: 'var(--surface)',
                            boxShadow: 'var(--shadow-lg)',
                            zIndex: 1001,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden',
                        }}
                    >
                        {/* Header */}
                        <div
                            style={{
                                padding: '24px',
                                borderBottom: '1px solid var(--glass-border)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '16px',
                                background: 'transparent',
                            }}
                        >
                            {onBack && (
                                <Tooltip content="Back" position="bottom">
                                    <button
                                        onClick={onBack}
                                        style={{
                                            background: 'var(--bg-color)',
                                            border: '1px solid var(--glass-border)',
                                            borderRadius: '8px',
                                            width: '36px',
                                            height: '36px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.background = 'var(--accent)';
                                            e.currentTarget.style.transform = 'translateX(-2px)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.background = 'var(--bg-color)';
                                            e.currentTarget.style.transform = 'translateX(0)';
                                        }}
                                    >
                                        <ChevronLeft size={20} color="var(--primary)" />
                                    </button>
                                </Tooltip>
                            )}

                            <h2 style={{ flex: 1, fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {title}
                            </h2>

                            <Tooltip content="Close" position="bottom">
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: 'var(--bg-color)',
                                        border: '1px solid var(--glass-border)',
                                        borderRadius: '8px',
                                        width: '36px',
                                        height: '36px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--urgent)';
                                        e.currentTarget.style.color = 'var(--white)';
                                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-color)';
                                        e.currentTarget.style.color = 'var(--primary)';
                                        e.currentTarget.style.boxShadow = 'none';
                                    }}
                                >
                                    <X size={20} style={{ color: 'inherit' }} />
                                </button>
                            </Tooltip>
                        </div>

                        {/* Content */}
                        <div
                            style={{
                                flex: 1,
                                overflowY: 'auto',
                                padding: '24px',
                            }}
                        >
                            {children}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

// Drawer Manager Context (for stacking)
const DrawerContext = React.createContext();

export function DrawerProvider({ children }) {
    const [drawerStack, setDrawerStack] = React.useState([]);

    const openDrawer = (drawer) => {
        setDrawerStack(prev => [...prev, drawer]);
    };

    const closeDrawer = () => {
        setDrawerStack(prev => prev.slice(0, -1));
    };

    const closeAllDrawers = () => {
        setDrawerStack([]);
    };

    return (
        <DrawerContext.Provider value={{ drawerStack, openDrawer, closeDrawer, closeAllDrawers }}>
            {children}

            {/* Render all drawers in stack */}
            {drawerStack.map((drawer, index) => (
                <Drawer
                    key={index}
                    isOpen={true}
                    onClose={index === drawerStack.length - 1 ? closeDrawer : undefined}
                    onBack={index > 0 ? closeDrawer : undefined}
                    title={drawer.title}
                    width={drawer.width}
                >
                    {drawer.content}
                </Drawer>
            ))}
        </DrawerContext.Provider>
    );
}

export function useDrawer() {
    const context = React.useContext(DrawerContext);
    if (!context) {
        throw new Error('useDrawer must be used within DrawerProvider');
    }
    return context;
}
