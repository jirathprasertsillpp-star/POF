import React from 'react';
import ReactDOM from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, RefreshCcw, Edit3, Check, X, ChevronRight, ChevronLeft, List, Cpu, Clock,
    Layers, Zap, Send, ExternalLink, Shield, Gauge, Save, AlertCircle,
    ChevronDown, ArrowUpRight, Target, HardHat, TrendingUp, Activity, PlayCircle,
    Calendar, FileText, Ruler, Palette, Box, ArrowRightCircle, Terminal, Command,
    Hash, User, Users, Package, CalendarClock, AlertTriangle, Settings, RefreshCw, Play,
    BarChart2, CheckCircle, Lock, Plus, Trash2
} from 'lucide-react';
import { salesOrders, getStationById, getMachineById, getPlanRowsForSO, machines, stations, getSalesOrderById } from '../data/db';
import { useI18n } from '../i18n';
import { useProduction } from '../contexts/ProductionContext';
import { useNotification } from '../contexts/NotificationContext';

export function OutputTable({ viewMode = 'today', onSOSelect, user }) {
    const { t } = useI18n();
    const { orders, plans, updatePlan, addPlan, removePlan, setOrders, releasePlans, checkSOCompletion, executionStatus, startExecution, completeExecution } = useProduction();
    const { addNotification } = useNotification();

    const isOwner = user?.role === 'OWNER';
    const isManager = user?.role === 'MANAGER';
    const isOperator = user?.role === 'OPERATOR';
    const canEdit = isOwner || isManager;

    const [activeSubTab, setActiveSubTab] = React.useState(user?.role === 'OWNER' ? 'SUMMARY' : 'SO DATA');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [editingId, setEditingId] = React.useState(null);
    const [expandedId, setExpandedId] = React.useState(null);
    const [localOrders, setLocalOrders] = React.useState([]);
    const [localPlans, setLocalPlans] = React.useState([]);
    const [isLoaded, setIsLoaded] = React.useState(false);
    const [openDropdownId, setOpenDropdownId] = React.useState(null);
    const [theme, setTheme] = React.useState('dark');
    const [selectedSO, setSelectedSO] = React.useState(null);
    const [detailTab, setDetailTab] = React.useState('overview');
    const [planManagerMode, setPlanManagerMode] = React.useState('grouped'); // 'grouped' or 'master'
    const [masterConfig, setMasterConfig] = React.useState([
        { key: 'Shift_1_Start', value: '8:00', description: 'เริ่มกะเช้า', category: 'SHIFT' },
        { key: 'Shift_1_End', value: '20:00', description: 'จบกะ', category: 'SHIFT' },
        { key: 'Shift_2_Start', value: '20:30', description: 'เริ่มกะมืด', category: 'SHIFT' },
        { key: 'Shift_2_End', value: '7:30', description: 'จบกะดึก', category: 'SHIFT' },
        { key: 'Lunch_Start', value: '12:00', description: 'พักเที่ยง', category: 'BREAK' },
        { key: 'Lunch_End', value: '13:00', description: 'จบพัก', category: 'BREAK' },
        { key: 'WIP_S1_to_S2', value: '30 m', description: 'จบตัด(1) -> พิมพ์(2) [ขนย้าย/คิว]', category: 'WIP' },
        { key: 'WIP_S2_to_S3', value: '120 m', description: 'จบพิมพ์(2) -> พับ(3) [รอหมึกแห้ง - สำคัญ]', category: 'WIP' },
        { key: 'WIP_S3_to_S4', value: '15 m', description: 'จบพับ(3) -> ตัดท้าย(4) [รอกาวแห้ง]', category: 'WIP' },
        { key: 'WIP_Final', value: '0 m', description: 'จบกระบวนการ (Pack ลงกล่องได้เลย)', category: 'WIP' },
        { key: 'WIP_change_normal_to_high', value: '30 m', description: 'Normal -> High Priority (Buffer Time)', category: 'PRIORITY' },
    ]);

    // Sync local state with context
    React.useEffect(() => {
        setLocalOrders(orders);
        setLocalPlans(plans);
    }, [orders, plans]);

    // Sync with global theme (bottom-left toggle)
    React.useEffect(() => {
        const checkTheme = () => {
            const isDark = document.documentElement.classList.contains('dark') ||
                document.body.classList.contains('dark-mode') ||
                document.documentElement.getAttribute('data-theme') === 'dark';
            setTheme(isDark ? 'dark' : 'light');
        };
        checkTheme();
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class', 'data-theme'] });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
        return () => observer.disconnect();
    }, []);

    // Track completed SOs to notify Manager/Owner
    const [lastCompletedSO, setLastCompletedSO] = React.useState(null);

    React.useEffect(() => {
        localOrders.forEach(so => {
            if (checkSOCompletion(so.so_id) && lastCompletedSO !== so.so_id) {
                // If it wasn't completed before, notify!
                // This is a simple version, ideally we'd track previous state properly
                // But for now, we'll use a ref or similar if we wanted to be robust.
                // Let's just trigger a notification if we find a completed one not in our "seen" list
                addNotification({
                    type: 'success',
                    title: 'Order Fully Completed',
                    message: `SO ${so.so_number} is finished! Click to see summary.`,
                    onClick: () => setActiveSubTab('SUMMARY')
                });
                setLastCompletedSO(so.so_id);
            }
        });
    }, [executionStatus, localOrders]);

    // --- ULTRA PREMIUM THEME SYSTEMS ---
    const themes = {
        dark: {
            // Cyber Industrial / Command Center
            bg: '#050B14',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            // Glass + Glow
            card: {
                background: 'rgba(15, 23, 42, 0.6)', // Semi-transparent
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(59, 130, 246, 0.15)', // Subtle blue rim
                borderRadius: '4px', // Tight industrial corners
                boxShadow: '0 0 40px rgba(0,0,0,0.5)', // Deep shadow
                position: 'relative',
                overflow: 'hidden'
            },
            tableHeader: {
                background: 'rgba(15, 23, 42, 0.95)',
                color: '#94A3B8',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                borderBottom: '2px solid #1E293B',
            },
            tableRow: {
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                color: '#E2E8F0',
                hoverBg: 'rgba(59, 130, 246, 0.08)',
                oddBg: 'rgba(255,255,255,0.01)'
            },
            input: {
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid #334155',
                color: '#38BDF8', // Neon Blue Text
                borderRadius: '4px',
                fontSize: '12px',
                focusBorder: '#38BDF8'
            },
            text: '#F8FAFC',
            textSecondary: '#64748B',
            primary: '#38BDF8', // Neon Sky
            accent: '#34D399', // Neon Emerald
            danger: '#FB7185', // Neon Rose
            columnDivider: '1px solid rgba(255,255,255,0.03)',
            shadow: '0 4px 20px rgba(0,0,0,0.3)'
        },
        light: {
            // Executive Paper / High-End SaaS
            bg: '#F8FAFC',
            fontFamily: "'Inter', system-ui, sans-serif",
            card: {
                background: '#FFFFFF',
                border: '1px solid #E2E8F0',
                borderRadius: '16px', // Smooth corners
                boxShadow: '0 10px 30px -10px rgba(0,0,0,0.05), 0 4px 6px -2px rgba(0,0,0,0.02)'
            },
            tableHeader: {
                background: '#F1F5F9', // Light gray header
                color: '#475569',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                borderBottom: '1px solid #E2E8F0',
            },
            tableRow: {
                borderBottom: '1px solid #F1F5F9',
                color: '#334155',
                hoverBg: '#F8FAFC',
                oddBg: '#FFFFFF'
            },
            input: {
                background: '#FFFFFF',
                border: '1px solid #CBD5E1',
                color: '#0F172A',
                borderRadius: '8px',
                fontSize: '13px',
                focusBorder: '#2563EB'
            },
            text: '#0F172A',
            textSecondary: '#64748B',
            primary: '#2563EB', // Royal Blue
            accent: '#059669', // Deep Green
            danger: '#DC2626', // Deep Red
            columnDivider: '1px solid #F1F5F9',
            shadow: '0 4px 12px rgba(0,0,0,0.05)'
        }
    };

    const currentTheme = themes[theme];

    // Theme-Aware Dropdown with Portal to break out of overflow
    const CustomDropdown = ({ options, value, onChange, placeholder = "Select...", id, isOpen, onToggle, title = "Select Item", icon: Icon }) => {
        const buttonRef = React.useRef(null);
        const [coords, setCoords] = React.useState({ top: 0, left: 0, width: 0 });

        const updatePosition = React.useCallback(() => {
            if (buttonRef.current && isOpen) {
                const rect = buttonRef.current.getBoundingClientRect();
                setCoords({
                    top: rect.bottom + 4,
                    left: rect.left,
                    width: rect.width
                });
            }
        }, [isOpen]);

        React.useEffect(() => {
            if (isOpen) {
                updatePosition();
                window.addEventListener('scroll', updatePosition, true);
                window.addEventListener('resize', updatePosition);
            }
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }, [isOpen, updatePosition]);

        React.useEffect(() => {
            if (!isOpen) return;
            const handleClick = (e) => {
                if (buttonRef.current && buttonRef.current.contains(e.target)) return;
                const menuEl = document.getElementById(`dropdown-menu-${id}`);
                if (menuEl && menuEl.contains(e.target)) return;
                onToggle(null);
            };
            setTimeout(() => window.addEventListener('click', handleClick), 0);
            return () => window.removeEventListener('click', handleClick);
        }, [isOpen, onToggle, id]);

        const selected = options.find(opt => opt.value === value);
        const displayText = selected ? selected.label : placeholder;
        const isPlaceholder = !selected;

        const style = theme === 'dark' ? {
            bg: isOpen ? 'rgba(56, 189, 248, 0.1)' : 'rgba(0,0,0,0.3)',
            border: isOpen ? currentTheme.primary : '#334155',
            text: isPlaceholder ? '#64748B' : '#F8FAFC',
            radius: '4px'
        } : {
            bg: isOpen ? '#EFF6FF' : '#FFFFFF',
            border: isOpen ? currentTheme.primary : '#E2E8F0',
            text: isPlaceholder ? '#94A3B8' : '#0F172A',
            radius: '8px'
        };

        return (
            <>
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onToggle(isOpen ? null : id); }}
                    style={{
                        width: '100%', padding: '10px 14px', fontSize: '13px', fontWeight: 500, display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer',
                        borderRadius: style.radius, border: `1px solid ${style.border}`, background: style.bg, color: style.text,
                        outline: 'none', transition: 'all 0.2s', fontFamily: currentTheme.fontFamily,
                        boxShadow: isOpen ? `0 0 0 2px ${currentTheme.primary}40` : 'none'
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                        {Icon && <Icon size={14} color={isOpen ? currentTheme.primary : currentTheme.textSecondary} />}
                        <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{displayText}</span>
                    </div>
                    <ChevronDown size={14} style={{ opacity: 0.5, transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>
                {isOpen && ReactDOM.createPortal(
                    <AnimatePresence>
                        <motion.div
                            key={`dropdown-${id}`}
                            id={`dropdown-menu-${id}`}
                            initial={{ opacity: 0, y: -5, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -5, scale: 0.98 }}
                            transition={{ duration: 0.15, ease: 'easeOut' }}
                            style={{
                                position: 'fixed', top: coords.top, left: coords.left, width: coords.width,
                                minWidth: '200px',
                                background: theme === 'dark' ? '#0F172A' : '#FFFFFF',
                                border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}`,
                                borderRadius: style.radius,
                                boxShadow: theme === 'dark' ? '0 10px 40px rgba(0,0,0,0.5)' : '0 10px 40px rgba(0,0,0,0.1)',
                                zIndex: 9999, overflow: 'hidden'
                            }}
                        >
                            <div style={{ padding: '8px 12px', background: theme === 'dark' ? 'rgba(56, 189, 248, 0.1)' : '#F1F5F9', borderBottom: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#E2E8F0'}`, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', color: currentTheme.textSecondary, letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                {Icon && <Icon size={12} />} {title}
                            </div>
                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {options.map((opt) => (
                                    <button key={opt.value} onClick={(e) => { e.stopPropagation(); onChange(opt.value); onToggle(null); }} style={{
                                        width: '100%', padding: '12px 14px', fontSize: '13px', textAlign: 'left', border: 'none',
                                        background: selected?.value === opt.value ? (theme === 'dark' ? 'rgba(56, 189, 246, 0.15)' : '#EFF6FF') : 'transparent',
                                        color: selected?.value === opt.value ? currentTheme.primary : currentTheme.text,
                                        cursor: 'pointer', borderBottom: `1px solid ${theme === 'dark' ? '#1E293B' : '#F1F5F9'}`,
                                        display: 'flex', alignItems: 'center', gap: '10px', fontFamily: currentTheme.fontFamily,
                                        transition: 'background 0.2s'
                                    }}>
                                        <div style={{
                                            width: '16px', height: '16px', borderRadius: '4px', border: `1px solid ${selected?.value === opt.value ? currentTheme.primary : (theme === 'dark' ? '#334155' : '#CBD5E1')}`,
                                            display: 'flex', alignItems: 'center', justifyContent: 'center', background: selected?.value === opt.value ? currentTheme.primary : 'transparent'
                                        }}>
                                            {selected?.value === opt.value && <Check size={10} color="#fff" />}
                                        </div>
                                        <span>{opt.label}</span>
                                        {selected?.value === opt.value && <span style={{ fontSize: '10px', marginLeft: 'auto', opacity: 0.7, border: `1px solid ${currentTheme.primary}`, padding: '2px 4px', borderRadius: '4px' }}>ACTIVE</span>}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>,
                    document.body
                )}
            </>
        );
    };

    // ==================== MASTER HYBRID DATE PICKER ====================
    // ==================== MASTER HYBRID DATE PICKER (V4 - ULTRA STABLE) ====================
    const MasterHybridDatePicker = ({ value, onChange, id, isOpen, onToggle }) => {
        const containerRef = React.useRef(null);
        const [coords, setCoords] = React.useState({ top: 0, left: 0 });
        const [inputValue, setInputValue] = React.useState('');
        const [viewDate, setViewDate] = React.useState(value ? new Date(value) : new Date());

        const thaiMonths = ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน", "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"];
        const toBE = (date) => (date ? date.getFullYear() + 543 : '');
        const fromBE = (yearBE) => yearBE - 543;

        // Sync input display with value
        React.useEffect(() => {
            if (value) {
                const d = new Date(value);
                const dd = String(d.getDate()).padStart(2, '0');
                const mm = String(d.getMonth() + 1).padStart(2, '0');
                const yyyyBE = toBE(d);
                setInputValue(`${dd}/${mm}/${yyyyBE}`);
            }
        }, [value]);

        // Position tracking
        const updatePosition = () => {
            if (containerRef.current && isOpen) {
                const rect = containerRef.current.getBoundingClientRect();
                setCoords({ top: rect.bottom + 5, left: rect.left });
            }
        };

        React.useEffect(() => {
            if (isOpen) {
                updatePosition();
                window.addEventListener('scroll', updatePosition, true);
                window.addEventListener('resize', updatePosition);

                const handleGlobalClick = (e) => {
                    const portal = document.getElementById(`cal-portal-${id}`);
                    if (containerRef.current && containerRef.current.contains(e.target)) return;
                    if (portal && portal.contains(e.target)) return;
                    onToggle(null);
                };

                setTimeout(() => window.addEventListener('mousedown', handleGlobalClick), 0);
                return () => {
                    window.removeEventListener('scroll', updatePosition, true);
                    window.removeEventListener('resize', updatePosition);
                    window.removeEventListener('mousedown', handleGlobalClick);
                };
            }
        }, [isOpen, onToggle, id]);

        const handleInput = (e) => {
            let v = e.target.value.replace(/[^0-9]/g, '');
            if (v.length > 8) v = v.substring(0, 8);

            let fmt = v;
            if (v.length > 2) fmt = v.substring(0, 2) + '/' + v.substring(2);
            if (v.length > 4) fmt = v.substring(0, 2) + '/' + v.substring(2, 4) + '/' + v.substring(4);
            setInputValue(fmt);

            if (v.length === 8) {
                const d = parseInt(v.substring(0, 2));
                const m = parseInt(v.substring(2, 4)) - 1;
                const yBE = parseInt(v.substring(4, 8));
                const yAD = fromBE(yBE);
                const newD = new Date(yAD, m, d);
                if (!isNaN(newD.getTime()) && newD.getDate() === d) {
                    onChange(newD);
                    setViewDate(newD);
                }
            }
        };

        const renderCalendar = () => {
            const year = viewDate.getFullYear();
            const month = viewDate.getMonth();
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            const days = [];

            for (let i = 0; i < firstDay; i++) days.push(null);
            for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));

            return (
                <div style={{ padding: '15px', color: '#FFF' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setViewDate(new Date(year, month - 1, 1)); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}><ChevronLeft size={14} /></button>
                        <div style={{ fontWeight: 800, fontSize: '13px' }}>{thaiMonths[month]} {toBE(viewDate)}</div>
                        <button type="button" onClick={(e) => { e.stopPropagation(); setViewDate(new Date(year, month + 1, 1)); }} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#FFF', borderRadius: '4px', padding: '4px', cursor: 'pointer' }}><ChevronRight size={14} /></button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', textAlign: 'center' }}>
                        {['อ', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'].map(d => <div key={d} style={{ fontSize: '10px', opacity: 0.5, marginBottom: '5px' }}>{d}</div>)}
                        {days.map((d, i) => {
                            const isSel = d && value && new Date(value).toDateString() === d.toDateString();
                            return (
                                <div
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); if (d) { onChange(d); onToggle(null); } }}
                                    style={{
                                        height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: d ? 'pointer' : 'default',
                                        borderRadius: '4px', fontSize: '12px', background: isSel ? currentTheme.primary : 'transparent',
                                        color: isSel ? '#FFF' : '#FFF', opacity: d ? 1 : 0, border: d && d.toDateString() === new Date().toDateString() ? `1px solid ${currentTheme.primary}` : 'none'
                                    }}
                                >
                                    {d ? d.getDate() : ''}
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        };

        return (
            <div ref={containerRef} style={{ position: 'relative' }}>
                <div style={{
                    display: 'flex', alignItems: 'center', background: theme === 'dark' ? 'rgba(0,0,0,0.3)' : '#FFF',
                    border: `1px solid ${isOpen ? currentTheme.primary : (theme === 'dark' ? 'rgba(56, 189, 248, 0.2)' : '#E2E8F0')}`,
                    borderRadius: '6px', padding: '4px 10px', gap: '8px'
                }}>
                    <input
                        type="text" value={inputValue} onChange={handleInput} placeholder="DD/MM/YYYY"
                        style={{ background: 'none', border: 'none', outline: 'none', color: currentTheme.text, fontSize: '12px', width: '85px', fontWeight: 700, fontFamily: 'monospace' }}
                    />
                    <Calendar size={14} style={{ cursor: 'pointer', color: isOpen ? currentTheme.primary : currentTheme.textSecondary }} onClick={() => onToggle(isOpen ? null : id)} />
                </div>
                {isOpen && ReactDOM.createPortal(
                    <div
                        id={`cal-portal-${id}`}
                        style={{
                            position: 'fixed', top: coords.top, left: coords.left, width: '260px', zIndex: 999999,
                            background: '#0B111E', border: '1px solid rgba(56, 189, 248, 0.4)', borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0,0,0,0.6)', overflow: 'hidden', fontFamily: currentTheme.fontFamily
                        }}
                    >
                        {renderCalendar()}
                    </div>,
                    document.body
                )}
            </div>
        );
    };

    // ==================== SO DETAIL MODAL ====================
    const renderSODetailModal = () => {
        if (!selectedSO) return null;

        const plans = localPlans.filter(p => p.so_id === selectedSO.so_id).sort((a, b) => a.sequence - b.sequence);
        const isHigh = selectedSO.priority === 'HIGH';

        return ReactDOM.createPortal(
            <AnimatePresence>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedSO(null)}
                    style={{
                        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
                        zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, y: 20 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.9, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                            ...currentTheme.card,
                            width: '100%', maxWidth: '1200px', maxHeight: '90vh', overflow: 'hidden',
                            display: 'flex', flexDirection: 'column'
                        }}
                    >
                        {/* Modal Header */}
                        <div style={{
                            padding: '24px 32px', borderBottom: currentTheme.tableRow.borderBottom,
                            background: theme === 'dark' ? 'linear-gradient(90deg, #0B1221 0%, rgba(15,23,42,0) 100%)' : '#F8FAFC',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                        }}>
                            <div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                        width: '48px', height: '48px', borderRadius: theme === 'dark' ? '8px' : '50%',
                                        background: theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        border: `1px solid ${theme === 'dark' ? currentTheme.primary + '40' : 'transparent'}`
                                    }}>
                                        <FileText size={24} color={currentTheme.primary} />
                                    </div>
                                    <div>
                                        <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: currentTheme.text }}>{selectedSO.so_number}</h2>
                                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: currentTheme.textSecondary }}>{selectedSO.customer_name}</p>
                                    </div>
                                </div>
                            </div>
                            <button onClick={() => setSelectedSO(null)} style={{
                                padding: '8px', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}`,
                                background: 'transparent', color: currentTheme.textSecondary, cursor: 'pointer',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s'
                            }}>
                                <X size={20} />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div style={{
                            padding: '16px 32px', borderBottom: currentTheme.tableRow.borderBottom,
                            background: theme === 'dark' ? 'rgba(15, 23, 42, 0.5)' : '#FAFBFC',
                            display: 'flex', gap: '8px'
                        }}>
                            {['overview', 'product', 'planning', 'timeline'].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setDetailTab(tab)}
                                    style={{
                                        padding: '8px 16px', borderRadius: '8px', border: 'none',
                                        background: detailTab === tab ? (theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF') : 'transparent',
                                        color: detailTab === tab ? currentTheme.primary : currentTheme.textSecondary,
                                        fontSize: '12px', fontWeight: 600, cursor: 'pointer', textTransform: 'uppercase',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {tab === 'overview' && <Activity size={14} style={{ marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />}
                                    {tab === 'product' && <Package size={14} style={{ marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />}
                                    {tab === 'planning' && <List size={14} style={{ marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />}
                                    {tab === 'timeline' && <Clock size={14} style={{ marginRight: '6px', display: 'inline', verticalAlign: 'middle' }} />}
                                    {tab}
                                </button>
                            ))}
                        </div>

                        {/* Modal Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
                            {detailTab === 'overview' && (
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                                    {/* Basic Info */}
                                    <div style={{ padding: '20px', borderRadius: theme === 'dark' ? '8px' : '12px', background: theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC', border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}` }}>
                                        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: currentTheme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Hash size={16} color={currentTheme.primary} /> Order Information
                                        </h3>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <div><span style={{ color: currentTheme.textSecondary, fontSize: '12px' }}>SO Number:</span> <span style={{ color: currentTheme.text, fontWeight: 600, marginLeft: '8px' }}>{selectedSO.so_number}</span></div>
                                            <div><span style={{ color: currentTheme.textSecondary, fontSize: '12px' }}>Created:</span> <span style={{ color: currentTheme.text, marginLeft: '8px' }}>{new Date(selectedSO.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                                            <div><span style={{ color: currentTheme.textSecondary, fontSize: '12px' }}>Due Date:</span> <span style={{ color: isHigh ? currentTheme.danger : currentTheme.text, fontWeight: isHigh ? 700 : 400, marginLeft: '8px' }}>{new Date(selectedSO.customer_due_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</span></div>
                                            <div><span style={{ color: currentTheme.textSecondary, fontSize: '12px' }}>Priority:</span> <span style={{ marginLeft: '8px', display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, background: isHigh ? (theme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : '#FECACA') : (theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#DCFCE7'), color: isHigh ? (theme === 'dark' ? '#F87171' : '#DC2626') : (theme === 'dark' ? '#34D399' : '#16A34A') }}>{selectedSO.priority}</span></div>
                                        </div>
                                    </div>

                                    {/* Customer Info */}
                                    <div style={{ padding: '20px', borderRadius: theme === 'dark' ? '8px' : '12px', background: theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC', border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}` }}>
                                        <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: currentTheme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <User size={16} color={currentTheme.accent} /> Customer
                                        </h3>
                                        <div style={{ display: 'grid', gap: '12px' }}>
                                            <div><span style={{ color: currentTheme.textSecondary, fontSize: '12px' }}>Name:</span> <span style={{ color: currentTheme.text, fontWeight: 600, marginLeft: '8px' }}>{selectedSO.customer_name}</span></div>
                                            <div><span style={{ color: currentTheme.textSecondary, fontSize: '12px' }}>Item:</span> <span style={{ color: currentTheme.text, marginLeft: '8px' }}>{selectedSO.item_name}</span></div>
                                            <div><span style={{ color: currentTheme.textSecondary, fontSize: '12px' }}>Quantity:</span> <span style={{ color: currentTheme.text, fontWeight: 700, marginLeft: '8px' }}>{selectedSO.total_qty?.toLocaleString()} pcs</span></div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {detailTab === 'product' && (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <div style={{ padding: '24px', borderRadius: theme === 'dark' ? '8px' : '12px', background: theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC', border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}` }}>
                                        <h3 style={{ margin: '0 0 20px 0', fontSize: '16px', fontWeight: 700, color: currentTheme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Ruler size={18} color={currentTheme.primary} /> Product Specifications
                                        </h3>
                                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
                                            <div style={{ padding: '16px', borderRadius: '8px', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#FFFFFF', border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}` }}>
                                                <div style={{ fontSize: '11px', color: currentTheme.textSecondary, marginBottom: '4px', textTransform: 'uppercase' }}>Width / Thickness</div>
                                                <div style={{ fontSize: '16px', fontWeight: 700, color: currentTheme.text }}>{selectedSO.width_thick || '-'}</div>
                                            </div>
                                            <div style={{ padding: '16px', borderRadius: '8px', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#FFFFFF', border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}` }}>
                                                <div style={{ fontSize: '11px', color: currentTheme.textSecondary, marginBottom: '4px', textTransform: 'uppercase' }}>Final Size</div>
                                                <div style={{ fontSize: '16px', fontWeight: 700, color: currentTheme.text }}>{selectedSO.final_size || '-'}</div>
                                            </div>
                                            <div style={{ padding: '16px', borderRadius: '8px', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#FFFFFF', border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}` }}>
                                                <div style={{ fontSize: '11px', color: currentTheme.textSecondary, marginBottom: '4px', textTransform: 'uppercase' }}>Colors</div>
                                                <div style={{ fontSize: '16px', fontWeight: 700, color: currentTheme.text }}>{selectedSO.colors || '-'}</div>
                                            </div>
                                            <div style={{ padding: '16px', borderRadius: '8px', background: theme === 'dark' ? 'rgba(0,0,0,0.2)' : '#FFFFFF', border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}` }}>
                                                <div style={{ fontSize: '11px', color: currentTheme.textSecondary, marginBottom: '4px', textTransform: 'uppercase' }}>Total Quantity</div>
                                                <div style={{ fontSize: '16px', fontWeight: 700, color: currentTheme.accent }}>{selectedSO.total_qty?.toLocaleString()} pcs</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {detailTab === 'planning' && (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: currentTheme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Layers size={18} color={currentTheme.primary} /> Routing & Resource Planning
                                    </h3>
                                    {plans.length === 0 ? (
                                        <div style={{ padding: '40px', textAlign: 'center', color: currentTheme.textSecondary }}>
                                            No planning data available
                                        </div>
                                    ) : (
                                        plans.map((plan, idx) => {
                                            const machine = getMachineById(plan.machine_id);
                                            const station = getStationById(plan.station_id);
                                            return (
                                                <div key={plan.plan_id} style={{ padding: '20px', borderRadius: theme === 'dark' ? '8px' : '12px', background: theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC', border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}` }}>
                                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                            <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: currentTheme.primary }}>{plan.sequence}</div>
                                                            <div>
                                                                <div style={{ fontSize: '13px', fontWeight: 600, color: currentTheme.text }}>{station?.station_name || 'Station ' + plan.station_id}</div>
                                                                <div style={{ fontSize: '11px', color: currentTheme.textSecondary }}>{machine?.machine_name || 'Machine ' + plan.machine_id}</div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                                                        <div>
                                                            <div style={{ fontSize: '10px', color: currentTheme.textSecondary, marginBottom: '4px' }}>Setup Time</div>
                                                            <div style={{ fontSize: '14px', fontWeight: 600, color: currentTheme.text }}>{plan.setup_time_minutes || 0} min</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', color: currentTheme.textSecondary, marginBottom: '4px' }}>Run Time</div>
                                                            <div style={{ fontSize: '14px', fontWeight: 600, color: currentTheme.text }}>{plan.run_time_minutes || 0} min</div>
                                                        </div>
                                                        <div>
                                                            <div style={{ fontSize: '10px', color: currentTheme.textSecondary, marginBottom: '4px' }}>Changeover</div>
                                                            <div style={{ fontSize: '14px', fontWeight: 600, color: currentTheme.text }}>{plan.changeover_time_minutes || 0} min</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {detailTab === 'timeline' && (
                                <div style={{ display: 'grid', gap: '16px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: currentTheme.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <Calendar size={18} color={currentTheme.primary} /> Timeline & Status
                                    </h3>
                                    <div style={{ padding: '24px', borderRadius: theme === 'dark' ? '8px' : '12px', background: theme === 'dark' ? 'rgba(15, 23, 42, 0.6)' : '#F8FAFC', border: `1px solid ${theme === 'dark' ? '#334155' : '#E2E8F0'}` }}>
                                        <div style={{ display: 'grid', gap: '20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: theme === 'dark' ? 'rgba(52, 211, 153, 0.15)' : '#DCFCE7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Calendar size={20} color={currentTheme.accent} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '12px', color: currentTheme.textSecondary }}>Order Created</div>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: currentTheme.text }}>{new Date(selectedSO.created_at).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: isHigh ? (theme === 'dark' ? 'rgba(251, 113, 133, 0.15)' : '#FECACA') : (theme === 'dark' ? 'rgba(52, 211, 153, 0.15)' : '#DCFCE7'), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <CalendarClock size={20} color={isHigh ? currentTheme.danger : currentTheme.accent} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '12px', color: currentTheme.textSecondary }}>Customer Due Date</div>
                                                    <div style={{ fontSize: '14px', fontWeight: 700, color: isHigh ? currentTheme.danger : currentTheme.text }}>{new Date(selectedSO.customer_due_date).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
                                                </div>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <Activity size={20} color={currentTheme.primary} />
                                                </div>
                                                <div style={{ flex: 1 }}>
                                                    <div style={{ fontSize: '12px', color: currentTheme.textSecondary }}>Current Status</div>
                                                    <div style={{ fontSize: '14px', fontWeight: 600, color: currentTheme.text }}>Total Plans: {plans.length} routing steps</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </motion.div>
                </motion.div>
            </AnimatePresence>,
            document.body
        );
    };

    React.useEffect(() => {
        setIsLoaded(false);
        const timer = setTimeout(() => {
            setLocalOrders(Array.isArray(salesOrders) ? [...salesOrders] : []);
            const allPlans = salesOrders.flatMap(so => getPlanRowsForSO(so.so_id));
            setLocalPlans(allPlans);
            setIsLoaded(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [viewMode]);

    const [localMachineStatus, setLocalMachineStatus] = React.useState({});

    const handleStartPlan = (planId) => {
        // This simulates sending to Operator system and updating Summary
        startExecution(planId, 'SYSTEM_AUTO');
        addNotification({
            type: 'info',
            title: 'Operator Feed Updated',
            message: 'Real-time production data is now syncing with User Operator terminal.'
        });
    };

    const handlePlanUpdate = (planId, field, value) => {
        updatePlan(planId, { [field]: value });
        setLocalPlans(prev => prev.map(p => p.plan_id === planId ? { ...p, [field]: value } : p));
    };

    const handleAddSiblingPlan = (sourcePlan) => {
        const newPlan = {
            plan_id: Date.now() + Math.random(),
            so_id: sourcePlan.so_id, station_id: sourcePlan.station_id,
            machine_id: machines.find(m => m.station_id === sourcePlan.station_id)?.machine_id || 1,
            sequence: sourcePlan.sequence + 0.1, setup: 15, run: 480, co: 10,
            planned_start: new Date(), planned_end: new Date(), total_qty: 1000,
            setup_time_minutes: 15,
            run_time_minutes: 480,
            changeover_time_minutes: 10
        };

        // Add to context
        addPlan(newPlan);

        // Update local state for UI
        const updatedPlans = [...localPlans, newPlan];
        const soPlans = updatedPlans.filter(p => p.so_id === sourcePlan.so_id);
        soPlans.sort((a, b) => a.sequence - b.sequence);
        soPlans.forEach((p, idx) => p.sequence = idx + 1);
        setLocalPlans(prev => {
            const otherPlans = prev.filter(p => p.so_id !== sourcePlan.so_id);
            return [...otherPlans, ...soPlans];
        });
    };

    const handleRemovePlan = (planId) => {
        removePlan(planId);
        setLocalPlans(prev => prev.filter(p => p.plan_id !== planId));
    };

    const filteredOrders = React.useMemo(() => {
        if (!isLoaded) return [];
        const targetDateStr = viewMode === 'tomorrow' ? '2026-02-11' : '2026-02-10';
        return localOrders.filter(so => {
            if (!so) return false;
            const search = searchTerm.toLowerCase();
            const matchesSearch = (so.so_number || '').toLowerCase().includes(search) || (so.customer_name || '').toLowerCase().includes(search);
            if (viewMode === 'all') return matchesSearch;
            try { return matchesSearch && new Date(so.customer_due_date).toISOString().split('T')[0] === targetDateStr; } catch (e) { return matchesSearch; }
        });
    }, [localOrders, searchTerm, viewMode, isLoaded]);

    const getMachineForStation = (so, stationId) => {
        if (!so) return '-';
        const plan = localPlans.find(p => p.so_id === so.so_id && p.station_id === stationId);
        if (!plan) return '-';
        const machine = getMachineById(plan.machine_id);
        return machine ? machine.machine_code : '-';
    };

    // --- VIEW RENDERERS ---

    const [activeCalendar, setActiveCalendar] = React.useState(null);

    const handleStartDateChange = (soId, date) => {
        setLocalOrders(prev => prev.map(so =>
            so.so_id === soId ? { ...so, start_date: date } : so
        ));

        // Sync with plans
        setLocalPlans(prev => prev.map(p =>
            p.so_id === soId ? { ...p, planned_start: date } : p
        ));

        addNotification({
            type: 'success',
            title: 'Schedule Synchronized',
            message: `Start date for SO ${getSalesOrderById(soId)?.so_number} and all associated plans updated.`
        });
    };

    const renderSODataView = () => {
        const columns = [
            { l: 'Timestamp', i: Clock, w: '120px' },
            { l: 'SO No.', i: Hash, w: '140px' },
            { l: 'Issue Date', i: Calendar, w: '100px' },
            { l: 'ลูกค้า', i: User, w: '180px' },
            { l: 'Item Name', i: Package, w: '180px' },
            { l: 'Due Date', i: CalendarClock, w: '100px' },
            { l: 'Width (mm)', i: Ruler, w: '100px' },
            { l: 'Thick (mic)', i: Ruler, w: '100px' },
            { l: 'Print Colors', i: Palette, w: '110px' },
            { l: 'Size (W*L)', i: Box, w: '140px' },
            { l: 'Quantity', i: Layers, w: '110px' },
            { l: 'Combination', i: Zap, w: '120px' },
            { l: 'Folding Type', i: Layers, w: '120px' },
            { l: 'Routing 1', i: Cpu, w: '80px' },
            { l: 'Routing 2', i: Cpu, w: '80px' },
            { l: 'Routing 3', i: Cpu, w: '80px' },
            { l: 'Routing 4', i: Cpu, w: '80px' },
            { l: 'Remark 1', i: FileText, w: '150px' },
            { l: 'Remark 2', i: FileText, w: '150px' },
            { l: 'Remark 3', i: FileText, w: '150px' },
            { l: 'กำหนดวันเริ่มงาน', i: Calendar, w: '200px' }
        ];

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} style={currentTheme.card} className={theme === 'dark' ? 'tech-border' : ''}>
                {theme === 'dark' && <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: currentTheme.primary, boxShadow: `0 0 20px ${currentTheme.primary}` }}></div>}
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, fontFamily: currentTheme.fontFamily }}>
                        <thead>
                            <tr style={currentTheme.tableHeader}>
                                {columns.map((h, i) => (
                                    <th key={i} style={{ padding: '16px 20px', textAlign: 'left', whiteSpace: 'nowrap', borderRight: currentTheme.columnDivider, minWidth: h.w }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <h.i size={14} color={currentTheme.textSecondary} />
                                            <span style={{ fontSize: '11px', fontWeight: 800 }}>{h.l}</span>
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((so, idx) => {
                                const isHigh = so.priority === 'HIGH';
                                const soPlans = localPlans.filter(p => p.so_id === so.so_id).sort((a, b) => a.sequence - b.sequence);

                                return (
                                    <motion.tr
                                        key={so.so_id}
                                        whileHover={{ background: currentTheme.tableRow.hoverBg }}
                                        style={{
                                            background: idx % 2 === 0 ? 'transparent' : currentTheme.tableRow.oddBg,
                                            transition: 'all 0.2s', position: 'relative'
                                        }}
                                    >
                                        <td style={{ padding: '14px 20px', fontSize: '11px', color: currentTheme.textSecondary, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            {new Date(so.created_at || Date.now()).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                                        </td>
                                        <td onClick={() => setSelectedSO(so)} style={{ padding: '14px 20px', fontWeight: 800, fontSize: '13px', color: currentTheme.primary, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider, cursor: 'pointer' }}>
                                            {so.so_number}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '12px', color: currentTheme.textSecondary, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            {new Date(so.created_at || Date.now()).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit', year: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontWeight: 700, fontSize: '12px', color: currentTheme.text, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            {so.customer_name}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '12px', color: currentTheme.text, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            {so.item_name}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '12px', color: isHigh ? currentTheme.danger : currentTheme.text, fontWeight: isHigh ? 800 : 500, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            {new Date(so.customer_due_date).toLocaleDateString('th-TH', { day: '2-digit', month: '2-digit' })}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '12px', color: currentTheme.text, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            {so.width || '-'}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '12px', color: currentTheme.text, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            {so.thickness || '-'}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '12px', color: currentTheme.text, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            {so.colors || '-'}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '12px', color: currentTheme.text, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            {so.final_size || '-'}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontWeight: 800, fontSize: '12px', color: currentTheme.accent, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            {so.total_qty?.toLocaleString()}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '11px', color: currentTheme.textSecondary, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            {so.combination || 'N/A'}
                                        </td>
                                        <td style={{ padding: '14px 20px', fontSize: '11px', color: currentTheme.textSecondary, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            {so.folding_type || 'N/A'}
                                        </td>
                                        <td onClick={() => { setActiveSubTab('TIMECARD'); setSearchTerm(so.so_number); }} style={{ padding: '14px 20px', fontSize: '11px', color: currentTheme.primary, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider, cursor: 'pointer', fontWeight: 600 }}>{getMachineForStation(so, 1)}</td>
                                        <td onClick={() => { setActiveSubTab('TIMECARD'); setSearchTerm(so.so_number); }} style={{ padding: '14px 20px', fontSize: '11px', color: currentTheme.primary, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider, cursor: 'pointer', fontWeight: 600 }}>{getMachineForStation(so, 2)}</td>
                                        <td onClick={() => { setActiveSubTab('TIMECARD'); setSearchTerm(so.so_number); }} style={{ padding: '14px 20px', fontSize: '11px', color: currentTheme.primary, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider, cursor: 'pointer', fontWeight: 600 }}>{getMachineForStation(so, 3)}</td>
                                        <td onClick={() => { setActiveSubTab('TIMECARD'); setSearchTerm(so.so_number); }} style={{ padding: '14px 20px', fontSize: '11px', color: currentTheme.primary, borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider, cursor: 'pointer', fontWeight: 600 }}>{getMachineForStation(so, 4)}</td>
                                        <td style={{ padding: '14px 20px', fontSize: '10px', color: currentTheme.textSecondary, fontStyle: 'italic', borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>{so.remark_1 || '-'}</td>
                                        <td style={{ padding: '14px 20px', fontSize: '10px', color: currentTheme.textSecondary, fontStyle: 'italic', borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>{so.remark_2 || '-'}</td>
                                        <td style={{ padding: '14px 20px', fontSize: '10px', color: currentTheme.textSecondary, fontStyle: 'italic', borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>{so.remark_3 || '-'}</td>
                                        <td style={{ padding: '14px 20px', borderBottom: currentTheme.tableRow.borderBottom, borderRight: currentTheme.columnDivider }}>
                                            <MasterHybridDatePicker
                                                id={`cal-${so.so_id}`}
                                                value={so.start_date || so.created_at}
                                                onChange={(date) => handleStartDateChange(so.so_id, date)}
                                                isOpen={activeCalendar === `cal-${so.so_id}`}
                                                onToggle={setActiveCalendar}
                                            />
                                        </td>
                                    </motion.tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        );
    };

    const renderTimecardView = () => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', isolation: 'isolate', fontFamily: currentTheme.fontFamily }}>
            {filteredOrders.map(so => {
                const plans = localPlans.filter(p => p.so_id === so.so_id).sort((a, b) => a.sequence - b.sequence);
                const isHigh = so.priority === 'HIGH';
                const accentColor = isHigh ? currentTheme.danger : currentTheme.primary;

                return (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={so.so_id}
                        style={{
                            ...currentTheme.card,
                            padding: 0,
                            overflow: 'hidden',
                            borderLeft: `6px solid ${accentColor}`,
                            boxShadow: theme === 'dark' ? `0 15px 50px -15px ${accentColor}15` : '0 10px 30px -10px rgba(0,0,0,0.05)'
                        }}
                    >
                        {/* Header Frame */}
                        <div style={{
                            padding: '20px 28px',
                            borderBottom: currentTheme.tableRow.borderBottom,
                            background: theme === 'dark' ? 'linear-gradient(90deg, #0D1627 0%, rgba(13,22,39,0) 100%)' : '#F8FAFC',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                                <div onClick={() => setSelectedSO(so)} style={{ cursor: 'pointer' }}>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: currentTheme.textSecondary, letterSpacing: '2px', marginBottom: '4px' }}>ORDER_TRACKING</div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '18px', fontWeight: 900, color: currentTheme.text }}>
                                        {so.so_number}
                                        <Terminal size={16} color={currentTheme.primary} />
                                    </div>
                                </div>
                                <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.05)' }}></div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: currentTheme.textSecondary, letterSpacing: '1px', marginBottom: '4px' }}>CLIENT</div>
                                    <div style={{ fontSize: '14px', fontWeight: 700, color: currentTheme.text }}>{so.customer_name}</div>
                                </div>
                                <div style={{ width: '1px', height: '32px', background: 'rgba(255,255,255,0.05)' }}></div>
                                <div>
                                    <div style={{ fontSize: '10px', fontWeight: 800, color: currentTheme.textSecondary, letterSpacing: '1px', marginBottom: '4px' }}>QTY_TARGET</div>
                                    <div style={{ fontSize: '14px', fontWeight: 900, color: currentTheme.accent }}>{so.total_qty?.toLocaleString()} <span style={{ fontSize: '10px', opacity: 0.7 }}>PCS</span></div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button
                                    onClick={() => {
                                        plans.forEach(p => completeExecution(p.plan_id, p.total_qty || 1000, 0));
                                        addNotification({ type: 'success', title: 'Work Success', message: `SO ${so.so_number} marked as complete.` });
                                        setActiveSubTab('SUMMARY');
                                    }}
                                    style={{
                                        display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 20px',
                                        background: theme === 'dark' ? 'rgba(16, 185, 129, 0.1)' : '#10B981',
                                        color: theme === 'dark' ? '#10B981' : '#fff',
                                        border: theme === 'dark' ? `1px solid #10B981` : 'none',
                                        borderRadius: '6px', fontWeight: 900, fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase'
                                    }}
                                >
                                    <CheckCircle size={14} /> <span>Success</span>
                                </button>
                                <button
                                    onClick={() => {
                                        setActiveSubTab('PLAN MANAGER');
                                        setSearchTerm(so.so_number);
                                    }}
                                    style={{
                                        display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 20px',
                                        background: theme === 'dark' ? 'rgba(56, 189, 248, 0.1)' : currentTheme.primary,
                                        color: theme === 'dark' ? currentTheme.primary : '#fff',
                                        border: theme === 'dark' ? `1px solid ${currentTheme.primary}` : 'none',
                                        borderRadius: '6px', fontWeight: 900, fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase'
                                    }}
                                >
                                    <Play size={14} /> <span>Process to Plan</span>
                                </button>
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto', padding: '12px 24px 24px' }}>
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px', fontSize: '12px' }}>
                                <thead>
                                    <tr>
                                        {['ROUTING_STEP', 'RESOURCE_ASSIGNMENT', 'LANE', 'SETUP_MIN', 'RUN_MIN', 'C/O_MIN', 'ACTIONS'].map(h => (
                                            <th key={h} style={{ padding: '0 12px 10px', textAlign: 'left', color: currentTheme.textSecondary, fontSize: '10px', textTransform: 'uppercase', fontWeight: 800, letterSpacing: '1px' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {plans.map((plan, idx) => {
                                        const isSameStationAsPrev = idx > 0 && plans[idx - 1].station_id === plan.station_id;
                                        const isPrinting = plan.station_id === 2; // S2 Printing
                                        const station = getStationById(plan.station_id);

                                        return (
                                            <motion.tr
                                                key={plan.plan_id}
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                                                style={{ background: theme === 'dark' ? 'rgba(255,255,255,0.01)' : '#FFFFFF', transition: 'all 0.2s' }}
                                            >
                                                <td style={{ padding: '12px', borderTopLeftRadius: '8px', borderBottomLeftRadius: '8px', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'transparent'}` }}>
                                                    {!isSameStationAsPrev ? (
                                                        <CustomDropdown
                                                            id={`station-${plan.plan_id}`}
                                                            options={stations.map(s => ({ value: s.station_id, label: s.station_name }))}
                                                            value={plan.station_id}
                                                            onChange={(val) => handlePlanUpdate(plan.plan_id, 'station_id', val)}
                                                            placeholder="Select Station"
                                                            title="Routing Step"
                                                            icon={Layers}
                                                            isOpen={openDropdownId === `station-${plan.plan_id}`}
                                                            onToggle={setOpenDropdownId}
                                                        />
                                                    ) : (
                                                        <div style={{ display: 'flex', alignItems: 'center', height: '100%', paddingLeft: '24px' }}>
                                                            <div style={{ width: '12px', height: '40px', borderLeft: `2px solid ${accentColor}40`, borderBottom: `2px solid ${accentColor}40`, transform: 'translateY(-50%)', marginTop: '-20px', borderBottomLeftRadius: '8px' }}></div>
                                                        </div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'transparent'}` }}>
                                                    <CustomDropdown
                                                        id={`machine-${plan.plan_id}`}
                                                        options={machines.filter(m => m.station_id === plan.station_id).map(m => ({ value: m.machine_id, label: m.machine_code }))}
                                                        value={plan.machine_id}
                                                        onChange={(val) => handlePlanUpdate(plan.plan_id, 'machine_id', val)}
                                                        placeholder="Select Machine"
                                                        title="Assign Resource"
                                                        icon={Cpu}
                                                        isOpen={openDropdownId === `machine-${plan.plan_id}`}
                                                        onToggle={setOpenDropdownId}
                                                    />
                                                </td>
                                                <td style={{ padding: '12px', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'transparent'}` }}>
                                                    {isPrinting ? (
                                                        <CustomDropdown
                                                            id={`lane-${plan.plan_id}`}
                                                            options={[
                                                                { value: 'Lane A', label: 'Lane A' },
                                                                { value: 'Lane B', label: 'Lane B' },
                                                                { value: 'Double Lane', label: 'Double Lane' },
                                                                { value: 'N/A', label: 'None' }
                                                            ]}
                                                            value={plan.lane || 'Lane A'}
                                                            onChange={(val) => handlePlanUpdate(plan.plan_id, 'lane', val)}
                                                            placeholder="Select Lane"
                                                            title="Production Lane"
                                                            icon={Zap}
                                                            isOpen={openDropdownId === `lane-${plan.plan_id}`}
                                                            onToggle={setOpenDropdownId}
                                                        />
                                                    ) : (
                                                        <div style={{ paddingLeft: '12px', color: currentTheme.textSecondary, fontStyle: 'italic', fontSize: '11px' }}>Standard</div>
                                                    )}
                                                </td>
                                                <td style={{ padding: '12px', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'transparent'}` }}>
                                                    <input
                                                        type="number"
                                                        disabled={!canEdit}
                                                        value={plan.setup ?? 15}
                                                        onChange={(e) => handlePlanUpdate(plan.plan_id, 'setup', parseInt(e.target.value) || 0)}
                                                        style={{ ...currentTheme.input, width: '100%', textAlign: 'center', padding: '12px 8px', fontSize: '14px', fontWeight: 800, fontFamily: 'monospace' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '12px', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'transparent'}` }}>
                                                    <input
                                                        type="number"
                                                        disabled={!canEdit}
                                                        value={plan.run ?? 480}
                                                        onChange={(e) => handlePlanUpdate(plan.plan_id, 'run', parseInt(e.target.value) || 0)}
                                                        style={{ ...currentTheme.input, width: '100%', textAlign: 'center', padding: '12px 8px', fontSize: '14px', fontWeight: 800, fontFamily: 'monospace', background: theme === 'dark' ? 'rgba(59, 130, 246, 0.05)' : '#FFF' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '12px', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'transparent'}` }}>
                                                    <input
                                                        type="number"
                                                        disabled={!canEdit}
                                                        value={plan.co ?? 10}
                                                        onChange={(e) => handlePlanUpdate(plan.plan_id, 'co', parseInt(e.target.value) || 0)}
                                                        style={{ ...currentTheme.input, width: '100%', textAlign: 'center', padding: '12px 8px', fontSize: '14px', fontWeight: 800, fontFamily: 'monospace' }}
                                                    />
                                                </td>
                                                <td style={{ padding: '12px', borderTopRightRadius: '8px', borderBottomRightRadius: '8px', border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'transparent'}` }}>
                                                    <div style={{ display: 'flex', gap: '8px' }}>
                                                        <button
                                                            onClick={() => handleAddSiblingPlan(plan)}
                                                            title="Add Machine to this Station"
                                                            style={{
                                                                padding: '8px', background: `${currentTheme.primary}15`, color: currentTheme.primary,
                                                                border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex'
                                                            }}
                                                        >
                                                            <Plus size={14} />
                                                        </button>
                                                        {plans.length > 1 && (
                                                            <button
                                                                onClick={() => handleRemovePlan(plan.plan_id)}
                                                                title="Remove this Machine Entry"
                                                                style={{
                                                                    padding: '8px', background: `${currentTheme.danger}15`, color: currentTheme.danger,
                                                                    border: 'none', borderRadius: '6px', cursor: 'pointer', display: 'flex'
                                                                }}
                                                            >
                                                                <Trash2 size={14} />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );


    const renderMasterPlanView = () => {
        const columns = [
            { l: 'ลำดับ', w: '60px' },
            { l: 'DATE', w: '80px' },
            { l: 'SO_NUMBER', w: '150px' },
            { l: 'CUSTOMER_DUE_DATE', w: '140px' },
            { l: 'PRIORITY', w: '100px' },
            { l: 'SEQ', w: '60px' },
            { l: 'STATION', w: '90px' },
            { l: 'MACHINE', w: '90px' },
            { l: 'RUNTIME ต่อวัน', w: '120px' },
            { l: 'START_TIME', w: '100px' },
            { l: 'END_TIME', w: '100px' },
            { l: 'TOTAL_QTY', w: '110px' },
            { l: 'PROGRESS', w: '140px' }
        ];

        const flatPlans = localPlans.map(plan => {
            const so = localOrders.find(o => o.so_id === plan.so_id);
            const status = executionStatus[plan.plan_id] || {};
            const station = getStationById(plan.station_id);
            const machine = getMachineById(plan.machine_id);
            const pStart = plan.planned_start ? new Date(plan.planned_start) : new Date();
            const pEnd = plan.planned_end ? new Date(plan.planned_end) : new Date();

            return {
                ...plan,
                so_number: so?.so_number || '-',
                customer_due_date: so?.customer_due_date,
                priority: so?.priority || 'NORMAL',
                total_qty: so?.total_qty || 0,
                station_code: station?.station_code,
                machine_code: machine?.machine_code,
                progress: status.progress || 0,
                is_completed: status.status === 'completed',
                formattedStart: pStart.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                formattedEnd: pEnd.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
                dateStr: pStart.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' })
            };
        }).sort((a, b) => a.so_number.localeCompare(b.so_number) || a.sequence - b.sequence);

        const plansBySO = filteredOrders.map(so => {
            const plans = flatPlans.filter(p => p.so_id === so.so_id);
            return { so, plans };
        }).filter(group => group.plans.length > 0);

        return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {plansBySO.map((group, gIdx) => (
                    <motion.div
                        key={group.so.so_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: gIdx * 0.05 }}
                        style={{ ...currentTheme.card, padding: 0, overflow: 'hidden', border: `1px solid ${theme === 'dark' ? 'rgba(56, 189, 248, 0.1)' : '#E2E8F0'}` }}
                    >
                        <div style={{
                            padding: '12px 24px',
                            background: theme === 'dark' ? 'rgba(15, 23, 42, 0.8)' : '#F8FAFC',
                            borderBottom: currentTheme.tableRow.borderBottom,
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                <div style={{ width: '4px', height: '16px', borderRadius: '2px', background: group.so.priority === 'HIGH' ? currentTheme.danger : currentTheme.primary }}></div>
                                <span style={{ fontSize: '14px', fontWeight: 900, color: currentTheme.text, letterSpacing: '1px' }}>{group.so.so_number}</span>
                                <span style={{ fontSize: '11px', fontWeight: 700, color: currentTheme.textSecondary, opacity: 0.7 }}>| {group.so.customer_name}</span>
                            </div>
                            <div style={{ fontSize: '10px', fontWeight: 800, color: currentTheme.textSecondary }}>
                                TOTAL_QTY: <span style={{ color: currentTheme.primary }}>{group.so.total_qty?.toLocaleString()}</span>
                            </div>
                        </div>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                                <thead>
                                    <tr style={{ ...currentTheme.tableHeader, background: theme === 'dark' ? '#0F172A' : '#F1F5F9' }}>
                                        {columns.map((col, i) => (
                                            <th key={i} style={{ padding: '14px 20px', textAlign: 'left', minWidth: col.w, fontSize: '10px', fontWeight: 900, color: currentTheme.textSecondary }}>{col.l}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {group.plans.map((p, idx) => (
                                        <tr key={p.plan_id} style={{
                                            borderBottom: currentTheme.tableRow.borderBottom,
                                            background: idx % 2 === 0 ? 'transparent' : (theme === 'dark' ? 'rgba(255,255,255,0.01)' : '#FAFAFA')
                                        }}>
                                            <td style={{ padding: '12px 20px', fontWeight: 800, color: currentTheme.textSecondary, fontFamily: 'monospace' }}>{String(idx + 1).padStart(2, '0')}</td>
                                            <td style={{ padding: '12px 20px' }}>{p.dateStr}</td>
                                            <td style={{ padding: '12px 20px', fontWeight: 800, color: currentTheme.primary }}>{p.so_number}</td>
                                            <td style={{ padding: '12px 20px' }}>{p.customer_due_date ? new Date(p.customer_due_date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' }) : '-'}</td>
                                            <td style={{ padding: '12px 20px' }}>
                                                <span style={{
                                                    padding: '4px 8px', borderRadius: '4px', fontSize: '9px', fontWeight: 900,
                                                    background: p.priority === 'HIGH' ? `${currentTheme.danger}15` : '#10B98115',
                                                    color: p.priority === 'HIGH' ? currentTheme.danger : '#10B981'
                                                }}>{p.priority}</span>
                                            </td>
                                            <td style={{ padding: '12px 20px', fontWeight: 700 }}>{p.sequence}</td>
                                            <td style={{ padding: '12px 20px' }}>{p.station_code}</td>
                                            <td style={{ padding: '12px 20px', color: currentTheme.accent, fontWeight: 700 }}>{p.machine_code}</td>
                                            <td style={{ padding: '12px 20px', fontWeight: 800 }}>{p.run || 0} MIN</td>
                                            <td style={{ padding: '12px 20px', fontWeight: 900, fontFamily: 'monospace' }}>{p.formattedStart}</td>
                                            <td style={{ padding: '12px 20px', fontWeight: 900, color: currentTheme.primary, fontFamily: 'monospace' }}>{p.formattedEnd}</td>
                                            <td style={{ padding: '12px 20px', fontWeight: 800 }}>{p.total_qty.toLocaleString()}</td>
                                            <td style={{ padding: '12px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ flex: 1, height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                                        <div style={{ height: '100%', width: `${p.progress}%`, background: p.is_completed ? '#10B981' : currentTheme.primary }}></div>
                                                    </div>
                                                    <span style={{ fontWeight: 800, fontSize: '10px' }}>{p.progress}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ))}
            </div>
        );
    };




    const renderMachineMonitorView = () => {
        const machineSpecs = {
            'SL-01': { process: 'Slit + ปรุ', speed: '80 m/min', width: '1000', color: '-', station: 'Station 1', colorKey: '#FEE2E2' },
            'SL-02': { process: 'Slit', speed: '100 m/min', width: '1000', color: '-', station: 'Station 1', colorKey: '#FEE2E2' },
            'RW-01': { process: 'Rewinding', speed: '90 m/min', width: '1000', color: '-', station: 'Station 1', colorKey: '#FEE2E2' },
            'SL-03': { process: 'Slit', speed: '80 m/min', width: '1000', color: '-', station: 'Station 1', colorKey: '#FEE2E2' },
            'RW-02': { process: 'Rewinding', speed: '95 m/min', width: '1000', color: '-', station: 'Station 1', colorKey: '#FEE2E2' },
            'PR-01': { process: 'Printing', speed: '180 m/min', width: '1010', color: '8', station: 'Station 2', colorKey: '#FED7AA' },
            'PR-02': { process: 'Printing', speed: '180 m/min', width: '1010', color: '8', station: 'Station 2', colorKey: '#FED7AA' },
            'PR-03': { process: 'Printing', speed: '80 m/min', width: '850', color: '10', station: 'Station 2', colorKey: '#FED7AA' },
            'PR-04': { process: 'Printing', speed: '150 m/min', width: '1010', color: '6', station: 'Station 2', colorKey: '#FED7AA' },
            'PR-05': { process: 'Printing', speed: '120 m/min', width: '900', color: '8', station: 'Station 2', colorKey: '#FED7AA' },
            'FD-01': { process: 'ซิลตะเข็บ + ปรุ', speed: '6 m/min', width: '500', color: '-', station: 'Station 3', colorKey: '#FDBA74' },
            'FD-02': { process: 'ซิลตะเข็บ + ปรุ', speed: '6 m/min', width: '500', color: '-', station: 'Station 3', colorKey: '#FDBA74' },
            'FD-03': { process: 'ซิลตะเข็บ', speed: '6 m/min', width: '700', color: '-', station: 'Station 3', colorKey: '#FDBA74' },
            'FD-04': { process: 'ซิลตะเข็บ', speed: '8 m/min', width: '600', color: '-', station: 'Station 3', colorKey: '#FDBA74' },
            'CT-01': { process: 'ตัดเปิด 2 ด้าน', speed: '100 pcs/min', width: '280', color: '-', station: 'Station 4', colorKey: '#FFEDD5' },
            'DC-01': { process: 'Die-Cutting', speed: '110 pcs/min', width: '300', color: '-', station: 'Station 4', colorKey: '#FFEDD5' },
            'DC-02': { process: 'Die-Cutting', speed: '110 pcs/min', width: '300', color: '-', station: 'Station 4', colorKey: '#FFEDD5' },
            'DC-03': { process: 'Die-Cutting', speed: '115 pcs/min', width: '350', color: '-', station: 'Station 4', colorKey: '#FFEDD5' },
            'CT-02': { process: 'ตัดเปิด 2 ด้าน', speed: '105 pcs/min', width: '300', color: '-', station: 'Station 4', colorKey: '#FFEDD5' }
        };

        const statusOptions = [
            { value: 'Active', label: 'Active', color: '#10B981', icon: CheckCircle },
            { value: 'Pending', label: 'Pending', color: '#F59E0B', icon: Clock },
            { value: 'Down', label: 'Down', color: '#EF4444', icon: AlertTriangle }
        ];

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...currentTheme.card, padding: 0, overflow: 'hidden' }}>
                <div style={{ padding: '24px', borderBottom: currentTheme.tableRow.borderBottom, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Cpu size={20} color={currentTheme.primary} />
                        Machine Resource Monitoring
                    </h3>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: currentTheme.textSecondary }}>{machines.length} Units Online</div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ ...currentTheme.tableHeader, background: theme === 'dark' ? '#0B1221' : '#F1F5F9' }}>
                                {['ลำดับ', 'ชื่อเครื่อง', 'Process', 'Max Speed', 'Max Width', 'Color', 'Station', 'Status', 'Timeline'].map(h => (
                                    <th key={h} style={{ padding: '16px 20px', textAlign: 'left', fontWeight: 800, textTransform: 'uppercase', color: currentTheme.textSecondary }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {machines.map((m, idx) => {
                                const spec = machineSpecs[m.machine_code] || { process: '-', speed: '-', width: '-', color: '-', station: '-', colorKey: 'transparent' };
                                const currentStatus = localMachineStatus[m.machine_id] || 'Active';
                                const statusInfo = statusOptions.find(o => o.value === currentStatus);

                                return (
                                    <tr key={m.machine_id} style={{
                                        borderBottom: currentTheme.tableRow.borderBottom,
                                        background: theme === 'light' ? spec.colorKey + '40' : 'transparent'
                                    }} className="hover-row">
                                        <td style={{ padding: '14px 20px', fontWeight: 700 }}>{idx + 1}</td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ fontWeight: 800, color: currentTheme.primary }}>{m.machine_code}</div>
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>{spec.process}</td>
                                        <td style={{ padding: '14px 20px', fontFamily: 'monospace' }}>{spec.speed}</td>
                                        <td style={{ padding: '14px 20px' }}>{spec.width} mm</td>
                                        <td style={{ padding: '14px 20px', textAlign: 'center' }}>{spec.color}</td>
                                        <td style={{ padding: '14px 20px', fontWeight: 600 }}>{spec.station}</td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ position: 'relative' }}>
                                                <select
                                                    value={currentStatus}
                                                    onChange={(e) => setLocalMachineStatus(prev => ({ ...prev, [m.machine_id]: e.target.value }))}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: '20px',
                                                        border: `1px solid ${statusInfo?.color}40`,
                                                        background: statusInfo?.color + '15',
                                                        color: statusInfo?.color,
                                                        fontWeight: 800,
                                                        fontSize: '11px',
                                                        cursor: 'pointer',
                                                        appearance: 'none',
                                                        textAlign: 'center',
                                                        minWidth: '100px',
                                                        outline: 'none'
                                                    }}
                                                >
                                                    {statusOptions.map(opt => (
                                                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                    ))}
                                                </select>
                                                <div style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}>
                                                    <ChevronDown size={10} color={statusInfo?.color} />
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ width: '100px', height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px' }}>
                                                <div style={{ width: currentStatus === 'Active' ? '100%' : '30%', height: '100%', background: statusInfo?.color, borderRadius: '3px' }}></div>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        );
    };

    const renderSummaryView = () => {
        const completedSOs = localOrders.filter(so => checkSOCompletion(so.so_id));
        const activeSOs = localOrders.filter(so => !checkSOCompletion(so.so_id));
        const totalTarget = localOrders.reduce((acc, so) => acc + so.total_qty, 0);
        const totalActual = localOrders.reduce((acc, so) => {
            const soPlans = plans.filter(p => p.so_id === so.so_id);
            return acc + soPlans.reduce((s, p) => s + (executionStatus[p.plan_id]?.actualQty || 0), 0);
        }, 0);
        const totalScrap = localOrders.reduce((acc, so) => {
            const soPlans = plans.filter(p => p.so_id === so.so_id);
            return acc + soPlans.reduce((s, p) => s + (executionStatus[p.plan_id]?.scrapQty || 0), 0);
        }, 0);

        const globalEfficiency = totalTarget > 0 ? (totalActual / totalTarget * 100).toFixed(1) : 0;

        return (
            <div style={{ display: 'grid', gap: '32px', animation: 'fadeIn 0.5s ease-out' }}>
                {/* Dashboard Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
                    {[
                        { label: 'Completed Orders', value: completedSOs.length, total: localOrders.length, icon: CheckCircle, color: '#10B981', trend: '+12%' },
                        { label: 'Live Throughput', value: totalActual.toLocaleString(), total: totalTarget.toLocaleString(), icon: Activity, color: '#3B82F6', trend: 'Live' },
                        { label: 'System Efficiency', value: `${globalEfficiency}%`, icon: TrendingUp, color: '#8B5CF6', trend: 'Good' },
                        { label: 'Scrap Mitigation', value: `${(100 - (totalScrap / (totalActual + totalScrap || 1) * 100)).toFixed(1)}%`, icon: Shield, color: '#F59E0B', trend: '-2.4%' }
                    ].map((stat, i) => (
                        <motion.div key={i} whileHover={{ y: -5, scale: 1.02 }} style={{
                            ...currentTheme.card,
                            padding: '24px',
                            position: 'relative',
                            overflow: 'hidden',
                            border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'}`
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                                <div style={{
                                    padding: '10px',
                                    borderRadius: '12px',
                                    background: `${stat.color}15`,
                                    color: stat.color,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <stat.icon size={20} />
                                </div>
                                <div style={{ fontSize: '10px', fontWeight: 800, color: stat.color, background: `${stat.color}20`, padding: '4px 8px', borderRadius: '20px' }}>
                                    {stat.trend}
                                </div>
                            </div>
                            <div style={{ fontSize: '11px', fontWeight: 800, color: currentTheme.textSecondary, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>{stat.label}</div>
                            <div style={{ fontSize: '28px', fontWeight: 800, color: currentTheme.text, letterSpacing: '-1px' }}>{stat.value}</div>
                            {stat.total && (
                                <div style={{ fontSize: '11px', color: currentTheme.textSecondary, marginTop: '4px' }}>
                                    of {stat.total} units
                                </div>
                            )}
                            {/* Micro Chart Path Placeholder */}
                            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '4px', background: `${stat.color}20` }}>
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: '70%' }}
                                    transition={{ duration: 1.5, delay: i * 0.2 }}
                                    style={{ height: '100%', background: stat.color, borderRadius: '2px' }}
                                />
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Main Content Area */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px' }}>
                    {/* Detailed Summary Table */}
                    <div style={{ ...currentTheme.card, padding: '0', overflow: 'hidden' }}>
                        <div style={{ padding: '24px', borderBottom: currentTheme.tableRow.borderBottom, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ fontSize: '16px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <BarChart2 size={20} color={currentTheme.primary} />
                                Master Production Summary
                            </h3>
                            <div style={{ display: 'flex', gap: '8px' }}>
                                <div style={{ padding: '4px', background: theme === 'dark' ? 'rgba(255,255,255,0.05)' : '#F1F5F9', borderRadius: '8px', display: 'flex', gap: '4px' }}>
                                    {['All', 'Active', 'Done'].map(tag => (
                                        <button key={tag} style={{
                                            padding: '4px 12px', border: 'none', borderRadius: '6px', fontSize: '11px', fontWeight: 700,
                                            background: tag === 'All' ? currentTheme.primary : 'transparent',
                                            color: tag === 'All' ? 'white' : currentTheme.textSecondary,
                                            cursor: 'pointer'
                                        }}>{tag}</button>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ position: 'sticky', top: 0, background: theme === 'dark' ? '#0B1221' : '#F8FAFC', zIndex: 10 }}>
                                    <tr>
                                        {['SO Number', 'Customer', 'Product', 'Target', 'Actual', 'Efficiency', 'Status'].map(h => (
                                            <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, color: currentTheme.textSecondary, textTransform: 'uppercase' }}>{h}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {localOrders.map((so) => {
                                        const isDone = checkSOCompletion(so.so_id);
                                        const soPlans = plans.filter(p => p.so_id === so.so_id);
                                        const actual = soPlans.reduce((acc, p) => acc + (executionStatus[p.plan_id]?.actualQty || 0), 0);
                                        const eff = so.total_qty > 0 ? (actual / so.total_qty * 100).toFixed(0) : 0;

                                        return (
                                            <tr
                                                key={so.so_id}
                                                style={{ borderBottom: currentTheme.tableRow.borderBottom, cursor: 'pointer' }}
                                                onClick={() => setSelectedSO(so)}
                                                className="hover-row"
                                            >
                                                <td style={{ padding: '16px 24px', fontWeight: 700, color: currentTheme.text }}>{so.so_number}</td>
                                                <td style={{ padding: '16px 24px', color: currentTheme.text }}>{so.customer_name}</td>
                                                <td style={{ padding: '16px 24px', color: currentTheme.textSecondary, fontSize: '12px' }}>{so.item_name}</td>
                                                <td style={{ padding: '16px 24px', fontWeight: 700 }}>{so.total_qty.toLocaleString()}</td>
                                                <td style={{ padding: '16px 24px', fontWeight: 700, color: '#10B981' }}>{actual.toLocaleString()}</td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <div style={{ flex: 1, minWidth: '40px', height: '6px', background: 'rgba(255,255,255,0.05)', borderRadius: '3px' }}>
                                                            <motion.div
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${Math.min(100, eff)}%` }}
                                                                style={{ height: '100%', background: parseInt(eff) > 90 ? '#10B981' : currentTheme.primary, borderRadius: '3px' }}
                                                            />
                                                        </div>
                                                        <span style={{ fontSize: '11px', fontWeight: 800 }}>{eff}%</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 24px' }}>
                                                    <div style={{
                                                        display: 'inline-flex', padding: '4px 10px', borderRadius: '6px', fontSize: '10px', fontWeight: 800,
                                                        background: isDone ? '#10B98115' : '#3B82F615',
                                                        color: isDone ? '#10B981' : '#3B82F6',
                                                        border: `1px solid ${isDone ? '#10B98133' : '#3B82F633'}`
                                                    }}>
                                                        {isDone ? 'COMPLETED' : 'IN PRODUCTION'}
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Right Side Insights */}
                    <div style={{ display: 'grid', gap: '24px' }}>
                        <div style={{ ...currentTheme.card, padding: '24px' }}>
                            <h4 style={{ fontSize: '13px', fontWeight: 800, marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1px', color: currentTheme.textSecondary }}>Live Production Mix</h4>
                            <div style={{ display: 'grid', gap: '16px' }}>
                                {['Slitting', 'Printing', 'Folding', 'Cutting'].map((dept, i) => (
                                    <div key={dept}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                                            <span style={{ fontWeight: 700 }}>{dept}</span>
                                            <span style={{ color: currentTheme.textSecondary }}>{75 - i * 10}%</span>
                                        </div>
                                        <div style={{ height: '6px', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${75 - i * 10}%` }}
                                                style={{ height: '100%', background: `hsl(${220 + i * 20}, 70%, 60%)` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ ...currentTheme.card, padding: '24px', background: theme === 'dark' ? 'linear-gradient(135deg, #4F46E522 0%, #050B14 100%)' : '#EEF2FF', border: '1px solid #4F46E544' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                <AlertTriangle size={20} color="#F59E0B" />
                                <span style={{ fontWeight: 800, fontSize: '13px', color: '#B45309' }}>Bottleneck Alert</span>
                            </div>
                            <p style={{ fontSize: '12px', lineHeight: '1.6', color: currentTheme.textSecondary, marginBottom: '16px' }}>
                                Printing line PR-02 is operating at 65% capacity due to high setup times. Recommend optimization for SO-2026-0105.
                            </p>
                            <button style={{
                                width: '100%', padding: '10px', borderRadius: '10px', border: 'none', background: '#4F46E5', color: 'white',
                                fontSize: '11px', fontWeight: 800, cursor: 'pointer'
                            }}>VIEW RECOMMENDATIONS</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    };




    const renderPlanOPView = () => {
        // Find active operators and their current assignments based on executionStatus
        const activeAssignments = localPlans.filter(p => {
            const status = executionStatus[p.plan_id];
            return status && (status.state === 'RUNNING' || status.state === 'PAUSED');
        }).map(p => {
            const status = executionStatus[p.plan_id];
            const lastEvent = status.events?.[(status.events?.length || 0) - 1];
            return {
                ...p,
                operatorName: lastEvent?.operator || 'Unknown',
                state: status.state,
                progress: status.actualQty / (p.total_qty || 1) * 100
            };
        });

        return (
            <div style={{ display: 'grid', gap: '32px', animation: 'fadeIn 0.5s ease-out' }}>
                {/* Operator Status Hero Section */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                    <motion.div whileHover={{ scale: 1.02 }} style={{ ...currentTheme.card, padding: '24px', background: theme === 'dark' ? 'linear-gradient(135deg, #1E293B 0%, #0F172A 100%)' : '#FFF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div style={{ padding: '10px', borderRadius: '12px', background: '#3B82F620', color: '#3B82F6' }}>
                                <Users size={20} />
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 800 }}>ACTIVE OPERATORS</div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 900 }}>{new Set(activeAssignments.map(a => a.operatorName)).size} / 12</div>
                        <div style={{ fontSize: '11px', color: currentTheme.textSecondary, marginTop: '8px' }}>Deployed across 4 Production Lines</div>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} style={{ ...currentTheme.card, padding: '24px', background: theme === 'dark' ? 'linear-gradient(135deg, #065F46 0%, #064E3B 100%)' : '#FFF' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div style={{ padding: '10px', borderRadius: '12px', background: '#10B98120', color: '#10B981' }}>
                                <Cpu size={20} />
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 800 }}>MACHINE UTILIZATION</div>
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 900 }}>{((activeAssignments.length / stations.length / 3) * 100).toFixed(1)}%</div>
                        <div style={{ fontSize: '11px', color: '#34D399', marginTop: '8px' }}>+4.2% from previous hour</div>
                    </motion.div>

                    <motion.div whileHover={{ scale: 1.02 }} style={{ ...currentTheme.card, padding: '24px', border: '1px solid #F59E0B44' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '15px' }}>
                            <div style={{ padding: '10px', borderRadius: '12px', background: '#F59E0B20', color: '#F59E0B' }}>
                                <AlertCircle size={20} />
                            </div>
                            <div style={{ fontSize: '14px', fontWeight: 800 }}>SHIFT HANDOVER</div>
                        </div>
                        <div style={{ fontSize: '24px', fontWeight: 900 }}>T-MINUS 124m</div>
                        <div style={{ fontSize: '11px', color: currentTheme.textSecondary, marginTop: '8px' }}>Next shift starting @ 14:00</div>
                    </motion.div>
                </div>

                {/* Operator Assignment Matrix */}
                <div style={{ ...currentTheme.card, padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '24px', borderBottom: currentTheme.tableRow.borderBottom, display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <HardHat size={20} color={currentTheme.primary} />
                            Resource Planning : Operator Assignment Matrix
                        </h3>
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <button style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: currentTheme.primary, color: 'white', fontSize: '11px', fontWeight: 800, cursor: 'pointer' }}>
                                ADD ASSIGNMENT
                            </button>
                        </div>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ ...currentTheme.tableHeader, background: theme === 'dark' ? '#0B1221' : '#F1F5F9' }}>
                                    {['Station', 'Active Operator', 'Assigned Machine', 'Current Job', 'Shift Status', 'Efficiency', 'Timeline'].map(h => (
                                        <th key={h} style={{ padding: '16px 24px', textAlign: 'left', fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', color: currentTheme.textSecondary }}>{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {stations.map(station => {
                                    const assignment = activeAssignments.find(a => a.station_id === station.station_id);
                                    const machine = assignment ? getMachineById(assignment.machine_id) : null;
                                    const so = assignment ? localOrders.find(o => o.so_id === assignment.so_id) : null;

                                    return (
                                        <tr key={station.station_id} style={{ borderBottom: currentTheme.tableRow.borderBottom }} className="hover-row">
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ fontSize: '14px', fontWeight: 800, color: currentTheme.text }}>{station.station_code}</div>
                                                <div style={{ fontSize: '11px', color: currentTheme.textSecondary }}>{station.station_name}</div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                {assignment ? (
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: currentTheme.primary + '30', color: currentTheme.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: '12px' }}>
                                                            {assignment.operatorName[0]}
                                                        </div>
                                                        <span style={{ fontWeight: 700, fontSize: '13px' }}>{assignment.operatorName}</span>
                                                    </div>
                                                ) : (
                                                    <span style={{ color: currentTheme.textSecondary, fontSize: '11px', fontStyle: 'italic' }}>Unassigned</span>
                                                )}
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ padding: '4px 10px', borderRadius: '6px', background: theme === 'dark' ? '#1E293B' : '#F1F5F9', display: 'inline-block', fontWeight: 700, fontSize: '12px', color: currentTheme.primary }}>
                                                    {machine ? machine.machine_code : '--'}
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                {so ? (
                                                    <div>
                                                        <div style={{ fontWeight: 800, fontSize: '12px' }}>{so.so_number}</div>
                                                        <div style={{ fontSize: '10px', color: currentTheme.textSecondary }}>{so.customer_name}</div>
                                                    </div>
                                                ) : '--'}
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: assignment ? (assignment.state === 'RUNNING' ? '#10B981' : '#F59E0B') : '#64748B' }}></div>
                                                    <span style={{ fontSize: '11px', fontWeight: 700 }}>{assignment ? (assignment.state === 'RUNNING' ? 'ON DUTY' : 'PENDING') : 'STANDBY'}</span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '20px 24px' }}>
                                                <div style={{ fontWeight: 800, color: '#10B981' }}>{assignment ? '98.2%' : '--'}</div>
                                            </td>
                                            <td style={{ padding: '20px 24px', width: '200px' }}>
                                                <div style={{ height: '6px', width: '100%', background: 'rgba(0,0,0,0.1)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: assignment ? `${assignment.progress}%` : '0%' }}
                                                        style={{ height: '100%', background: currentTheme.primary, borderRadius: '3px' }}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    const renderMasterConfigView = () => {
        const handleConfigChange = (key, newValue) => {
            setMasterConfig(prev => prev.map(c => c.key === key ? { ...c, value: newValue } : c));
        };

        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ ...currentTheme.card, padding: 0, overflow: 'hidden', border: `1px solid ${currentTheme.primary}33` }}>
                <div style={{
                    padding: '28px 32px',
                    borderBottom: currentTheme.tableRow.borderBottom,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: theme === 'dark' ? 'linear-gradient(90deg, #0B1221 0%, rgba(15,23,42,0) 100%)' : '#F8FAFC'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ padding: '12px', borderRadius: '12px', background: `${currentTheme.primary}15`, color: currentTheme.primary, boxShadow: `0 0 20px ${currentTheme.primary}20` }}>
                            <Settings size={22} />
                        </div>
                        <div>
                            <h3 style={{ fontSize: '18px', fontWeight: 900, margin: 0, letterSpacing: '1px', color: currentTheme.text }}>SYSTEM MASTER CONFIGURATION</h3>
                            <div style={{ fontSize: '11px', color: currentTheme.textSecondary, fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                <Shield size={12} /> ENTERPRISE_SECURE_PLANNING_ENGINE
                            </div>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02, boxShadow: `0 0 25px ${currentTheme.accent}40` }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                            addNotification({
                                type: 'success',
                                title: 'Configuration Synchronized',
                                message: 'Global production parameters have been updated and synced with all machine nodes.'
                            });
                            setActiveSubTab('SO DATA');
                        }}
                        style={{
                            padding: '12px 28px', borderRadius: '8px', border: 'none',
                            background: `linear-gradient(135deg, ${currentTheme.accent} 0%, #059669 100%)`,
                            color: '#fff', fontWeight: 900, fontSize: '13px', cursor: 'pointer',
                            display: 'flex', alignItems: 'center', gap: '10px', letterSpacing: '1px',
                            boxShadow: `0 8px 20px ${currentTheme.accent}30`
                        }}
                    >
                        <Save size={16} /> SAVE & SYNC ALL
                    </motion.button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead>
                            <tr style={{ ...currentTheme.tableHeader, background: theme === 'dark' ? '#0F172A' : '#F1F5F9', borderBottom: `2px solid ${theme === 'dark' ? '#1E293B' : '#E2E8F0'}` }}>
                                {['CATEGORY', 'CONFIG_KEY (PROTECTED)', 'VALUE_PARAMETER', 'OPERATION_DESCRIPTION', 'LINK_STATUS'].map(h => (
                                    <th key={h} style={{ padding: '20px 32px', textAlign: 'left', fontWeight: 900, fontSize: '10px', letterSpacing: '1.5px', color: currentTheme.textSecondary }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {masterConfig.map((c, idx) => (
                                <motion.tr
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.03 }}
                                    key={idx}
                                    style={{
                                        borderBottom: currentTheme.tableRow.borderBottom,
                                        background: theme === 'dark' ? (idx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent') : (idx % 2 === 0 ? '#FAFAFA' : '#FFF'),
                                        transition: 'all 0.2s'
                                    }}
                                    className="hover-row"
                                >
                                    <td style={{ padding: '18px 32px' }}>
                                        <div style={{
                                            padding: '6px 14px', borderRadius: '4px', fontSize: '10px', fontWeight: 900, letterSpacing: '1px',
                                            background: c.category === 'WIP' ? '#F59E0B15' : (c.category === 'SHIFT' ? '#3B82F615' : '#10B98115'),
                                            color: c.category === 'WIP' ? '#F59E0B' : (c.category === 'SHIFT' ? '#3B82F6' : '#10B981'),
                                            border: `1px solid ${c.category === 'WIP' ? '#F59E0B33' : (c.category === 'SHIFT' ? '#3B82F633' : '#10B98133')}`,
                                            display: 'inline-block'
                                        }}>
                                            {c.category}
                                        </div>
                                    </td>
                                    <td style={{ padding: '18px 32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{ width: '4px', height: '14px', background: currentTheme.primary, borderRadius: '2px' }}></div>
                                            <span style={{ fontWeight: 800, fontFamily: 'monospace', color: currentTheme.text, fontSize: '13px' }}>{c.key}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '18px 32px' }}>
                                        <input
                                            type="text"
                                            value={c.value}
                                            onChange={(e) => handleConfigChange(c.key, e.target.value)}
                                            style={{
                                                ...currentTheme.input,
                                                width: '100px',
                                                padding: '10px 14px',
                                                fontSize: '14px',
                                                fontWeight: 900,
                                                textAlign: 'center',
                                                fontFamily: 'monospace',
                                                background: theme === 'dark' ? 'rgba(56, 189, 248, 0.05)' : '#FFF',
                                                border: `1px solid ${currentTheme.primary}40`,
                                                color: currentTheme.primary,
                                                boxShadow: `inset 0 2px 4px rgba(0,0,0,0.1)`
                                            }}
                                        />
                                    </td>
                                    <td style={{ padding: '18px 32px', color: currentTheme.textSecondary, fontWeight: 500, fontSize: '12px' }}>{c.description}</td>
                                    <td style={{ padding: '18px 32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10B981', fontSize: '11px', fontWeight: 800 }}>
                                            <Activity size={12} className="pulse-animation" />
                                            <span style={{ letterSpacing: '1px' }}>_ACTIVE_NODES</span>
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        );
    };

    const renderPlaceholder = (title) => (
        <div style={{ ...currentTheme.card, height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
            <Box size={48} color={currentTheme.textSecondary} />
            <div style={{ fontSize: '18px', fontWeight: 700, color: currentTheme.text }}>{title} Module</div>
            <div style={{ fontSize: '13px', color: currentTheme.textSecondary, fontFamily: 'monospace' }}>_SYSTEM_MODULE_NOT_INITIALIZED</div>
        </div>
    );

    if (!isLoaded) {
        return (
            <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', background: currentTheme.bg }}>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                    <RefreshCcw size={48} color={currentTheme.primary} />
                </motion.div>
                <div style={{ letterSpacing: '0.2em', fontSize: '12px', fontWeight: 800, color: currentTheme.text, textTransform: 'uppercase' }}>
                    System Initializing...
                </div>
            </div>
        );
    }

    return (
        <div style={{
            padding: '24px 32px',
            background: currentTheme.bg,
            minHeight: '100vh',
            color: currentTheme.text,
            position: 'relative',
            fontFamily: currentTheme.fontFamily
        }}>
            {/* Subtle Background Gradient (static) */}
            <div style={{
                position: 'fixed', inset: 0,
                background: theme === 'dark'
                    ? 'radial-gradient(circle at 50% 0%, rgba(30, 41, 59, 0.4) 0%, transparent 60%)'
                    : 'radial-gradient(circle at 50% 0%, rgba(239, 246, 255, 0.6) 0%, transparent 60%)',
                pointerEvents: 'none', zIndex: 0
            }}></div>

            {/* Content Wrapper */}
            <div style={{ position: 'relative', zIndex: 10 }}>
                {/* Header Section */}
                <motion.div
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}
                >
                    <div>
                        <h1 style={{
                            margin: 0, fontSize: '24px',
                            letterSpacing: theme === 'dark' ? '0.05em' : '-0.02em',
                            color: currentTheme.text, fontWeight: 700,
                            textTransform: theme === 'dark' ? 'uppercase' : 'none',
                            display: 'flex', alignItems: 'center', gap: '12px'
                        }}>
                            {theme === 'dark' && <Activity size={24} color={currentTheme.accent} />}
                            Production Output Log
                        </h1>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px' }}>
                            <div className="pulse-dot" style={{ background: currentTheme.accent }}></div>
                            <p style={{ color: currentTheme.textSecondary, margin: 0, fontSize: '13px', fontFamily: theme === 'dark' ? 'monospace' : 'inherit' }}>
                                {theme === 'dark' ? '> SYSTEM_READY // MONITORING_ACTIVE_NODE_1' : 'Real-time Resource Allocation & Planning'}
                            </p>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                        {/* Tabs */}
                        <div style={{
                            display: 'flex', alignItems: 'center', padding: '4px', gap: '4px',
                            background: theme === 'light' ? '#FFFFFF' : 'rgba(15, 23, 42, 0.8)',
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${theme === 'dark' ? 'rgba(56, 189, 248, 0.2)' : '#E2E8F0'}`,
                            borderRadius: '12px',
                            boxShadow: theme === 'dark' ? '0 0 20px rgba(0,0,0,0.3)' : '0 2px 8px rgba(0,0,0,0.05)'
                        }}>
                            {['SO DATA', 'MACHINE MONITOR', 'MASTER CONFIG', 'TIMECARD', 'PRODUCTION PLAN', 'PLAN OP', 'SUMMARY'].map((tab) => (
                                <motion.button
                                    key={tab}
                                    onClick={() => setActiveSubTab(tab)}
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.95 }}
                                    style={{
                                        padding: '10px 24px',
                                        borderRadius: '10px',
                                        border: 'none',
                                        background: activeSubTab === tab ? (theme === 'dark' ? 'rgba(56, 189, 248, 0.15)' : '#FFF') : 'transparent',
                                        color: activeSubTab === tab ? (theme === 'dark' ? '#38BDF8' : currentTheme.primary) : currentTheme.textSecondary,
                                        fontSize: '11px',
                                        fontWeight: 800,
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '8px',
                                        boxShadow: activeSubTab === tab && theme === 'light' ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
                                        whiteSpace: 'nowrap'
                                    }}
                                >
                                    {tab === 'SO DATA' && <FileText size={14} />}
                                    {tab === 'MACHINE MONITOR' && <Cpu size={14} />}
                                    {tab === 'MASTER CONFIG' && <Settings size={14} />}
                                    {tab === 'TIMECARD' && <Clock size={14} />}
                                    {tab === 'PRODUCTION PLAN' && <Calendar size={14} />}
                                    {tab === 'PLAN OP' && <HardHat size={14} />}
                                    {tab === 'SUMMARY' && <BarChart2 size={14} />}
                                    {tab}
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </motion.div>

                {/* Search Bar */}
                <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    style={{ display: 'flex', gap: '16px', marginBottom: '24px' }}
                >
                    <div style={{ position: 'relative', flex: 1 }}>
                        <Search size={16} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: currentTheme.textSecondary }} />
                        <input
                            style={{
                                ...currentTheme.input,
                                width: '100%',
                                padding: '14px 14px 14px 48px',
                                fontSize: '13px',
                                fontFamily: theme === 'dark' ? 'monospace' : 'inherit',
                                transition: 'all 0.2s ease'
                            }}
                            placeholder={theme === 'dark' ? "SEARCH_QUERY > SO_NUMBER | MACHINE_ID..." : "Search SO Number or Machine..."}
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                            onFocus={(e) => {
                                e.target.style.boxShadow = `0 0 0 2px ${currentTheme.primary}40`;
                                e.target.style.borderColor = currentTheme.primary;
                            }}
                            onBlur={(e) => {
                                e.target.style.boxShadow = 'none';
                                e.target.style.borderColor = theme === 'dark' ? '#334155' : '#E2E8F0';
                            }}
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05, rotate: 90 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            padding: '0',
                            borderRadius: theme === 'dark' ? '4px' : '8px',
                            border: theme === 'dark' ? `1px solid ${currentTheme.primary}40` : '1px solid #E2E8F0',
                            background: theme === 'dark' ? 'rgba(0,0,0,0.4)' : '#FFFFFF',
                            color: currentTheme.textSecondary,
                            width: '48px', height: '48px',
                            cursor: 'pointer',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <RefreshCcw size={16} />
                    </motion.button>
                </motion.div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeSubTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.25 }}
                    >
                        {activeSubTab === 'SO DATA' && renderSODataView()}
                        {activeSubTab === 'MACHINE MONITOR' && renderMachineMonitorView()}
                        {activeSubTab === 'MASTER CONFIG' && renderMasterConfigView()}
                        {activeSubTab === 'TIMECARD' && renderTimecardView()}
                        {activeSubTab === 'PRODUCTION PLAN' && renderMasterPlanView()}
                        {activeSubTab === 'PLAN OP' && renderPlanOPView()}
                        {activeSubTab === 'SUMMARY' && renderSummaryView()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* === OPTIMIZED CSS === */}
            <style>{`
                /* Pulsing Dot Indicator */
                .pulse-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: 50%;
                    animation: pulse 2s ease-in-out infinite;
                }
                
                @keyframes pulse {
                    0%, 100% { 
                        opacity: 1;
                        box-shadow: 0 0 0 0 ${currentTheme.accent}80;
                    }
                    50% { 
                        opacity: 0.7;
                        box-shadow: 0 0 0 8px ${currentTheme.accent}00;
                    }
                }

                /* Smooth transitions only */
                input, button {
                    transition: all 0.2s ease;
                }
                
                .tech-border {
                    box-shadow: 0 0 20px rgba(0,0,0,0.5);
                }
            `}</style>

            {/* SO Detail Modal */}
            {renderSODetailModal()}
        </div>
    );
}
