-- ==============================================================================
-- EnergyTwin Digital Twin Energy Monitoring Platform - Supabase PostgreSQL Schema
-- Project: qwvajvktwxvbzsheikxj.supabase.co
-- ==============================================================================

-- 1. Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    logo TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tenants (Multi-Tenant Isolation)
CREATE TABLE IF NOT EXISTS public.tenants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    organization_id TEXT NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
    code TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Users & RBAC
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'facility_manager', 'energy_manager', 'tenant')),
    tenant_id TEXT REFERENCES public.tenants(id) ON DELETE SET NULL,
    organization_name TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Buildings
CREATE TABLE IF NOT EXISTS public.buildings (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    area NUMERIC NOT NULL,
    floors_count INTEGER NOT NULL,
    image_url TEXT,
    efficiency_score INTEGER DEFAULT 85,
    status TEXT DEFAULT 'operational',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Floors
CREATE TABLE IF NOT EXISTS public.floors (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    floor_number INTEGER NOT NULL,
    area NUMERIC NOT NULL,
    occupancy INTEGER DEFAULT 0,
    energy_target NUMERIC DEFAULT 500.0
);

-- 6. Rooms
CREATE TABLE IF NOT EXISTS public.rooms (
    id TEXT PRIMARY KEY,
    floor_id TEXT NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
    building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    room_number TEXT NOT NULL,
    type TEXT NOT NULL,
    area NUMERIC NOT NULL,
    occupancy_capacity INTEGER NOT NULL,
    current_occupancy INTEGER DEFAULT 0,
    temperature NUMERIC DEFAULT 22.5,
    energy_target NUMERIC DEFAULT 50.0,
    coordinates_json TEXT
);

-- 7. Equipment Assets
CREATE TABLE IF NOT EXISTS public.equipment (
    id TEXT PRIMARY KEY,
    room_id TEXT NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
    building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    floor_id TEXT NOT NULL REFERENCES public.floors(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    rated_power NUMERIC NOT NULL,
    current_power NUMERIC NOT NULL DEFAULT 0.0,
    status TEXT NOT NULL DEFAULT 'online' CHECK (status IN ('online', 'offline', 'warning', 'maintenance', 'critical')),
    runtime_hours NUMERIC DEFAULT 0.0,
    efficiency NUMERIC DEFAULT 92.0,
    last_maintenance TIMESTAMPTZ,
    next_maintenance TIMESTAMPTZ,
    connected_meter_id TEXT
);

-- 8. Smart Meters
CREATE TABLE IF NOT EXISTS public.meters (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    floor_id TEXT REFERENCES public.floors(id) ON DELETE SET NULL,
    room_id TEXT REFERENCES public.rooms(id) ON DELETE SET NULL,
    equipment_id TEXT REFERENCES public.equipment(id) ON DELETE SET NULL,
    meter_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'connected' CHECK (status IN ('connected', 'disconnected', 'warning')),
    voltage NUMERIC DEFAULT 400.0,
    current NUMERIC DEFAULT 0.0,
    power NUMERIC DEFAULT 0.0,
    energy NUMERIC DEFAULT 0.0,
    power_factor NUMERIC DEFAULT 0.95,
    frequency NUMERIC DEFAULT 50.0,
    last_reading TIMESTAMPTZ DEFAULT NOW(),
    last_communication TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Energy Telemetry Readings
CREATE TABLE IF NOT EXISTS public.energy_readings (
    id TEXT PRIMARY KEY,
    meter_id TEXT NOT NULL REFERENCES public.meters(id) ON DELETE CASCADE,
    building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    floor_id TEXT REFERENCES public.floors(id) ON DELETE SET NULL,
    room_id TEXT REFERENCES public.rooms(id) ON DELETE SET NULL,
    timestamp TIMESTAMPTZ NOT NULL,
    power NUMERIC NOT NULL,
    energy NUMERIC NOT NULL,
    voltage NUMERIC NOT NULL,
    current NUMERIC NOT NULL,
    power_factor NUMERIC NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_supabase_readings_time ON public.energy_readings(timestamp);
CREATE INDEX IF NOT EXISTS idx_supabase_readings_building_time ON public.energy_readings(building_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_supabase_readings_meter ON public.energy_readings(meter_id);

-- 10. AI Anomaly Detections
CREATE TABLE IF NOT EXISTS public.anomalies (
    id TEXT PRIMARY KEY,
    meter_id TEXT REFERENCES public.meters(id) ON DELETE SET NULL,
    equipment_id TEXT REFERENCES public.equipment(id) ON DELETE SET NULL,
    building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    floor_id TEXT REFERENCES public.floors(id) ON DELETE SET NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'high', 'medium', 'low')),
    title TEXT NOT NULL,
    detected_at TIMESTAMPTZ NOT NULL,
    measured_value NUMERIC NOT NULL,
    expected_value NUMERIC NOT NULL,
    difference_pct NUMERIC NOT NULL,
    confidence NUMERIC NOT NULL,
    explanation TEXT NOT NULL,
    evidence_json JSONB NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'investigating', 'resolved'))
);

-- 11. Energy Consumption Forecasts
CREATE TABLE IF NOT EXISTS public.forecasts (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    timestamp TIMESTAMPTZ NOT NULL,
    predicted_value NUMERIC NOT NULL,
    lower_bound NUMERIC NOT NULL,
    upper_bound NUMERIC NOT NULL,
    confidence NUMERIC NOT NULL,
    peak_predicted NUMERIC,
    factors_json JSONB
);

-- 12. AI Efficiency Recommendations
CREATE TABLE IF NOT EXISTS public.recommendations (
    id TEXT PRIMARY KEY,
    building_id TEXT NOT NULL REFERENCES public.buildings(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    potential_saving_pct NUMERIC NOT NULL,
    monthly_saving_usd NUMERIC NOT NULL,
    confidence NUMERIC NOT NULL,
    evidence_json JSONB NOT NULL,
    priority TEXT NOT NULL CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'task_created', 'implemented', 'dismissed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Alerts & Incident Management
CREATE TABLE IF NOT EXISTS public.alerts (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    building_id TEXT REFERENCES public.buildings(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('critical', 'warning', 'info')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    location TEXT NOT NULL,
    current_value NUMERIC,
    threshold NUMERIC,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'acknowledged', 'resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. Compliance Reports
CREATE TABLE IF NOT EXISTS public.reports (
    id TEXT PRIMARY KEY,
    tenant_id TEXT NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    building_id TEXT REFERENCES public.buildings(id) ON DELETE SET NULL,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    period TEXT NOT NULL,
    generated_at TIMESTAMPTZ DEFAULT NOW(),
    file_format TEXT NOT NULL,
    data_json JSONB NOT NULL
);

-- 15. Security & Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id TEXT PRIMARY KEY,
    tenant_id TEXT,
    user_id TEXT,
    user_name TEXT NOT NULL,
    action TEXT NOT NULL,
    resource TEXT NOT NULL,
    details TEXT NOT NULL,
    ip_address TEXT DEFAULT '127.0.0.1',
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 16. System Settings & Tariff Rates
CREATE TABLE IF NOT EXISTS public.system_settings (
    id TEXT PRIMARY KEY,
    tenant_id TEXT UNIQUE,
    cost_per_kwh NUMERIC DEFAULT 0.16,
    carbon_factor NUMERIC DEFAULT 0.42,
    peak_demand_threshold NUMERIC DEFAULT 650.0,
    daily_target_kwh NUMERIC DEFAULT 4200.0,
    email_alerts INTEGER DEFAULT 1,
    in_app_alerts INTEGER DEFAULT 1,
    simulator_speed NUMERIC DEFAULT 1.0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
