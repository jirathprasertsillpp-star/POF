// Helper to generate dates for today and tomorrow
const todayBase = new Date('2026-02-10T09:00:00+07:00');
const addHours = (hours, base = todayBase) => new Date(base.getTime() + hours * 60 * 60 * 1000);

// Global State Management (Protected)
let planId = 500; // Counter for new plans
let soId = 100;   // Counter for new SOs

// === STATIONS & MACHINES (Remains constant) ===
export const stations = [
    { station_id: 1, station_code: 'S1', station_name: 'Slitting / Rewinding' },
    { station_id: 2, station_code: 'S2', station_name: 'Printing' },
    { station_id: 3, station_code: 'S3', station_name: 'Folding' },
    { station_id: 4, station_code: 'S4', station_name: 'Final Cutting / Die Cutting' },
];

export const machines = [
    { machine_id: 1, station_id: 1, machine_code: 'SL-01', status: 'RUNNING', standard_speed: 100 },
    { machine_id: 2, station_id: 1, machine_code: 'SL-02', status: 'IDLE', standard_speed: 100 },
    { machine_id: 3, station_id: 1, machine_code: 'RW-01', status: 'RUNNING', standard_speed: 90 },
    { machine_id: 12, station_id: 1, machine_code: 'SL-03', status: 'MAINTENANCE', standard_speed: 100 },
    { machine_id: 13, station_id: 1, machine_code: 'RW-02', status: 'IDLE', standard_speed: 95 },

    { machine_id: 4, station_id: 2, machine_code: 'PR-01', status: 'RUNNING', standard_speed: 80 },
    { machine_id: 5, station_id: 2, machine_code: 'PR-02', status: 'DOWN', standard_speed: 80 },
    { machine_id: 6, station_id: 2, machine_code: 'PR-03', status: 'SETUP', standard_speed: 75 },
    { machine_id: 14, station_id: 2, machine_code: 'PR-04', status: 'RUNNING', standard_speed: 85 },
    { machine_id: 15, station_id: 2, machine_code: 'PR-05', status: 'IDLE', standard_speed: 80 },

    { machine_id: 7, station_id: 3, machine_code: 'FD-01', status: 'RUNNING', standard_speed: 120 },
    { machine_id: 8, station_id: 3, machine_code: 'FD-02', status: 'IDLE', standard_speed: 120 },
    { machine_id: 16, station_id: 3, machine_code: 'FD-03', status: 'RUNNING', standard_speed: 115 },
    { machine_id: 17, station_id: 3, machine_code: 'FD-04', status: 'OFFLINE', standard_speed: 120 },

    { machine_id: 9, station_id: 4, machine_code: 'CT-01', status: 'RUNNING', standard_speed: 100 },
    { machine_id: 10, station_id: 4, machine_code: 'DC-01', status: 'BLOCKED', standard_speed: 110 },
    { machine_id: 11, station_id: 4, machine_code: 'DC-02', status: 'IDLE', standard_speed: 110 },
    { machine_id: 18, station_id: 4, machine_code: 'DC-03', status: 'RUNNING', standard_speed: 115 },
    { machine_id: 19, station_id: 4, machine_code: 'CT-02', status: 'SETUP', standard_speed: 105 },
];

// === SALES ORDERS (Distinct for Today and Tomorrow) ===
const today = new Date('2026-02-10');
const tomorrow = new Date('2026-02-11');

