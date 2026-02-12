import React from 'react';
import { salesOrders, getPlanRowsForSO, getStationById, getMachineById } from '../data/db';
import { useNotification } from './NotificationContext';

const ProductionContext = React.createContext();

export function ProductionProvider({ children }) {
    const [orders, setOrders] = React.useState([]);
    const [plans, setPlans] = React.useState([]);
    const [executionStatus, setExecutionStatus] = React.useState({}); // Track execution status per plan

    // Initialize data
    React.useEffect(() => {
        // Load sales orders
        setOrders(Array.isArray(salesOrders) ? [...salesOrders] : []);

        // Load all plans
        const allPlans = salesOrders.flatMap(so => {
            const rowPlans = getPlanRowsForSO(so.so_id);
            // Release first 3 SOs by default for demo
            if (so.so_id <= 3) {
                return rowPlans.map(p => ({ ...p, isReleased: true }));
            }
            return rowPlans;
        });
        setPlans(allPlans);

        // Initialize execution status
        const initialStatus = {};
        allPlans.forEach(plan => {
            initialStatus[plan.plan_id] = {
                status: 'pending', // pending, running, paused, completed
                progress: 0,
                startTime: null,
                endTime: null,
                actualQty: 0,
                scrapQty: 0,
                operator: null
            };
        });
        setExecutionStatus(initialStatus);
    }, []);

    // Update plan
    const updatePlan = (planId, updates) => {
        setPlans(prev => prev.map(p => p.plan_id === planId ? { ...p, ...updates } : p));
    };

    // Add new plan
    const addPlan = (newPlan) => {
        setPlans(prev => [...prev, newPlan]);
        setExecutionStatus(prev => ({
            ...prev,
            [newPlan.plan_id]: {
                status: 'pending',
                progress: 0,
                startTime: null,
                endTime: null,
                actualQty: 0,
                scrapQty: 0,
                operator: null
            }
        }));
    };

    // Remove plan
    const removePlan = (planId) => {
        setPlans(prev => prev.filter(p => p.plan_id !== planId));
        setExecutionStatus(prev => {
            const newStatus = { ...prev };
            delete newStatus[planId];
            return newStatus;
        });
    };

    // Update execution status
    const updateExecutionStatus = (planId, statusUpdates) => {
        setExecutionStatus(prev => ({
            ...prev,
            [planId]: { ...prev[planId], ...statusUpdates }
        }));
    };

    // Start execution
    const startExecution = (planId, operator) => {
        updateExecutionStatus(planId, {
            status: 'running',
            startTime: new Date(),
            operator: operator
        });
    };

    // Pause execution
    const pauseExecution = (planId, reason) => {
        updateExecutionStatus(planId, {
            status: 'paused',
            pauseReason: reason
        });
    };

    // Complete execution
    const completeExecution = (planId, actualQty, scrapQty) => {
        const plan = plans.find(p => p.plan_id === planId);

        updateExecutionStatus(planId, {
            status: 'completed',
            endTime: new Date(),
            actualQty: actualQty,
            scrapQty: scrapQty,
            progress: 100
        });

        // Check if entire SO is completed
        // Need to check with updated status, but since state update is async, 
        // we check if all OTHER plans are completed
        const soPlans = plans.filter(p => p.so_id === plan.so_id);
        const otherPlansDone = soPlans.every(p =>
            p.plan_id === planId || executionStatus[p.plan_id]?.status === 'completed'
        );

        if (otherPlansDone) {
            // This SO is fully completed!
            const so = orders.find(o => o.so_id === plan.so_id);
            // We could trigger a global notification here if we had a way to broadcast
            console.log(`SO ${so?.so_number} completely finished!`);
        }
    };

    // Get work list for specific machine/operator
    const getWorkListForMachine = (machineId, date = 'today') => {
        // Filter plans by machine
        const machinePlans = plans.filter(plan => plan.machine_id === machineId);

        // Enrich with SO data and execution status
        return machinePlans.map(plan => {
            const so = orders.find(o => o.so_id === plan.so_id);
            const station = getStationById(plan.station_id);
            const machine = getMachineById(plan.machine_id);
            const status = executionStatus[plan.plan_id] || {};

            return {
                ...plan,
                so_number: so?.so_number,
                customer_name: so?.customer_name,
                item_name: so?.item_name,
                total_qty: so?.total_qty,
                priority: so?.priority,
                station_name: station?.station_name,
                station_code: station?.station_code,
                machine_name: machine?.machine_name,
                machine_code: machine?.machine_code,
                execution: status
            };
        }).sort((a, b) => a.sequence - b.sequence);
    };

    // Release plans to operator
    const releasePlans = (soIds) => {
        setPlans(prev => prev.map(p => soIds.includes(p.so_id) ? { ...p, isReleased: true } : p));
    };

    // Check if an SO is completely finished
    const checkSOCompletion = (soId) => {
        const soPlans = plans.filter(p => p.so_id === soId);
        if (soPlans.length === 0) return false;
        return soPlans.every(p => executionStatus[p.plan_id]?.status === 'completed');
    };

    const value = {
        orders,
        plans,
        executionStatus,
        setOrders,
        updatePlan,
        addPlan,
        removePlan,
        updateExecutionStatus,
        startExecution,
        pauseExecution,
        completeExecution,
        getWorkListForMachine,
        releasePlans,
        checkSOCompletion
    };

    return (
        <ProductionContext.Provider value={value}>
            {children}
        </ProductionContext.Provider>
    );
}

export function useProduction() {
    const context = React.useContext(ProductionContext);
    if (!context) {
        throw new Error('useProduction must be used within ProductionProvider');
    }
    return context;
}
