import React from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';

export function AnimatedBackground() {
    const { theme } = useApp();
    const isDark = theme === 'dark';

    // Wave colors reconstructed based on previous design parameters
    const colors = isDark
        ? {
            fill1: 'rgba(54, 192, 252, 0.2)',
            fill2: 'rgba(26, 116, 250, 0.1)',
            stroke: 'rgba(54, 192, 252, 0.4)',
            bg: '#0f172a'
        }
        : {
            fill1: 'rgba(59, 89, 152, 0.1)',
            fill2: 'rgba(139, 157, 195, 0.2)',
            stroke: 'rgba(59, 89, 152, 0.3)',
            bg: '#f8f9fa'
        };

    const wavePath1 = [
        "M 0 100 Q 250 50 500 100 T 1000 100 V 200 H 0 Z",
        "M 0 100 Q 250 150 500 100 T 1000 100 V 200 H 0 Z",
        "M 0 100 Q 250 50 500 100 T 1000 100 V 200 H 0 Z"
    ];

    const wavePath2 = [
        "M 0 120 Q 250 170 500 120 T 1000 120 V 200 H 0 Z",
        "M 0 120 Q 250 70 500 120 T 1000 120 V 200 H 0 Z",
        "M 0 120 Q 250 170 500 120 T 1000 120 V 200 H 0 Z"
    ];

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1,
            background: colors.bg,
            transition: 'background 0.8s ease',
            overflow: 'hidden'
        }}>
            {/* SVG Waves - Restoring the sophisticated flowing animation */}
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 1000 200"
                preserveAspectRatio="none"
                style={{ position: 'absolute', bottom: 0, left: 0 }}
            >
                <motion.path
                    d={wavePath1[0]}
                    animate={{ d: wavePath1 }}
                    transition={{
                        duration: 15,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    fill={colors.fill1}
                    stroke={colors.stroke}
                    strokeWidth="0.5"
                />
                <motion.path
                    d={wavePath2[0]}
                    animate={{ d: wavePath2 }}
                    transition={{
                        duration: 18,
                        repeat: Infinity,
                        ease: "linear"
                    }}
                    fill={colors.fill2}
                    opacity="0.8"
                />
            </svg>

            {/* Grid Overlay */}
            <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: `radial-gradient(${isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} 1px, transparent 1px)`,
                backgroundSize: '40px 40px',
                opacity: 0.5
            }} />

            {/* Soft Glow Elements */}
            <div style={{
                position: 'absolute',
                top: '-10%',
                left: '-10%',
                width: '40%',
                height: '40%',
                background: isDark ? 'radial-gradient(circle, rgba(79, 70, 229, 0.15) 0%, transparent 70%)' : 'radial-gradient(circle, rgba(79, 70, 229, 0.05) 0%, transparent 70%)',
                filter: 'blur(100px)',
                borderRadius: '50%'
            }} />
        </div>
    );
}