export const salesOrders = [
    // --- TODAY'S ORDERS ---
    { so_id: 1, so_number: 'SO-2026-0105-1234', customer_name: 'บริษัท อาหารไทย จำกัด (มหาชน)', item_name: 'ฟิล์มบรรจุภัณฑ์ขนมปัง', width: '230', thickness: '20', colors: '6 สี', final_size: '100x120', total_qty: 10000, combination: '3 Layers', folding_type: 'Center Fold', remark_1: 'Fragile handling', remark_2: 'Ship by morning', remark_3: 'Standard Pack', customer_due_date: addHours(8), priority: 'HIGH', is_urgent: true, urgent_reason: 'Urgent re-stock for automotive line', created_at: addHours(-24) },
    { so_id: 2, so_number: 'SO-078-24', customer_name: 'Siam Food Co., Ltd', item_name: 'Packaging Film AW', width: '250', thickness: '25', colors: '7 สี', final_size: '110x120', total_qty: 9500, combination: 'Pouch', folding_type: 'Gusset', remark_1: 'Special color match', remark_2: 'QC Priority', remark_3: '-', customer_due_date: addHours(10), priority: 'NORMAL', is_urgent: false, urgent_reason: null, created_at: addHours(-24) },
    { so_id: 3, so_number: 'SO-079-34', customer_name: 'Foodies Express', item_name: 'Laminated Film AX', width: '270', thickness: '18', colors: '8 สี', final_size: '90x90', total_qty: 6000, combination: 'Roll Stock', folding_type: 'Flat', remark_1: 'Check tension', remark_2: '-', remark_3: '-', customer_due_date: addHours(12), priority: 'HIGH', is_urgent: false, urgent_reason: null, created_at: addHours(-20) },
    { so_id: 4, so_number: 'SO-080-34', customer_name: 'Lotus', item_name: 'Film AY', width_thick: '210/18', colors: '4 สี', final_size: '95x100', total_qty: 9000, customer_due_date: addHours(6), priority: 'NORMAL', is_urgent: true, urgent_reason: 'Material defect in previous batch', created_at: addHours(-6) },
    { so_id: 5, so_number: 'SO-068-1234', customer_name: 'Siam Food', item_name: 'Bag AM', width_thick: '220/30', colors: '10 สี', final_size: '120x140', total_qty: 13000, customer_due_date: addHours(14), priority: 'HIGH', is_urgent: false, urgent_reason: null, created_at: addHours(-18) },
    { so_id: 6, so_number: 'SO-2026-1234-01', customer_name: 'Thai Snack Co.,Ltd.', item_name: 'ฟิล์มห่อขนม', width_thick: '240/22', colors: '6 สี', final_size: '100x115', total_qty: 8500, customer_due_date: addHours(16), priority: 'NORMAL', is_urgent: false, urgent_reason: null, created_at: addHours(-22) },
    { so_id: 7, so_number: 'SO-2026-234-02', customer_name: 'Siam Food', item_name: 'Film AZ', width_thick: '260/20', colors: '8 สี', final_size: '90x120', total_qty: 7200, customer_due_date: addHours(18), priority: 'HIGH', is_urgent: false, urgent_reason: null, created_at: addHours(-24) },
    { so_id: 8, so_number: 'SO-2026-34-03', customer_name: 'Lotus', item_name: 'Film BX', width_thick: '210/18', colors: '4 สี', final_size: '95x95', total_qty: 10000, customer_due_date: addHours(5), priority: 'NORMAL', is_urgent: true, urgent_reason: 'System installation deadline', created_at: addHours(-12) },
    { so_id: 9, so_number: 'SO-2026-1234-04', customer_name: 'CP Food Packaging', item_name: 'Bag CX', width_thick: '280/30', colors: '10 สี', final_size: '120x150', total_qty: 15000, customer_due_date: addHours(20), priority: 'HIGH', is_urgent: false, urgent_reason: null, created_at: addHours(-16) },
    { so_id: 10, so_number: 'SO-2026-24-05', customer_name: 'Siam Food', item_name: 'Film CY', width_thick: '230/19', colors: '5 สี', final_size: '100x105', total_qty: 8800, customer_due_date: addHours(22), priority: 'NORMAL', is_urgent: false, urgent_reason: null, created_at: addHours(-24) },

    // --- TOMORROW'S ORDERS ---
    { so_id: 21, so_number: 'SO-26-5001', customer_name: 'CP All Logistics', item_name: 'Packaging Pack', width_thick: '300/20', colors: '2 สี', final_size: '150x200', total_qty: 20000, customer_due_date: addHours(32), priority: 'HIGH', is_urgent: false, urgent_reason: null, created_at: addHours(-5) },
];

export function getSalesOrdersByDate(dateStr) {
    const targetDateStr = dateStr === 'today' ? '2026-02-10' : (dateStr === 'tomorrow' ? '2026-02-11' : null);

    return [...salesOrders]
        .filter(so => {
            if (!targetDateStr) return true;
            return so.customer_due_date.toISOString().split('T')[0] === targetDateStr;
        })
        .sort((a, b) => (b.created_at || 0) - (a.created_at || 0)); // Newest first
}

// === PLAN ROWS ===
export const planRows = [];
// planId is already declared at the top for global tracking


