import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, User, Package, AlertTriangle, Calendar, Settings, FileText, ChevronRight, Activity, Target, ShieldCheck, CheckCircle } from 'lucide-react';
import { useI18n } from '../i18n';
import { Tooltip } from '../components/Tooltip';
import { getPlanRowsForSO, getExecutionEventsForPlan, getMachineById, getStationById, getSOProgress } from '../data/db';
import { MachineStatusBar } from '../components/MachineStatusBar';
import { useDrawer } from '../components/Drawer';
import { MachineDetail } from './MachineDetail';
import { DatePicker } from '../components/DatePicker';

export function SODetail({ so }) {
    const { t } = useI18n();
    const [activeTab, setActiveTab] = React.useState('overview');
    const [rescheduleDate, setRescheduleDate] = React.useState(new Date(so.customer_due_date));
    const plans = React.useMemo(() => getPlanRowsForSO(so.so_id), [so.so_id]);
    const progress = React.useMemo(() => getSOProgress(so.so_id), [so.so_id]);
    const { openDrawer } = useDrawer();

    if (!so) return <div style={{ padding: '40px', textAlign: 'center' }}>SO Data Missing</div>;

    const tabs = [
        { id: 'overview', label: t('tab.overview'), icon: FileText },
        { id: 'plan', label: t('tab.plan'), icon: Target },
        { id: 'history', label: t('tab.history'), icon: Clock },
    ];

    const handleMachineClick = (machineId) => {
        const machine = getMachineById(machineId);
        openDrawer({
            title: `${machine.machine_code} - ${machine.status}`,
            content: <MachineDetail machine={machine} />,
            width: '600px',
        });
    };

    const renderOverview = () => (
        <div className="reveal-up" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header Info - Styled like image 1 */}
            <div className="glass-panel" style={{ padding: '32px', background: 'rgba(79, 70, 229, 0.04)', borderRadius: '32px' }}>
                <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '1.2px', marginBottom: '8px' }}>{t('op.wo_assign')}</div>
                    <div style={{ fontSize: '32px', fontWeight: 800, color: '#1E293B' }}>{so.customer_name}</div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '32px' }}>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>{t('so.target_output')}</div>
                        <div style={{ fontSize: '24px', fontWeight: 800 }}>{so.qty?.toLocaleString() || '12,500'} <span style={{ fontSize: '16px', fontWeight: 500, color: '#94A3B8' }}>{t('common.units')}</span></div>
                    </div>
                    <div>
                        <div style={{ fontSize: '12px', fontWeight: 600, color: '#64748B', marginBottom: '4px' }}>{t('so.estimated_time')}</div>
                        <div style={{ fontSize: '24px', fontWeight: 800 }}>08:00 - 09:30</div>
                    </div>
                </div>
            </div>

            {/* Technical Specs - Styled like image 1 */}
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <Settings size={20} /> {t('tech.specs')}
                </h4>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {[
                        { label: t('tech.station'), val: 'Printing' },
                        { label: t('tech.machine'), val: 'PR-01' },
                        { label: t('tech.material'), val: 'Glossy Paper 200g' },
                        { label: t('tech.ink'), val: 'CMYK Premium' }
                    ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '18px 24px', background: '#F8FAFC', borderRadius: '16px', border: '1px solid #E2E8F0' }}>
                            <span style={{ fontSize: '14px', fontWeight: 600, color: '#64748B' }}>{item.label}</span>
                            <span style={{ fontSize: '14px', fontWeight: 800, color: '#1E293B' }}>{item.val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* QC Checklist - Styled like image 1 */}
            <div className="glass-panel" style={{ padding: '32px', borderRadius: '32px', background: '#F8FAFC' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 800, color: '#10B981', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
                    <ShieldCheck size={20} /> {t('qc.checklist')}
                </h4>
                <div style={{ display: 'grid', gap: '16px' }}>
                    {[t('qc.color'), t('qc.distance'), t('qc.cleanliness')].map((text, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                            <div style={{ width: '28px', height: '28px', borderRadius: '10px', border: '2px solid #10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                                <CheckCircle size={18} color="#10B981" />
                            </div>
                            <span style={{ fontSize: '15px', fontWeight: 600, color: '#475569' }}>{text}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Execution Timeline */}
            <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '14px', fontWeight: 800, marginBottom: '20px', color: '#64748B', textTransform: 'uppercase', letterSpacing: '1px' }}>{t('dash.diagnostics')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {plans.map((plan, i) => {
                        const station = getStationById(plan.station_id);
                        const machine = getMachineById(plan.machine_id);
                        const events = getExecutionEventsForPlan(plan.plan_id);
                        const started = events.find(e => e.event_type === 'START');
                        const completed = events.find(e => e.event_type === 'COMPLETE');
                        const status = completed ? 'DONE' : started ? 'RUNNING' : 'QUEUED';

                        return (
                            <motion.div
                                key={plan.plan_id}
                                className="glass-panel"
                                style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', borderLeft: status === 'RUNNING' ? '6px solid #10B981' : '1px solid #E2E8F0', borderRadius: '20px' }}
                            >
                                <div style={{ fontSize: '12px', fontWeight: 800, color: '#94A3B8' }}>#{i + 1}</div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                                        <span style={{ fontWeight: 800, fontSize: '15px' }}>{station.station_name}</span>
                                        <span className={`badge status-${status.toLowerCase()}`} style={{ fontSize: '10px' }}>{status}</span>
                                    </div>
                                    <div style={{ height: '6px', background: '#F1F5F9', borderRadius: '3px', overflow: 'hidden' }}>
                                        <div style={{ width: completed ? '100%' : (started ? '50%' : '0%'), height: '100%', background: '#6366F1' }} />
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px', fontWeight: 600, color: '#64748B' }}>
                                        <span>{machine.machine_code}</span>
                                        <span>{plan.runtime_minutes} min</span>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </div>
    );

    const renderPlan = () => (
        <div className="reveal-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {plans.map((plan, i) => {
                const station = getStationById(plan.station_id);
                const machine = getMachineById(plan.machine_id);
                const events = getExecutionEventsForPlan(plan.plan_id);
                const started = events.find(e => e.event_type === 'START');
                const completed = events.find(e => e.event_type === 'COMPLETE');
                const status = completed ? 'DONE' : started ? 'RUNNING' : 'QUEUED';

                return (
                    <motion.div
                        key={plan.plan_id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="glass-panel"
                        style={{
                            padding: '24px',
                            display: 'grid',
                            gridTemplateColumns: '40px 1.5fr 1fr 1fr 100px',
                            alignItems: 'center',
                            gap: '20px',
                            borderLeft: status === 'RUNNING' ? '4px solid var(--primary)' : '1px solid var(--glass-border)',
                            background: 'var(--surface)'
                        }}
                    >
                        <div style={{
                            width: '32px', height: '32px', borderRadius: '50%',
                            background: status === 'DONE' ? 'var(--success)' : 'var(--bg-color)',
                            color: status === 'DONE' ? 'white' : 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontWeight: 700, fontSize: '14px'
                        }}>
                            {status === 'DONE' ? <CheckCircle size={18} /> : i + 1}
                        </div>

                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('tech.station')}</div>
                            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)' }}>{station.station_name}</div>
                        </div>

                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('tech.machine')}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{machine.machine_code}</div>
                            </div>
                        </div>

                        <div>
                            <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>{t('common.runtime')}</div>
                            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-primary)' }}>{plan.runtime_minutes} {t('common.minutes')}</div>
                        </div>

                        <div style={{ textAlign: 'right' }}>
                            <span className={`badge status-${status.toLowerCase()}`} style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                                {status}
                            </span>
                        </div>
                    </motion.div>
                );
            })}
            {plans.length === 0 && (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
                    {t('msg.no_jobs')}
                </div>
            )}
        </div>
    );

    const renderHistory = () => {
        // Mock System Events based on SO creation
        const systemEvents = [
            {
                event_type: 'ORDER_CREATED',
                station_name: 'System Core',
                timestamp: so.created_at || new Date(new Date().setHours(8, 0, 0, 0)),
                note: 'Order received via ERP Integration'
            },
            {
                event_type: 'PLAN_SCHEDULED',
                station_name: 'AI Scheduler',
                timestamp: new Date((so.created_at || new Date()).getTime() + 15 * 60000), // +15 mins
                note: 'Automatic resource allocation completed'
            }
        ];

        // Aggregate all execute events
        const executionEvents = plans.flatMap(p => {
            const evts = getExecutionEventsForPlan(p.plan_id);
            const station = getStationById(p.station_id);
            return evts.map(e => ({ ...e, station_name: station.station_name, timestamp: e.event_time }));
        });

        const allEvents = [...systemEvents, ...executionEvents].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        return (
            <div className="reveal-up" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {allEvents.map((evt, i) => (
                    <div key={i} className="glass-panel" style={{ padding: '20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
                        <div style={{
                            width: '40px', height: '40px', borderRadius: '12px',
                            background: evt.event_type === 'COMPLETE' ? 'var(--success-glow)' : evt.event_type === 'ORDER_CREATED' ? 'rgba(99, 102, 241, 0.2)' : 'var(--primary-glow)',
                            color: evt.event_type === 'COMPLETE' ? 'var(--success)' : evt.event_type === 'ORDER_CREATED' ? '#6366F1' : 'var(--primary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            {evt.event_type === 'ORDER_CREATED' ? <FileText size={20} /> :
                                evt.event_type === 'PLAN_SCHEDULED' ? <Settings size={20} /> :
                                    <Clock size={20} />}
                        </div>
                        <div>
                            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)' }}>
                                {evt.event_type.replace('_', ' ')} <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>• {evt.station_name}</span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                                {new Date(evt.timestamp).toLocaleString()} {evt.note && `• ${evt.note}`}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    return (
        <div style={{ padding: '8px' }}>
            <div className="glass-panel" style={{ padding: '4px', borderRadius: '16px', display: 'flex', gap: '4px', marginBottom: '32px' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`btn ${activeTab === tab.id ? 'btn-primary' : 'transparent'}`}
                        style={{ flex: 1, borderRadius: '12px', padding: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: activeTab === tab.id ? 'var(--primary)' : 'transparent', color: activeTab === tab.id ? 'white' : 'var(--text-secondary)' }}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                >
                    {activeTab === 'overview' && renderOverview()}
                    {activeTab === 'plan' && renderPlan()}
                    {activeTab === 'history' && renderHistory()}
                </motion.div>
            </AnimatePresence>
        </div>
    );
}
