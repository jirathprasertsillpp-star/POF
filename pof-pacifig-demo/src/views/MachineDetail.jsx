import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Clock, TrendingUp } from 'lucide-react';
import { useI18n } from '../i18n';
import { getCurrentJobForMachine, planRows, machineStatusLogs } from '../data/db';
import { MachineStatusBar, MachineUtilizationBar } from '../components/MachineStatusBar';
import { AlertTriangle, FileText } from 'lucide-react';

export function MachineDetail({ machine }) {
    const { t } = useI18n();
    const currentJob = getCurrentJobForMachine(machine.machine_id);

    // Get queue (previous, current, next)
    const machinePlans = planRows
        .filter(p => p.machine_id === machine.machine_id)
        .sort((a, b) => new Date(a.planned_start) - new Date(b.planned_start));

    const currentIndex = machinePlans.findIndex(p => p.plan_id === currentJob?.plan_id);
    const previousJob = currentIndex > 0 ? machinePlans[currentIndex - 1] : null;
    const nextJob = currentIndex >= 0 && currentIndex < machinePlans.length - 1
        ? machinePlans[currentIndex + 1]
        : null;

    // Machine logs
    const logs = machineStatusLogs.filter(log => log.machine_id === machine.machine_id);

    // Calculate utilization (simplified)
    const utilization = machine.status === 'RUNNING' ? 87 : machine.status === 'IDLE' ? 42 : 0;

    // Planned vs Actual (mock data)
    const plannedTime = 90;
    const actualTime = machine.status === 'RUNNING' ? 95 : machine.status === 'IDLE' ? 0 : 0;

    return (
        <div>
            {/* Machine Status Header */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                    <div
                        style={{
                            width: '56px',
                            height: '56px',
                            borderRadius: '12px',
                            background: machine.status === 'RUNNING'
                                ? 'var(--success)'
                                : machine.status === 'IDLE'
                                    ? 'var(--text-secondary)'
                                    : 'var(--danger)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: machine.status === 'RUNNING'
                                ? '0 8px 24px rgba(16, 185, 129, 0.4)'
                                : 'none',
                        }}
                    >
                        <Activity size={28} color="white" />
                    </div>

                    <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                            {machine.machine_code}
                        </div>
                        <div className={`status-${machine.status.toLowerCase()}`} style={{ fontSize: '14px', fontWeight: 600 }}>
                            {machine.status}
                        </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                            {t('metric.speed')}
                        </div>
                        <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--primary)' }}>
                            {machine.standard_speed} u/{t('common.minutes')}
                        </div>
                    </div>
                </div>

                <MachineStatusBar
                    status={machine.status}
                    progress={machine.status === 'RUNNING' ? 60 : machine.status === 'SETUP' ? 30 : 0}
                    label={t('machine.status')}
                />

                {/* Manual Actions */}
                <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                    <button
                        className="btn btn-secondary"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}
                        onClick={() => {
                            const reason = prompt(t('common.report_down'), "Machine Jammed");
                            if (reason) alert(`${t('msg.success')} ${reason}`);
                        }}
                    >
                        <AlertTriangle size={14} color="var(--danger)" />
                        {t('common.report_down')}
                    </button>
                    <button
                        className="btn btn-secondary"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '13px' }}
                        onClick={() => {
                            const status = prompt(t('common.log_status'), "SETUP");
                            if (status) alert(`${t('msg.success')} ${status}`);
                        }}
                    >
                        <FileText size={14} color="var(--primary)" />
                        {t('common.log_status')}
                    </button>
                </div>
            </div>

            {/* Utilization */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                <MachineUtilizationBar
                    utilization={utilization}
                    planned={plannedTime}
                    actual={actualTime}
                />
            </div>

            {/* Current Job */}
            {currentJob && (
                <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                    <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)' }} />
                        {t('machine.current')}
                    </div>

                    <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600, marginBottom: '8px' }}>
                        {currentJob.so.so_number} - {currentJob.so.customer_name}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '13px' }}>
                        <div>
                            <span style={{ color: 'var(--text-secondary)' }}>{t('common.started')}:</span>
                            <div style={{ color: 'var(--text-primary)' }}>{new Date(currentJob.planned_start).toLocaleTimeString()}</div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)' }}>{t('common.end')}:</span>
                            <div style={{ color: 'var(--text-primary)' }}>{new Date(currentJob.planned_end).toLocaleTimeString()}</div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)' }}>{t('so.qty')}:</span>
                            <div style={{ color: 'var(--text-primary)' }}>{currentJob.total_qty} {t('common.units')}</div>
                        </div>
                        <div>
                            <span style={{ color: 'var(--text-secondary)' }}>{t('common.runtime') || 'Runtime'}:</span>
                            <div style={{ color: 'var(--text-primary)' }}>{currentJob.runtime_minutes} {t('common.minutes')}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Job Queue */}
            <div className="glass-panel" style={{ padding: '20px', marginBottom: '20px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('machine.queue')}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Previous */}
                    {previousJob && (
                        <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                {t('machine.previous')}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 600 }}>
                                Completed
                            </div>
                        </div>
                    )}

                    {/* Current */}
                    {currentJob && (
                        <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '8px', border: '1px solid var(--success)' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                {t('machine.current')}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--success)', fontWeight: 600 }}>
                                {currentJob.so.so_number}
                            </div>
                        </div>
                    )}

                    {/* Next */}
                    {nextJob && (
                        <div style={{ padding: '12px', background: 'var(--surface)', borderRadius: '8px' }}>
                            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '4px' }}>
                                {t('machine.next')}
                            </div>
                            <div style={{ fontSize: '14px', color: 'var(--primary)', fontWeight: 600 }}>
                                Queued
                            </div>
                        </div>
                    )}

                    {!previousJob && !currentJob && !nextJob && (
                        <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                            {t('msg.no_jobs')}
                        </div>
                    )}
                </div>
            </div>

            {/* Machine Logs */}
            <div className="glass-panel" style={{ padding: '20px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '16px' }}>
                    {t('machine.logs')}
                </div>

                {logs.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {logs.map(log => (
                            <motion.div
                                key={log.log_id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    padding: '12px',
                                    background: 'var(--surface)',
                                    borderRadius: '8px',
                                    borderLeft: `3px solid ${log.status === 'DOWN' ? 'var(--danger)' : 'var(--warning)'}`,
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                    <span className={`status-${log.status.toLowerCase()}`} style={{ fontWeight: 600 }}>
                                        {log.status}
                                    </span>
                                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                                        <Clock size={12} style={{ display: 'inline', marginRight: '4px' }} />
                                        {new Date(log.start_time).toLocaleString()}
                                    </span>
                                </div>
                                <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                                    {log.reason}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                        {t('msg.no_logs') || 'No logs available'}
                    </div>
                )}
            </div>
        </div>
    );
}