salesOrders.forEach((so) => {
    const seed = so.so_id * 12345;
    const getRandom = (min, max) => Math.floor(((seed % 1000) / 1000) * (max - min + 1)) + min;
    const baseQty = 5000 + (so.so_id * 2250);

    const s1Time = 45 + (so.so_id % 30);
    const s1Start = new Date(so.customer_due_date.getTime() - getRandom(4, 6) * 60 * 60 * 1000);
    const s1End = new Date(s1Start.getTime() + s1Time * 60 * 1000);
    planRows.push({ plan_id: planId++, so_id: so.so_id, station_id: 1, machine_id: (so.so_id % 3) + 1, sequence: 1, planned_start: s1Start, planned_end: s1End, runtime_minutes: s1Time, total_qty: baseQty });

    const s2Time = 60 + (so.so_id * 3) % 60;
    const s2Start = s1End;
    const s2End = new Date(s2Start.getTime() + s2Time * 60 * 1000);
    planRows.push({ plan_id: planId++, so_id: so.so_id, station_id: 2, machine_id: 4 + (so.so_id % 3), sequence: 2, planned_start: s2Start, planned_end: s2End, runtime_minutes: s2Time, total_qty: baseQty });

    const s3Time = 30 + (so.so_id % 30);
    const s3Start = s2End;
    const s3End = new Date(s3Start.getTime() + s3Time * 60 * 1000);
    planRows.push({ plan_id: planId++, so_id: so.so_id, station_id: 3, machine_id: 7 + (so.so_id % 2), sequence: 3, planned_start: s3Start, planned_end: s3End, runtime_minutes: s3Time, total_qty: baseQty });

    const s4Time = 60 + (so.so_id % 30);
    const s4Start = s3End;
    const s4End = new Date(s4Start.getTime() + s4Time * 60 * 1000);
    planRows.push({ plan_id: planId++, so_id: so.so_id, station_id: 4, machine_id: 9 + (so.so_id % 3), sequence: 4, planned_start: s4Start, planned_end: s4End, runtime_minutes: s4Time, total_qty: baseQty });
});

// === EXECUTION EVENTS ===
export const executionEvents = [
    { event_id: 1, plan_id: 1, event_type: 'START', event_time: planRows[0].planned_start, operator_name: 'Somchai', note: null },
    { event_id: 2, plan_id: 1, event_type: 'COMPLETE', event_time: planRows[0].planned_end, operator_name: 'Somchai', note: 'Batch-A processed' },
    { event_id: 3, plan_id: 2, event_type: 'START', event_time: planRows[1].planned_start, operator_name: 'Niran', note: 'Machine check passed' },
    { event_id: 4, plan_id: 13, event_type: 'START', event_time: planRows[12].planned_start, operator_name: 'Somchai', note: null },
    { event_id: 5, plan_id: 13, event_type: 'COMPLETE', event_time: planRows[12].planned_end, operator_name: 'Somchai', note: 'QC Approved' },
];

export const machineStatusLogs = [
    { log_id: 1, machine_id: 5, status: 'DOWN', start_time: addHours(-2), end_time: null, reason: 'Hydraulic leak' },
    { log_id: 2, machine_id: 10, status: 'BLOCKED', start_time: addHours(-1), end_time: null, reason: 'Congestion at Die-Cut' },
    { log_id: 3, machine_id: 6, status: 'SETUP', start_time: addHours(-0.5), end_time: null, reason: 'UV Ink Swap' },
];

export const exceptions = [
    { exception_id: 1, type: 'MACHINE_DOWN', severity: 'HIGH', machine_id: 5, so_id: null, status: 'OPEN', sla_due: addHours(2), created_at: addHours(-2), resolved_at: null },
    { exception_id: 2, type: 'BLOCKED_JOB', severity: 'MEDIUM', machine_id: 10, so_id: 4, status: 'OPEN', sla_due: addHours(1), created_at: addHours(-1), resolved_at: null },
];

// === OVERRIDE LOGS ===
export const overrideLogs = JSON.parse(localStorage.getItem('pof_overrides')) || [
    { override_id: 1, user_name: 'Manager1', so_id: 1, snapshot_json: '{"action":"insert_urgent"}', reason_code: 'CUSTOMER_ESCALATION', reason_text: 'VP called directly', created_at: addHours(-6) },
];

/**
 * Schedule an SO for a specific date (Mock scheduling)
 */
