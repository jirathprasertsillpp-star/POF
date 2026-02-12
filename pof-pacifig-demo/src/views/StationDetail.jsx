import React from 'react';
import { motion } from 'framer-motion';
import { Cpu, Activity, Clock, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getMachinesForStation, getSOsForStation } from '../data/db';
import { useDrawer } from '../components/Drawer';
import { MachineDetail } from './MachineDetail';
import { useI18n } from '../i18n';

export function StationDetail({ station }) {
    const machines = getMachinesForStation(station.station_id);
    const stationSOs = getSOsForStation(station.station_id);
    const { openDrawer } = useDrawer();
    const { t } = useI18n();

    const handleMachineClick = (machine) => {
        openDrawer({
            title: `${machine.machine_code} - ${machine.status}`,
            content: <MachineDetail machine={machine} />,
            width: '600px',
        });
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', padding: '12px' }}>
            {/* Health Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>{t('metric.load')}</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)' }}>{Math.round((machines.filter(m => m.status === 'RUNNING').length / machines.length) * 100)}%</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>{t('metric.active')}</div>
                    <div style={{ fontSize: '24px', fontWeight: 800 }}>{machines.filter(m => m.status === 'RUNNING').length} / {machines.length}</div>
                </div>
                <div className="glass-panel" style={{ padding: '20px', textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '4px' }}>{t('metric.maint')}</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--urgent)' }}>{machines.filter(m => m.status === 'DOWN').length}</div>
                </div>
            </div>

            {/* Machines Grid - Styled like image 2 */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '32px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Cpu size={20} className="status-running" /> {t('machine.queue')}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {machines.map(m => (
                        <motion.div
                            key={m.machine_id}
                            whileHover={{ scale: 1.01, background: 'var(--surface)' }}
                            onClick={() => handleMachineClick(m)}
                            className="glass-panel"
                            style={{
                                padding: '20px 24px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                background: 'var(--glass-bg)',
                                cursor: 'pointer',
                                borderRadius: '20px'
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <div className={m.status === 'RUNNING' ? 'status-glow' : ''} style={{ width: '10px', height: '10px', borderRadius: '50%', background: m.status === 'RUNNING' ? 'var(--success)' : (m.status === 'DOWN' ? 'var(--urgent)' : 'var(--text-secondary)') }} />
                                <span style={{ fontWeight: 800, fontSize: '16px', color: 'var(--text-primary)' }}>{m.machine_code}</span>
                            </div>
                            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                                <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-secondary)' }}>{t('metric.speed')}: {m.standard_speed}u/{t('common.minutes')}</span>
                                <span className={`badge status-${m.status.toLowerCase()}`} style={{ fontWeight: 800, minWidth: '80px', textAlign: 'center' }}>{t(`status.${m.status.toLowerCase()}`)}</span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Active Queue at this station */}
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '32px' }}>
                <h4 style={{ fontSize: '18px', fontWeight: 800, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Clock size={20} className="status-running" /> {t('machine.queue')}
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {stationSOs.slice(0, 3).map(sso => (
                        <div key={sso.so_id} style={{ padding: '16px', borderLeft: '4px solid var(--primary)', background: 'var(--bg-color)', borderRadius: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontWeight: 800, color: 'var(--text-primary)' }}>{sso.so_number}</span>
                                <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{sso.progress.progressPercent}%</span>
                            </div>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{sso.customer_name}</div>
                        </div>
                    ))}
                    {stationSOs.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>{t('msg.no_jobs')}</div>}
                </div>
            </div>
        </div>
    );
}
