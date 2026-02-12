import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, CheckCircle, LogOut, Calendar, Clock, ChevronRight, Info, Settings, ShieldCheck, Activity, Cpu, Terminal, Package, User, Layers, Rocket, Globe } from 'lucide-react';
import { useI18n } from '../i18n';
import { Tooltip } from '../components/Tooltip';
import { MachineStatusBar } from '../components/MachineStatusBar';
import { useNotification } from '../contexts/NotificationContext';
import { useDrawer } from '../components/Drawer';
import { useProduction } from '../contexts/ProductionContext';
import { getStationById, getMachineById } from '../data/db';

export function Worklist({ user, onLogout, onSwitchScreen }) {
    const { t } = useI18n();
    const { addNotification } = useNotification();
    const { openDrawer } = useDrawer();
    const {
        plans,
        orders,
        executionStatus,
        startExecution,
        pauseExecution,
        completeExecution,
        updateExecutionStatus,
        checkSOCompletion
    } = useProduction();

    const [selectedDay, setSelectedDay] = React.useState('today');
    const [showPauseDialog, setShowPauseDialog] = React.useState(false);
    const [showCompleteDialog, setShowCompleteDialog] = React.useState(false);
    const [pauseReason, setPauseReason] = React.useState('');
    const [actualQty, setActualQty] = React.useState('');
    const [scrapQty, setScrapQty] = React.useState('0');
    const [currentPlanId, setCurrentPlanId] = React.useState(null);
    const [showSummary, setShowSummary] = React.useState(false);
    const [summaryData, setSummaryData] = React.useState(null);

    // Get work list from planning
    // Filter by today/tomorrow and operator's machine assignment
    // For now, we'll show all plans sorted by SO and sequence
    const workList = React.useMemo(() => {
        return plans
            .filter(plan => plan.isReleased) // Only show manager-approved plans
            .map(plan => {
                const so = orders.find(o => o.so_id === plan.so_id);
                const status = executionStatus[plan.plan_id] || {};

                return {
                    ...plan,
                    ...status,
                    so_number: so?.so_number || '',
                    customer_name: so?.customer_name || '',
                    item_name: so?.item_name || '',
                    total_qty: so?.total_qty || 0,
                    priority: so?.priority || 'NORMAL',
                    material: so?.width_thick || '-',
                    due_date: so?.customer_due_date
                };
            }).sort((a, b) => {
                if (a.so_id !== b.so_id) return a.so_id - b.so_id;
                return a.sequence - b.sequence;
            });
    }, [plans, orders, executionStatus]);

    const handleStart = (e, planId) => {
        e.stopPropagation();
        startExecution(planId, user.username);
        addNotification({
            type: 'info',
            title: 'Job Started',
            message: `${user.username} started work on plan ${planId}`
        });
    };

    const handlePauseClick = (e, planId) => {
        e.stopPropagation();
        setCurrentPlanId(planId);
        setShowPauseDialog(true);
    };

    const confirmPause = () => {
        if (!pauseReason.trim() || !currentPlanId) return;
        pauseExecution(currentPlanId, pauseReason);
        setShowPauseDialog(false);
        addNotification({
            type: 'warning',
            title: 'Job Paused',
            message: `Paused. Reason: ${pauseReason}`
        });
        setPauseReason('');
        setCurrentPlanId(null);
    };

    const handleCompleteClick = (e, planId, qty) => {
        e.stopPropagation();
        setCurrentPlanId(planId);
        setActualQty(qty.toString());
        setShowCompleteDialog(true);
    };

    const confirmComplete = () => {
        if (!currentPlanId) return;
        const job = workList.find(j => j.plan_id === currentPlanId);
        const actual = parseInt(actualQty) || 0;
        const scrap = parseInt(scrapQty) || 0;

        completeExecution(currentPlanId, actual, scrap);

        // Check if SO is fully finished after this step
        // We check current plans since it was just updated
        const isSOFinished = checkSOCompletion(job.so_id);

        // Capture data for summary popup
        setSummaryData({
            ...job,
            actual,
            scrap,
            isSOFinished,
            completedAt: new Date()
        });

        setShowCompleteDialog(false);
        setShowSummary(true);

        addNotification({
            type: 'success',
            title: 'Job Completed',
            message: `Completed successfully. Output: ${actual} pcs, Scrap: ${scrap} pcs`
        });
        setActualQty('');
        setScrapQty('0');
        setCurrentPlanId(null);
    };

    const handleRowClick = (job) => {
        openDrawer({
            title: `Work Order Detail: ${job.so_number}`,
            width: '550px',
            content: <SODetailView job={job} />
        });
    };

    const SODetailView = ({ job }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '12px' }}>
            <div className="glass-panel" style={{ padding: '24px', background: 'rgba(79, 70, 229, 0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div>
                        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Work Assignment</div>
                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--text-primary)' }}>{job.customer_name}</div>
                    </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Target Output</div>
                        <div style={{ fontSize: '18px', fontWeight: 800 }}>{job.total_qty?.toLocaleString()} <span style={{ fontSize: '12px', fontWeight: 400 }}>Units</span></div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 600 }}>Item</div>
                        <div style={{ fontSize: '18px', fontWeight: 800 }}>{job.item_name}</div>
                    </div>
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '16px', fontWeight: 800 }}>
                    <Settings size={18} className="status-running" /> Technical Specs
                </h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                        { label: 'SO Number', val: job.so_number },
                        { label: 'Station', val: `Station ${job.station_id}` },
                        { label: 'Machine', val: `Machine ${job.machine_id}` },
                        { label: 'Material', val: job.material },
                        { label: 'Setup Time', val: `${job.setup_time_minutes || job.setup || 0} min` },
                        { label: 'Run Time', val: `${job.run_time_minutes || job.run || 0} min` },
                        { label: 'Changeover', val: `${job.changeover_time_minutes || job.co || 0} min` }
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '14px', background: 'var(--bg-color)', borderRadius: '12px', border: '1px solid var(--glass-border)' }}>
                            <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{item.label}</span>
                            <span style={{ fontSize: '13px', fontWeight: 700 }}>{item.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', fontSize: '16px', fontWeight: 800, color: 'var(--success)' }}>
                    <ShieldCheck size={18} /> Execution Status
                </h4>
                <div style={{ display: 'grid', gap: '12px' }}>
                    <div style={{ padding: '14px', background: 'var(--bg-color)', borderRadius: '12px' }}>
                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Status</div>
                        <div className={`badge status-${job.status}`} style={{ display: 'inline-block' }}>{job.status?.toUpperCase() || 'PENDING'}</div>
                    </div>
                    {job.operator && (
                        <div style={{ padding: '14px', background: 'var(--bg-color)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Operator</div>
                            <div style={{ fontSize: '14px', fontWeight: 700 }}>{job.operator}</div>
                        </div>
                    )}
                    {job.progress > 0 && (
                        <div style={{ padding: '14px', background: 'var(--bg-color)', borderRadius: '12px' }}>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '4px' }}>Progress</div>
                            <div style={{ fontSize: '14px', fontWeight: 700 }}>{job.progress}%</div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    return (
        <div style={{ minHeight: '100vh', padding: '40px', maxWidth: '1400px', margin: '0 auto', position: 'relative' }}>
            <div className="reveal-up" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '48px' }}>
                <div>
                    <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px' }}>OPERATION STATION</div>
                    <h1 style={{ fontSize: '42px', fontWeight: 800, letterSpacing: '-1.5px', marginBottom: '4px' }}>My Worklist</h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                        <span style={{ color: 'var(--primary)' }}>{user.username}</span> • {t('role.operator')}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '16px' }}>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => onSwitchScreen('dashboard')}
                        className="btn glass-panel"
                        style={{
                            padding: '12px 24px',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px',
                            color: 'var(--primary)',
                            fontWeight: 700
                        }}
                    >
                        <Globe size={18} />
                        CONTROL ROOM & SUMMARY
                    </motion.button>

                    <div className="glass-panel" style={{ padding: '12px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Terminal size={20} color="var(--primary)" />
                        <div>
                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Tasks</div>
                            <div style={{ fontSize: '18px', fontWeight: 800 }}>{workList.length}</div>
                        </div>
                    </div>
                    <button onClick={onLogout} className="btn glass-panel" style={{ width: '48px', height: '48px', padding: 0, borderRadius: '16px' }}>
                        <LogOut size={20} />
                    </button>
                </div>
            </div>

            <div className="grid-masonry reveal-up stagger-1" style={{ marginBottom: '32px' }}>
                <div className="glass-panel" style={{ padding: '24px', gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: '32px' }}>
                    <div style={{ background: 'var(--primary)', color: 'white', padding: '16px', borderRadius: '20px', boxShadow: '0 8px 16px var(--primary-glow)' }}>
                        <Cpu size={32} />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>Production Line Status</div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div className="status-glow status-running" style={{ width: '12px', height: '12px', borderRadius: '50%', background: 'var(--success)' }}></div>
                            <span style={{ fontSize: '20px', fontWeight: 800 }}>All Systems Operational</span>
                        </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)' }}>Completed Today</div>
                        <div style={{ fontSize: '24px', fontWeight: 800 }}>
                            {workList.filter(w => w.status === 'completed').length} / {workList.length}
                        </div>
                    </div>
                </div>
            </div>

            <motion.div layout className="glass-panel reveal-up stagger-2" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.02)' }}>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Layers size={14} /> Sequence
                                </div>
                            </th>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Package size={14} /> Work Order
                                </div>
                            </th>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <User size={14} /> Customer
                                </div>
                            </th>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <Settings size={14} /> Times (Setup/Run/CO)
                                </div>
                            </th>
                            <th style={{ padding: '20px 32px', textAlign: 'left', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Status</th>
                            <th style={{ padding: '20px 32px', textAlign: 'right', fontSize: '12px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <AnimatePresence mode="popLayout">
                            {workList.map((job, idx) => (
                                <motion.tr
                                    key={job.plan_id}
                                    layout
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    onClick={() => handleRowClick(job)}
                                    className="clickable-row"
                                    style={{
                                        borderBottom: '1px solid var(--glass-border)',
                                        background: job.status === 'running' ? 'rgba(79, 70, 229, 0.04)' : 'transparent'
                                    }}
                                >
                                    <td style={{ padding: '24px 32px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                            <div style={{
                                                width: '32px', height: '32px', borderRadius: '8px',
                                                background: 'var(--primary)', color: 'white',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '14px', fontWeight: 800
                                            }}>
                                                {job.sequence}
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px 32px' }}>
                                        <div style={{ fontWeight: 800, fontSize: '16px' }}>{job.so_number}</div>
                                        <div style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>{job.item_name}</div>
                                    </td>
                                    <td style={{ padding: '24px 32px' }}>
                                        <div style={{ fontSize: '14px', fontWeight: 700 }}>{job.customer_name}</div>
                                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{job.total_qty?.toLocaleString()} units</div>
                                    </td>
                                    <td style={{ padding: '24px 32px' }}>
                                        <div style={{ fontSize: '13px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
                                            {job.setup_time_minutes || job.setup || 0}m / {job.run_time_minutes || job.run || 0}m / {job.changeover_time_minutes || job.co || 0}m
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px 32px' }}>
                                        <div className={`badge status-${job.status || 'pending'}`} style={{ fontWeight: 800 }}>
                                            {(job.status || 'pending').toUpperCase()}
                                        </div>
                                    </td>
                                    <td style={{ padding: '24px 32px', textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                                        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                                            {(!job.status || job.status === 'pending') ? (
                                                <button onClick={e => handleStart(e, job.plan_id)} className="btn btn-primary" style={{ padding: '10px 20px' }}>
                                                    <Play size={16} /> Execute
                                                </button>
                                            ) : job.status === 'running' ? (
                                                <>
                                                    <button onClick={e => handlePauseClick(e, job.plan_id)} className="btn glass-panel" style={{ color: 'var(--warning)' }}>
                                                        <Pause size={16} />
                                                    </button>
                                                    <button onClick={e => handleCompleteClick(e, job.plan_id, job.total_qty)} className="btn btn-primary" style={{ background: 'var(--success)' }}>
                                                        <CheckCircle size={16} /> Finish
                                                    </button>
                                                </>
                                            ) : job.status === 'paused' ? (
                                                <button onClick={e => handleStart(e, job.plan_id)} className="btn btn-primary" style={{ background: 'var(--warning)' }}>
                                                    <Activity size={16} /> Resume
                                                </button>
                                            ) : (
                                                <div style={{ color: 'var(--success)', fontWeight: 800 }}>COMPLETED</div>
                                            )}
                                        </div>
                                    </td>
                                </motion.tr>
                            ))}
                        </AnimatePresence>
                    </tbody>
                </table>
            </motion.div>

            {/* Pause Dialog */}
            <AnimatePresence>
                {showPauseDialog && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel" style={{ padding: '32px', width: '400px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Pause Reason</h3>
                            <select className="input-field" value={pauseReason} onChange={e => setPauseReason(e.target.value)} style={{ width: '100%', padding: '12px', borderRadius: '12px', marginBottom: '24px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}>
                                <option value="">Select reason...</option>
                                <option value="Maintenance">Maintenance Required</option>
                                <option value="Material">Material Issue</option>
                                <option value="Shift">Shift Change</option>
                                <option value="Quality">Quality Check</option>
                                <option value="Other">Other</option>
                            </select>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={confirmPause} className="btn btn-primary" style={{ flex: 1 }}>Confirm</button>
                                <button onClick={() => { setShowPauseDialog(false); setPauseReason(''); }} className="btn glass-panel" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Complete Dialog */}
            <AnimatePresence>
                {showCompleteDialog && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="glass-panel" style={{ padding: '32px', width: '450px' }}>
                            <h3 style={{ fontSize: '20px', fontWeight: 800, marginBottom: '24px' }}>Complete Job</h3>
                            <div style={{ marginBottom: '16px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Actual Quantity Produced</label>
                                <input
                                    type="number"
                                    value={actualQty}
                                    onChange={e => setActualQty(e.target.value)}
                                    className="input-field"
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                                    placeholder="Enter quantity..."
                                />
                            </div>
                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, marginBottom: '8px', color: 'var(--text-secondary)' }}>Scrap Quantity</label>
                                <input
                                    type="number"
                                    value={scrapQty}
                                    onChange={e => setScrapQty(e.target.value)}
                                    className="input-field"
                                    style={{ width: '100%', padding: '12px', borderRadius: '12px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--glass-border)' }}
                                    placeholder="Enter scrap quantity..."
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '12px' }}>
                                <button onClick={confirmComplete} className="btn btn-primary" style={{ flex: 1, background: 'var(--success)' }}>Complete</button>
                                <button onClick={() => { setShowCompleteDialog(false); setActualQty(''); setScrapQty('0'); }} className="btn glass-panel" style={{ flex: 1 }}>Cancel</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Completion Summary Popup */}
            <AnimatePresence>
                {showSummary && summaryData && (
                    <div style={{ position: 'fixed', inset: 0, zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(5, 11, 20, 0.8)', backdropFilter: 'blur(12px)' }}>
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="glass-panel"
                            style={{
                                width: '600px',
                                padding: '40px',
                                background: 'linear-gradient(180deg, rgba(16, 185, 129, 0.1) 0%, rgba(5, 11, 20, 0.95) 100%)',
                                border: '1px solid rgba(16, 185, 129, 0.3)',
                                boxShadow: '0 0 50px rgba(16, 185, 129, 0.15)',
                                color: 'var(--text-primary)',
                                overflow: 'hidden'
                            }}
                        >
                            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                                <div style={{
                                    width: '80px',
                                    height: '80px',
                                    borderRadius: '40px',
                                    background: summaryData.isSOFinished ? 'var(--primary)' : 'var(--success)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    margin: '0 auto 20px',
                                    boxShadow: `0 0 30px ${summaryData.isSOFinished ? 'rgba(79, 70, 229, 0.4)' : 'rgba(16, 185, 129, 0.4)'}`
                                }}>
                                    {summaryData.isSOFinished ? <Rocket size={40} color="white" /> : <CheckCircle size={40} color="white" />}
                                </div>
                                <h2 style={{ fontSize: '28px', fontWeight: 800, letterSpacing: '-0.5px' }}>
                                    {summaryData.isSOFinished ? 'ORDER FULLY COMPLETED!' : 'Job Completed Successfully'}
                                </h2>
                                <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                                    {summaryData.isSOFinished ? 'All production steps for this Sales Order are finished. Great job!' : 'Production data has been synchronized with the main system.'}
                                </p>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px', marginBottom: '40px' }}>
                                <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)', border: summaryData.isSOFinished ? '1px solid var(--primary)' : 'none' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>
                                        {summaryData.isSOFinished ? '🎯 Global Status' : 'Work Information'}
                                    </h4>
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                        {summaryData.isSOFinished && (
                                            <div style={{ padding: '8px 12px', background: 'var(--primary)', color: 'white', borderRadius: '8px', fontSize: '10px', fontWeight: 800, textAlign: 'center', marginBottom: '8px' }}>
                                                ALL ROUTING STEPS FINISHED
                                            </div>
                                        )}
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SO NUMBER</div>
                                            <div style={{ fontSize: '18px', fontWeight: 800 }}>{summaryData.so_number}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ITEM NAME</div>
                                            <div style={{ fontSize: '16px', fontWeight: 700 }}>{summaryData.item_name}</div>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                                            <div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>STATION</div>
                                                <div style={{ fontSize: '14px', fontWeight: 700 }}>{getStationById(summaryData.station_id).station_code}</div>
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>MACHINE</div>
                                                <div style={{ fontSize: '14px', fontWeight: 700 }}>{getMachineById(summaryData.machine_id).machine_code}</div>
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>CUSTOMER</div>
                                            <div style={{ fontSize: '14px', fontWeight: 700 }}>{summaryData.customer_name}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>OPERATOR</div>
                                            <div style={{ fontSize: '14px', fontWeight: 700 }}>{summaryData.operatorName || user.username}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="glass-panel" style={{ padding: '24px', background: 'rgba(255,255,255,0.03)' }}>
                                    <h4 style={{ fontSize: '12px', fontWeight: 800, color: 'var(--success)', textTransform: 'uppercase', marginBottom: '16px', letterSpacing: '1px' }}>Performance Metrics</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>TARGET</div>
                                            <div style={{ fontSize: '20px', fontWeight: 800 }}>{summaryData.total_qty}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>ACTUAL</div>
                                            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--success)' }}>{summaryData.actual}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>SCRAP</div>
                                            <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--danger)' }}>{summaryData.scrap}</div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>YIELD</div>
                                            <div style={{ fontSize: '20px', fontWeight: 800 }}>
                                                {summaryData.actual > 0 ? Math.round((summaryData.actual / (summaryData.actual + summaryData.scrap)) * 100) : 0}%
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel" style={{ padding: '24px', marginBottom: '40px', background: 'rgba(255,255,255,0.03)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <div style={{ display: 'flex', gap: '24px' }}>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>START TIME</div>
                                            <div style={{ fontSize: '14px', fontWeight: 700 }}>
                                                {summaryData.startTime ? new Date(summaryData.startTime).toLocaleTimeString() : '-'}
                                            </div>
                                        </div>
                                        <div>
                                            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>END TIME</div>
                                            <div style={{ fontSize: '14px', fontWeight: 700 }}>
                                                {new Date(summaryData.completedAt).toLocaleTimeString()}
                                            </div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>TOTAL DURATION</div>
                                        <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>
                                            {summaryData.startTime ?
                                                Math.round((new Date(summaryData.completedAt) - new Date(summaryData.startTime)) / 60000) : 0}
                                            <span style={{ fontSize: '12px', marginLeft: '4px' }}>min</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                                <button
                                    onClick={() => {
                                        setShowSummary(false);
                                        setSummaryData(null);
                                    }}
                                    className="btn btn-primary"
                                    style={{ width: '100%', padding: '20px', fontSize: '18px', borderRadius: '20px', fontWeight: 800, background: 'var(--success)', border: 'none', cursor: 'pointer', boxShadow: '0 10px 20px rgba(16, 185, 129, 0.2)' }}
                                >
                                    Acknowledge & Close
                                </button>

                                {summaryData.isSOFinished && (
                                    <button
                                        onClick={() => {
                                            setShowSummary(false);
                                            setSummaryData(null);
                                            onSwitchScreen('dashboard');
                                        }}
                                        className="btn glass-panel"
                                        style={{ width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 700, color: 'var(--primary)', border: '1px solid var(--primary-glow)' }}
                                    >
                                        <Globe size={16} /> View Master Summary Report
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
