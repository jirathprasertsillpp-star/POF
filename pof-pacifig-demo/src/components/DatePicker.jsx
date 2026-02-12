import React, { useState, useRef, useEffect } from 'react';
import { format } from 'date-fns';
import { DayPicker } from 'react-day-picker';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import 'react-day-picker/dist/style.css';

// Custom POF Pacific Theme for DatePicker
const css = `
  .rdp {
    --rdp-cell-size: 40px;
    --rdp-accent-color: var(--primary);
    --rdp-background-color: var(--surface);
    margin: 0;
  }
  .rdp-day_selected:not([disabled]), .rdp-day_selected:focus:not([disabled]), .rdp-day_selected:active:not([disabled]), .rdp-day_selected:hover:not([disabled]) { 
      background-color: var(--rdp-accent-color); 
      color: var(--white);
      font-weight: bold;
  }
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) {
      background-color: var(--accent);
      color: var(--primary);
  }
  .rdp-caption_label { 
      color: var(--text-primary); 
      font-size: 16px; 
      font-weight: 700; 
  }
  .rdp-head_cell { 
      color: var(--text-secondary); 
      font-size: 13px; 
      font-weight: 600; 
  }
  .rdp-day { 
      color: var(--text-primary); 
      font-size: 14px;
  }
  .rdp-nav_button { 
      color: var(--text-secondary); 
  }
  .rdp-nav_button:hover { 
      color: var(--primary); 
      background-color: var(--accent); 
  }
  .rdp-day_today {
      font-weight: bold;
      color: var(--primary);
  }
`;

export function DatePicker({ selected, onSelect, placeholder = "Select date", className, style }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event) {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelect = (date) => {
        if (date) {
            onSelect(date);
            setIsOpen(false);
        }
    };

    return (
        <div className={`date-picker-container ${className || ''}`} ref={containerRef} style={{ position: 'relative', ...style }}>
            <div
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px',
                    backgroundColor: 'var(--surface)',
                    border: isOpen ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    boxShadow: isOpen ? '0 0 10px rgba(59, 89, 152, 0.2)' : 'none'
                }}
            >
                <CalendarIcon size={16} color="var(--primary)" />
                <span style={{ fontWeight: selected ? 600 : 400 }}>
                    {selected ? format(selected, 'dd MMM yyyy') : placeholder}
                </span>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'absolute',
                            top: '100%',
                            left: 0,
                            marginTop: '8px',
                            backgroundColor: 'var(--surface)',
                            border: '1px solid var(--glass-border)',
                            borderRadius: '16px',
                            padding: '16px',
                            zIndex: 1000,
                            boxShadow: 'var(--shadow-lg)',
                            minWidth: '300px'
                        }}
                    >
                        <style>{css}</style>
                        <DayPicker
                            mode="single"
                            selected={selected}
                            onSelect={handleSelect}
                            showOutsideDays
                            modifiersClassNames={{
                                selected: 'rdp-day_selected'
                            }}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
