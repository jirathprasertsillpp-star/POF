-- POF PACIFIC — FACTORY OS SCHEMA
-- PostgreSQL Source of Truth

CREATE TABLE stations (
    station_id SERIAL PRIMARY KEY,
    station_code VARCHAR(10) NOT NULL UNIQUE,
    station_name VARCHAR(100) NOT NULL
);

CREATE TABLE machines (
    machine_id SERIAL PRIMARY KEY,
    station_id INTEGER REFERENCES stations(station_id),
    machine_code VARCHAR(20) NOT NULL UNIQUE,
    status VARCHAR(20) DEFAULT 'IDLE' CHECK (status IN ('RUNNING', 'IDLE', 'BLOCKED', 'SETUP', 'DOWN')),
    standard_speed INTEGER NOT NULL -- Units per minute
);

CREATE TABLE sales_orders (
    so_id SERIAL PRIMARY KEY,
    so_number VARCHAR(50) NOT NULL UNIQUE,
    customer_name VARCHAR(100) NOT NULL,
    customer_due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    priority VARCHAR(20) DEFAULT 'NORMAL' CHECK (priority IN ('LOW', 'NORMAL', 'HIGH', 'URGENT')),
    is_urgent BOOLEAN DEFAULT FALSE,
    urgent_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE plan_rows (
    plan_id SERIAL PRIMARY KEY,
    so_id INTEGER REFERENCES sales_orders(so_id),
    station_id INTEGER REFERENCES stations(station_id),
    machine_id INTEGER REFERENCES machines(machine_id),
    sequence INTEGER NOT NULL, -- 1 to 4
    planned_start TIMESTAMP WITH TIME ZONE NOT NULL,
    planned_end TIMESTAMP WITH TIME ZONE NOT NULL,
    runtime_minutes INTEGER NOT NULL,
    total_qty INTEGER NOT NULL
);

CREATE TABLE execution_events (
    event_id SERIAL PRIMARY KEY,
    plan_id INTEGER REFERENCES plan_rows(plan_id),
    event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('START', 'PAUSE', 'RESUME', 'COMPLETE')),
    event_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    operator_name VARCHAR(100),
    note TEXT
);

CREATE TABLE machine_status_logs (
    log_id SERIAL PRIMARY KEY,
    machine_id INTEGER REFERENCES machines(machine_id),
    status VARCHAR(20) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    reason TEXT
);

CREATE TABLE exceptions (
    exception_id SERIAL PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    severity VARCHAR(20) CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH')),
    machine_id INTEGER REFERENCES machines(machine_id),
    so_id INTEGER REFERENCES sales_orders(so_id),
    status VARCHAR(20) DEFAULT 'OPEN',
    sla_due TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE override_logs (
    override_id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    so_id INTEGER REFERENCES sales_orders(so_id),
    snapshot_json JSONB, -- Capture full state at time of override
    reason_code VARCHAR(50) NOT NULL,
    reason_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Seed Data (Stations)
INSERT INTO stations (station_code, station_name) VALUES
('S1', 'Slitting / Rewinding'),
('S2', 'Printing'),
('S3', 'Folding'),
('S4', 'Final Cutting / Die Cutting');

-- Seed Data (Machines)
INSERT INTO machines (station_id, machine_code, status, standard_speed) VALUES
(1, 'SL-01', 'RUNNING', 100),
(1, 'SL-02', 'IDLE', 100),
(1, 'RW-01', 'RUNNING', 90),
(2, 'PR-01', 'RUNNING', 80),
(2, 'PR-02', 'DOWN', 80), -- Planned Down simulation
(2, 'PR-03', 'SETUP', 75),
(3, 'FD-01', 'RUNNING', 120),
(3, 'FD-02', 'IDLE', 120),
(4, 'CT-01', 'RUNNING', 100),
(4, 'DC-01', 'BLOCKED', 110),
(4, 'DC-02', 'IDLE', 110);
