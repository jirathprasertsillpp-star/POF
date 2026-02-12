import React from 'react';
import { motion } from 'framer-motion';
import { Play, Sun, Moon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';

export function Landing({ onStart }) {
    const { theme, toggleTheme } = useApp();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.3
            }
        }
    };

    const letterVariants = {
        hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
        visible: {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            transition: { duration: 0.8, ease: [0.2, 0.65, 0.3, 0.9] }
        }
    };

    const pofText = "POF".split("");
    const pacificText = "PACIFIC".split("");

    // Adaptive Colors
    const isDark = theme === 'dark';
    const pofColor = isDark ? 'var(--primary)' : '#3b5998';
    const pacificColor = isDark ? 'var(--primary-light)' : '#8b9dc3';

    return (
        <div
            style={{
                height: '100vh',
                width: '100vw',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'transparent' // Leveraging global AnimatedBackground
            }}
        >
            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                style={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '40px',
                    zIndex: 10
                }}
            >
                <div style={{ display: 'flex', gap: '12px', fontSize: 'clamp(48px, 10vw, 120px)', fontWeight: 900, letterSpacing: '-0.05em' }}>
                    <div style={{ display: 'flex' }}>
                        {pofText.map((char, i) => (
                            <motion.span
                                key={i}
                                variants={letterVariants}
                                style={{ color: pofColor }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </div>
                    <div style={{ display: 'flex', marginLeft: '12px' }}>
                        {pacificText.map((char, i) => (
                            <motion.span
                                key={i}
                                variants={letterVariants}
                                style={{ color: pacificColor }}
                            >
                                {char}
                            </motion.span>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5, duration: 0.8 }}
                >
                    <motion.button
                        className="btn btn-primary"
                        onClick={onStart}
                        whileHover={{ scale: 1.05, boxShadow: isDark ? '0 10px 25px rgba(54, 192, 252, 0.4)' : '0 10px 25px rgba(59, 89, 152, 0.3)' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '16px 48px',
                            fontSize: '18px',
                            borderRadius: '50px',
                            gap: '12px',
                            textTransform: 'uppercase',
                            letterSpacing: '2px'
                        }}
                    >
                        <Play size={20} fill="currentColor" />
                        Start OS
                    </motion.button>
                </motion.div>
            </motion.div>
        </div>
    );
}
