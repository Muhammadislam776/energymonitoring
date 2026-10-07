-- Database Schema for EnergyTwin Digital Twin Energy Monitoring Platform

CREATE TABLE IF NOT EXISTS organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization_id TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (organization_id) REFERENCES organizations(id)
);

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('super_admin', 'facility_manager', 'energy_manager', 'tenant')),
    tenant_id TEXT,
    organization_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'pending')),
    last_login DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS buildings (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    area REAL NOT NULL,
    floors_count INTEGER NOT NULL,
    image_url TEXT,
    efficiency_score INTEGER DEFAULT 85,
    status TEXT DEFAULT 'operational',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS floors (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL,
    name TEXT NOT NULL,
    floor_number INTEGER NOT NULL,
    area REAL NOT NULL,
    occupancy INTEGER DEFAULT 0,
    energy_target REAL DEFAULT 500.0,
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);

CREATE TABLE IF NOT EXISTS rooms (
    id TEXT PRIMARY KEY,
    floor_id TEXT NOT NULL,
    building_id TEXT NOT NULL,
    name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    type TEXT NOT NULL,
    area REAL NOT NULL,
    occupancy_capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    temperature REAL DEFAULT 22.5,
    energy_target REAL DEFAULT 50.0,
    coordinates_json TEXT,
    FOREIGN KEY (floor_id) REFERENCES floors(id),
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);

CREATE TABLE IF NOT EXISTS equipment (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL,
    building_id TEXT NOT NULL,
    floor_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    rated_power REAL NOT NULL,
    current_power REAL NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'online' CHECK(status IN ('online', 'offline', 'warning', 'maintenance', 'critical')),
    runtime_hours REAL DEFAULT 0.0,
    efficiency REAL DEFAULT 92.0,
    last_maintenance DATETIME,
    next_maintenance DATETIME,
    connected_meter_id TEXT,
    FOREIGN KEY (room_id) REFERENCES rooms(id)
);

CREATE TABLE IF NOT EXISTS meters (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL,
    floor_id TEXT,
    room_id TEXT,
    equipment_id TEXT,
    meter_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'connected' CHECK(status IN ('connected', 'disconnected', 'warning')),
    voltage REAL DEFAULT 400.0,
    current REAL DEFAULT 0.0,
    power REAL DEFAULT 0.0,
    energy REAL DEFAULT 0.0,
    power_factor REAL DEFAULT 0.95,
    frequency REAL DEFAULT 50.0,
    last_reading DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_communication DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);

CREATE TABLE IF NOT EXISTS energy_readings (
    id TEXT PRIMARY KEY,
    meter_id TEXT NOT NULL,
    building_id TEXT NOT NULL,
    floor_id TEXT,
    room_id TEXT,
    timestamp DATETIME NOT NULL,
    power REAL NOT NULL,
    energy REAL NOT NULL,
    voltage REAL NOT NULL,
    current REAL NOT NULL,
    power_factor REAL NOT NULL,
    FOREIGN KEY (meter_id) REFERENCES meters(id)
);

CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON energy_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_readings_building_time ON energy_readings(building_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_readings_meter ON energy_readings(meter_id);

CREATE TABLE IF NOT EXISTS anomalies (
    id TEXT PRIMARY KEY,
    meter_id TEXT,
    equipment_id TEXT,
    building_id TEXT NOT NULL,
    floor_id TEXT,
    severity TEXT NOT NULL CHECK(severity IN ('critical', 'high', 'medium', 'low')),
    title TEXT NOT NULL,
    detected_at DATETIME NOT NULL,
    measured_value REAL NOT NULL,
    expected_value REAL NOT NULL,
    difference_pct REAL NOT NULL,
    confidence REAL NOT NULL,
    explanation TEXT NOT NULL,
    evidence_json TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'investigating', 'resolved')),
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);

CREATE TABLE IF NOT EXISTS forecasts (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL,
    timestamp DATETIME NOT NULL,
    predicted_value REAL NOT NULL,
    lower_bound REAL NOT NULL,
    upper_bound REAL NOT NULL,
    confidence REAL NOT NULL,
    peak_predicted REAL,
    factors_json TEXT,
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);

CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    potential_saving_pct REAL NOT NULL,
    monthly_saving_usd REAL NOT NULL,
    confidence REAL NOT NULL,
    evidence_json TEXT NOT NULL,
    priority TEXT NOT NULL CHECK(priority IN ('high', 'medium', 'low')),
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'task_created', 'implemented', 'dismissed')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (building_id) REFERENCES buildings(id)
);

CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    building_id TEXT,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK(severity IN ('critical', 'warning', 'info')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    location TEXT NOT NULL,
    current_value REAL,
    threshold REAL,
    status TEXT NOT NULL DEFAULT 'new' CHECK(status IN ('new', 'acknowledged', 'resolved')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL,
    building_id TEXT,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    period TEXT NOT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    file_format TEXT NOT NULL,
    data_json TEXT NOT NULL,
    FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    user_id TEXT,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT DEFAULT '127.0.0.1',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS system_settings (
    id TEXT PRIMARY KEY,
    tenant_id TEXT UNIQUE,
    cost_per_kwh REAL DEFAULT 0.16,
    carbon_factor REAL DEFAULT 0.42,
    peak_demand_threshold REAL DEFAULT 650.0,
    daily_target_kwh REAL DEFAULT 4200.0,
    email_alerts INTEGER DEFAULT 1,
    in_app_alerts INTEGER DEFAULT 1,
    simulator_speed REAL DEFAULT 1.0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
