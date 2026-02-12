import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, TrendingUp, Cpu, AlertOctagon, Shield, LogOut, Globe, Bell, Trash2, CheckCircle, Info, AlertTriangle, Plus, X, List, Layers, Calendar, Clock, ChevronRight, RefreshCcw } from 'lucide-react';
import { useI18n } from '../i18n';
import { Tooltip } from '../components/Tooltip';
import { salesOrders, calculateKPIs, getUrgentSOs, stations, getMachinesForStation, createSalesOrder, machines, exceptions, getSalesOrdersByDate, getStationHealth } from '../data/db';
import { SOCard } from '../components/SOCard';
import { useDrawer } from '../components/Drawer';
import { SODetail } from './SODetail';
import { StationDetail } from './StationDetail';
import { MachineDetail } from './MachineDetail';
import { DatePicker } from '../components/DatePicker';
import { OutputTable } from './OutputTable'; // Import the new view
import { useNotification } from '../contexts/NotificationContext';

export function Dashboard({ user, onLogout, onSwitchScreen }) {
    const { t, toggleLocale } = useI18n();
    const { notifications, removeNotification, clearAll } = useNotification();
    const { openDrawer } = useDrawer();

    // All states at the top
    const [refreshKey, setRefreshKey] = React.useState(0);
    const [viewMode, setViewMode] = React.useState('today');
    const [selectedDate, setSelectedDate] = React.useState(new Date());
    const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('dashboard');
    const [showNotifications, setShowNotifications] = React.useState(false);
    const [isProcessing, setIsProcessing] = React.useState(false);
    const [creationSuccess, setCreationSuccess] = React.useState(null);
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const { addNotification } = useNotification();

    // Derived memoized data
    const kpis = React.useMemo(() => calculateKPIs(), [refreshKey]);
    const urgentSOs = React.useMemo(() => getUrgentSOs(), [refreshKey]);
    const displayOrders = React.useMemo(() => getSalesOrdersByDate(viewMode), [viewMode, refreshKey]);
    const stationHealth = React.useMemo(() => getStationHealth(), [refreshKey]);

    // Form State
    const [newSO, setNewSO] = React.useState({
        so_number: '',
        customer_name: '',
        due_date: new Date(),
        qty: 1000,
        priority: 'NORMAL',
        steps: [
            { station_id: 1, machine_id: 1, runtime: 60 },
            { station_id: 2, machine_id: 4, runtime: 90 },
            { station_id: 3, machine_id: 7, runtime: 45 },
            { station_id: 4, machine_id: 9, runtime: 60 }
        ]
    });

    const addStep = () => {
        setNewSO({
            ...newSO,
            steps: [...newSO.steps, { station_id: 1, machine_id: machines.find(m => m.station_id === 1)?.machine_id || 1, runtime: 60 }]
        });
    };

    const removeStep = (index) => {
        const updatedSteps = newSO.steps.filter((_, i) => i !== index);
        setNewSO({ ...newSO, steps: updatedSteps });
    };

    const updateStep = (index, field, value) => {
        const updatedSteps = [...newSO.steps];
        updatedSteps[index] = { ...updatedSteps[index], [field]: value };

        // If station changed, auto-pick first machine for that station
        if (field === 'station_id') {
            const firstMachine = machines.find(m => m.station_id === parseInt(value));
            if (firstMachine) updatedSteps[index].machine_id = firstMachine.machine_id;
        }

        setNewSO({ ...newSO, steps: updatedSteps });
    };

    const handleCreateSO = async () => {
        if (!newSO.so_number || !newSO.customer_name) {
            addNotification({
                type: 'ERROR',
                title: 'Missing Information',
                message: 'Please fill in the SO Number and Customer Name.',
                time: new Date().toLocaleTimeString()
            });
            return;
        }

        setIsProcessing(true);

        try {
            // Simulated network delay for stability feel
            await new Promise(resolve => setTimeout(resolve, 800));

            const created = createSalesOrder(newSO);
            setCreationSuccess(created.so_number);

            addNotification({
                type: 'SUCCESS',
                title: 'Order Integrated',
                message: `New plan for ${newSO.so_number} has been scheduled.`,
                time: new Date().toLocaleTimeString()
            });

            // Transition delay to show success screen
            setTimeout(() => {
                setIsCreateModalOpen(false);
                setCreationSuccess(null);
                setActiveTab('output');
                setRefreshKey(prev => prev + 1);

                // Reset form
                setNewSO({
                    so_number: '',
                    customer_name: '',
                    due_date: new Date(),
                    qty: 1000,
                    priority: 'NORMAL',
                    steps: [
                        { station_id: 1, machine_id: 1, runtime: 60 },
                        { station_id: 2, machine_id: 4, runtime: 90 },
                        { station_id: 3, machine_id: 7, runtime: 45 },
                        { station_id: 4, machine_id: 9, runtime: 60 }
                    ]
                });
            }, 1500);
        } catch (error) {
            addNotification({
                type: 'ERROR',
                title: 'Operation Failed',
                message: error.message || 'An unexpected error occurred.',
                time: new Date().toLocaleTimeString()
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // Refs for auto-scrolling
    const urgentLaneRef = React.useRef(null);
    const flowRiverRef = React.useRef(null);
    const pausedLanes = React.useRef({ urgent: false, flow: false });

    // Auto-scroll logic
    React.useEffect(() => {
        if (activeTab !== 'dashboard') return;

        const lanes = [
            { id: 'urgent', ref: urgentLaneRef, speed: 0.5 }
        ];

        let animationFrameId;

        const scroll = () => {
            lanes.forEach(({ ref, speed, id }) => {
                if (ref.current && !pausedLanes.current[id]) {
                    ref.current.scrollLeft += speed;
                    if (ref.current.scrollLeft >= ref.current.scrollWidth / 2) {
                        ref.current.scrollLeft = 0;
                    }
                }
            });
            animationFrameId = requestAnimationFrame(scroll);
        };

        animationFrameId = requestAnimationFrame(scroll);
        return () => cancelAnimationFrame(animationFrameId);
    }, [activeTab]);

    const handleSOClick = (so) => {
        if (!so) return;
        openDrawer({
            title: `${so.so_number} - ${so.customer_name}`,
            content: <SODetail so={so} />,
            width: '700px',
        });
    };

    const handleKPIClick = (item) => {
        let content;

        if (item.label === t('kpi.oee')) {
            content = (
                <div style={{ padding: '20px' }}>
                    <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                        <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>{t('dash.oee_breakdown')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {[
                                { label: t('metric.availability'), value: 89, color: '#10B981' },
                                { label: t('metric.performance'), value: 82, color: '#36C0FC' },
                                { label: t('metric.quality'), value: 98, color: '#F59E0B' }
                            ].map(metric => (
                                <div key={metric.label}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                                        <span>{metric.label}</span>
                                        <span style={{ color: 'var(--text-primary)' }}>{metric.value}%</span>
                                    </div>
                                    <div style={{ height: '8px', background: 'var(--accent)', borderRadius: '4px', overflow: 'hidden' }}>
                                        <div style={{ width: `${metric.value}%`, height: '100%', background: metric.color }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            );
        } else if (item.label === t('kpi.blocked') || item.label === 'Blocked Jobs') {
            const blockedMachines = machines.filter(m => m.status === 'BLOCKED' || m.status === 'DOWN');
            content = (
                <div style={{ padding: '20px' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>{t('dash.issues')} ({blockedMachines.length})</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {blockedMachines.length === 0 && <div style={{ color: 'var(--text-secondary)' }}>{t('msg.no_jobs')}</div>}
                        {blockedMachines.map(m => (
                            <div key={m.machine_id} className="glass-panel" style={{ padding: '16px', borderLeft: '4px solid var(--danger)' }}>
                                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>{m.machine_code}</div>
                                <div style={{ color: 'var(--danger)', fontWeight: 600, fontSize: '12px', marginBottom: '8px' }}>{m.status}</div>
                                <div style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
                                    {exceptions.find(e => e.machine_id === m.machine_id)?.reason || 'Operational Issue'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );
        } else if (item.label === t('kpi.load')) {
            content = (
                <div style={{ padding: '20px' }}>
                    <h3 style={{ color: 'var(--text-primary)', marginBottom: '16px' }}>{t('dash.station_load')}</h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {stations.map(s => {
                            const sMachines = getMachinesForStation(s.station_id);
                            const running = sMachines.filter(m => m.status === 'RUNNING').length;
                            const load = Math.round((running / sMachines.length) * 100);
                            return (
                                <div key={s.station_id}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px', color: 'var(--text-primary)' }}>
                                        <span>{s.station_code}</span>
                                        <span>{load}%</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'var(--accent)', borderRadius: '3px' }}>
                                        <div style={{ width: `${load}%`, height: '100%', background: 'var(--primary)', borderRadius: '3px' }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        } else {
            content = <div style={{ padding: '20px', color: '#9CA3AF' }}>Detailed analysis for {item.label} coming soon.</div>;
        }

        openDrawer({
            title: item.label,
            content: content,
            width: '500px'
        });
    };

    const kpiItems = [
        {
            icon: Activity,
            label: t('kpi.oee'),
            value: `${kpis.oee}%`,
            color: '#10B981',
            visible: true,
        },
        {
            icon: TrendingUp,
            label: t('kpi.output'),
            value: `${kpis.outputVsPlan}%`,
            color: '#1A74FA',
            visible: true,
        },
        {
            icon: Cpu,
            label: t('kpi.load'),
            value: `${kpis.machineLoad}%`,
            color: '#36C0FC',
            visible: true,
        },
        {
            icon: AlertOctagon,
            label: t('kpi.blocked'),
            value: kpis.blockedJobs,
            color: '#EF4444',
            visible: true,
        },
        {
            icon: Shield,
            label: t('kpi.overrides'),
            value: kpis.overridesToday,
            color: '#F59E0B',
            visible: user.role === 'OWNER',
        },
    ].filter(item => item.visible);

    const handleDateChange = (date) => {
        setSelectedDate(date);
        setViewMode('custom');
    };

    const setQuickDate = (mode) => {
        setViewMode(mode);
        const date = new Date();
        if (mode === 'tomorrow') date.setDate(date.getDate() + 1);
        setSelectedDate(date);
    };

    return (
        <div style={{ minHeight: '100vh', padding: '32px', position: 'relative' }}>
            {/* Header Area */}
            <div
                className="reveal-up"
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'end',
                    marginBottom: '40px',
                }}
            >
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            style={{ fontSize: '14px', fontWeight: 700, color: user.role === 'OWNER' ? 'var(--warning)' : 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px' }}
                        >
                            {user.role === 'OWNER' ? 'EXECUTIVE COMMAND CENTER' : `${t(`role.${user.role.toLowerCase()}`)} Control Room`}
                        </motion.div>
                        {user.role === 'OPERATOR' && (
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => onSwitchScreen('worklist')}
                                style={{
                                    padding: '4px 12px',
                                    background: 'rgba(16, 185, 129, 0.1)',
                                    border: '1px solid rgba(16, 185, 129, 0.2)',
                                    color: '#10B981',
                                    borderRadius: '20px',
                                    fontSize: '10px',
                                    fontWeight: 800,
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '6px'
                                }}
                            >
                                <Activity size={12} />
                                GO BACK TO WORKLIST
                            </motion.button>
                        )}
                    </div>
                    <div style={{ fontSize: '36px', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-1.5px', lineHeight: 1 }}>
                        {t('dash.welcome')}, <span style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user.name || 'User'}</span>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <div className="glass-panel" style={{ padding: '4px 16px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                        <span style={{ fontSize: '13px', fontWeight: 600 }}>{t('dash.live')}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center', position: 'relative' }}>
                        <button
                            onClick={async () => {
                                setIsRefreshing(true);
                                await new Promise(r => setTimeout(r, 600));
                                setRefreshKey(prev => prev + 1);
                                setIsRefreshing(false);
                            }}
                            className="btn glass-panel"
                            style={{ width: '44px', height: '44px', padding: 0, borderRadius: '14px' }}
                        >
                            <RefreshCcw size={18} className={isRefreshing ? 'spin-animation' : ''} />
                        </button>

                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="btn glass-panel"
                            style={{ width: '44px', height: '44px', padding: 0, borderRadius: '14px' }}
                        >
                            <Bell size={18} />
                            {notifications.length > 0 && <span className="status-glow" style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', background: 'var(--danger)', borderRadius: '50%' }}></span>}
                        </button>

                        <button onClick={onLogout} className="btn glass-panel" style={{ width: '44px', height: '44px', padding: 0, borderRadius: '14px' }}>
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs & Controls */}
            <div className="reveal-up stagger-1" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                        className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'glass-panel'}`}
                        onClick={() => setActiveTab('dashboard')}
                        style={{ borderRadius: '12px' }}
                    >
                        {t('dash.ops')}
                    </button>
                    <button
                        className={`btn ${activeTab === 'output' ? 'btn-primary' : 'glass-panel'}`}
                        onClick={() => setActiveTab('output')}
                        style={{ borderRadius: '12px' }}
                    >
                        {t('dash.output_log')}
                    </button>
                </div>

                <div className="glass-panel" style={{ padding: '4px', borderRadius: '14px', display: 'flex', gap: '4px' }}>
                    {['today', 'tomorrow'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => setQuickDate(mode)}
                            style={{
                                padding: '8px 16px',
                                borderRadius: '10px',
                                border: 'none',
                                background: viewMode === mode ? 'var(--primary)' : 'transparent',
                                color: viewMode === mode ? 'white' : 'var(--text-secondary)',
                                fontSize: '13px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                transition: 'all 0.2s'
                            }}
                        >
                            {t(`op.${mode}`)}
                        </button>
                    ))}
                    <div style={{ width: '1px', background: 'var(--glass-border)', margin: '4px' }} />
                    <DatePicker selected={selectedDate} onSelect={handleDateChange} />
                </div>
            </div>

            {/* Main Content */}
            <AnimatePresence mode="wait">
                {activeTab === 'dashboard' ? (
                    <motion.div
                        key="operations"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.4 }}
                    >
                        {/* Flow River Animation Background */}
                        <div style={{ position: 'relative', marginBottom: '40px' }}>
                            <div className="flow-river-container">
                                <motion.div
                                    className="flow-river-line"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                                />
                                <motion.div
                                    className="flow-river-line"
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ duration: 15, repeat: Infinity, ease: "linear", delay: 7.5 }}
                                />
                            </div>

                            {/* KPI Grid - Responsive Row Layout */}
                            <div className="kpi-row-layout">
                                {kpiItems.map((item, i) => (
                                    <motion.div
                                        key={i}
                                        className="glass-panel kpi-card"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.1 }}
                                        whileHover={{ y: -8, scale: 1.02 }}
                                        onClick={() => handleKPIClick(item)}
                                        style={{ cursor: 'pointer', flex: '1 1 200px' }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                                            <div style={{ background: `${item.color}15`, padding: '10px', borderRadius: '12px', color: item.color }}>
                                                <item.icon size={20} />
                                            </div>
                                            <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--success)' }}>+2.4%</div>
                                        </div>
                                        <div style={{ marginTop: '16px' }}>
                                            <div style={{ fontSize: '14px', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</div>
                                            <div className="kpi-value" style={{ color: item.color }}>{item.value}</div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>

                        {/* Station Health Monitor - NEW */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '40px' }}>
                            {stationHealth.map((sh, idx) => (
                                <motion.div
                                    key={sh.station_id}
                                    className="glass-panel"
                                    whileHover={{ y: -5, background: 'var(--surface)' }}
                                    style={{ padding: '24px', cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '16px', background: 'var(--glass-bg)', borderLeft: `4px solid ${sh.status === 'WARNING' ? 'var(--urgent)' : 'var(--success)'}` }}
                                    onClick={() => {
                                        openDrawer({
                                            title: `${t('tab.diagnostics')}: ${sh.station_name}`,
                                            content: <StationDetail station={sh} />,
                                            width: '600px'
                                        });
                                        addNotification({
                                            type: 'INFO',
                                            title: `${t('action.back')} ${sh.station_name}`,
                                            message: t('msg.telemetry'),
                                            time: new Date().toLocaleTimeString()
                                        });
                                    }}
                                >
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-secondary)' }}>{sh.station_code}</div>
                                        <div className={sh.isRunning ? 'status-glow' : ''} style={{ width: '8px', height: '8px', borderRadius: '50%', background: sh.status === 'HEALTHY' ? 'var(--success)' : sh.status === 'WARNING' ? 'var(--urgent)' : 'var(--text-secondary)' }} />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{sh.station_name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>{sh.load}% {t('metric.load')}</div>
                                    </div>
                                    <div style={{ height: '4px', background: 'var(--bg-color)', borderRadius: '2px', overflow: 'hidden', opacity: 0.5 }}>
                                        <motion.div initial={{ width: 0 }} animate={{ width: `${sh.load}%` }} style={{ height: '100%', background: sh.status === 'HEALTHY' ? 'var(--primary)' : 'var(--urgent)' }} />
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                        {viewMode === 'today' && urgentSOs.length > 0 && (
                            <div style={{ marginBottom: '40px' }}>
                                <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--urgent)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <AlertOctagon size={20} />
                                    {t('dash.urgent_req')} ({urgentSOs.length})
                                </div>
                                <div
                                    ref={urgentLaneRef}
                                    style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '12px', scrollbarWidth: 'none' }}
                                >
                                    {[...urgentSOs, ...urgentSOs].map((so, i) => (
                                        <SOCard key={`${so.so_id}-${i}`} so={so} onClick={() => handleSOClick(so)} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Production Sequence */}
                        <div className="glass-panel" style={{ padding: '32px', marginBottom: '40px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                                <h3 style={{ fontSize: '20px', fontWeight: 800 }}>{t('dash.prod_seq')}</h3>
                            </div>
                            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' }}>
                                {displayOrders.map(so => (
                                    <SOCard key={so.so_id} so={so} onClick={() => handleSOClick(so)} />
                                ))}
                            </div>
                        </div>

                        {/* Station Swimlanes - High Fidelity Feed */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '32px' }}>
                            {stations.map(station => {
                                const sHealth = stationHealth.find(h => h.station_id === station.station_id);
                                const ms = getMachinesForStation(station.station_id);
                                return (
                                    <div key={station.station_id} className="glass-panel" style={{ padding: '32px', borderRadius: '32px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
                                            <h3
                                                style={{ fontSize: '22px', fontWeight: 800, color: 'var(--primary)', cursor: 'pointer' }}
                                                onClick={() => openDrawer({ title: `Station Details: ${station.station_name}`, content: <StationDetail station={station} />, width: '600px' })}
                                            >
                                                {station.station_name}
                                            </h3>
                                            <button
                                                className="btn glass-panel"
                                                style={{ fontSize: '12px', padding: '8px 16px', borderRadius: '12px' }}
                                                onClick={() => openDrawer({ title: `${t('tab.diagnostics')}: ${station.station_name}`, content: <StationDetail station={station} />, width: '600px' })}
                                            >
                                                {t('dash.live_feed')}
                                            </button>
                                        </div>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                            {ms.map(m => (
                                                <motion.div
                                                    key={m.machine_id}
                                                    whileHover={{ x: 8, background: 'var(--surface)' }}
                                                    onClick={() => openDrawer({ title: `Machine Diagnostic: ${m.machine_code}`, content: <MachineDetail machine={m} />, width: '600px' })}
                                                    className="glass-panel"
                                                    style={{ padding: '20px 24px', display: 'flex', justifyContent: 'space-between', background: 'var(--glass-bg)', cursor: 'pointer', borderRadius: '20px' }}
                                                >
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                                        <div className={m.status === 'RUNNING' ? 'status-glow' : ''} style={{ width: '12px', height: '12px', borderRadius: '50%', background: m.status === 'RUNNING' ? 'var(--success)' : m.status === 'DOWN' ? 'var(--urgent)' : 'var(--text-secondary)' }} />
                                                        <span style={{ fontWeight: 800, fontSize: '17px', color: 'var(--text-primary)' }}>{m.machine_code}</span>
                                                    </div>
                                                    <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
                                                        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('metric.speed')}: {m.standard_speed}u/{t('common.minutes')}</span>
                                                        <span className={`badge status-${m.status.toLowerCase()}`} style={{ fontWeight: 800, minWidth: '90px', textAlign: 'center' }}>{t(`status.${m.status.toLowerCase()}`)}</span>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="output"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                    >
                        <OutputTable viewMode={viewMode} onSOSelect={handleSOClick} user={user} />
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Create SO Modal */}
            <AnimatePresence>
                {isCreateModalOpen && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(8px)' }}>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="glass-panel"
                            style={{ width: '500px', padding: '32px' }}
                        >
                            <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', color: 'var(--text-primary)' }}>
                                <div style={{ background: 'var(--primary)', padding: '10px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Layers size={24} color="white" />
                                </div>
                                {t('dash.new_load')}
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '32px', maxHeight: '75vh', overflowY: 'auto', paddingRight: '12px', paddingBottom: '20px' }}>
                                {/* Global Information Section - Re-styled as per image */}
                                <div style={{ background: 'var(--surface)', padding: '24px', borderRadius: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', border: '1px solid var(--glass-border)' }}>
                                    <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#6366F1', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '1.2px' }}>{t('dash.global_info')}</h4>

                                    <div style={{ display: 'grid', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('so.number')}</label>
                                            <input
                                                className="input-field"
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontWeight: 600, outline: 'none' }}
                                                value={newSO.so_number}
                                                onChange={e => setNewSO({ ...newSO, so_number: e.target.value })}
                                                placeholder="SO-26-XXXX"
                                            />
                                        </div>

                                        <div>
                                            <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('so.customer')}</label>
                                            <input
                                                className="input-field"
                                                style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontWeight: 600, outline: 'none' }}
                                                value={newSO.customer_name}
                                                onChange={e => setNewSO({ ...newSO, customer_name: e.target.value })}
                                                placeholder="Customer Ltd."
                                            />
                                        </div>

                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('so.qty')}</label>
                                                <input
                                                    type="number"
                                                    className="input-field"
                                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontWeight: 600, outline: 'none' }}
                                                    value={newSO.qty}
                                                    onChange={e => setNewSO({ ...newSO, qty: parseInt(e.target.value) })}
                                                />
                                            </div>
                                            <div>
                                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>{t('so.priority')}</label>
                                                <select
                                                    className="input-field"
                                                    style={{ width: '100%', padding: '14px', borderRadius: '12px', border: '1.5px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontWeight: 600, appearance: 'none', outline: 'none' }}
                                                    value={newSO.priority}
                                                    onChange={e => setNewSO({ ...newSO, priority: e.target.value })}
                                                >
                                                    <option value="NORMAL">NORMAL</option>
                                                    <option value="HIGH">HIGH</option>
                                                    <option value="URGENT">URGENT</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Integration Date Selection Menu */}
                                        <div style={{ marginTop: '10px', padding: '16px', borderRadius: '12px', background: 'var(--bg-color)', border: '1.5px solid var(--glass-border)', opacity: 0.9 }}>
                                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                                <Calendar size={16} color="var(--primary)" /> {t('dash.schedule')}
                                            </label>
                                            <div style={{ display: 'flex', gap: '10px' }}>
                                                {['TODAY', 'TOMORROW', 'NEXT WEEK'].map(d => (
                                                    <button
                                                        key={d}
                                                        onClick={() => {
                                                            const date = new Date();
                                                            if (d === 'TOMORROW') date.setDate(date.getDate() + 1);
                                                            if (d === 'NEXT WEEK') date.setDate(date.getDate() + 7);
                                                            setNewSO({ ...newSO, due_date: date });
                                                        }}
                                                        style={{
                                                            flex: 1,
                                                            padding: '10px',
                                                            borderRadius: '8px',
                                                            fontSize: '12px',
                                                            fontWeight: 700,
                                                            border: 'none',
                                                            cursor: 'pointer',
                                                            background: newSO.due_date.toDateString() === (d === 'TODAY' ? new Date().toDateString() : d === 'TOMORROW' ? new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() : 'none') ? 'var(--primary)' : 'var(--surface)',
                                                            color: newSO.due_date.toDateString() === (d === 'TODAY' ? new Date().toDateString() : d === 'TOMORROW' ? new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() : 'none') ? 'white' : 'var(--text-secondary)',
                                                            boxShadow: 'var(--shadow-sm)'
                                                        }}
                                                    >
                                                        {d}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Production Routing Section */}
                                <div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                        <h4 style={{ fontSize: '15px', fontWeight: 800, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '1.2px' }}>{t('dash.routing')}</h4>
                                        <button
                                            className="btn btn-primary"
                                            style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '20px', background: '#4F46E5' }}
                                            onClick={addStep}
                                        >
                                            <Plus size={16} /> {t('dash.add_step')}
                                        </button>
                                    </div>

                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        {newSO.steps.map((step, index) => (
                                            <motion.div
                                                layout
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                key={index}
                                                style={{
                                                    padding: '24px',
                                                    display: 'grid',
                                                    gridTemplateColumns: 'minmax(140px, 1.2fr) minmax(120px, 1fr) 1fr 44px',
                                                    gap: '16px',
                                                    alignItems: 'end',
                                                    background: 'var(--surface)',
                                                    borderRadius: '24px',
                                                    boxShadow: 'var(--shadow-md)',
                                                    border: '1.5px solid var(--glass-border)'
                                                }}
                                            >
                                                <div>
                                                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{t('dash.stations')}</label>
                                                    <select
                                                        className="input-field"
                                                        style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '10px', border: '1.5px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontWeight: 600, outline: 'none' }}
                                                        value={step.station_id}
                                                        onChange={e => updateStep(index, 'station_id', e.target.value)}
                                                    >
                                                        {stations.map(s => <option key={s.station_id} value={s.station_id}>{s.station_name}</option>)}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{t('metric.machine')}</label>
                                                    <select
                                                        className="input-field"
                                                        style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '10px', border: '1.5px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontWeight: 600, outline: 'none' }}
                                                        value={step.machine_id}
                                                        onChange={e => updateStep(index, 'machine_id', e.target.value)}
                                                    >
                                                        <option value="">-- Skip --</option>
                                                        {getMachinesForStation(parseInt(step.station_id)).map(m => (
                                                            <option key={m.machine_id} value={m.machine_id}>{m.machine_code}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'block' }}>{t('common.runtime')}</label>
                                                    <input
                                                        type="number"
                                                        className="input-field"
                                                        style={{ width: '100%', padding: '10px', fontSize: '14px', borderRadius: '10px', border: '1.5px solid var(--glass-border)', background: 'var(--bg-color)', color: 'var(--text-primary)', fontWeight: 600, outline: 'none' }}
                                                        value={step.runtime}
                                                        onChange={e => updateStep(index, 'runtime', e.target.value)}
                                                        placeholder="Skip"
                                                    />
                                                </div>
                                                <button
                                                    onClick={() => removeStep(index)}
                                                    style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        borderRadius: '10px',
                                                        color: '#EF4444',
                                                        background: '#FEF2F2',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        transition: 'all 0.2s'
                                                    }}
                                                    onMouseOver={e => e.currentTarget.style.background = '#FEE2E2'}
                                                    onMouseOut={e => e.currentTarget.style.background = '#FEF2F2'}
                                                >
                                                    <X size={20} />
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '16px', marginTop: '16px', paddingBottom: '20px' }}>
                                    <button
                                        className="btn btn-primary"
                                        style={{
                                            flex: 1,
                                            padding: '18px',
                                            borderRadius: '16px',
                                            fontSize: '16px',
                                            fontWeight: 800,
                                            boxShadow: '0 10px 15px -3px rgba(79, 70, 229, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            gap: '10px',
                                            opacity: isProcessing ? 0.7 : 1,
                                            cursor: isProcessing ? 'wait' : 'pointer'
                                        }}
                                        onClick={handleCreateSO}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? t('msg.scheduling') : t('dash.integrate')} <ChevronRight size={20} />
                                    </button>
                                    <button
                                        className="btn"
                                        style={{ flex: 0.4, padding: '18px', borderRadius: '16px', background: '#F1F5F9', color: '#64748B', border: 'none', fontWeight: 700 }}
                                        onClick={() => setIsCreateModalOpen(false)}
                                    >
                                        {t('action.cancel')}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