export function scheduleSOToday(soId, date = new Date()) {
    const override = {
        override_id: Date.now(),
        user_name: 'SYSTEM',
        so_id: soId,
        snapshot_json: JSON.stringify({ action: 'SCHEDULE_DAILY', date }),
        reason_code: 'DAILY_PLANNING',
        reason_text: `Scheduled for ${date.toLocaleDateString()}`,
        created_at: new Date(),
    };
    overrideLogs.push(override);
    localStorage.setItem('pof_overrides', JSON.stringify(overrideLogs));
    return override;
}

/**
 * Create a New Sales Order with optional custom production steps
 * Improved stability: Uses robust ID counter and input sanitization
 */
export function createSalesOrder(data) {
    if (!data.so_number || data.so_number.trim() === '') {
        throw new Error('SO Number is required');
    }

    const currentMaxSoId = salesOrders.reduce((max, so) => Math.max(max, so.so_id), 0);
    const nextSoId = Math.max(soId++, currentMaxSoId + 1);

    const newSO = {
        so_id: nextSoId,
        so_number: data.so_number || `SO-26-${String(nextSoId).padStart(4, '0')}`,
        customer_name: data.customer_name || 'New Customer',
        customer_due_date: data.due_date ? new Date(data.due_date) : new Date(),
        priority: data.priority || 'NORMAL',
        is_urgent: data.priority === 'URGENT',
        urgent_reason: data.priority === 'URGENT' ? 'Manual Creation' : null,
        created_at: new Date(),
    };

    salesOrders.push(newSO);

    // If custom steps are provided, use them. Otherwise generate default.
    if (data.steps && data.steps.length > 0) {
        let currentStart = new Date(newSO.customer_due_date);
        // Start from start of production day if date is fixed
        currentStart.setHours(9, 0, 0, 0);

        data.steps.forEach((step, index) => {
            // Skip steps if machine_id or runtime is empty
            if (!step.machine_id || !step.runtime) return;

            const currentMaxPlanId = planRows.reduce((max, pr) => Math.max(max, pr.plan_id), 0);
            const nextPlanId = Math.max(planId++, currentMaxPlanId + 1);

            const runtime = parseInt(step.runtime) || 60;
            const stepEnd = new Date(currentStart.getTime() + runtime * 60000);

            planRows.push({
                plan_id: nextPlanId,
                so_id: newSO.so_id,
                station_id: parseInt(step.station_id),
                machine_id: parseInt(step.machine_id),
                sequence: index + 1,
                planned_start: new Date(currentStart),
                planned_end: new Date(stepEnd),
                runtime_minutes: runtime,
                total_qty: parseInt(data.qty) || 1000
            });
            currentStart = new Date(stepEnd); // Chain steps
        });
    } else {
        // Fallback default flow: Standard routing
        let currentStart = new Date(newSO.customer_due_date);
        currentStart.setHours(9, 0, 0, 0);

        const buildDefaultStep = (stationIdx, machineIdx, time, seq) => {
            const currentMaxPlanId = planRows.reduce((max, pr) => Math.max(max, pr.plan_id), 0);
            const pId = Math.max(planId++, currentMaxPlanId + 1);
            const end = new Date(currentStart.getTime() + time * 60000);
            const row = {
                plan_id: pId,
                so_id: newSO.so_id,
                station_id: stationIdx,
                machine_id: machineIdx,
                sequence: seq,
                planned_start: new Date(currentStart),
                planned_end: new Date(end),
                runtime_minutes: time,
                total_qty: parseInt(data.qty) || 1000
            };
            planRows.push(row);
            currentStart = new Date(end);
        };

        buildDefaultStep(1, 1, 60, 1);
        buildDefaultStep(2, 4, 90, 2);
        buildDefaultStep(3, 7, 45, 3);
        buildDefaultStep(4, 9, 60, 4);
    }

    return newSO;
}

/**
 * Activate a job immediately (Start first available station)
 */
export function activateJobImmediately(soId) {
    const plans = getPlanRowsForSO(soId);
    const nextUnstarted = plans.find(p => !getExecutionEventsForPlan(p.plan_id).length);

    if (nextUnstarted) {
        const startEvent = {
            event_id: Date.now(),
            plan_id: nextUnstarted.plan_id,
            event_type: 'START',
            event_time: new Date(),
            operator_name: 'Auto-Trigger',
            note: 'Urgent activation from Dashboard'
        };
        executionEvents.push(startEvent);
        // Persist to local storage if needed, but for demo we can just keep in memory
        return true;
    }
    return false;
}

