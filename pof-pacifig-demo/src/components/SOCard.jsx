import React from 'react';
import { motion } from 'framer-motion';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { getSOProgress, getStationById, activateJobImmediately, scheduleSOToday } from '../data/db';
import { Tooltip } from './Tooltip';
import { Play, Calendar, Check } from 'lucide-react';

export function SOCard({ so, onClick, showActions = true }) {
    const progress = getSOProgress(so.so_id);
    const [activated, setActivated] = React.useState(false);

    const handleActivate = (e) => {
        e.stopPropagation();
        activateJobImmediately(so.so_id);
        setActivated(true);
        setTimeout(() => setActivated(false), 2000);
    };

    const handleSchedule = (e) => {
        e.stopPropagation();
        const date = prompt("Enter scheduled date (YYYY-MM-DD):", new Date().toISOString().split('T')[0]);
        if (date) {
            scheduleSOToday(so.so_id, new Date(date));
            alert(`Scheduled ${so.so_number} for ${date}`);
        }
    };
    const now = new Date();
    const hoursUntilDue = Math.round((new Date(so.customer_due_date) - now) / (1000 * 60 * 60));
    const isAtRisk = hoursUntilDue < 4;

    return (
        <motion.div
            whileHover={{ scale: 1.02, y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`glass-panel ${so.is_urgent ? 'animate-pulse-urgent' : ''}`}
            style={{
                minWidth: '280px',
                maxWidth: '280px',
                padding: '16px',
                cursor: 'pointer',
                position: 'relative',
                border: so.is_urgent ? '2px solid var(--urgent)' : undefined,
            }}
        >
            {/* Urgent Badge */}
            {so.is_urgent && (
                <div
                    className="badge badge-urgent"
                    style={{
                        position: 'absolute',
                        top: '12px',
                        right: '12px',
                    }}
                >
                    URGENT
                </div>
            )}

            {/* SO Header */}
            <div style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {so.so_number}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {so.customer_name}
                </div>

                {showActions && (
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                        <Tooltip content="Activate Immediately">
                            <button
                                onClick={handleActivate}
                                className={`btn ${activated ? 'btn-success' : 'btn-primary'}`}
                                style={{
                                    flex: 1,
                                    padding: '8px',
                                    fontSize: '12px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',
                                    background: activated ? 'var(--success)' : undefined
                                }}
                            >
                                {activated ? <Check size={14} /> : <Play size={14} />}
                                {activated ? 'Activated' : 'Activate'}
                            </button>
                        </Tooltip>
                        <Tooltip content="Add to Daily Plan">
                            <button
                                onClick={handleSchedule}
                                className="btn btn-secondary"
                                style={{
                                    padding: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                }}
                            >
                                <Calendar size={14} />
                            </button>
                        </Tooltip>
                    </div>
                )}
            </div>

            {/* Priority Badge */}
            <div style={{ marginBottom: '12px' }}>
                <span
                    className={`badge ${so.priority === 'URGENT' || so.priority === 'HIGH' ? 'badge-high' : 'badge-normal'
                        }`}
                >
                    {so.priority}
                </span>
            </div>

            {/* 4-Station Progress Dots */}
            <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {[1, 2, 3, 4].map(stationId => {
                        const isComplete = progress.completed >= stationId;
                        const isCurrent = progress.current === stationId;
                        const station = getStationById(stationId);

                        return (
                            <Tooltip key={stationId} content={`${station.station_code}: ${isComplete ? 'Complete' : isCurrent ? 'Running' : 'Queued'}`}>
                                <div
                                    style={{
                                        width: '58px',
                                        height: '6px',
                                        borderRadius: '3px',
                                        background: isComplete
                                            ? 'var(--success)'
                                            : isCurrent
                                                ? 'var(--warning)'
                                                : 'var(--accent)',
                                        position: 'relative',
                                        cursor: 'help',
                                    }}
                                >
                                    {isCurrent && (
                                        <motion.div
                                            animate={{ opacity: [1, 0.5, 1] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            style={{
                                                position: 'absolute',
                                                width: '100%',
                                                height: '100%',
                                                background: 'rgba(255, 255, 255, 0.5)',
                                                borderRadius: '3px',
                                            }}
                                        />
                                    )}
                                </div>
                            </Tooltip>
                        );
                    })}
                </div>

                {/* Current Station Label */}
                {progress.currentStation && (
                    <div style={{ fontSize: '11px', color: 'var(--primary)', marginTop: '6px', fontWeight: 600 }}>
                        {progress.currentStation.station_code}: {progress.currentMachine?.machine_code || 'Queued'}
                    </div>
                )}
            </div>

            {/* Due Time & Risk */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px' }}>
                <Clock size={14} color={isAtRisk ? 'var(--urgent)' : 'var(--text-secondary)'} />
                <span style={{ color: isAtRisk ? 'var(--urgent)' : 'var(--text-secondary)' }}>
                    {hoursUntilDue > 0 ? `${hoursUntilDue}h remaining` : `${Math.abs(hoursUntilDue)}h overdue`}
                </span>
                {isAtRisk && <AlertTriangle size={14} color="var(--urgent)" />}
            </div>
        </motion.div>
    );
}
