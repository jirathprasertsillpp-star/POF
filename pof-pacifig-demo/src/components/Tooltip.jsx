import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function Tooltip({ children, content, position = 'top' }) {
    const [isVisible, setIsVisible] = React.useState(false);

    const positions = {
        top: {
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(-10px)',
            marginBottom: '8px',
        },
        bottom: {
            top: '100%',
            left: '50%',
            transform: 'translateX(-50%) translateY(10px)',
            marginTop: '8px',
        },
        left: {
            top: '50%',
            right: '100%',
            transform: 'translateY(-50%) translateX(-10px)',
            marginRight: '8px',
        },
        right: {
            top: '50%',
            left: '100%',
            transform: 'translateY(-50%) translateX(10px)',
            marginLeft: '8px',
        },
    };

    return (
        <div
            style={{ position: 'relative', display: 'inline-block' }}
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        style={{
                            position: 'absolute',
                            zIndex: 2000,
                            pointerEvents: 'none',
                            backgroundColor: 'rgba(17, 24, 39, 0.95)',
                            color: 'white',
                            padding: '6px 12px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 500,
                            whiteSpace: 'nowrap',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
                            ...positions[position],
                        }}
                    >
                        {content}
                        {/* Arrow */}
                        <div
                            style={{
                                position: 'absolute',
                                width: '0',
                                height: '0',
                                borderStyle: 'solid',
                                ...(position === 'top' && {
                                    top: '100%',
                                    left: '50%',
                                    marginLeft: '-6px',
                                    borderWidth: '6px 6px 0 6px',
                                    borderColor: 'rgba(17, 24, 39, 0.95) transparent transparent transparent',
                                }),
                                ...(position === 'bottom' && {
                                    bottom: '100%',
                                    left: '50%',
                                    marginLeft: '-6px',
                                    borderWidth: '0 6px 6px 6px',
                                    borderColor: 'transparent transparent rgba(17, 24, 39, 0.95) transparent',
                                }),
                                ...(position === 'left' && {
                                    left: '100%',
                                    top: '50%',
                                    marginTop: '-6px',
                                    borderWidth: '6px 0 6px 6px',
                                    borderColor: 'transparent transparent transparent rgba(17, 24, 39, 0.95)',
                                }),
                                ...(position === 'right' && {
                                    right: '100%',
                                    top: '50%',
                                    marginTop: '-6px',
                                    borderWidth: '6px 6px 6px 0',
                                    borderColor: 'transparent rgba(17, 24, 39, 0.95) transparent transparent',
                                }),
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