// === HELPER FUNCTIONS ===
export function getSalesOrderById(soId) {
    const so = salesOrders.find(so => so.so_id === soId);
    if (!so) console.warn(`Sales Order with ID ${soId} not found.`);
    return so;
}

export function getPlanRowsForSO(soId) {
    return planRows.filter(p => p.so_id === soId).sort((a, b) => a.sequence - b.sequence);
}

export function getExecutionEventsForPlan(planId) {
    return executionEvents.filter(e => e.plan_id === planId).sort((a, b) => new Date(a.event_time) - new Date(b.event_time));
}

export function getMachineById(machineId) {
    const machine = machines.find(m => m.machine_id === machineId);
    if (!machine) console.warn(`Machine with ID ${machineId} not found.`);
    return machine || { machine_id: machineId, machine_code: 'UNKNOWN', status: 'UNKNOWN' };
}

export function getStationById(stationId) {
    const station = stations.find(s => s.station_id === stationId);
    if (!station) console.warn(`Station with ID ${stationId} not found.`);
    return station || { station_id: stationId, station_code: '??', station_name: 'Unknown Station' };
}

export function getMachinesForStation(stationId) {
    return machines.filter(m => m.station_id === stationId);
}

export function getCurrentJobForMachine(machineId) {
    const now = new Date();
    const currentPlan = planRows.find(p => {
        const events = getExecutionEventsForPlan(p.plan_id);
        const started = events.find(e => e.event_type === 'START');
        const completed = events.find(e => e.event_type === 'COMPLETE');
        return p.machine_id === machineId && started && !completed;
    });

    if (currentPlan) {
        const so = getSalesOrderById(currentPlan.so_id);
        return { ...currentPlan, so };
    }
    return null;
}

export function getSOProgress(soId) {
    const plans = getPlanRowsForSO(soId);
    if (plans.length === 0) return { total: 0, completed: 0, current: 0, currentMachine: null, currentStation: null };

    const completed = plans.filter(p => {
        const events = getExecutionEventsForPlan(p.plan_id);
        return events.find(e => e.event_type === 'COMPLETE');
    }).length;

    const current = plans.find(p => {
        const events = getExecutionEventsForPlan(p.plan_id);
        const started = events.find(e => e.event_type === 'START');
        const done = events.find(e => e.event_type === 'COMPLETE');
        return started && !done;
    });

    return {
        total: plans.length,
        completed,
        current: current ? current.sequence : (completed === plans.length ? plans.length : completed + 1),
        currentMachine: current ? getMachineById(current.machine_id) : null,
        currentStation: current ? getStationById(current.station_id) : null,
    };
}

export function calculateKPIs() {
    const now = new Date();

    // OEE calculation (simplified)
    const runningMachines = machines.filter(m => m.status === 'RUNNING').length;
    const totalMachines = machines.length;
    const oee = Math.round((runningMachines / totalMachines) * 85); // Base 85% with availability factor

    // Output vs Plan
    const completedToday = executionEvents.filter(e => e.event_type === 'COMPLETE').length;
    const plannedToday = 20; // 20 SOs planned
    const outputVsPlan = Math.round((completedToday / plannedToday) * 100);

    // Machine Load
    const machineLoad = Math.round((runningMachines / totalMachines) * 100);

    // Blocked Jobs
    const blockedJobs = machines.filter(m => m.status === 'BLOCKED' || m.status === 'DOWN').length;

    // Overrides Today
    const overridesToday = overrideLogs.length;

    return {
        oee,
        outputVsPlan,
        machineLoad,
        blockedJobs,
        overridesToday,
    };
}

export function getUrgentSOs() {
    return salesOrders.filter(so => so.is_urgent);
}

export function getSOsForStation(stationId) {
    const stationPlans = planRows.filter(p => p.station_id === stationId);
    return stationPlans.map(p => ({
        ...getSalesOrderById(p.so_id),
        plan: p,
        progress: getSOProgress(p.so_id),
    }));
}

export function getStationHealth() {
    return stations.map(station => {
        const sMachines = getMachinesForStation(station.station_id);
        const running = sMachines.filter(m => m.status === 'RUNNING').length;
        const issues = sMachines.filter(m => m.status === 'DOWN' || m.status === 'BLOCKED').length;
        const load = Math.round((running / sMachines.length) * 100);

        return {
            ...station,
            load,
            issues,
            isRunning: running > 0,
            status: issues > 0 ? 'WARNING' : (running > 0 ? 'HEALTHY' : 'IDLE')
        };
    });
}
